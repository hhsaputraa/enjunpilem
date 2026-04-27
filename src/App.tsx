import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useIsMobile } from "./hooks/use-mobile";
import Navbar from "./components/Navbar";
import Footer from "@/components/Footer";
import { AuthGuard } from "./components/AuthGuard";
import { ScrollToTop } from "./components/ScrollToTop";
import { AuthProvider } from "./contexts/AuthContext";
import { PageLoading } from "./components/mobile/Skeletons";

// Desktop Pages (Lazy)
const Index = lazy(() => import("./pages/Index"));
const Watch = lazy(() => import("./pages/Watch"));
const Search = lazy(() => import("./pages/Search"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Watchlist = lazy(() => import("./pages/Watchlist"));
const Collections = lazy(() => import("./pages/Collections"));
const NavMovies = lazy(() => import("./pages/NavMovies"));
const NavTVShows = lazy(() => import("./pages/NavTVShows"));
const MoreCollection = lazy(() => import("./pages/MoreCollection"));
const Profile = lazy(() => import("./pages/Profile"));
const ItemMoreCollectionRouter = lazy(() => import("./pages/ItemMoreCollectionRouter"));
const DetailListCollectionRouter = lazy(() => import("./pages/DetailListCollectionRouter"));
const SharedFilms = lazy(() => import("./pages/SharedFilms"));
const ImportCollection = lazy(() => import("./pages/ImportCollection"));
const Onboarding = lazy(() => import("./pages/Onboarding"));

// Mobile Layout Components (Non-lazy for shell stability)
import { BottomNav, ToastProvider } from "./components/mobile";

// Mobile Pages (Lazy)
const MobileHome = lazy(() => import("./components/mobile/pages/MobileHome").then(m => ({ default: m.MobileHome })));
const MobileExplore = lazy(() => import("./components/mobile/pages/MobileExplore").then(m => ({ default: m.MobileExplore })));
const MobileSearch = lazy(() => import("./components/mobile/pages/MobileSearch").then(m => ({ default: m.MobileSearch })));
const MobileWatchlist = lazy(() => import("./components/mobile/pages/MobileWatchlist").then(m => ({ default: m.MobileWatchlist })));
const MobileProfile = lazy(() => import("./components/mobile/pages/MobileProfile").then(m => ({ default: m.MobileProfile })));
const MobileMovieDetail = lazy(() => import("./components/mobile/pages/MobileMovieDetail").then(m => ({ default: m.MobileMovieDetail })));
const MobileCollections = lazy(() => import("./components/mobile/pages/MobileCollections").then(m => ({ default: m.MobileCollections })));
const MobileSharedFilms = lazy(() => import("./components/mobile/pages/MobileSharedFilms").then(m => ({ default: m.MobileSharedFilms })));
const MobileFavorites = lazy(() => import("./components/mobile/pages/MobileFavorites").then(m => ({ default: m.MobileFavorites })));
const MobileHistory = lazy(() => import("./components/mobile/pages/MobileHistory").then(m => ({ default: m.MobileHistory })));
const MobileWatch = lazy(() => import("./components/mobile/pages/MobileWatch").then(m => ({ default: m.MobileWatch })));
const MobileAuth = lazy(() => import("./components/mobile/pages/MobileAuth").then(m => ({ default: m.MobileAuth })));

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
          <ScrollToTop />
          <Suspense fallback={<PageLoading />}>
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
              <Route path="/collections" element={<MobileCollections />} />
              <Route path="/shared-films" element={<MobileSharedFilms />} />
              <Route path="/favorites" element={<MobileFavorites />} />
              <Route path="/history" element={<MobileHistory />} />
              <Route path="/detail-list-collection" element={<DetailListCollectionRouter />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <BottomNav />
        </TooltipProvider>
      </ToastProvider>
    );
  }

  return (
    <TooltipProvider>
      <ScrollToTop />
      <ScrollToTop />
      <Navbar />
      <main className={`${location.pathname === "/" ? "" : ""}`}>
        <Toaster />
        <Sonner />
        <Suspense fallback={<PageLoading />}>
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
        </Suspense>
      </main>
      <Footer />
    </TooltipProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <AuthGuard>
          <Layout />
        </AuthGuard>
      </AuthProvider>
      <AuthProvider>
        <AuthGuard>
          <Layout />
        </AuthGuard>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
