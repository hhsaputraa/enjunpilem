"use client"

import { Link, useLocation } from "react-router-dom"
import { Film, Tv, Heart, Clock, List, LogOut, LogIn, User, Menu, Compass,SquareLibrary, RefreshCw, Home } from "lucide-react"
import { Button } from "./ui/button"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { SearchBar } from "@/components/SearchBar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUserProfile } from "@/hooks/useUserProfile"
import { cn } from "@/lib/utils"

const Navbar = () => {
  const [user, setUser] = useState<any>(null)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
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

    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
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
        title: "Logged out",
        description: "See you next time!",
      })
    } catch (error: any) {
      toast({
        title: "Error logging out",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getUserInitials = () => {
    if (!user || !user.email) return "U"
    return user.email.charAt(0).toUpperCase()
  }

  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Movies", path: "/navmovies", icon: Film },
    { name: "TV Shows", path: "/navtvshows", icon: Tv },
    { name: "Collections", path: "/collections", icon: SquareLibrary },
    { name: "Shared Films", path: "/shared-films", icon: Compass },
  ]

  const isActive = (path: string) => {
    if (path === "/" && location.pathname !== "/") return false
    return location.pathname.startsWith(path)
  }

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-colors duration-300",
        scrolled 
          ? "bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm transition-shadow duration-300" 
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2.5 group"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-110">
            <img src="/image.png" alt="EnjunPilem Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Enjun<span className="text-primary">Pilem</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-muted/50 rounded-full border border-white/5 backdrop-blur-sm">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300",
                isActive(link.path)
                  ? "bg-background text-foreground shadow-sm scale-105"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              {link.icon && <link.icon className="w-4 h-4" />}
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:block w-full max-w-[240px]">
            <SearchBar />
          </div>

          <div className="lg:hidden">
              <Button variant="ghost" size="icon" onClick={() => navigate("/search")}>
                  <Compass className="h-5 w-5" />
              </Button>
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full h-10 w-10 ring-2 ring-transparent hover:ring-primary/20 transition-all font-normal p-0 overflow-hidden"
                >
                  <Avatar className="h-full w-full">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 overflow-hidden rounded-2xl border-border/50 shadow-xl bg-card/95 backdrop-blur-xl">
                <DropdownMenuLabel className="font-normal p-4 bg-muted/30">
                  <div className="flex flex-col space-y-1.5">
                    <p className="text-sm font-semibold leading-none text-foreground">{user.email?.split("@")[0]}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-1">
                    <DropdownMenuItem asChild className="rounded-xl">
                    <Link to="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl">
                    <Link to="/favorites" className="cursor-pointer">
                        <Heart className="mr-2 h-4 w-4" />
                        <span>Favorites</span>
                    </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl">
                    <Link to="/watchlist" className="cursor-pointer">
                        <Clock className="mr-2 h-4 w-4" />
                        <span>Watchlist</span>
                    </Link>
                    </DropdownMenuItem>
                    {user?.id === import.meta.env.VITE_ALLOWED_ADMIN_ID && (
                      <DropdownMenuItem asChild className="rounded-xl text-[#0AC4E0] focus:text-[#0AC4E0] focus:bg-[#0AC4E0]/10">
                        <Link to="/import-collection" className="cursor-pointer">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            <span>Import Items</span>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild className="rounded-xl">
                    <Link to="/collections" className="cursor-pointer">
                        <List className="mr-2 h-4 w-4" />
                        <span>Collections</span>
                    </Link>
                    </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator />
                <div className="p-1">
                    <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-destructive focus:text-destructive cursor-pointer rounded-xl bg-destructive/5 focus:bg-destructive/10"
                    >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                    </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => navigate("/auth")}
              size="sm"
              className="rounded-full px-6 font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
            >
              Sign In
            </Button>
          )}

          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] border-l-border/50 bg-background/95 backdrop-blur-xl p-0">
                <SheetHeader className="text-left px-6 py-6 border-b border-border/50">
                  <SheetTitle>
                    <Link to="/" className="flex items-center gap-2">
                       <div className="flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden">
                         <img src="/image.png" alt="Logo" className="w-full h-full object-cover" />
                       </div>
                       <span className="text-xl font-bold">
                         Enjun<span className="text-primary">Pilem</span>
                       </span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col h-full overflow-y-auto pb-20">
                  <div className="px-6 py-4">
                    <div className="sm:hidden mb-6">
                        <SearchBar />
                    </div>

                    <nav className="flex flex-col gap-1">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Menu</h4>
                        {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={cn(
                            "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors",
                            isActive(link.path)
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                        >
                            {link.icon ? <link.icon className="w-4 h-4" /> : <div className="w-4" />}
                            {link.name}
                        </Link>
                        ))}
                    </nav>

                    {user && (
                        <div className="flex flex-col gap-1 mt-6">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Library</h4>
                        <Link
                            to="/favorites"
                            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                            <Heart className="w-4 h-4" />
                            Favorites
                        </Link>
                        <Link
                            to="/watchlist"
                            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                            <Clock className="w-4 h-4" />
                            Watchlist
                        </Link>
                        {user?.id === import.meta.env.VITE_ALLOWED_ADMIN_ID && (
                          <Link
                              to="/import-collection"
                              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-[#0AC4E0] hover:bg-[#0AC4E0]/10 transition-colors"
                          >
                              <RefreshCw className="w-4 h-4" />
                              Import Items
                          </Link>
                        )}
                        <Link
                            to="/collections"
                            className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                        >
                            <List className="w-4 h-4" />
                            My Collections
                        </Link>
                        </div>
                    )}
                  </div>

                  <div className="mt-auto border-t border-border/50 p-6 bg-muted/20">
                    {user ? (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 px-2">
                          <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage src={user.user_metadata?.avatar_url} />
                            <AvatarFallback>{getUserInitials()}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{user.email?.split("@")[0]}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[150px]">{user.email}</span>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full justify-center text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 rounded-xl"
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Log Out
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full shadow-lg shadow-primary/20 rounded-xl" 
                        onClick={() => navigate("/auth")}
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In
                      </Button>
                    )}
                  </div>
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

