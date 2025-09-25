"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown, TrendingUp, Scale, Users, Home, LogIn, UserPlus, Plus, X, Search, AlertCircle, FileText, Eye, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Mock data for preview
const mockFaults = [
 
];

const    = [
  
];

// Header Component
function ModernHeader() {
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
                AccountabilityHub
              </h1>
              <p className="text-xs text-muted-foreground -mt-1">
                Holding Leaders Accountable
              </p>
            </div>
          </Link>
          
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="modern-button">
              <Home className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            <Button variant="ghost" size="sm" className="modern-button">
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Leaders</span>
            </Button>
            <div className="h-4 w-px bg-border mx-2" />
            <Button variant="ghost" size="sm" className="modern-button">
              <LogIn className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Login</span>
            </Button>
            <Button size="sm" className="modern-button gradient-primary text-white border-0">
              <UserPlus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Register</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}

// Add Fault Form Component
function ModernAddFaultForm() {
  const [showFullForm, setShowFullForm] = useState(false);
  const [title, setTitle] = useState("");

  return (
    <div className="mb-8">
      <div className="glass-card compact-padding rounded-xl">
        {!showFullForm && <div className="flex gap-3">
          <input
            placeholder="Report a Leader's Fault."
            value={showFullForm ? title : ""}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value && !showFullForm) {
                setShowFullForm(true);
              }
            }}
            onFocus={() => setShowFullForm(true)}
            className="flex-grow bg-white/50 border border-white/30 rounded-lg px-3 py-2 focus:bg-white/80 transition-all outline-none focus:ring-2 focus:ring-primary/20"
          />
          
          <Button 
            onClick={() => setShowFullForm(true)}
            disabled={showFullForm}
            className="modern-button gradient-primary text-white border-0"
          >
            <Plus className="h-4 w-4 mr-1" />
            Fault
          </Button>
        </div>}
        
        {showFullForm && (
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Report Title</label>
                <input
                  placeholder="Brief title for the Fault"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/50 border border-white/30 rounded-lg px-3 py-2 focus:bg-white/80 transition-all outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Image</label>
                <input
                  placeholder="Link to supporting image or document"
                  className="w-full bg-white/50 border border-white/30 rounded-lg px-3 py-2 focus:bg-white/80 transition-all outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Detailed Description of the Fault</label>
              <input
                placeholder="Provide detailed information about the fault"
                className="w-full bg-white/50 border border-white/30 rounded-lg px-3 py-2 focus:bg-white/80 transition-all outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Leaders</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  placeholder="Search for leaders to hold accountable..."
                  className="w-full pl-10 bg-white/50 border border-white/30 rounded-lg px-3 py-2 focus:bg-white/80 transition-all outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <div className="flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  <span>John Mayor</span>
                  <X className="h-3 w-3 ml-2" />
                </div>
                <div className="flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  <span>Sarah Governor</span>
                  <X className="h-3 w-3 ml-2" />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between pt-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowFullForm(false);
                  setTitle("");
                }}
                className="modern-button"
              >
                Cancel
              </Button>
              <Button className="modern-button gradient-primary text-white border-0">
                Submit Fault
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ModernRevampPreview() {
  const [currentView, setCurrentView] = useState<'home' | 'leaders' | 'leader-detail'>('home');
  const [selectedLeader, setSelectedLeader] = useState( [0]);

  return (
    <div className="min-h-screen">
      <ModernHeader />
      
      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex space-x-2 mb-6">
          <Button 
            variant={currentView === 'home' ? 'default' : 'outline'}
            onClick={() => setCurrentView('home')}
            className="modern-button"
          >
            Home View
          </Button>
          <Button 
            variant={currentView === 'leaders' ? 'default' : 'outline'}
            onClick={() => setCurrentView('leaders')}
            className="modern-button"
          >
            Leaders View
          </Button>
          <Button 
            variant={currentView === 'leader-detail' ? 'default' : 'outline'}
            onClick={() => setCurrentView('leader-detail')}
            className="modern-button"
          >
            Leader Detail
          </Button>
        </div>
      </div>

      {/* Home View */}
      {currentView === 'home' && (
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient-primary">
              Hold Leaders Accountable
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Report, track, and vote on leadership accountability. Your voice matters in building better governance.
            </p>
          </div>

          <ModernAddFaultForm />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockFaults.map((fault) => (
              <Card key={fault.id} className="glass-card floating-card compact-padding overflow-hidden">
                <div className="aspect-video relative -m-3 mb-3 rounded-lg overflow-hidden">
                  <img 
                    src={fault.imageUrl} 
                    alt={fault.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                
                <CardHeader className="compact-padding-sm">
                  <CardTitle className="text-lg font-semibold line-clamp-2">{fault.title}</CardTitle>
                </CardHeader>
                
                <CardContent className="compact-padding-sm">
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{fault.description}</p>
                  
                  <div className="mb-3">
                    <h4 className="text-xs font-medium mb-2 text-muted-foreground">Leaders Involved:</h4>
                    <div className="flex flex-wrap gap-1">
                      {fault.leaders.map((leader) => (
                        <span key={leader.id} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20 cursor-pointer transition-colors">
                          {leader.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
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
                      variant={fault.voteStatus === "liked" ? "default" : "outline"}
                      size="sm"
                      className={`flex-1 modern-button ${
                        fault.voteStatus === "liked" 
                          ? "gradient-success text-white border-0" 
                          : "hover:bg-success-green/10 hover:text-success-green hover:border-success-green/30"
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {fault.voteStatus === "liked" ? "Agreed" : "Agree"}
                    </Button>
                    
                    <Button 
                      variant={fault.voteStatus === "disliked" ? "default" : "outline"} 
                      size="sm"
                      className={`flex-1 modern-button ${
                        fault.voteStatus === "disliked" 
                          ? "bg-destructive hover:bg-destructive/90 text-white border-0" 
                          : "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                      }`}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      {fault.voteStatus === "disliked" ? "Disagreed" : "Disagree"}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Leaders View */}
      {currentView === 'leaders' && (
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gradient-primary">
              Leadership Directory
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Browse leaders, view their Faults, and make your voice heard through voting.
            </p>
          </div>

          <div className="mb-8">
            <div className="glass-card compact-padding rounded-xl text-center">
              <Button className="modern-button gradient-secondary text-white border-0">
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Leader to Directory
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            { .map((leader) => (
              <Card key={leader.id} className="glass-card floating-card compact-padding">
                <CardHeader className="compact-padding-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold">{leader.name}</CardTitle>
                      <CardDescription className="text-sm mt-1">{leader.description}</CardDescription>
                    </div>
                    <div className="flex items-center space-x-1 bg-muted/50 px-2 py-1 rounded-full text-xs">
                      <FileText className="h-3 w-3" />
                      <span>{leader.numberOfFaults}</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="compact-padding-sm">
                  <div className="flex items-center justify-between mb-3">
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
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="modern-button"
                      onClick={() => {
                        setSelectedLeader(leader);
                        setCurrentView('leader-detail');
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                  </div>
                </CardContent>
                
                <CardFooter className="compact-padding-sm">
                  <div className="flex space-x-2 w-full">
                    <Button
                      variant={leader.voteStatus === "LIKED" ? "default" : "outline"}
                      size="sm"
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
        </div>
      )}

      {/* Leader Detail View */}
      {currentView === 'leader-detail' && (
        <div className="container mx-auto px-4 py-6">
          <div className="mb-6">
            <Button 
              variant="outline" 
              className="modern-button"
              onClick={() => setCurrentView('leaders')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Leaders
            </Button>
          </div>
          
          <Card className="glass-card compact-padding mb-8">
            <CardHeader className="compact-padding-sm">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">{selectedLeader.name}</CardTitle>
                  <CardDescription className="text-base mt-1">{selectedLeader.description}</CardDescription>
                </div>
                <div className="flex items-center space-x-1 bg-muted/50 px-3 py-2 rounded-full">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">{selectedLeader.numberOfFaults}</span>
                  <span className="text-xs text-muted-foreground">Faults</span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="compact-padding-sm">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1 bg-success-green/10 text-success-green px-3 py-2 rounded-full">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="font-medium">{selectedLeader.likes}</span>
                  <span className="text-sm">Support</span>
                </div>
                <div className="flex items-center space-x-1 bg-destructive/10 text-destructive px-3 py-2 rounded-full">
                  <ThumbsDown className="h-4 w-4" />
                  <span className="font-medium">{selectedLeader.dislikes}</span>
                  <span className="text-sm">Opposition</span>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="compact-padding-sm">
              <div className="flex space-x-3 w-full">
                <Button 
                  variant={selectedLeader.voteStatus === "LIKED" ? "default" : "outline"}
                  className={`flex-1 modern-button ${
                    selectedLeader.voteStatus === "LIKED" 
                      ? "gradient-success text-white border-0" 
                      : "hover:bg-success-green/10 hover:text-success-green hover:border-success-green/30"
                  }`}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  {selectedLeader.voteStatus === "LIKED" ? "Supported" : "Support"}
                </Button>
                <Button 
                  variant={selectedLeader.voteStatus === "DISLIKED" ? "default" : "outline"} 
                  className={`flex-1 modern-button ${
                    selectedLeader.voteStatus === "DISLIKED" 
                      ? "bg-destructive hover:bg-destructive/90 text-white border-0" 
                      : "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                  }`}
                >
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  {selectedLeader.voteStatus === "DISLIKED" ? "Opposed" : "Oppose"}
                </Button>
              </div>
            </CardFooter>
          </Card>

          <h2 className="text-2xl font-bold mb-6">Faults By {selectedLeader.name}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockFaults.filter(fault => 
              fault.leaders.some(leader => leader.name === selectedLeader.name)
            ).map((fault) => (
              <Card key={fault.id} className="glass-card floating-card compact-padding">
                <div className="aspect-video relative -m-3 mb-3 rounded-lg overflow-hidden">
                  <img 
                    src={fault.imageUrl} 
                    alt={fault.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
                
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
                      variant={fault.voteStatus === "liked" ? "default" : "outline"}
                      size="sm"
                      className={`flex-1 modern-button ${
                        fault.voteStatus === "liked" 
                          ? "gradient-success text-white border-0" 
                          : "hover:bg-success-green/10 hover:text-success-green hover:border-success-green/30"
                      }`}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {fault.voteStatus === "liked" ? "Agreed" : "Agree"}
                    </Button>
                    <Button 
                      variant={fault.voteStatus === "disliked" ? "default" : "outline"} 
                      size="sm"
                      className={`flex-1 modern-button ${
                        fault.voteStatus === "disliked" 
                          ? "bg-destructive hover:bg-destructive/90 text-white border-0" 
                          : "hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                      }`}
                    >
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      {fault.voteStatus === "disliked" ? "Disagreed" : "Disagree"}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}