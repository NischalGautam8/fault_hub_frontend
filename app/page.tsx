"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import AddFaultForm from "@/components/add-fault-form";
import { getFaults, likeFault, dislikeFault, getAuthToken } from "@/lib/api"; // Import getAuthToken
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  leaders: Leader[];
}

export default function Home() {
  const router = useRouter(); // Initialize useRouter
  const [faults, setFaults] = useState<Fault[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 5; // Number of items per page

  const fetchFaults = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const data = await getFaults(page, limit);
      setFaults(data.content);
      setTotalPages(data.pagination.pageCount);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching faults:", error);
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchFaults(currentPage);
  }, [currentPage, fetchFaults]);

  const handleFaultAdded = () => {
    fetchFaults(currentPage);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Faults...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient-primary">
            Hold Leaders Accountable
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Report, track, and vote on leadership accountability. Your voice matters in building better governance.
          </p>
        </div>

        <AddFaultForm onFaultAdded={handleFaultAdded} />
        
        {faults.length === 0 && !loading ? (
          <p className="text-center text-muted-foreground">No faults found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {faults.map((fault) => (
              <Card key={fault.id} className="glass-card floating-card p-2 overflow-hidden"> {/* Changed compact-padding to p-2 */}
                {fault.imageUrl && (
                  <div className="aspect-video relative -m-2 mb-2 rounded-lg overflow-hidden"> {/* Changed -m-3 mb-3 to -m-2 mb-2 */}
                    <img 
                      src={fault.imageUrl} 
                      alt={fault.title} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                )}
                
                <CardHeader className="p-2"> {/* Changed compact-padding-sm to p-2 */}
                  <CardTitle className="text-base font-semibold line-clamp-2">{fault.title}</CardTitle> {/* Reduced font size */}
                </CardHeader>
                
                <CardContent className="p-2 pt-0"> {/* Changed compact-padding-sm to p-2 pt-0 */}
                  <p className="text-xs text-muted-foreground line-clamp-3 mb-2">{fault.description}</p> {/* Reduced font size and margin */}
                  
                  {fault.leaders && fault.leaders.length > 0 && (
                    <div className="mb-2"> {/* Reduced margin */}
                      <h4 className="text-xs font-medium mb-1 text-muted-foreground">Leaders Involved:</h4> {/* Reduced margin */}
                      <div className="flex flex-wrap gap-1">
                        {fault.leaders.map((leader) => (
                          <Link key={leader.id} href={`/leaders/${leader.id}`} passHref>
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary hover:bg-primary/20 cursor-pointer transition-colors"> {/* Reduced padding */}
                              {leader.name}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vote Statistics */}
                  <div className="flex items-center justify-between mb-2"> {/* Reduced margin */}
                    <div className="flex items-center space-x-1 text-xs"> {/* Reduced space-x */}
                      <div className="flex items-center space-x-0.5 bg-success-green/10 text-success-green px-1.5 py-0.5 rounded-full"> {/* Reduced padding and space-x */}
                        <TrendingUp className="h-3 w-3" />
                        <span>{fault.percentageLiked.toFixed(0)}%</span>
                      </div>
                      <div className="flex items-center space-x-0.5 text-muted-foreground"> {/* Reduced space-x */}
                        <ThumbsUp className="h-3 w-3" />
                        <span>{fault.likes}</span>
                      </div>
                      <div className="flex items-center space-x-0.5 text-muted-foreground"> {/* Reduced space-x */}
                        <ThumbsDown className="h-3 w-3" />
                        <span>{fault.dislikes}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="p-2 pt-0"> {/* Changed compact-padding-sm to p-2 pt-0 */}
                  <div className="flex space-x-1 w-full"> {/* Reduced space-x */}
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
                                    voteStatus: f.voteStatus === "liked" ? "none" : "liked",
                                    likes: f.voteStatus === "liked" ? f.likes - 1 : f.likes + 1,
                                    dislikes: f.voteStatus === "disliked" ? f.dislikes - 1 : f.dislikes,
                                    percentageLiked:
                                      f.voteStatus === "liked"
                                        ? ((f.likes - 1) / Math.max(1, f.likes - 1 + f.dislikes)) * 100
                                        : ((f.likes + 1) / Math.max(1, f.likes + 1 + (f.voteStatus === "disliked" ? f.dislikes - 1 : f.dislikes))) * 100,
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
                      variant={fault.voteStatus === "liked" ? "default" : "outline"}
                      size="sm"
                      className={`flex-1 modern-button ${
                        fault.voteStatus === "liked"
                          ? "gradient-success text-white border-0"
                          : "hover:bg-success-green/10 hover:text-success-green hover:border-success-green/30"
                      }`}
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" /> {/* Reduced icon size */}
                      {fault.voteStatus === "liked" ? "Agreed" : "Agree"}
                    </Button>

                    <Button
                      variant={fault.voteStatus === "disliked" ? "default" : "outline"}
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
                                    voteStatus: f.voteStatus === "disliked" ? "none" : "disliked",
                                    dislikes: f.voteStatus === "disliked" ? f.dislikes - 1 : f.dislikes + 1,
                                    likes: f.voteStatus === "liked" ? f.likes - 1 : f.likes,
                                    percentageLiked:
                                      f.voteStatus === "disliked"
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
                        fault.voteStatus === "disliked"
                          ? "bg-destructive hover:bg-destructive/90 text-white border-0"
                          : "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                      }`}
                    >
                      <ThumbsDown className="h-3 w-3 mr-1" /> {/* Reduced icon size */}
                      {fault.voteStatus === "disliked" ? "Disagreed" : "Disagree"}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                  aria-disabled={currentPage === 0}
                  tabIndex={currentPage === 0 ? -1 : undefined}
                  className={currentPage === 0 ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={i === currentPage}
                    onClick={() => setCurrentPage(i)}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                  aria-disabled={currentPage === totalPages - 1}
                  tabIndex={currentPage === totalPages - 1 ? -1 : undefined}
                  className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : undefined}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}
