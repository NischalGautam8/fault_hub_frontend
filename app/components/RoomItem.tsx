"use client";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id, Doc } from "../../convex/_generated/dataModel";

interface RoomItemProps {
  room: Doc<"rooms">;
  selectedRoomId: Id<"rooms"> | null;
  setSelectedRoomId: (id: Id<"rooms"> | null) => void;
}

export function RoomItem({ room, selectedRoomId, setSelectedRoomId }: RoomItemProps) {
  const lastMessage = useQuery(api.messages.getLastMessage, { roomId: room._id });
  
  // Use displayName for DM rooms, otherwise use regular name
  const displayName = (room as Doc<"rooms"> & { displayName?: string }).displayName || room.name;
  const isDM = room.isprivate && room.members.length === 2;

  return (
    <div 
      key={room._id} 
      className={`p-3 mb-1 rounded-lg cursor-pointer transition-colors ${selectedRoomId === room._id ? "bg-sidebar-primary text-sidebar-primary-foreground" : "hover:bg-sidebar-accent"}`}
      onClick={() => {
        setSelectedRoomId(room._id);
      }}
    >
      <div className="font-semibold text-sm">
        {isDM ? displayName : `${room.name}`}
      </div>
      {lastMessage && (
        <div className={`text-xs truncate ${selectedRoomId === room._id ? "text-sidebar-primary-foreground/80" : "text-sidebar-foreground/60"}`}>
          <strong>{lastMessage.senderId}:</strong> {lastMessage.content}
        </div>
      )}
    </div>
  );
}
