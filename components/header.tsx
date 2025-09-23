"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Leader Fault App
        </Link>
        <nav className="flex space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/">Home</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/leaders">Leaders</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/register">Register</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
