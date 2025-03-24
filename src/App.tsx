
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import Watch from "./pages/Watch";
import Search from "./pages/Search";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Favorites from "./pages/Favorites";
import Watchlist from "./pages/Watchlist";
import Collections from "./pages/Collections";
import NavMovies from "./pages/NavMovies";
import NavTVShows from "./pages/NavTVShows";
import MoreCollection from "./pages/MoreCollection";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <Navbar />
        <main className="pt-16">
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/:type/:id" element={<Watch />} />
            <Route path="/search" element={<Search />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/navmovies" element={<NavMovies />} />
            <Route path="/navtvshows" element={<NavTVShows />} />
            <Route path="/more-collection" element={<MoreCollection />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
