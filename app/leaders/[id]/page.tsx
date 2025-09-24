"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddFaultForm from "@/components/add-fault-form";
import { getLeader, likeLeader, dislikeLeader } from "@/lib/api";
import { toast } from "sonner";

// Define types for our data
interface Fault {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

interface ApiError extends Error {
  message: string;
}

interface Leader {
  id: number;
  name: string;
  description: string;
  likes: number;
  dislikes: number;
  numberOfFaults: number;
  faults: Fault[];
  voteStatus?: "LIKED" | "DISLIKED" | null;
}

export default function LeaderDetailPage({ params }: { params: { id: string } }) {
  const [leader, setLeader] = useState<Leader | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchLeader = async () => {
    try {
      const data = await getLeader(params.id);
      setLeader(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching leader:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeader();
  }, [params.id]);

  const handleFaultAdded = () => {
    // Refresh the leader data when a fault is added
    fetchLeader();
  };

  const handleLike = async () => {
    try {
      await likeLeader(params.id);
      fetchLeader();
      toast.success("Leader liked successfully!");
    } catch (error: unknown) {
      console.error("Error liking leader:", error);
      if (error instanceof Error) {
        toast.error(error.message || "Failed to like leader. Please try again.");
      } else {
        toast.error("Failed to like leader. Please try again.");
      }
    }
  };

  const handleDislike = async () => {
    try {
      await dislikeLeader(params.id);
      fetchLeader();
      toast.success("Leader disliked successfully!");
    } catch (error: unknown) {
      console.error("Error disliking leader:", error);
      if (error instanceof Error) {
        toast.error(error.message || "Failed to dislike leader. Please try again.");
      } else {
        toast.error("Failed to dislike leader. Please try again.");
      }
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading leader details...</div>;
  }

  if (!leader) {
    return <div className="flex justify-center items-center h-screen">Leader not found</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/leaders">← Back to Leaders</Link>
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{leader.name}</CardTitle>
          <CardDescription>{leader.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Faults: {leader.numberOfFaults}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex space-x-4">
            <Button 
              onClick={handleLike} 
              variant={leader.voteStatus === "LIKED" ? "default" : "outline"}
              disabled={leader.voteStatus === "LIKED" || leader.voteStatus === "DISLIKED"}
            >
              Like ({leader.likes})
            </Button>
            <Button 
              variant={leader.voteStatus === "DISLIKED" ? "destructive" : "outline"} 
              onClick={handleDislike}
              disabled={leader.voteStatus === "LIKED" || leader.voteStatus === "DISLIKED"}
            >
              Dislike ({leader.dislikes})
            </Button>
          </div>
        </CardFooter>
      </Card>

      <AddFaultForm onFaultAdded={handleFaultAdded} />

      <h2 className="text-2xl font-bold mb-4">Faults</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {leader.faults && leader.faults.map((fault) => (
          <Card key={fault.id} className="flex flex-col">
            {fault.imageUrl && (
              <div className="aspect-video relative">
                <img 
                  src={fault.imageUrl} 
                  alt={fault.title} 
                  className="w-full h-full object-cover rounded-t-lg"
                />
              </div>
            )}
            <CardHeader>
              <CardTitle>{fault.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p>{fault.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
