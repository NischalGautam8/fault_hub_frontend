"use client"
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { PrivateChat } from "../components/PrivateChat"; // Import the new component
import { RoomItem } from "../components/RoomItem"; // Import the RoomItem component
import { useAuth } from "@/hooks/useAuth";
import { CreateDMModal } from "@/components/CreateDMModal";
import { InfiniteMessageList } from "@/components/InfiniteMessageList";

type ChatTab = "public" | "private";

function ChatContent() {
  const { isAuthenticated, username } = useAuth();
  
  const [activeTab, setActiveTab] = useState<ChatTab>("public");
  const [selectedRoomId, setSelectedRoomId] = useState<Id<"rooms"> | null>(null);
  const [showCreateDMModal, setShowCreateDMModal] = useState(false);
  
  const privateRooms = useQuery(api.rooms.getMyRooms, { username: username || undefined }) ?? [];
  const publicRooms = useQuery(api.rooms.getPublicRooms, {}) ?? [];
  const [messageContent, setMessageContent] = useState("");
  const sendMessageMutation = useMutation(api.messages.sendMessage);

  // Filter rooms based on the active tab
  const displayedRooms = activeTab === "public" ? publicRooms : privateRooms;

  // Select the first room by default if available when on the active tab
  useEffect(() => {
    if (activeTab === "public" && publicRooms.length > 0 && selectedRoomId === null) {
      setSelectedRoomId(publicRooms[0]._id);
    } else if (activeTab === "private" && privateRooms.length > 0 && selectedRoomId === null) {
      setSelectedRoomId(privateRooms[0]._id);
    } else if (displayedRooms.length === 0 && selectedRoomId !== null) {
      setSelectedRoomId(null);
    }
  }, [activeTab, publicRooms, privateRooms, selectedRoomId, displayedRooms]);

  // Reset selectedRoomId when switching tabs if the current selected room is not in the new tab's list
  useEffect(() => {
    if (selectedRoomId && !displayedRooms.some(room => room._id === selectedRoomId)) {
      setSelectedRoomId(null);
    }
  }, [activeTab, selectedRoomId, displayedRooms]);


  const sendMessage = async () => {
    if (!messageContent.trim() || !selectedRoomId || !username) return;
    
    try {
      await sendMessageMutation({ content: messageContent, roomId: selectedRoomId, username });
      setMessageContent("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleDMCreated = (roomId: string) => {
    setSelectedRoomId(roomId as Id<"rooms">);
    setActiveTab("private");
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Please log in to access chat</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Chat</h2>
      
      {/* Tab navigation */}
      <div className="flex border-b mb-4">
        <button 
          className={`py-2 px-4 text-lg ${activeTab === "public" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
          onClick={() => {
            setActiveTab("public");
            setSelectedRoomId(publicRooms.length > 0 ? publicRooms[0]._id : null);
          }}
        >
          Public Chat
        </button>
        <div className="flex items-center">
          <button 
            className={`py-2 px-4 text-lg ${activeTab === "private" ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-600"}`}
            onClick={() => {
              setActiveTab("private");
              setSelectedRoomId(privateRooms.length > 0 ? privateRooms[0]._id : null);
            }}
          >
            Private Chat
          </button>
          {activeTab === "private" && (
            <button
              onClick={() => setShowCreateDMModal(true)}
              className="ml-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-blue-600"
              title="Start new DM"
            >
              +
            </button>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {activeTab === "public" && (
          <>
            {/* Current Room Name */}
            <h3 className="text-xl font-semibold mb-2">
              {selectedRoomId ? publicRooms.find(room => room._id === selectedRoomId)?.name : "Select a room"}
            </h3>

            {/* Messages display with infinite scroll */}
            <div className="flex-1 border rounded bg-gray-50 flex flex-col">
              {selectedRoomId ? (
                <InfiniteMessageList roomId={selectedRoomId} />
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Please select a room to view messages
                </div>
              )}
            </div>
            
            {/* Message input */}
            <div className="flex mb-4">
              <input
                type="text"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Say Something..."
                className="flex-1 p-2 border rounded-l text-black"
                disabled={!selectedRoomId}
              />
              <button 
                onClick={sendMessage} 
                className="bg-blue-500 text-white p-2 rounded-r"
                disabled={!selectedRoomId || !messageContent.trim()}
              >
                Send
              </button>
            </div>
          </>
        )}

        {activeTab === "private" && (
          <PrivateChat 
            selectedRoomId={selectedRoomId} 
            setSelectedRoomId={setSelectedRoomId} 
            privateRooms={privateRooms} 
          />
        )}
      </div>
      
      {/* Rooms list at the bottom */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-bold">Rooms</h3>
          <span className="text-gray-600">{displayedRooms.length} rooms</span>
        </div>
        <div className="overflow-y-auto h-48 border rounded p-2 bg-gray-50">
          {displayedRooms.map((room) => (
            <RoomItem 
              key={room._id} 
              room={room} 
              selectedRoomId={selectedRoomId} 
              setSelectedRoomId={setSelectedRoomId} 
            />
          ))}
        </div>
      </div>

      {/* Create DM Modal */}
      <CreateDMModal
        isOpen={showCreateDMModal}
        onClose={() => setShowCreateDMModal(false)}
        onDMCreated={handleDMCreated}
      />
    </div>
  );
}

export default function Page() {
  return (
    <>
      <ChatContent />
    
    </>
    );    
}
