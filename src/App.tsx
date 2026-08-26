import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useIsMobile } from "./hooks/use-mobile";
import { AuthGuard } from "./components/AuthGuard";
import { ScrollToTop } from "./components/ScrollToTop";
import { AuthProvider } from "./contexts/AuthContext";
import { PageLoading } from "./components/mobile/Skeletons";
import { ErrorBoundary } from "./components/ErrorBoundary"
import { ThemeProvider } from "./contexts/ThemeContext";

// ─── EAGER IMPORTS — critical path, harus ada sebelum apapun render ───────────
// MobileHome: eager karena LCP ada di sini (hero image)
import { MobileHome } from "./components/mobile/pages/MobileHome";
// TooltipProvider: eager karena dia wrap seluruh tree — lazy = null screen
import { TooltipProvider } from "@/components/ui/tooltip";
// ToastProvider mobile: eager karena dia wrap seluruh mobile tree
import { ToastProvider } from "./components/mobile/Toast";

// ─── LAZY — tidak di critical path ────────────────────────────────────────────
// Shell desktop
const Navbar = lazy(() => import("./components/Navbar"));
const Footer = lazy(() => import("@/components/Footer"));

// UI providers — render di luar tree utama, tidak block LCP
const Toaster = lazy(() => import("@/components/ui/toaster").then(m => ({ default: m.Toaster })));
const Sonner = lazy(() => import("@/components/ui/sonner").then(m => ({ default: m.Toaster })));

// Mobile shell
const BottomNav = lazy(() => import("./components/mobile/BottomNav").then(m => ({ default: m.BottomNav })));

// Desktop Pages
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

// Mobile Pages (Lazy — not on critical path)
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

// QueryClient dengan config optimal
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// SilentSuspense hanya untuk komponen yang TIDAK block render utama
const SilentSuspense = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={null}>{children}</Suspense>
);

const Layout = () => {
  const isMobile = useIsMobile();

  // ─── MOBILE LAYOUT ──────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      // ToastProvider & TooltipProvider sekarang EAGER — tidak ada null screen
      <ToastProvider>
        <TooltipProvider>
          {/* Toaster/Sonner lazy OK — tidak block render konten */}
          <SilentSuspense><Toaster /></SilentSuspense>
          <SilentSuspense><Sonner /></SilentSuspense>
          <ScrollToTop />
          {/*
            Route "/" render MobileHome langsung — eager import, tidak ada Suspense.
            Semua route lain lazy dengan per-route Suspense.
          */}
          <Routes>
            <Route path="/" element={<MobileHome />} />
            <Route path="/explore" element={<Suspense fallback={<PageLoading />}><MobileExplore /></Suspense>} />
            <Route path="/search" element={<Suspense fallback={<PageLoading />}><MobileSearch /></Suspense>} />
            <Route path="/watchlist" element={<Suspense fallback={<PageLoading />}><MobileWatchlist /></Suspense>} />
            <Route path="/profile" element={<Suspense fallback={<PageLoading />}><MobileProfile /></Suspense>} />
            <Route path="/movie/:id" element={<Suspense fallback={<PageLoading />}><MobileMovieDetail /></Suspense>} />
            <Route path="/tv/:id" element={<Suspense fallback={<PageLoading />}><MobileMovieDetail /></Suspense>} />
            <Route path="/watch/:type/:id" element={<Suspense fallback={<PageLoading />}><MobileWatch /></Suspense>} />
            <Route path="/auth" element={<Suspense fallback={<PageLoading />}><MobileAuth /></Suspense>} />
            <Route path="/onboarding" element={<Suspense fallback={<PageLoading />}><Onboarding /></Suspense>} />
            <Route path="/collections" element={<Suspense fallback={<PageLoading />}><MobileCollections /></Suspense>} />
            <Route path="/shared-films" element={<Suspense fallback={<PageLoading />}><MobileSharedFilms /></Suspense>} />
            <Route path="/favorites" element={<Suspense fallback={<PageLoading />}><MobileFavorites /></Suspense>} />
            <Route path="/history" element={<Suspense fallback={<PageLoading />}><MobileHistory /></Suspense>} />
            <Route path="/detail-list-collection" element={<Suspense fallback={<PageLoading />}><DetailListCollectionRouter /></Suspense>} />
            <Route path="*" element={<Suspense fallback={<PageLoading />}><NotFound /></Suspense>} />
          </Routes>
          <SilentSuspense><BottomNav /></SilentSuspense>
        </TooltipProvider>
      </ToastProvider>
    );
  }

  // ─── DESKTOP LAYOUT ─────────────────────────────────────────────────────────
  return (
    <TooltipProvider>
      <ScrollToTop />
      <SilentSuspense><Navbar /></SilentSuspense>
      <main>
        <SilentSuspense><Toaster /></SilentSuspense>
        <SilentSuspense><Sonner /></SilentSuspense>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/watch/:type/:id" element={<Watch />} />
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
      <SilentSuspense><Footer /></SilentSuspense>
    </TooltipProvider>
  );
};

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <AuthGuard>
            <Layout />
          </AuthGuard>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
