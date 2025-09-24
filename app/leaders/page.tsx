"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import AddLeaderForm from "@/components/add-leader-form";
import { getLeaders } from "@/lib/api";

// Define types for our data
interface Leader {
  id: number;
  name: string;
  description: string;
  likes: number;
  dislikes: number;
  numberOfFaults: number;
  voteStatus?: "LIKED" | "DISLIKED" | null;
}

export default function LeadersPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaders = async () => {
    try {
      const data = await getLeaders();
      setLeaders(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching leaders:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaders();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading leaders...</div>;
  }

return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Leaders</h1>
      <AddLeaderForm onLeaderAdded={fetchLeaders} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leaders.map((leader) => (
          <Card key={leader.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{leader.name}</CardTitle>
              <CardDescription>{leader.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p>Faults: {leader.numberOfFaults}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex space-x-2">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Likes: {leader.likes}</span>
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded">Dislikes: {leader.dislikes}</span>
              </div>
              <Button asChild>
                <Link href={`/leaders/${leader.id}`}>View Details</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
