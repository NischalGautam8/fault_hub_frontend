"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import AddFaultForm from "@/components/add-fault-form";
import { getFaults, likeFault, dislikeFault } from "@/lib/api";
import { toast } from "sonner";

// Define types for our data
interface Leader {
  id: number;
  name: string;
}

interface Fault {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  likes: number;
  dislikes: number;
  percentageLiked: number;
  voteStatus?: "liked" | "disliked" | "none";
  leaders: Leader[]; // Add leaders field
}

export default function Home() {
  const [faults, setFaults] = useState<Fault[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFaults = async () => {
    try {
      const data = await getFaults();
      setFaults(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching faults:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaults();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading faults...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      
      <AddFaultForm onFaultAdded={fetchFaults} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {faults.map((fault) => (
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
              <CardDescription>Fault Description</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p>{fault.description}</p>
              {fault.leaders && fault.leaders.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-2">Leaders Responsible:</h4>
                  <div className="flex flex-wrap gap-2">
                    {fault.leaders.map((leader) => (
                      <Link key={leader.id} href={`/leaders/${leader.id}`} passHref>
                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 hover:bg-gray-100 cursor-pointer">
                          {leader.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
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
                      
                      // Update local state
                      setFaults(prevFaults => 
                        prevFaults.map(f => 
                          f.id === fault.id 
                            ? {
                                ...f,
                                voteStatus: f.voteStatus === "liked" ? "none" : "liked",
                                likes: f.voteStatus === "liked" ? f.likes - 1 : 
                                       f.voteStatus === "disliked" ? f.likes + 1 : f.likes + 1,
                                dislikes: f.voteStatus === "disliked" ? f.dislikes - 1 : f.dislikes,
                                percentageLiked: f.voteStatus === "liked" 
                                  ? (f.likes - 1) / Math.max(1, (f.likes - 1) + f.dislikes) * 100
                                  : f.voteStatus === "disliked"
                                  ? (f.likes + 1) / Math.max(1, (f.likes + 1) + (f.dislikes - 1)) * 100
                                  : (f.likes + 1) / Math.max(1, (f.likes + 1) + f.dislikes) * 100
                              }
                            : f
                        )
                      );
                      
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
                  variant={fault.voteStatus === "liked" ? "default" : "outline"}
                  className={`flex-1 flex items-center gap-2 ${
                    fault.voteStatus === "liked" 
                      ? "bg-green-600 hover:bg-green-700 text-white" 
                      : "hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                  }`}
                >
                  <ThumbsUp size={18} />
                  {fault.voteStatus === "liked" ? "Liked" : "Like"}
                </Button>
                <Button 
                  variant={fault.voteStatus === "disliked" ? "default" : "outline"} 
                  onClick={async () => {
                    try {
                      await dislikeFault(fault.id.toString());
                      
                      // Update local state
                      setFaults(prevFaults => 
                        prevFaults.map(f => 
                          f.id === fault.id 
                            ? {
                                ...f,
                                voteStatus: f.voteStatus === "disliked" ? "none" : "disliked",
                                dislikes: f.voteStatus === "disliked" ? f.dislikes - 1 : 
                                         f.voteStatus === "liked" ? f.dislikes + 1 : f.dislikes + 1,
                                likes: f.voteStatus === "liked" ? f.likes - 1 : f.likes,
                                percentageLiked: f.voteStatus === "disliked" 
                                  ? f.likes / Math.max(1, f.likes + (f.dislikes - 1)) * 100
                                  : f.voteStatus === "liked"
                                  ? (f.likes - 1) / Math.max(1, (f.likes - 1) + (f.dislikes + 1)) * 100
                                  : f.likes / Math.max(1, f.likes + (f.dislikes + 1)) * 100
                              }
                            : f
                        )
                      );
                      
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
                    fault.voteStatus === "disliked" 
                      ? "bg-red-600 hover:bg-red-700 text-white" 
                      : "hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                  }`}
                >
                  <ThumbsDown size={18} />
                  {fault.voteStatus === "disliked" ? "Disliked" : "Dislike"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
