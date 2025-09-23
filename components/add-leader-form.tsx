"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { createLeader } from "@/lib/api";

interface AddLeaderFormProps {
  onLeaderAdded: () => void;
}

export default function AddLeaderForm({ onLeaderAdded }: AddLeaderFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await createLeader(name, description);
      // Handle successful creation
      setSuccess("Leader added successfully!");
      setName("");
      setDescription("");
      // Notify parent component that leader was added
      onLeaderAdded();
    } catch (err) {
      // Handle error
      setError("Failed to add leader");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-8 p-6 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Add New Leader</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Leader Name</Label>
          <Input
            id="name"
            placeholder="Enter leader name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="Enter leader description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-red-500">{error}</div>}
        {success && <div className="text-green-500">{success}</div>}
        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Leader"}
        </Button>
      </form>
    </div>
  );
}
