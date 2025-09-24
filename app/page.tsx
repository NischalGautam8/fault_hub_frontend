"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import AddFaultForm from "@/components/add-fault-form";
import { getFaults } from "@/lib/api";

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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
