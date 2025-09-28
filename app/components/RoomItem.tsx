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
  const displayName = (room as any).displayName || room.name;
  const isDM = room.isprivate && room.members.length === 2;

  return (
    <div 
      key={room._id} 
      className={`p-2 mb-1 rounded cursor-pointer ${selectedRoomId === room._id ? "bg-blue-100" : "hover:bg-gray-100"}`}
      onClick={() => {
        setSelectedRoomId(room._id);
      }}
    >
      <div className="font-semibold">
        {isDM ? displayName : `${room.name} ${room.isprivate ? "(Private)" : "(Public)"}`}
      </div>
      {lastMessage && (
        <div className="text-sm text-gray-600">
          {lastMessage.senderId}: {lastMessage.content} - {new Date(lastMessage.createdAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}
