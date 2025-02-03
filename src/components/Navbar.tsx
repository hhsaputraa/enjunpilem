import { Link } from "react-router-dom";
import { Search, Film, Tv } from "lucide-react";
import { Button } from "./ui/button";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect">
      <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link 
            to="/" 
            className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text hover:scale-105 transition-transform"
          >
            EnjunPilem
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2 group"
            >
              <Film className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Movies
            </Link>
            <Link 
              to="/search" 
              className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-2 group"
            >
              <Tv className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              TV Shows
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/search">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 hover:bg-white/10 transition-colors"
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;