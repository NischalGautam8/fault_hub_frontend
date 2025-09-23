"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { createFault } from "@/lib/api";

interface AddFaultFormProps {
  leaderId: number;
  onFaultAdded: () => void;
}

export default function AddFaultForm({ leaderId, onFaultAdded }: AddFaultFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await createFault(leaderId.toString(), title, description, imageUrl);
      // Handle successful creation
      setSuccess("Fault added successfully!");
      setTitle("");
      setDescription("");
      setImageUrl("");
      // Notify parent component that fault was added
      onFaultAdded();
    } catch (err) {
      setError("An error occurred while adding the fault");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8 p-6 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Add New Fault</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Fault Title</Label>
          <Input
            id="title"
            placeholder="Enter fault title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="Enter fault description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image URL (optional)</Label>
          <Input
            id="imageUrl"
            placeholder="Enter image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-500">{success}</div>}
        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Fault"}
        </Button>
      </form>
    </div>
  );
}
