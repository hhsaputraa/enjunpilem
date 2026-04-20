import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from "./hooks/use-mobile";
import Navbar from "./components/Navbar";
import Footer from "@/components/Footer";

// Desktop Pages
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
import ItemMoreCollectionRouter from "./pages/ItemMoreCollectionRouter";
import DetailListCollectionRouter from "./pages/DetailListCollectionRouter";
import SharedFilms from "./pages/SharedFilms";
import ImportCollection from "./pages/ImportCollection";
import Onboarding from "./pages/Onboarding";
import { AuthGuard } from "./components/AuthGuard";

// Mobile Pages
import {
  MobileHome,
  MobileExplore,
  MobileSearch,
  MobileWatchlist,
  MobileProfile,
  MobileMovieDetail,
  ToastProvider
} from "./components/mobile";
import { MobileWatch } from "./components/mobile/pages/MobileWatch";
import { MobileAuth } from "./components/mobile/pages/MobileAuth";

const queryClient = new QueryClient();

const Layout = () => {
  const location = useLocation();
  const isMobile = useIsMobile();

  // Mobile Layout
  if (isMobile) {
    return (
      <ToastProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<MobileHome />} />
            <Route path="/explore" element={<MobileExplore />} />
            <Route path="/search" element={<MobileSearch />} />
            <Route path="/watchlist" element={<MobileWatchlist />} />
            <Route path="/profile" element={<MobileProfile />} />
            <Route path="/movie/:id" element={<MobileMovieDetail />} />
            <Route path="/tv/:id" element={<MobileMovieDetail />} />
            <Route path="/watch/:type/:id" element={<MobileWatch />} />
            <Route path="/auth" element={<MobileAuth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/import-collection" element={<ImportCollection />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </ToastProvider>
    );
  }

  // Desktop Layout
  return (
    <TooltipProvider>
      <Navbar />
      <main className={`${location.pathname === "/" ? "" : ""}`}>
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
          <Route path="/shared-films" element={<SharedFilms />} />
          <Route path="/navmovies" element={<NavMovies />} />
          <Route path="/navtvshows" element={<NavTVShows />} />
          <Route path="/more-collection" element={<MoreCollection />} />
          <Route path="/detail-list-collection" element={<DetailListCollectionRouter />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/import-collection" element={<ImportCollection />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/item-more-collection" element={<ItemMoreCollectionRouter />} />
        </Routes>
      </main>
      <Footer />
    </TooltipProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthGuard>
        <Layout />
      </AuthGuard>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
