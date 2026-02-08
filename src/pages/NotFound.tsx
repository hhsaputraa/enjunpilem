"use client"

import { useLocation } from "react-router-dom"
import { useEffect } from "react"
import { Home, Search, AlertTriangle } from "lucide-react"

const NotFound = () => {
  const location = useLocation()

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname)
  }, [location.pathname])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/95 p-4">
      <div className="max-w-md w-full bg-card rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-primary/10 p-8 flex justify-center">
          <div className="relative">
            {/* Decorative elements */}
            <div className="absolute -top-6 -left-6 w-12 h-12 rounded-full bg-primary/20 animate-pulse"></div>
            <div className="absolute -bottom-8 -right-8 w-16 h-16 rounded-full bg-primary/10 animate-pulse delay-300"></div>

            {/* Main 404 graphic */}
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-background shadow-md">
                <span className="text-7xl font-extrabold bg-gradient-to-r from-primary to-primary/60 text-transparent bg-clip-text">
                  404
                </span>
              </div>
              
            </div>
          </div>
        </div>

        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground mb-8">
            We couldn't find the page you're looking for. The URL
            <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded mx-1 inline-block max-w-[200px] truncate align-middle">
              {location.pathname}
            </span>
            doesn't exist.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Home className="h-4 w-4" />
              Return Home
            </a>
            <a
              href="/search"
              className="inline-flex items-center justify-center gap-2 bg-card border border-input hover:bg-accent hover:text-accent-foreground px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Search className="h-4 w-4" />
              Search Site
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}

export default NotFound

