"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Scale, Users, Home, LogIn, UserPlus, MessageSquare, Menu } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-card border-b border-white/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-xl gradient-primary">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient-primary">
                FaultHub
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">
                Holding Leaders Accountable
              </p>
            </div>
          </Link>
          
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="modern-button"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          <nav className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" size="sm" asChild className="modern-button">
              <Link href="/" className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="modern-button">
              <Link href="/leaders" className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Leaders</span>
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="modern-button">
              <Link href="/chat" className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Chat</span>
              </Link>
            </Button>
            <NotificationDropdown />
            <div className="h-4 w-px bg-border mx-2" />
            <Button variant="ghost" size="sm" asChild className="modern-button">
              <Link href="/login" className="flex items-center space-x-2">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            </Button>
            <Button size="sm" asChild className="modern-button gradient-primary text-white border-0">
              <Link href="/register" className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">Register</span>
              </Link>
            </Button>
          </nav>
        </div>
        {isMenuOpen && (
          <div className="md:hidden mt-4 flex flex-col space-y-2">
            <Button variant="ghost" asChild className="modern-button w-full justify-start">
              <Link href="/" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
            </Button>
            <Button variant="ghost" asChild className="modern-button w-full justify-start">
              <Link href="/leaders" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
                <Users className="h-4 w-4" />
                <span>Leaders</span>
              </Link>
            </Button>
            <Button variant="ghost" asChild className="modern-button w-full justify-start">
              <Link href="/chat" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
                <MessageSquare className="h-4 w-4" />
                <span>Chat</span>
              </Link>
            </Button>
            <div className="h-px bg-border my-2" />
            <Button variant="ghost" asChild className="modern-button w-full justify-start">
              <Link href="/login" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Link>
            </Button>
            <Button size="sm" asChild className="modern-button gradient-primary text-white border-0 w-full justify-start">
              <Link href="/register" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
                <UserPlus className="h-4 w-4" />
                <span>Register</span>
              </Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
