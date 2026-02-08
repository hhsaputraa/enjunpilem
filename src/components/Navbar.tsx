"use client"

import { Link, useLocation } from "react-router-dom"
import { Film, Tv, Heart, Clock, List, LogOut, LogIn, User, Menu, Compass } from "lucide-react"
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
    { name: "Home", path: "/" },
    { name: "Movies", path: "/navmovies", icon: Film },
    { name: "TV Shows", path: "/navtvshows", icon: Tv },
    { name: "Collections", path: "/collections", icon: Compass },
  ]

  const isActive = (path: string) => {
    if (path === "/" && location.pathname !== "/") return false
    return location.pathname.startsWith(path)
  }

  return (
    <header 
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 border-b border-transparent",
        scrolled 
          ? "bg-background/80 backdrop-blur-md border-border/40 shadow-sm" 
          : "bg-gradient-to-b from-background/80 to-transparent"
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 group"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-110">
            E
          </div>
          <span className="text-xl font-bold tracking-tight">
            Enjun<span className="text-primary">Pilem</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                isActive(link.path)
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
            >
              {link.icon && <link.icon className="w-4 h-4" />}
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block w-full max-w-[200px] lg:max-w-[300px]">
            <SearchBar />
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full h-9 w-9 ring-2 ring-transparent hover:ring-primary/20 transition-all font-normal"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 overflow-hidden rounded-xl border-border/50 shadow-xl bg-card/95 backdrop-blur-sm">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.email?.split("@")[0]}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                   <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                   </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                   <Link to="/favorites" className="cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Favorites</span>
                   </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                   <Link to="/watchlist" className="cursor-pointer">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>Watchlist</span>
                   </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                   <Link to="/collections" className="cursor-pointer">
                      <List className="mr-2 h-4 w-4" />
                      <span>Collections</span>
                   </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
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
              <SheetContent side="right" className="w-[300px] border-l-border/50 bg-background/95 backdrop-blur-xl">
                <SheetHeader className="text-left mb-6">
                  <SheetTitle>
                    <Link to="/" className="flex items-center gap-2">
                       <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-bold">
                         E
                       </div>
                       <span className="text-xl font-bold">
                         Enjun<span className="text-primary">Pilem</span>
                       </span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="flex flex-col gap-6">
                  <div className="sm:hidden">
                    <SearchBar />
                  </div>

                  <nav className="flex flex-col gap-1">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Menu</h4>
                    {navLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
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
                    <div className="flex flex-col gap-1">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Library</h4>
                      <Link
                        to="/favorites"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      >
                         <Heart className="w-4 h-4" />
                         Favorites
                      </Link>
                      <Link
                        to="/watchlist"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      >
                         <Clock className="w-4 h-4" />
                         Watchlist
                      </Link>
                      <Link
                        to="/collections"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      >
                         <List className="w-4 h-4" />
                         My Collections
                      </Link>
                    </div>
                  )}

                  <div className="mt-auto border-t pt-6">
                    {user ? (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 px-2">
                          <Avatar className="h-9 w-9 border border-border">
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
                          className="w-full justify-center text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Log Out
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full shadow-lg shadow-primary/20" 
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

