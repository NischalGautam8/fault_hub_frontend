import { useState, useEffect } from 'react';
import { getAuthToken } from '@/lib/api';

interface User {
  id: number;
  username: string;
  email: string;
  // Add other user fields as needed
}

export const useUserSearch = (query: string) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    const searchUsers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = getAuthToken();
        const response = await fetch(`http://localhost:8080/api/auth/search?query=${encodeURIComponent(query)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to search users');
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300); // Debounce search

    return () => clearTimeout(debounceTimer);
  }, [query]);

  return { users, loading, error };
};