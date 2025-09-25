"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react";
import { createFault, searchLeaders } from "@/lib/api";
import { Plus, X, Search, AlertCircle } from "lucide-react";

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
  const [image, setImage] = useState<File | null>(null);
  const [leaderSearch, setLeaderSearch] = useState("");
  const [leaderSearchResults, setLeaderSearchResults] = useState<Leader[]>([]);
  const [selectedLeaders, setSelectedLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showFullForm, setShowFullForm] = useState(false);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debounced search function
  useEffect(() => {
    if (leaderSearch.trim() === "") {
      setLeaderSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchLeaders(leaderSearch);
        setLeaderSearchResults(results); // Directly use the results array
        setIsSearching(false);
      } catch (err) {
        console.error("Error searching leaders:", err);
        setLeaderSearchResults([]);
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [leaderSearch]);

  const handleLeaderSelect = (leader: Leader) => {
    if (selectedLeaders.length >= 5) {
      setError("You can only select up to 5 leaders.");
      return;
    }
    if (!selectedLeaders.some(l => l.id === leader.id)) {
      setSelectedLeaders([...selectedLeaders, leader]);
      setError(""); // Clear any previous leader selection error
    }
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

    if (selectedLeaders.length === 0) {
      setError("Please select at least one leader.");
      setLoading(false);
      return;
    }

    if (selectedLeaders.length > 5) {
      setError("You can only select up to 5 leaders.");
      setLoading(false);
      return;
    }

    if (!image) {
      setError("Please select an image file.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("leaderIds", JSON.stringify(selectedLeaders.map(l => l.id)));
      formData.append("image", image);

      await createFault(formData);
      
      setSuccess("Fault submitted successfully!");
      setTitle("");
      setDescription("");
      setImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedLeaders([]);
      setShowFullForm(false);
      onFaultAdded();
    } catch (err) {
      setError("An error occurred while submitting the report");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8">
      <div className="glass-card p-4 rounded-xl"> {/* Replaced compact-padding with p-4 */}
        {success && (
          <div className="flex items-center space-x-2 text-success-green bg-success-green/10 p-3 rounded-lg mb-4">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{success}</span>
          </div>
        )}
        
        {!showFullForm && (
          <div className="flex gap-3">
            <Input
              placeholder="Report a Leader's Fault."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (e.target.value && !showFullForm) {
                  setShowFullForm(true);
                }
              }}
              onFocus={() => setShowFullForm(true)}
              className="flex-grow bg-white/50 border-white/30 focus:bg-white/80 transition-all"
            />
            
            <Button 
              onClick={() => setShowFullForm(true)}
              disabled={showFullForm}
              className="modern-button gradient-primary text-white border-0"
            >
              <Plus className="h-4 w-4 mr-1" />
              Report
            </Button>
          </div>
        )}
        
        {showFullForm && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Fault Title</Label>
                <Input
                  id="title"
                  placeholder="Brief title for Fault"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="bg-white/50 border-white/30 focus:bg-white/80 transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image" className="text-sm font-medium">Image</Label>
                <Input
                  id="image"
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => setImage(e.target.files ? e.target.files[0] : null)}
                  required
                  className="bg-white/50 border-white/30 focus:bg-white/80 transition-all"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Detailed Description of the Fault</Label>
              <Input
                id="description"
                placeholder="Provide detailed information about the fault"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="bg-white/50 border-white/30 focus:bg-white/80 transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="leaderSearch" className="text-sm font-medium">Select Leaders Involved</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="leaderSearch"
                  placeholder="Search for leaders to hold accountable..."
                  value={leaderSearch}
                  onChange={(e) => setLeaderSearch(e.target.value)}
                  className="pl-10 bg-white/50 border-white/30 focus:bg-white/80 transition-all"
                />
              </div>
              
              {/* Selected leaders display */}
              {selectedLeaders.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {selectedLeaders.map((leader) => (
                    <div key={leader.id} className="flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                      <span>{leader.name}</span>
                      <button 
                        type="button" 
                        onClick={() => handleLeaderRemove(leader.id)}
                        className="ml-2 hover:text-primary/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Search results dropdown */}
              {leaderSearchResults.length > 0 && (
                <div className="glass-card border rounded-lg mt-2 max-h-60 overflow-y-auto">
                  {leaderSearchResults.map((leader) => (
                    <div 
                      key={leader.id} 
                      className="p-3 hover:bg-white/20 cursor-pointer border-b border-white/10 last:border-b-0 transition-colors"
                      onClick={() => handleLeaderSelect(leader)}
                    >
                      <div className="font-medium text-sm">{leader.name}</div>
                      <div className="text-xs text-muted-foreground">{leader.description}</div>
                    </div>
                  ))}
                </div>
              )}
              
              {isSearching && (
                <div className="text-xs text-muted-foreground flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
                  <span>Searching leaders...</span>
                </div>
              )}
            </div>
            
            {error && (
              <div className="flex items-center space-x-2 text-destructive bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
            
            <div className="flex justify-between pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowFullForm(false);
                  setTitle("");
                  setDescription("");
                  setImage(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                  setSelectedLeaders([]);
                  setError("");
                  setSuccess("");
                }}
                className="modern-button"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="modern-button gradient-primary text-white border-0"
              >
                {loading ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
