"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, TrendingUp, ArrowLeft, FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Import Image component
import { getLeader, getLeaderFaults, likeLeader, dislikeLeader, likeFault, dislikeFault, getAuthToken } from "@/lib/api"; // Import getAuthToken
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

interface Leader {
  id: number;
  name: string;
  description: string;
  likes: number;
  dislikes: number;
  numberOfFaults: number;
  imageUrl?: string; // Add imageUrl to the Leader interface
  voteStatus?: "LIKED" | "DISLIKED" | null;
}

export default function LeaderDetailPage({ params }: { params: { id: string } }) {
  const [leader, setLeader] = useState<Leader | null>(null);
  const [faults, setFaults] = useState<Fault[]>([]);
  const [loadingLeader, setLoadingLeader] = useState(true);
  const [loadingFaults, setLoadingFaults] = useState(true);
  const [currentFaultsPage, setCurrentFaultsPage] = useState(0);
  const [totalFaultsPages, setTotalFaultsPages] = useState(0);
  const faultsLimit = 5; // Number of faults per page
  const router = useRouter();

  const fetchLeader = async () => {
    try {
      const data = await getLeader(params.id); // Re-add this line
      setLeader(data);
    } catch (error) {
      console.error("Error fetching leader:", error);
    } finally {
      setLoadingLeader(false);
    }
  };

  const fetchFaults = useCallback(async (page: number) => {
    setLoadingFaults(true);
    try {
      const data = await getLeaderFaults(params.id, page, faultsLimit);
      setFaults(data.content);
      setTotalFaultsPages(data.pagination.pageCount);
    } catch (error) {
      console.error("Error fetching faults:", error);
    } finally {
      setLoadingFaults(false);
    }
  }, [params.id, faultsLimit]);

  useEffect(() => {
    if (params.id) {
      fetchLeader();
      fetchFaults(currentFaultsPage);
    }
  }, [params.id, currentFaultsPage, fetchLeader, fetchFaults]);

  const handleLike = async () => {
    if (!getAuthToken()) {
      router.push("/login");
      return;
    }
    try {
      await likeLeader(params.id);
      setLeader((prevLeader) => {
        if (!prevLeader) return null;
        return {
          ...prevLeader,
          likes: prevLeader.voteStatus === "LIKED" ? prevLeader.likes - 1 : prevLeader.likes + 1,
          dislikes: prevLeader.voteStatus === "DISLIKED" ? prevLeader.dislikes - 1 : prevLeader.dislikes,
          voteStatus: prevLeader.voteStatus === "LIKED" ? null : "LIKED",
        };
      });
      toast.success("Vote recorded successfully!");
    } catch (error: unknown) {
      console.error("Error voting:", error);
      toast.error("Failed to record vote. Please try again.");
    }
  };

  const handleDislike = async () => {
    if (!getAuthToken()) {
      router.push("/login");
      return;
    }
    try {
      await dislikeLeader(params.id);
      setLeader((prevLeader) => {
        if (!prevLeader) return null;
        return {
          ...prevLeader,
          dislikes: prevLeader.voteStatus === "DISLIKED" ? prevLeader.dislikes - 1 : prevLeader.dislikes + 1,
          likes: prevLeader.voteStatus === "LIKED" ? prevLeader.likes - 1 : prevLeader.likes,
          voteStatus: prevLeader.voteStatus === "DISLIKED" ? null : "DISLIKED",
        };
      });
      toast.success("Vote recorded successfully!");
    } catch (error: unknown) {
      console.error("Error voting:", error);
      toast.error("Failed to record vote. Please try again.");
    }
  };

  if (loadingLeader) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading leader details...</p>
        </div>
      </div>
    );
  }

  if (!leader) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Leader Not Found</h2>
          <p className="text-muted-foreground mb-4">The requested leader could not be found.</p>
          <Button asChild className="modern-button">
            <Link href="/leaders">Back to Leaders</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Button variant="outline" asChild className="modern-button">
            <Link href="/leaders" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Leaders</span>
            </Link>
          </Button>
        </div>
        
        {/* Leader Profile Card */}
        <Card className="glass-card compact-padding mb-8">
          {leader.imageUrl && (
            <div className="relative w-full h-60 rounded-t-xl overflow-hidden">
              <Image
                src={leader.imageUrl}
                alt={leader.name}
                layout="fill"
                objectFit="cover"
                className="absolute inset-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
            </div>
          )}
          <CardHeader className="compact-padding-sm">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">{leader.name}</CardTitle>
                <CardDescription className="text-base mt-1">{leader.description}</CardDescription>
              </div>
              <div className="flex items-center space-x-1 bg-muted/50 px-3 py-2 rounded-full">
                <FileText className="h-4 w-4" />
                <span className="font-medium">{leader.numberOfFaults}</span>
                <span className="text-xs text-muted-foreground">reports</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="compact-padding-sm">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-1 bg-success-green/10 text-success-green px-3 py-2 rounded-full">
                <ThumbsUp className="h-4 w-4" />
                <span className="font-medium">{leader.likes}</span>
                <span className="text-sm">Support</span>
              </div>
              <div className="flex items-center space-x-1 bg-destructive/10 text-destructive px-3 py-2 rounded-full">
                <ThumbsDown className="h-4 w-4" />
                <span className="font-medium">{leader.dislikes}</span>
                <span className="text-sm">Opposition</span>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="compact-padding-sm">
            <div className="flex space-x-3 w-full">
              <Button 
                onClick={handleLike} 
                variant={leader.voteStatus === "LIKED" ? "default" : "outline"}
                className={`flex-1 modern-button ${
                  leader.voteStatus === "LIKED" 
                    ? "gradient-success text-white border-0" 
                    : "hover:bg-success-green/10 hover:text-success-green hover:border-success-green/30"
                }`}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                {leader.voteStatus === "LIKED" ? "Supported" : "Support"}
              </Button>
              <Button 
                variant={leader.voteStatus === "DISLIKED" ? "default" : "outline"} 
                onClick={handleDislike}
                className={`flex-1 modern-button ${
                  leader.voteStatus === "DISLIKED" 
                    ? "bg-destructive hover:bg-destructive/90 text-white border-0" 
                    : "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                }`}
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                {leader.voteStatus === "DISLIKED" ? "Opposed" : "Oppose"}
              </Button>
            </div>
          </CardFooter>
        </Card>

        <h2 className="text-2xl font-bold mb-6">Faults By {leader.name}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingFaults ? (
            Array.from({ length: faultsLimit }).map((_, index) => (
              <Card key={index} className="glass-card compact-padding animate-pulse">
                <div className="aspect-video bg-muted/50 rounded-lg mb-3"></div>
                <CardHeader className="compact-padding-sm">
                  <div className="h-5 bg-muted/50 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted/50 rounded w-1/2"></div>
                </CardHeader>
                <CardContent className="compact-padding-sm">
                  <div className="h-4 bg-muted/50 rounded w-full mb-2"></div>
                  <div className="h-4 bg-muted/50 rounded w-5/6"></div>
                </CardContent>
                <CardFooter className="compact-padding-sm">
                  <div className="flex space-x-2 w-full">
                    <div className="h-8 bg-muted/50 rounded flex-1"></div>
                    <div className="h-8 bg-muted/50 rounded flex-1"></div>
                  </div>
                </CardFooter>
              </Card>
            ))
          ) : faults.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Faults Yet</h3>
              <p className="text-muted-foreground">No Faults have been submitted for this leader.</p>
            </div>
          ) : (
            faults.map((fault) => (
              <Card key={fault.id} className="glass-card floating-card compact-padding">
                {fault.imageUrl && (
                  <div className="aspect-video relative -m-3 mb-3 rounded-lg overflow-hidden">
                    <Image
                      src={fault.imageUrl}
                      alt={fault.title}
                      layout="fill"
                      objectFit="cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                )}
                
                <CardHeader className="compact-padding-sm">
                  <CardTitle className="text-lg font-semibold line-clamp-2">{fault.title}</CardTitle>
                </CardHeader>
                
                <CardContent className="compact-padding-sm">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{fault.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs">
                      <div className="flex items-center space-x-1 bg-success-green/10 text-success-green px-2 py-1 rounded-full">
                        <TrendingUp className="h-3 w-3" />
                        <span>{fault.percentageLiked.toFixed(0)}%</span>
                      </div>
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{fault.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <ThumbsDown className="h-3 w-3" />
                        <span>{fault.dislikes}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="compact-padding-sm">
                  <div className="flex space-x-2 w-full">
                    <Button 
                      onClick={async () => {
                        if (!getAuthToken()) {
                          router.push("/login");
                          return;
                        }
                        try {
                          await likeFault(fault.id.toString());
                          setFaults((prevFaults) =>
                            prevFaults.map((f) =>
                              f.id === fault.id
                                ? {
                                    ...f,
                                    voteStatus: f.voteStatus === "LIKED" ? null : "LIKED",
                                    likes: f.voteStatus === "LIKED" ? f.likes - 1 : f.likes + 1,
                                    dislikes: f.voteStatus === "DISLIKED" ? f.dislikes - 1 : f.dislikes,
                                    percentageLiked:
                                      f.voteStatus === "LIKED"
                                        ? ((f.likes - 1) / Math.max(1, f.likes - 1 + f.dislikes)) * 100
                                        : ((f.likes + 1) / Math.max(1, f.likes + 1 + (f.voteStatus === "DISLIKED" ? f.dislikes - 1 : f.dislikes))) * 100,
                                  }
                                : f
                            )
                          );
                          toast.success("Vote recorded successfully!");
                        } catch (error: unknown) {
                          console.error("Error voting:", error);
                          toast.error("Failed to record vote. Please try again.");
                        }
                      }}
                      variant={fault.voteStatus === "LIKED" ? "default" : "outline"}
                      size="sm"
                      className={`flex-1 modern-button ${
                        fault.voteStatus === "LIKED" 
                          ? "gradient-success text-white border-0" 
                          : "hover:bg-success-green/10 hover:text-success-green hover:border-success-green/30"
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {fault.voteStatus === "LIKED" ? "Agreed" : "Agree"}
                    </Button>
                    <Button 
                      variant={fault.voteStatus === "DISLIKED" ? "default" : "outline"} 
                      size="sm"
                      onClick={async () => {
                        if (!getAuthToken()) {
                          router.push("/login");
                          return;
                        }
                        try {
                          await dislikeFault(fault.id.toString());
                          setFaults((prevFaults) =>
                            prevFaults.map((f) =>
                              f.id === fault.id
                                ? {
                                    ...f,
                                    voteStatus: f.voteStatus === "DISLIKED" ? null : "DISLIKED",
                                    dislikes: f.voteStatus === "DISLIKED" ? f.dislikes - 1 : f.dislikes + 1,
                                    likes: f.voteStatus === "LIKED" ? f.likes - 1 : f.likes,
                                    percentageLiked:
                                      f.voteStatus === "DISLIKED"
                                        ? (f.likes / Math.max(1, f.likes + f.dislikes - 1)) * 100
                                        : (f.likes / Math.max(1, f.likes + f.dislikes + 1)) * 100,
                                  }
                                : f
                            )
                          );
                          toast.success("Vote recorded successfully!");
                        } catch (error: unknown) {
                          console.error("Error voting:", error);
                          toast.error("Failed to record vote. Please try again.");
                        }
                      }}
                      className={`flex-1 modern-button ${
                        fault.voteStatus === "DISLIKED" 
                          ? "bg-destructive hover:bg-destructive/90 text-white border-0" 
                          : "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                      }`}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      {fault.voteStatus === "DISLIKED" ? "Disagreed" : "Disagree"}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        {totalFaultsPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() => setCurrentFaultsPage((prev) => Math.max(0, prev - 1))}
                  aria-disabled={currentFaultsPage === 0}
                  tabIndex={currentFaultsPage === 0 ? -1 : undefined}
                  className={currentFaultsPage === 0 ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>
              {[...Array(totalFaultsPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={i === currentFaultsPage}
                    onClick={() => setCurrentFaultsPage(i)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() => setCurrentFaultsPage((prev) => Math.min(totalFaultsPages - 1, prev + 1))}
                  aria-disabled={currentFaultsPage === totalFaultsPages - 1}
                  tabIndex={currentFaultsPage === totalFaultsPages - 1 ? -1 : undefined}
                  className={currentFaultsPage === totalFaultsPages - 1 ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
