"use client";
import { useState, useRef, useEffect } from 'react';
import { useUserSearch } from '@/hooks/useUserSearch';

interface User {
  id: number;
  username: string;
  email: string;
}

interface UserSearchDropdownProps {
  onSelectUser: (username: string) => void;
  placeholder?: string;
  className?: string;
}

export function UserSearchDropdown({ onSelectUser, placeholder = "Search users...", className = "" }: UserSearchDropdownProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { users, loading, error } = useUserSearch(query);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectUser = (user: User) => {
    onSelectUser(user.username);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      
      {isOpen && (query.length > 0) && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {loading && (
            <div className="px-3 py-2 text-gray-500">Searching...</div>
          )}
          
          {error && (
            <div className="px-3 py-2 text-red-500">Error: {error}</div>
          )}
          
          {!loading && !error && users.length === 0 && query.length > 0 && (
            <div className="px-3 py-2 text-gray-500">No users found</div>
          )}
          
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => handleSelectUser(user)}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium">{user.username}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}