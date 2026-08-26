"use client"

import { Link, useLocation } from "react-router-dom"
import { Film, Tv, Heart, Clock, List, LogOut, LogIn, User, Compass, SquareLibrary, RefreshCw, Home } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUserProfile } from "@/hooks/useUserProfile"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { LogoImage } from "@/components/LogoImage"
import { ThemeToggle } from "@/components/ThemeToggle"

const Navbar = () => {
  const { user } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const { data: profile } = useUserProfile(user?.id)
  const avatarUrl = profile?.avatar_url || (user as { user_metadata?: { avatar_url?: string } } | null)?.user_metadata?.avatar_url

  useEffect(() => {
    let ticking = false
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
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
    } catch (err) {
      const error = err as Error;
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
        "bg-background/95 backdrop-blur-md border-b border-border/60 shadow-sm",
        scrolled && "shadow-md"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between gap-3 px-4 lg:px-6">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2.5 group"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl overflow-hidden transition-transform duration-300 group-hover:scale-110">
            <LogoImage size={36} className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Enjun<span className="text-primary">Pilem</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden min-w-0 flex-1 md:flex items-center justify-center gap-0.5 rounded-full border border-border/60 bg-muted/80 p-1 shadow-sm backdrop-blur-sm lg:mx-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-all duration-300 lg:px-4",
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

          <ThemeToggle />

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
                    <AvatarImage src={avatarUrl} />
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


        </div>
      </div>
    </header>
  )
}

export default Navbar

