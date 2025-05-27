import { WS_TOKEN_EXPIRY_TIME } from "@/utils/const.ts";
import {
  connectDB,
  logInfo,
  plainTextToJSONContent,
  saveMessageReadStatus,
  saveMessageToDb,
  withdrawMessage,
} from "@/utils/index.ts";
import { extractText, JSONContentZod, userRoleType, wsMessageSchema, WSMessage } from "@/utils/types.ts";
import { zValidator } from "@hono/zod-validator";
import { type ServerWebSocket } from "bun";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { createBunWebSocket } from "hono/bun";
import { HTTPException } from "hono/http-exception";
import type { WSContext } from "hono/ws";
import { z } from "zod";
import { authMiddleware, factory } from "../middleware.ts";
import { UUID } from "crypto";
import { and, count, eq } from "drizzle-orm";
import * as schema from "@/db/schema.ts";
import { MyCache } from "@/utils/cache.ts";
import NodeCache from "node-cache";
import { runWithInterval } from "@/utils/runtime.ts";
import { getAIResponse } from "@/utils/platform/ai.ts";
type wsInstance = WSContext<ServerWebSocket<undefined>>;

// Connection management constants
const HEARTBEAT_INTERVAL = 30000; // Send heartbeat every 30 seconds
const HEARTBEAT_TIMEOUT = 10000; // Wait 10 seconds for heartbeat response
const MAX_RECONNECT_DELAY = 30000; // Maximum reconnection delay of 30 seconds

// Connection state tracking
interface ConnectionState {
  lastHeartbeat: number;
  heartbeatTimeout?: NodeJS.Timeout;
  isAlive: boolean;
}

const connectionStates = new Map<string, ConnectionState>();

// Token management
interface TokenData {
  userId: number;
  role: userRoleType;
  expiresAt: number;
}

const tokenMap = new Map<string, TokenData>();

const generateToken = (userId: number, role: userRoleType): string => {
  const token = crypto.randomUUID();
  tokenMap.set(token, {
    userId,
    role,
    expiresAt: Date.now() + WS_TOKEN_EXPIRY_TIME,
  });
  return token;
};

const validateToken = (token: string): TokenData | null => {
  const data = tokenMap.get(token);
  if (!data) return null;

  if (Date.now() > data.expiresAt) {
    tokenMap.delete(token);
    return null;
  }

  return data;
};

// Clean up expired tokens periodically
setInterval(() => {
  for (const [token, data] of tokenMap.entries()) {
    if (Date.now() > data.expiresAt) {
      tokenMap.delete(token);
    }
  }
}, 60000); // Clean up every minute

// Helper functions for connection management
const initializeConnection = (clientId: string, ws: wsInstance) => {
  connectionStates.set(clientId, {
    lastHeartbeat: Date.now(),
    isAlive: true,
  });

  // Start heartbeat for this connection
  const heartbeatInterval = setInterval(() => {
    const state = connectionStates.get(clientId);
    if (!state || !state.isAlive) {
      clearInterval(heartbeatInterval);
      return;
    }

    // Send heartbeat
    ws.send(JSON.stringify({ type: "heartbeat", timestamp: Date.now() }));

    // Set timeout for response
    state.heartbeatTimeout = setTimeout(() => {
      const currentState = connectionStates.get(clientId);
      if (currentState) {
        currentState.isAlive = false;
        ws.close();
      }
    }, HEARTBEAT_TIMEOUT);
  }, HEARTBEAT_INTERVAL);
};

const handleHeartbeat = (clientId: string) => {
  const state = connectionStates.get(clientId);
  if (state) {
    // Clear previous timeout if exists
    if (state.heartbeatTimeout) {
      clearTimeout(state.heartbeatTimeout);
    }
    state.lastHeartbeat = Date.now();
    state.isAlive = true;
    connectionStates.set(clientId, state);
  }
};

const cleanupConnection = (clientId: string) => {
  const state = connectionStates.get(clientId);
  if (state?.heartbeatTimeout) {
    clearTimeout(state.heartbeatTimeout);
  }
  connectionStates.delete(clientId);
};

// In-memory storage for connected clients and room management
const roomsMap = new Map<string, Map<string, wsInstance>>(); // roomId -> set of clientId

// Helper function to broadcast a message to all clients in a room
const broadcastToRoom = (
  roomId: string,
  message: any,
  excludeClientId?: string | string[],
) => {
  const room = roomsMap.get(roomId);
  if (!room) return;
  const set = new Set<string>(
    typeof excludeClientId === "string" ? [excludeClientId] : excludeClientId,
  );

  for (const [clientId, wsContext] of room) {
    if (set.has(clientId)) continue;
    wsContext.send(JSON.stringify(message));
  }
};

// Helper function to add a client to a room
const addClientToRoom = async (
  roomId: string,
  clientId: string,
  ws: wsInstance,
) => {
  if (!roomsMap.has(roomId)) {
    roomsMap.set(roomId, new Map());
  }
  const room = roomsMap.get(roomId)!;

  room.set(clientId, ws);
  return true;
};

// Helper function to remove a client from a room
const removeClientFromRoom = (clientId: string, roomId: string) => {
  const room = roomsMap.get(roomId)!;
  room.delete(clientId);
};

const roomCustomerMap = new Map<string, UUID>();

// WebSocket setup
const { upgradeWebSocket, websocket } = createBunWebSocket<ServerWebSocket>();

namespace aiHandler {
  // Cache to track AI response counts for each ticket
  const aiResponseCountCache = new NodeCache({
    stdTTL: 24 * 60 * 60, // 24 hours
    checkperiod: 60 * 60 * 12,
  });

  export const MAX_AI_RESPONSES_PER_TICKET = 4;

  export async function getCurrentAIMsgCount(ticketId: string) {
    // Check if we've reached the AI response limit for this ticket
    let currentCount = aiResponseCountCache.get<number>(ticketId);
    if (currentCount === undefined) {
      const db = connectDB();
      const [num] = await db
        .select({
          count: count(),
        })
        .from(schema.chatMessages)
        .where(
          and(
            eq(schema.chatMessages.ticketId, ticketId),
            eq(schema.chatMessages.senderId, 1),
          ),
        );
      currentCount = num?.count ?? 0;
      aiResponseCountCache.set(ticketId, currentCount);
    }
    return currentCount;
  }

  export function handleAIResponse(
    ws: wsInstance,
    ticketId: string,
    content: JSONContentZod | string[],
  ) {
    const currentCount = aiResponseCountCache.get<number>(ticketId) ?? 0;

    const toSendContent = Array.isArray(content)
      ? content.join("\n")
      : extractText(content);
    runWithInterval(
      () =>
        getAIResponse(ticketId, [
          {
            role: "user",
            content: toSendContent,
          },
        ]),
      () =>
        broadcastToRoom(ticketId, {
          type: "user_typing",
          userId: 1,
          roomId: ticketId,
          timestamp: Date.now(),
        }),
      2000,
      async (result) => {
        const savedAIMessage = await saveMessageToDb(
          ticketId,
          1,
          plainTextToJSONContent(result),
          false,
        );
        if (!savedAIMessage) {
          return;
        }

        // Increment the AI response count for this ticket
        aiResponseCountCache.set(ticketId, currentCount + 1);
        broadcastToRoom(ticketId, {
          type: "new_message",
          messageId: savedAIMessage.id,
          roomId: ticketId,
          userId: 1,
          content: savedAIMessage.content,
          timestamp: savedAIMessage.createdAt,
          isInternal: false,
        });
      },
      (error: unknown) => {
        console.error("Error handling AI response:", error);
        ws.send(
          JSON.stringify({
            type: "error",
            error: "Some error occurred in AI response.",
          }),
        );
      },
    );
  }
}

const wsRouter = factory
  .createApp()
  .get(
    "/token",
    authMiddleware,
    describeRoute({
      tags: ["Chat"],
      description: "Get WebSocket connection token",
      responses: {
        200: {
          description: "Successful response",
          content: {
            "application/json": {
              schema: resolver(
                z.object({
                  token: z.string(),
                  expiresIn: z.number(),
                }),
              ),
            },
          },
        },
      },
    }),
    async (c) => {
      const userId = Number(c.var.userId);
      const role = c.var.role;
      // Generate WebSocket token
      const wsToken = generateToken(userId, role);
      return c.json({
        token: wsToken,
        expiresIn: WS_TOKEN_EXPIRY_TIME / 1000, // Convert to seconds
      });
    },
  )
  .get(
    "/onlineClients",
    describeRoute({
      tags: ["Chat"],
      description: "Get online clients",
    }),
    async (c) => {
      return c.json({
        onlineClients: Array.from(roomsMap.entries()).map(([key, value]) => ({
          roomId: key,
          clients: Array.from(value.keys()),
        })),
      });
    },
  )
  .get(
    "/chat",
    describeRoute({
      tags: ["Chat"],
      description: "WebSocket connection endpoint",
    }),
    zValidator(
      "query",
      z.object({
        token: z.string(),
        ticketId: z.string(),
      }),
    ),
    upgradeWebSocket(async (c) => {
      // Generate a unique client ID
      const clientId = crypto.randomUUID();
      const { token, ticketId } = c.req.query();

      if (!ticketId) {
        throw new HTTPException(400, {
          message: "Ticket ID is required",
        });
      }

      if (ticketId.length !== 13) {
        throw new HTTPException(400, {
          message: "Invalid ticket ID",
        });
      }

      // Validate token
      const tokenData = validateToken(token!);
      if (!tokenData) {
        throw new HTTPException(401, {
          message: "Invalid or expired WebSocket token.",
        });
      }

      const { userId, role } = tokenData;

      // Check if user has permission to access this ticket
      const roomMembers = await MyCache.getTicketMembers(ticketId);

      if (
        role === "customer" &&
        !roomMembers.map((member) => member.id).includes(userId) &&
        process.env.NODE_ENV === "production"
      ) {
        throw new HTTPException(403, {
          message: "You do not have permission to access this ticket.",
        });
      }

      return {
        async onOpen(evt, ws) {
          logInfo(`Client connected: ${clientId}, UserId: ${userId}`);
          await addClientToRoom(ticketId, clientId, ws);

          // Initialize connection state and start heartbeat
          initializeConnection(clientId, ws);

          broadcastToRoom(
            ticketId,
            {
              type: "user_joined",
              userId,
              roomId: ticketId,
              timestamp: Date.now(),
            },
            clientId,
          );

          if (role === "customer") {
            roomCustomerMap.set(ticketId, clientId);
            const currentCount =
              await aiHandler.getCurrentAIMsgCount(ticketId);
            if (currentCount === 0) {
              const db = connectDB();
              db.query.tickets
                .findFirst({
                  columns: {
                    title: true,
                    description: true,
                    errorMessage: true,
                  },
                  where: eq(schema.tickets.id, ticketId),
                })
                .then((ticket) => {
                  if (ticket) {
                    aiHandler.handleAIResponse(ws, ticketId, [
                      ticket.title,
                      extractText(ticket.description),
                      ticket.errorMessage,
                    ]);
                  }
                });
            }
          }

          // Confirm to the user
          ws.send(
            JSON.stringify({
              type: "join_success",
              roomId: ticketId,
              timestamp: Date.now(),
            }),
          );
        },

        async onMessage(evt, ws) {
          try {
            // Parse the message
            const messageData = evt.data.toString();
            const data = JSON.parse(messageData);

            // Validate message format
            const validationResult = wsMessageSchema.safeParse(data);
            if (!validationResult.success) {
              ws.send(
                JSON.stringify({
                  type: "error",
                  error: "Invalid message format",
                  details: validationResult.error.errors,
                }),
              );
              console.error(
                "Invalid message format:",
                validationResult.error.errors,
              );
              return;
            }

            const parsedMessage: WSMessage = validationResult.data;
            // Handle different message types
            switch (parsedMessage.type) {
              case "heartbeat":
                ws.send(
                  JSON.stringify({
                    type: "heartbeat_ack",
                    timestamp: Date.now(),
                  }),
                );
                break;
              case "heartbeat_ack":
                handleHeartbeat(clientId);
                break;

              case "message":
                // Check if connection is alive
                const state = connectionStates.get(clientId);
                if (!state?.isAlive) {
                  ws.send(
                    JSON.stringify({
                      type: "error",
                      error: "Connection is not alive",
                    }),
                  );
                  return;
                }

                // User is sending a message to a room
                if (!parsedMessage.content) {
                  ws.send(
                    JSON.stringify({
                      type: "error",
                      error: "Message content is required",
                    }),
                  );
                  return;
                }

                // Save message to database
                const messageResult = await saveMessageToDb(
                  ticketId,
                  userId,
                  parsedMessage.content,
                  parsedMessage.isInternal ?? false,
                );

                if (messageResult) {
                  if (role === "customer") {
                    const currentCount =
                      await aiHandler.getCurrentAIMsgCount(ticketId);
                    if (currentCount <= aiHandler.MAX_AI_RESPONSES_PER_TICKET) {
                      aiHandler.handleAIResponse(
                        ws,
                        ticketId,
                        parsedMessage.content,
                      );
                    }
                  }

                  // Broadcast message to room
                  let broadcastExclude = [clientId];
                  if (parsedMessage.isInternal) {
                    broadcastExclude = [
                      clientId,
                      roomCustomerMap.get(ticketId)!,
                    ];
                  }

                  broadcastToRoom(
                    ticketId,
                    {
                      type: "new_message",
                      messageId: messageResult.id,
                      roomId: ticketId,
                      userId,
                      content: parsedMessage.content,
                      timestamp: messageResult.createdAt,
                      isInternal: parsedMessage.isInternal,
                    },
                    broadcastExclude,
                  );

                  // Confirm to sender
                  ws.send(
                    JSON.stringify({
                      type: "message_sent",
                      tempId: parsedMessage.tempId,
                      messageId: messageResult.id,
                      roomId: ticketId,
                      timestamp: messageResult.createdAt,
                    }),
                  );
                } else {
                  ws.send(
                    JSON.stringify({
                      type: "error",
                      error: "Failed to save message",
                      roomId: ticketId,
                    }),
                  );
                }
                break;

              case "typing":
                // Check if connection is alive
                const typingState = connectionStates.get(clientId);
                if (!typingState?.isAlive) {
                  return; // Silently ignore typing events from dead connections
                }

                // User is typing in a room
                if (!roomsMap.has(ticketId)) {
                  return; // ignore if not in room
                }

                // Broadcast typing status to room
                broadcastToRoom(
                  ticketId,
                  {
                    type: "user_typing",
                    userId,
                    roomId: ticketId,
                    timestamp: Date.now(),
                  },
                  clientId, // Exclude sender
                );
                break;

              case "message_read":
                if (!parsedMessage.messageId) {
                  ws.send(
                    JSON.stringify({
                      type: "error",
                      error: "Message ID is required for read status",
                    }),
                  );
                  return;
                }

                // Save read status to database
                const readStatus = await saveMessageReadStatus(
                  parsedMessage.messageId,
                  userId,
                );

                if (readStatus) {
                  // Broadcast read status to room
                  broadcastToRoom(ticketId, {
                    type: "message_read_update",
                    messageId: parsedMessage.messageId,
                    userId,
                    readAt: readStatus.readAt,
                  });
                }
                break;
              case "agent_first_message":
                if (role === "agent") {
                  const db = connectDB();
                  db.transaction(async (tx) => {
                    await tx
                      .update(schema.tickets)
                      .set({
                        status: "in_progress",
                      })
                      .where(eq(schema.tickets.id, ticketId));
                    await tx.insert(schema.ticketHistory).values({
                      ticketId,
                      type: "first_reply",
                      meta: 0,
                      operatorId: userId,
                    });
                  });
                }
                break;

              case "withdraw_message":
                // Withdraw the message
                const withdrawnMessage = await withdrawMessage(
                  parsedMessage.messageId,
                  userId,
                );

                if (withdrawnMessage) {
                  let broadcastExclude = [clientId];
                  if (withdrawnMessage.isInternal) {
                    broadcastExclude = [
                      clientId,
                      roomCustomerMap.get(ticketId)!,
                    ];
                  }
                  broadcastToRoom(
                    ticketId,
                    {
                      type: "message_withdrawn",
                      messageId: withdrawnMessage.id,
                      roomId: ticketId,
                      userId,
                      timestamp: Date.now(),
                      isInternal: withdrawnMessage.isInternal,
                    },
                    broadcastExclude, // Exclude sender
                  );
                } else {
                  ws.send(
                    JSON.stringify({
                      type: "error",
                      error: "Failed to withdraw message",
                      roomId: ticketId,
                    }),
                  );
                }
                break;
            }
          } catch (error) {
            console.error("Error handling WebSocket message:", error);
            ws.send(
              JSON.stringify({
                type: "error",
                error:
                  error instanceof Error
                    ? error.message
                    : "Internal server error",
              }),
            );
          }
        },

        onClose() {
          // Clean up connection state
          cleanupConnection(clientId);

          // Get client info before removal
          const room = roomsMap.get(ticketId);
          if (room) {
            broadcastToRoom(
              ticketId,
              {
                type: "user_left",
                userId,
                roomId: ticketId,
                timestamp: Date.now(),
              },
              clientId,
            );
            removeClientFromRoom(clientId, ticketId);

            if (room.size === 0) {
              roomsMap.delete(ticketId);
            }
          }
          console.log(`Client disconnected: ${clientId}`);
        },
      };
    }),
  );

export { websocket, wsRouter };
