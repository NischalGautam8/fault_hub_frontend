"use client";
import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { UserSearchDropdown } from './UserSearchDropdown';
import { useAuth } from '@/hooks/useAuth';

interface CreateDMModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDMCreated: (roomId: string) => void;
}

export function CreateDMModal({ isOpen, onClose, onDMCreated }: CreateDMModalProps) {
  const { username } = useAuth();
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);
  const createDMRoomMutation = useMutation(api.rooms.createDMRoom);

  const handleCreateDM = async () => {
    if (!selectedUser || !username) return;

    setLoading(true);
    try {
      const room = await createDMRoomMutation({ username, otherUsername: selectedUser });
      const roomId = typeof room === 'string' ? room : room._id;
      onDMCreated(roomId);
      setSelectedUser('');
      onClose();
    } catch (error) {
      console.error('Failed to create DM:', error);
      alert('Failed to create DM. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
        <h2 className="text-xl font-semibold mb-4">Start New Direct Message</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search for a user:
          </label>
          <UserSearchDropdown
            onSelectUser={setSelectedUser}
            placeholder="Type username or email..."
          />
          {selectedUser && (
            <div className="mt-2 text-sm text-green-600">
              Selected: {selectedUser}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateDM}
            disabled={!selectedUser || loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Start Chat'}
          </button>
        </div>
      </div>
    </div>
  );
}