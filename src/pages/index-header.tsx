"use client"

import { Link, useNavigate } from "react-router-dom"
import { Film, Tv, Heart, Clock, List, LogOut, LogIn, User, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/SearchBar"
import { supabase } from "@/integrations/supabase/client"import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"

const IndexHeader = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      navigate("/")
      toast({
        title: "Logged out successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error logging out",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.email) return "U"
    return user.email.charAt(0).toUpperCase()
  }

  return (
    <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-10 bg-background/80">
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-3xl font-extrabold bg-gradient-to-r from-purple-500 to-pink-600 text-transparent bg-clip-text hover:scale-105 transition-transform duration-300"
          >
            EnjunPilem
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors relative py-1 group">
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/navmovies"
              className="text-sm font-medium hover:text-primary transition-colors relative py-1 group flex items-center gap-2"
            >
              <Film className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              Movies
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/navtvshows"
              className="text-sm font-medium hover:text-primary transition-colors relative py-1 group flex items-center gap-2"
            >
              <Tv className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              TV Shows
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/collections"
              className="text-sm font-medium hover:text-primary transition-colors relative py-1 group"
            >
              Collections
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-auto md:w-64 lg:w-80">
            <SearchBar />
          </div>

          {/* User Profile */}
          <div className="hidden sm:block">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 rounded-full hover:bg-primary/10 transition-colors p-1 pr-3 h-9"
                  >
                    <Avatar className="h-7 w-7 border-2 border-primary/20">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden lg:inline-block">
                      {user.email?.split("@")[0] || "User"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-1 animate-in fade-in-80 slide-in-from-top-5">
                  <div className="px-2 pt-1 pb-2">
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Logged in</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="hover:bg-primary/5 focus:bg-primary/5">
                    <Link to="/profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>View Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal mt-1">
                    My Lists
                  </DropdownMenuLabel>
                  <DropdownMenuItem asChild className="hover:bg-primary/5 focus:bg-primary/5">
                    <Link to="/favorites" className="flex items-center cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Favorites</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-primary/5 focus:bg-primary/5">
                    <Link to="/watchlist" className="flex items-center cursor-pointer">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>Watch Later</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-primary/5 focus:bg-primary/5">
                    <Link to="/collections" className="flex items-center cursor-pointer">
                      <List className="mr-2 h-4 w-4" />
                      <span>My Collection</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive hover:bg-destructive/5 focus:bg-destructive/5"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="secondary"
                onClick={() => navigate("/auth")}
                className="flex items-center gap-2 rounded-full shadow-sm hover:shadow transition-all h-9"
                size="sm"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Button>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <div className="flex flex-col h-full">
                  <div className="py-6">
                    <Link
                      to="/"
                      className="text-xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 text-transparent bg-clip-text"
                    >
                      EnjunPilem
                    </Link>
                  </div>

                  <div className="flex flex-col space-y-3 py-4">
                    <Link
                      to="/"
                      className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-primary/5 transition-colors"
                    >
                      <span className="font-medium">Home</span>
                    </Link>
                    <Link
                      to="/navmovies"
                      className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-primary/5 transition-colors"
                    >
                      <Film className="w-5 h-5" />
                      <span className="font-medium">Movies</span>
                    </Link>
                    <Link
                      to="/navtvshows"
                      className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-primary/5 transition-colors"
                    >
                      <Tv className="w-5 h-5" />
                      <span className="font-medium">TV Shows</span>
                    </Link>
                    <Link
                      to="/collections"
                      className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-primary/5 transition-colors"
                    >
                      <span className="font-medium">Collections</span>
                    </Link>
                  </div>

                  {user && (
                    <>
                      <div className="border-t border-border/40 pt-4 mt-2">
                        <p className="px-2 text-sm font-medium">My Lists</p>
                        <div className="flex flex-col space-y-1 mt-3">
                          <Link
                            to="/favorites"
                            className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-primary/5 transition-colors"
                          >
                            <Heart className="w-4 h-4" />
                            <span>Favorites</span>
                          </Link>
                          <Link
                            to="/watchlist"
                            className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-primary/5 transition-colors"
                          >
                            <Clock className="w-4 h-4" />
                            <span>Watch Later</span>
                          </Link>
                          <Link
                            to="/collections"
                            className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-primary/5 transition-colors"
                          >
                            <List className="w-4 h-4" />
                            <span>My Collection</span>
                          </Link>
                        </div>
                      </div>

                      <div className="mt-auto border-t border-border/40 pt-4">
                        <div className="flex items-center gap-3 px-2 mb-4">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.user_metadata?.avatar_url} />
                            <AvatarFallback className="bg-primary/10 text-primary">{getUserInitials()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user.email?.split("@")[0] || "User"}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/5"
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </Button>
                      </div>
                    </>
                  )}

                  {!user && (
                    <div className="mt-auto border-t border-border/40 pt-4">
                      <Button className="w-full" onClick={() => navigate("/auth")}>
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

export default IndexHeader

