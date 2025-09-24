"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import AddLeaderForm from "@/components/add-leader-form";
import { getLeaders, likeLeader, dislikeLeader } from "@/lib/api";

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

  const handleLike = async (leaderId: number) => {
    try {
      await likeLeader(leaderId.toString());
      // Refresh the leaders list to get updated vote status
      await fetchLeaders();
    } catch (error) {
      console.error("Error liking leader:", error);
    }
  };

  const handleDislike = async (leaderId: number) => {
    try {
      await dislikeLeader(leaderId.toString());
      // Refresh the leaders list to get updated vote status
      await fetchLeaders();
    } catch (error) {
      console.error("Error disliking leader:", error);
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
            <CardFooter className="flex flex-col space-y-3">
              <div className="flex justify-between items-center w-full">
                <div className="flex space-x-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm flex items-center gap-1">
                    <ThumbsUp size={14} />
                    {leader.likes}
                  </span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm flex items-center gap-1">
                    <ThumbsDown size={14} />
                    {leader.dislikes}
                  </span>
                </div>
                <Button asChild size="sm">
                  <Link href={`/leaders/${leader.id}`}>View Details</Link>
                </Button>
              </div>
              <div className="flex space-x-2 w-full">
                <Button
                  variant={leader.voteStatus === "LIKED" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleLike(leader.id)}
                  className={`flex-1 flex items-center gap-1 ${
                    leader.voteStatus === "LIKED" 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : "hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                  }`}
                >
                  <ThumbsUp size={16} />
                  {leader.voteStatus === "LIKED" ? "Liked" : "Like"}
                </Button>
                <Button
                  variant={leader.voteStatus === "DISLIKED" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDislike(leader.id)}
                  className={`flex-1 flex items-center gap-1 ${
                    leader.voteStatus === "DISLIKED" 
                      ? "bg-red-600 hover:bg-red-700 text-white" 
                      : "hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                  }`}
                >
                  <ThumbsDown size={16} />
                  {leader.voteStatus === "DISLIKED" ? "Disliked" : "Dislike"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
            <AddLeaderForm onLeaderAdded={fetchLeaders} />

    </div>
  );
}
