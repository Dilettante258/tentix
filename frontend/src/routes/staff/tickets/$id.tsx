import {
  ticketsQueryOptions,
  userTicketsQueryOptions,
  wsTokenQueryOptions,
} from "@lib/query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSessionMembersStore, useTicketStore } from "../../../store";
import { StaffSiteHeader } from "@comp/staff/site-header";
import { StaffTicketSidebar } from "@comp/staff/staff-ticket-sidebar";
import { useBoolean } from "ahooks";
import { SidebarInset, SidebarProvider } from "tentix-ui";
import { StaffChat } from "@comp/chat/staff/index";
import { StaffRightSidebar } from "@comp/staff/staff-right-sidebar";

export const Route = createFileRoute("/staff/tickets/$id")({
  loader: async ({ context: { queryClient, authContext }, params }) => {
    return {
      data: await queryClient.ensureQueryData(
        userTicketsQueryOptions(),
      ),
      ticket: await queryClient.ensureQueryData(ticketsQueryOptions(params.id)),
      token: await queryClient.ensureQueryData(
        wsTokenQueryOptions(authContext.user!.id.toString()),
      ),
      authContext,
    };
  },
  head: ({ params }) => ({
    meta: [
      {
        title: `工单#${params.id} | Tentix`,
      }
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { data, ticket, token: wsToken, authContext } = Route.useLoaderData();
  const { id } = Route.useParams();
  const { setTicket } = useTicketStore();
  const { setSessionMembers } = useSessionMembersStore();
  const [isCollapsed, { toggle: toggleCollapse }] = useBoolean(false);

  // Set up initial ticket data
  useEffect(() => {
    setTicket(ticket);
    setSessionMembers(ticket);
  }, [ticket, setTicket, setSessionMembers]);


  return (
    <SidebarProvider>
      <StaffTicketSidebar currentTicketId={id} tickets={data} />
      <SidebarInset className="max-h-svh" style={{
          scrollbarGutter: 'stable both-edges',
          overflowY: 'clip',
        }}>
        <StaffSiteHeader
          ticket={ticket}
          sidebarVisible={!isCollapsed}
          toggleSidebar={toggleCollapse}
        />
        <div className="flex flex-1 flex-col h-[calc(100svh-48px)]">
          <div className="flex flex-1 flex-row h-full">
            <div className={`h-full flex flex-col flex-1`}>
              <StaffChat
                ticket={ticket}
                token={wsToken.token}
                userId={authContext.user?.id ?? 0}
              />
            </div>
            <StaffRightSidebar id={id} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
