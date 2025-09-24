"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import { createFault, searchLeaders } from "@/lib/api";

interface Leader {
  id: number;
  name: string;
  description: string;
}

interface AddFaultFormProps {
  onFaultAdded: () => void;
}

export default function AddFaultForm({ onFaultAdded }: AddFaultFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [leaderSearch, setLeaderSearch] = useState("");
  const [leaderSearchResults, setLeaderSearchResults] = useState<Leader[]>([]);
  const [selectedLeaders, setSelectedLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showFullForm, setShowFullForm] = useState(false);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  useEffect(() => {
    if (leaderSearch.trim() === "") {
      setLeaderSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchLeaders(leaderSearch);
        // Limit to 5 results
        setLeaderSearchResults(results.slice(0, 5));
        setIsSearching(false);
      } catch (err) {
        console.error("Error searching leaders:", err);
        setLeaderSearchResults([]);
        setIsSearching(false);
      }
    }, 300); // 300ms debounce delay

    // Cleanup timeout on unmount or when leaderSearch changes
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [leaderSearch]);

  const handleLeaderSelect = (leader: Leader) => {
    // Check if leader is already selected
    if (!selectedLeaders.some(l => l.id === leader.id)) {
      setSelectedLeaders([...selectedLeaders, leader]);
    }
    // Clear search and results
    setLeaderSearch("");
    setLeaderSearchResults([]);
  };

  const handleLeaderRemove = (leaderId: number) => {
    setSelectedLeaders(selectedLeaders.filter(leader => leader.id !== leaderId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate that at least one leader is selected
    if (selectedLeaders.length === 0) {
      setError("Please select at least one leader");
      setLoading(false);
      return;
    }

    try {
      // Create a fault with all selected leader IDs
      await createFault(title, description, selectedLeaders.map(l => l.id), imageUrl);
      
      // Handle successful creation
      setSuccess("Fault added successfully!");
      setTitle("");
      setDescription("");
      setImageUrl("");
      setSelectedLeaders([]);
      setShowFullForm(false);
    } catch (err) {
      setError("An error occurred while adding the fault");
      console.error(err);
    } finally {
      setLoading(false);
    }
    
    // Notify parent component that fault was added
    onFaultAdded();
  };

  return (
    <div className="mb-6 p-4 border rounded-lg bg-white">
      {success && <div className="text-green-500 mb-2">{success}</div>}
      
      <div className="flex gap-3">
        <Input
          placeholder="Add a new fault"
          value={showFullForm ? title : ""}
          onChange={(e) => {
            setTitle(e.target.value);
            if (e.target.value && !showFullForm) {
              setShowFullForm(true);
            }
          }}
          onFocus={() => setShowFullForm(true)}
          className="flex-grow"
        />
        
        <Button 
          onClick={() => setShowFullForm(true)}
          disabled={showFullForm}
        >
          Post
        </Button>
      </div>
      
      {showFullForm && (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="space-y-2">
            <Input
              placeholder="Fault title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Input
              placeholder="Fault description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Input
              placeholder="Image URL (optional)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="leaderSearch">Leaders</Label>
            <Input
              id="leaderSearch"
              placeholder="Search leaders..."
              value={leaderSearch}
              onChange={(e) => setLeaderSearch(e.target.value)}
            />
            
            {/* Selected leaders display */}
            {selectedLeaders.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedLeaders.map((leader) => (
                  <div key={leader.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center text-sm">
                    <span>{leader.name}</span>
                    <button 
                      type="button" 
                      onClick={() => handleLeaderRemove(leader.id)}
                      className="ml-2 text-blue-800 hover:text-blue-900 font-bold"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Search results dropdown */}
            {leaderSearchResults.length > 0 && (
              <div className="border rounded-md mt-1 max-h-60 overflow-y-auto">
                {leaderSearchResults.map((leader) => (
                  <div 
                    key={leader.id} 
                    className="p-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleLeaderSelect(leader)}
                  >
                    <div className="font-medium">{leader.name}</div>
                    <div className="text-sm text-gray-600">{leader.description}</div>
                  </div>
                ))}
              </div>
            )}
            
            {isSearching && (
              <div className="text-sm text-gray-500">Searching...</div>
            )}
          </div>
          
          {error && <div className="text-red-500">{error}</div>}
          
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowFullForm(false);
                setTitle("");
                setDescription("");
                setImageUrl("");
                setSelectedLeaders([]);
                setError("");
                setSuccess("");
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Posting..." : "Post Fault"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
