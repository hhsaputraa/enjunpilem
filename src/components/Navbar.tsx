"use client"

import { Link } from "react-router-dom"
import { Film, Tv, Heart, Clock, List, LogOut, LogIn, User, Menu } from "lucide-react"
import { Button } from "./ui/button"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { SearchBar } from "@/components/SearchBar" // Assuming this component exists
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const Navbar = () => {
  const [user, setUser] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    // Add scroll event listener
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

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
    <header className={`border-b border-white/10 backdrop-blur-xl sticky top-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-black/80 shadow-2xl shadow-black/50'
        : 'bg-black/60'
    }`}>
      {/* Glassmorphism overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5"></div>

      <div className="relative max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-3xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-transparent bg-clip-text hover:scale-110 transition-all duration-500 hover:drop-shadow-lg relative group"
          >
            EnjunPilem
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-semibold hover:text-primary transition-all duration-300 relative py-2 px-3 rounded-lg group hover:bg-white/5">
              <span className="relative z-10">Home</span>
              <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-purple-500 group-hover:w-full group-hover:left-0 transition-all duration-500 rounded-full"></span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              to="/navmovies"
              className="text-sm font-semibold hover:text-primary transition-all duration-300 relative py-2 px-3 rounded-lg group hover:bg-white/5 flex items-center gap-2"
            >
              <Film className="w-4 h-4 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500" />
              <span className="relative z-10">Movies</span>
              <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-purple-500 group-hover:w-full group-hover:left-0 transition-all duration-500 rounded-full"></span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              to="/navtvshows"
              className="text-sm font-semibold hover:text-primary transition-all duration-300 relative py-2 px-3 rounded-lg group hover:bg-white/5 flex items-center gap-2"
            >
              <Tv className="w-4 h-4 group-hover:rotate-12 group-hover:scale-110 transition-all duration-500" />
              <span className="relative z-10">TV Shows</span>
              <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-purple-500 group-hover:w-full group-hover:left-0 transition-all duration-500 rounded-full"></span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              to="/collections"
              className="text-sm font-semibold hover:text-primary transition-all duration-300 relative py-2 px-3 rounded-lg group hover:bg-white/5"
            >
              <span className="relative z-10">📚 Collections</span>
              <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-purple-500 group-hover:w-full group-hover:left-0 transition-all duration-500 rounded-full"></span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block w-full max-w-xs">
            <div className="relative">
              <SearchBar />
            </div>
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-3 rounded-full hover:bg-white/10 transition-all duration-300 p-2 pr-4 border border-white/10 hover:border-white/20 backdrop-blur-sm group"
                >
                  <Avatar className="h-9 w-9 border-2 border-primary/30 group-hover:border-primary/50 transition-colors duration-300 ring-2 ring-white/10">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-semibold text-white group-hover:text-primary transition-colors duration-300">
                      {user.email?.split("@")[0] || "User"}
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 mt-2 bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl animate-in fade-in-80 slide-in-from-top-5 duration-300"
              >
                <div className="px-4 pt-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-primary/30">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary font-bold">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-white">{user.email?.split("@")[0] || "User"}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                      
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  <DropdownMenuItem asChild className="hover:bg-white/5 focus:bg-white/5 mx-2 rounded-lg transition-colors duration-200">
                    <Link to="/profile" className="flex items-center cursor-pointer px-3 py-2">
                      <User className="mr-3 h-4 w-4 text-primary" />
                      <span className="text-white">View Profile</span>
                    </Link>
                  </DropdownMenuItem>
                </div>

                <div className="px-4 py-2">
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">My Lists</div>
                </div>

                <div className="pb-2">
                  <DropdownMenuItem asChild className="hover:bg-white/5 focus:bg-white/5 mx-2 rounded-lg transition-colors duration-200">
                    <Link to="/favorites" className="flex items-center cursor-pointer px-3 py-2">
                      <Heart className="mr-3 h-4 w-4 text-red-400" />
                      <span className="text-white">Favorites</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-white/5 focus:bg-white/5 mx-2 rounded-lg transition-colors duration-200">
                    <Link to="/watchlist" className="flex items-center cursor-pointer px-3 py-2">
                      <Clock className="mr-3 h-4 w-4 text-blue-400" />
                      <span className="text-white">Watch Later</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-white/5 focus:bg-white/5 mx-2 rounded-lg transition-colors duration-200">
                    <Link to="/collections" className="flex items-center cursor-pointer px-3 py-2">
                      <List className="mr-3 h-4 w-4 text-purple-400" />
                      <span className="text-white">My Collection</span>
                    </Link>
                  </DropdownMenuItem>
                </div>

                <div className="border-t border-white/10 pt-2">
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10 mx-2 rounded-lg transition-colors duration-200"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => navigate("/auth")}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 px-6 py-2 border border-white/20"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline-block font-semibold">✨ Sign In</span>
            </Button>
          )}

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

                  <div className="py-3">
                    <SearchBar />
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

export default Navbar

