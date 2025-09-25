"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, FileText, Eye } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import Image from "next/image";
import AddLeaderForm from "@/components/add-leader-form";
import { getLeaders, likeLeader, dislikeLeader, searchLeaders, getAuthToken } from "@/lib/api"; // Import getAuthToken
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";

// Define types for our data
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

export default function LeadersPage() {
  const router = useRouter(); // Initialize useRouter
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const limit = 5; // Number of items per page

  const fetchLeaders = useCallback(async (page: number, query: string = "") => {
    if (query) {
      setIsSearching(true);
    } else {
      setLoading(true);
    }
    try {
      let leadersData;
      let paginationData;

      if (query) {
        const searchResults = await searchLeaders(query);
        leadersData = searchResults;
        paginationData = { pageCount: 1, totalElements: searchResults.length }; // Mock pagination for search results
      } else {
        const paginatedLeaders = await getLeaders(page, limit);
        leadersData = paginatedLeaders.content;
        paginationData = paginatedLeaders.pagination;
      }

      setLeaders(leadersData || []);
      if (paginationData && typeof paginationData.pageCount === 'number') {
        setTotalPages(paginationData.pageCount);
      } else {
        setTotalPages(0);
      }
    } catch (error) {
      console.error("Error fetching leaders:", error);
    } finally {
      if (query) {
        setIsSearching(false);
      } else {
        setLoading(false);
      }
    }
  }, [limit]);

  useEffect(() => {
    fetchLeaders(currentPage, debouncedSearchQuery);
  }, [currentPage, debouncedSearchQuery, fetchLeaders]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(0); // Reset to first page on new search
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleLike = async (leaderId: number) => {
    if (!getAuthToken()) {
      router.push("/login");
      return;
    }
    try {
      await likeLeader(leaderId.toString());
      setLeaders((prevLeaders) =>
        prevLeaders.map((leader) =>
          leader.id === leaderId
            ? {
                ...leader,
                likes: leader.voteStatus === "LIKED" ? leader.likes - 1 : leader.likes + 1,
                dislikes: leader.voteStatus === "DISLIKED" ? leader.dislikes - 1 : leader.dislikes,
                voteStatus: leader.voteStatus === "LIKED" ? null : "LIKED",
              }
            : leader
        )
      );
    } catch (error) {
      console.error("Error liking leader:", error);
    }
  };

  const handleDislike = async (leaderId: number) => {
    if (!getAuthToken()) {
      router.push("/login");
      return;
    }
    try {
      await dislikeLeader(leaderId.toString());
      setLeaders((prevLeaders) =>
        prevLeaders.map((leader) =>
          leader.id === leaderId
            ? {
                ...leader,
                dislikes: leader.voteStatus === "DISLIKED" ? leader.dislikes - 1 : leader.dislikes + 1,
                likes: leader.voteStatus === "LIKED" ? leader.likes - 1 : leader.likes,
                voteStatus: leader.voteStatus === "DISLIKED" ? null : "DISLIKED",
              }
            : leader
        )
      );
    } catch (error) {
      console.error("Error disliking leader:", error);
    }
  };


  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient-primary">
            Leadership Directory
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Browse leaders, view their faults, and make your voice heard through voting.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row  sm:items-center gap-4 mb-8">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search leaders by name..."
              value={searchQuery}
              onChange={handleSearch}
              className="pr-10"
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
          <AddLeaderForm  onLeaderAdded={() => fetchLeaders(currentPage, debouncedSearchQuery)} />
        </div>
        
        {loading ? (
            <div className="flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading leaders...</p>
                </div>
            </div>
        ) : leaders.length === 0 ? (
          <p className="text-center text-muted-foreground">No leaders found matching your criteria.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leaders.map((leader) => (
              <Card key={leader.id} className="glass-card floating-card relative overflow-hidden">
                <div className="relative w-full h-48 bg-gray-200">
                  {leader.imageUrl && (
                    <Image
                      src={leader.imageUrl}
                      alt={leader.name}
                      layout="fill"
                      objectFit="cover"
                      className="absolute inset-0"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  {/* "2%" badge - placeholder for now, assuming it's numberOfFaults percentage */}
                  {leader.numberOfFaults > 0 && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {leader.numberOfFaults}%
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <CardTitle className="text-lg font-bold">{leader.name}</CardTitle>
                    <CardDescription className="text-sm text-gray-200">{leader.description}</CardDescription>
                  </div>
                </div>
                
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 bg-success-green/10 text-success-green px-2 py-1 rounded-full text-xs">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{leader.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1 bg-destructive/10 text-destructive px-2 py-1 rounded-full text-xs">
                        <ThumbsDown className="h-3 w-3" />
                        <span>{leader.dislikes}</span>
                      </div>
                    </div>
                    <Button asChild size="sm" variant="outline" className="modern-button">
                      <Link href={`/leaders/${leader.id}`} className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>Details</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
                
                <CardFooter className="p-3 pt-0">
                  <div className="flex space-x-2 w-full">
                    <Button
                      variant={leader.voteStatus === "LIKED" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleLike(leader.id)}
                      className={`flex-1 modern-button ${
                        leader.voteStatus === "LIKED" 
                          ? "gradient-success text-white border-0" 
                          : "hover:bg-success-green/10 hover:text-success-green hover:border-success-green/30"
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {leader.voteStatus === "LIKED" ? "Supported" : "Support"}
                    </Button>
                    <Button
                      variant={leader.voteStatus === "DISLIKED" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleDislike(leader.id)}
                      className={`flex-1 modern-button ${
                        leader.voteStatus === "DISLIKED" 
                          ? "bg-destructive hover:bg-destructive/90 text-white border-0" 
                          : "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                      }`}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      {leader.voteStatus === "DISLIKED" ? "Opposed" : "Oppose"}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && !searchQuery && (
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
