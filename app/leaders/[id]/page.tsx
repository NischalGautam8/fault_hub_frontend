"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddFaultForm from "@/components/add-fault-form";
import { getLeader, getLeaderFaults, likeLeader, dislikeLeader, likeFault, dislikeFault } from "@/lib/api";
import { toast } from "sonner";

// Define types for our data
interface Fault {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  likes: number;
  dislikes: number;
  percentageLiked: number;
  voteStatus?: "LIKED" | "DISLIKED" | null;
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
  voteStatus?: "LIKED" | "DISLIKED" | null;
}

export default function LeaderDetailPage({ params }: { params: { id: string } }) {
  const [leader, setLeader] = useState<Leader | null>(null);
  const [faults, setFaults] = useState<Fault[]>([]);
  const [loadingLeader, setLoadingLeader] = useState(true);
  const [loadingFaults, setLoadingFaults] = useState(true);
  const router = useRouter();

  const fetchLeader = async () => {
    try {
      const data = await getLeader(params.id);
      setLeader(data);
    } catch (error) {
      console.error("Error fetching leader:", error);
    } finally {
      setLoadingLeader(false);
    }
  };

  const fetchFaults = async () => {
    try {
      const data = await getLeaderFaults(params.id);
      setFaults(data);
    } catch (error) {
      console.error("Error fetching faults:", error);
    } finally {
      setLoadingFaults(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchLeader();
      fetchFaults();
    }
  }, [params.id]);

  const handleFaultAdded = () => {
    // Refresh the leader data and faults when a fault is added
    fetchLeader();
    fetchFaults();
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

  if (loadingLeader) {
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
        <CardFooter className="flex flex-col space-y-4">
          <div className="flex justify-between items-center w-full">
            <div className="flex space-x-3">
              <span className="bg-green-100 text-green-800 px-3 py-2 rounded text-sm flex items-center gap-1">
                <ThumbsUp size={16} />
                {leader.likes} Likes
              </span>
              <span className="bg-red-100 text-red-800 px-3 py-2 rounded text-sm flex items-center gap-1">
                <ThumbsDown size={16} />
                {leader.dislikes} Dislikes
              </span>
            </div>
          </div>
          <div className="flex space-x-3 w-full">
            <Button 
              onClick={handleLike} 
              variant={leader.voteStatus === "LIKED" ? "default" : "outline"}
              className={`flex-1 flex items-center gap-2 ${
                leader.voteStatus === "LIKED" 
                  ? "bg-green-600 hover:bg-green-700 text-white" 
                  : "hover:bg-green-50 hover:text-green-700 hover:border-green-300"
              }`}
            >
              <ThumbsUp size={18} />
              {leader.voteStatus === "LIKED" ? "Liked" : "Like"}
            </Button>
            <Button 
              variant={leader.voteStatus === "DISLIKED" ? "default" : "outline"} 
              onClick={handleDislike}
              className={`flex-1 flex items-center gap-2 ${
                leader.voteStatus === "DISLIKED" 
                  ? "bg-red-600 hover:bg-red-700 text-white" 
                  : "hover:bg-red-50 hover:text-red-700 hover:border-red-300"
              }`}
            >
              <ThumbsDown size={18} />
              {leader.voteStatus === "DISLIKED" ? "Disliked" : "Dislike"}
            </Button>
          </div>
        </CardFooter>
      </Card>


      <h2 className="text-2xl font-bold mb-4">Faults By {leader.name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loadingFaults ? (
          // Skeleton UI for loading faults
          Array.from({ length: leader.numberOfFaults > 0 ? leader.numberOfFaults : 3 }).map((_, index) => (
            <Card key={index} className="flex flex-col animate-pulse">
              <div className="aspect-video relative bg-gray-200 rounded-t-lg"></div>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <div className="flex justify-between items-center w-full">
                  <div className="flex space-x-3">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="flex space-x-3 w-full">
                  <div className="h-10 bg-gray-200 rounded flex-1"></div>
                  <div className="h-10 bg-gray-200 rounded flex-1"></div>
                </div>
              </CardFooter>
            </Card>
          ))
        ) : faults.length === 0 ? (
          <p>No faults found for this leader.</p>
        ) : (
          faults.map((fault) => (
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
              <CardFooter className="flex flex-col space-y-4">
                <div className="flex justify-between items-center w-full">
                  <div className="flex space-x-3">
                    <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded text-sm flex items-center gap-1">
                      {fault.percentageLiked.toFixed(0)}% Liked
                    </span>
                    <span className="bg-green-100 text-green-800 px-3 py-2 rounded text-sm flex items-center gap-1">
                      <ThumbsUp size={16} />
                      {fault.likes}
                    </span>
                    <span className="bg-red-100 text-red-800 px-3 py-2 rounded text-sm flex items-center gap-1">
                      <ThumbsDown size={16} />
                      {fault.dislikes}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-3 w-full">
                  <Button 
                    onClick={async () => {
                      try {
                        await likeFault(fault.id.toString());
                        fetchFaults(); // Refresh faults after liking
                        toast.success("Fault liked successfully!");
                      } catch (error: unknown) {
                        console.error("Error liking fault:", error);
                        if (error instanceof Error) {
                          toast.error(error.message || "Failed to like fault. Please try again.");
                        } else {
                          toast.error("Failed to like fault. Please try again.");
                        }
                      }
                    }} 
                    variant={fault.voteStatus === "LIKED" ? "default" : "outline"}
                    className={`flex-1 flex items-center gap-2 ${
                      fault.voteStatus === "LIKED" 
                        ? "bg-green-600 hover:bg-green-700 text-white" 
                        : "hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                    }`}
                  >
                    <ThumbsUp size={18} />
                    {fault.voteStatus === "LIKED" ? "Liked" : "Like"}
                  </Button>
                  <Button 
                    variant={fault.voteStatus === "DISLIKED" ? "default" : "outline"} 
                    onClick={async () => {
                      try {
                        await dislikeFault(fault.id.toString());
                        fetchFaults(); // Refresh faults after disliking
                        toast.success("Fault disliked successfully!");
                      } catch (error: unknown) {
                        console.error("Error disliking fault:", error);
                        if (error instanceof Error) {
                          toast.error(error.message || "Failed to dislike fault. Please try again.");
                        } else {
                          toast.error("Failed to dislike fault. Please try again.");
                        }
                      }
                    }}
                    className={`flex-1 flex items-center gap-2 ${
                      fault.voteStatus === "DISLIKED" 
                        ? "bg-red-600 hover:bg-red-700 text-white" 
                        : "hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                    }`}
                  >
                    <ThumbsDown size={18} />
                    {fault.voteStatus === "DISLIKED" ? "Disliked" : "Dislike"}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
