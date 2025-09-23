"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

// Define types for our data
interface Fault {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
}

export default function Home() {
  const [faults, setFaults] = useState<Fault[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch faults from the backend
    const fetchFaults = async () => {
      try {
        // Replace with actual API endpoint
        const response = await fetch("/api/faults");
        const data = await response.json();
        setFaults(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching faults:", error);
        setLoading(false);
      }
    };

    fetchFaults();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading faults...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Leader Faults</h1>
        <Button asChild>
          <Link href="/leaders">View Leaders</Link>
        </Button>
      </div>
      
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
