import { Link } from "react-router-dom"
import { LogoImage } from "@/components/LogoImage"
import { Film, Building2, Heart, Zap } from "lucide-react"

const Footer = () => {
  return (
    <footer className="relative border-t border-white/5 mt-20 py-16 bg-gradient-to-b from-background/50 to-background/95 backdrop-blur-sm overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-6 group w-fit">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-lg overflow-hidden">
                <LogoImage size={32} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary via-cyan-400 to-blue-500 text-transparent bg-clip-text">
                EnjunPilem
              </h3>
            </Link>
            <p className="text-muted-foreground text-base leading-relaxed mb-6 max-w-md">
              Your ultimate destination for movies and TV shows. Discover, explore, and enjoy the best entertainment from around the world.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-6 flex items-center gap-2">
              <Film className="w-4 h-4 text-primary" />
              Explore
            </h4>
            <ul className="space-y-3">
              {[
                { to: "/navmovies", label: "Movies" },
                { to: "/navtvshows", label: "TV Shows" },
                { to: "/collections", label: "Collections" },
                { to: "/more-collection", label: "Top Rated" },
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full group-hover:w-3 group-hover:bg-primary transition-all duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-foreground mb-6 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Company
            </h4>
            <ul className="space-y-3">
              {[
                { to: "/about", label: "About Us" },
                { to: "/contact", label: "Contact" },
                { to: "/careers", label: "Careers" },
                { to: "/press", label: "Press" },
              ].map((link) => (
                <li key={link.to}>
                  <Link 
                    to={link.to} 
                    className="text-muted-foreground hover:text-primary transition-all duration-300 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-primary/50 rounded-full group-hover:w-3 group-hover:bg-primary transition-all duration-300"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <p className="text-muted-foreground text-sm">
                © {new Date().getFullYear()} EnjunPilem. All rights reserved.
              </p>
              <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground/80">
                <span>Made with</span>
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                <span>for movie lovers</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/5 backdrop-blur-sm">
                v2.0.0
              </div>
              <div className="text-xs text-muted-foreground bg-white/5 px-3 py-1 rounded-full border border-white/5 backdrop-blur-sm flex items-center gap-1">
                <Zap className="w-3 h-3 text-cyan-400" /> Fast & Secure
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
