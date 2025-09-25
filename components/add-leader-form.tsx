"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useRef } from "react"; // Import useEffect
import { useRouter } from "next/navigation"; // Import useRouter
import { createLeader, getAuthToken } from "@/lib/api"; // Import getAuthToken
import { UserPlus, AlertCircle, CheckCircle2 } from "lucide-react"; // Import CheckCircle2

interface AddLeaderFormProps {
  onLeaderAdded: () => void;
}

export default function AddLeaderForm({ onLeaderAdded }: AddLeaderFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter(); // Initialize useRouter

  // Effect to auto-hide success message
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 3000); // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleAddLeaderClick = () => {
    if (!getAuthToken()) {
      router.push("/login");
      return;
    }
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!image) {
      setError("Please select an image file.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("image", image);

      await createLeader(formData);
      setSuccess("Leader added successfully to the directory!");
      setName("");
      setDescription("");
      setImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setShowForm(false);
      onLeaderAdded();
    } catch (err) {
      setError("Failed to add leader to directory");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="">
      <div className="glass-card rounded-xl "> {/* Added p-6 here for consistent padding */}
        {success && (
          <div className="flex items-center space-x-2 text-success-green bg-success-green/10 p-3 rounded-lg mb-4 animate-fade-in-out"> {/* Added animation class */}
            <CheckCircle2 className="h-4 w-4" /> {/* Changed icon to CheckCircle2 */}
            <span className="text-sm font-medium">{success}</span>
          </div>
        )}

        {!showForm ? (
          <div className="flex items-center justify-center h-full">
            <Button 
              onClick={handleAddLeaderClick}
              className="modern-button gradient-secondary text-white border-0"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Leader to Directory
            </Button>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <UserPlus className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Add New Leader</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Leader Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter leader's full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="bg-white/50 border-white/30 focus:bg-white/80 transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                  <Input
                    id="description"
                    placeholder="e.g., Mayor, Governor, CEO, etc."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="bg-white/50 border-white/30 focus:bg-white/80 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-sm font-medium">Leader Image</Label>
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
                    setShowForm(false);
                    setName("");
                    setDescription("");
                    setImage(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
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
                  className="modern-button gradient-secondary text-white border-0"
                >
                  {loading ? "Adding..." : "Add Leader"}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
