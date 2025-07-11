import { type JSONContentZod } from "tentix-server/types";
import { Loader2Icon, SendIcon } from "lucide-react";
import React, { useRef, useState } from "react";
import { Button, UserChatEditor, type EditorRef } from "tentix-ui";

interface MessageInputProps {
  onSendMessage: (content: JSONContentZod) => void;
  onTyping?: () => void;
  isLoading: boolean;
}

export function MessageInput({
  onSendMessage,
  onTyping,
  isLoading,
}: MessageInputProps) {
  const [newMessage, setNewMessage] = useState<JSONContentZod>({
    type: "doc",
    content: [],
  });
  const editorRef = useRef<EditorRef>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage || isLoading) return;
    onSendMessage(newMessage);
    editorRef.current?.clearContent();
  };

  return (
    <div className="border-t p-4 lg:p-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <UserChatEditor
            ref={editorRef}
            value={newMessage}
            onChange={(value) => {
              onTyping?.();
              console.log(value);
              setNewMessage(value as JSONContentZod);
            }}
            throttleDelay={500}
            editorContentClassName="overflow-auto h-full"
            placeholder="Comment here..."
            editable={true}
            editorClassName="focus:outline-none px-5 py-4 h-full"
          />
          <Button
            type="submit"
            size="icon"
            disabled={
              newMessage?.content?.at(0)?.content === undefined && newMessage?.content?.at(0)?.attrs?.id === undefined || isLoading
            }
          >
            {isLoading ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <SendIcon className="h-4 w-4" />
            )}
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
