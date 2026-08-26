import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { TMDBMediaItem } from "@/types/tmdb";
import { MovieCard } from "@/components/MovieCard";
import { PosterCard } from "@/components/mobile/PosterCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Grid, List, Loader2, Film } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { PageLayout } from "@/components/mobile/MobileLayout";
import { GridSkeleton } from "@/components/mobile/Skeletons";

interface DetailListCollectionProps {
  title: string;
  queryFn: (page: number) => Promise<{ items: TMDBMediaItem[]; totalPages: number }>;
  queryKey: string;
  collectionId: string;
}

const DetailListCollection = ({ title, queryFn, queryKey, collectionId }: DetailListCollectionProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Automatically scroll to top when changing page
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Dynamic query based on passed queryFn
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: [queryKey, collectionId, currentPage],
    queryFn: () => queryFn(currentPage),
  });

  const items = data?.items || [];
  const totalPages = data?.totalPages || 1;

  if (error) {
    if (isMobile) {
      return (
        <PageLayout title="Error" showBackButton>
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Gagal memuat data</h2>
            <p className="text-muted-foreground text-sm mb-4">{error.message}</p>
            <Button onClick={() => navigate(-1)}>Kembali</Button>
          </div>
        </PageLayout>
      );
    }
    return (
      <div className="min-h-screen p-6 bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error loading data</h2>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={() => navigate(-1)}>Kembali</Button>
        </div>
      </div>
    );
  }

  // --- MOBILE VIEW ---
  if (isMobile) {
    return (
      <PageLayout title={title} showBackButton>
        <div className="px-4 py-4 space-y-4">
          {/* Content Section */}
          {isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-muted/60 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {items.map((item: TMDBMediaItem) => (
                <PosterCard
                  key={item.id}
                  id={item.id.toString()}
                  title={item.title || item.name}
                  poster={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : ''}
                  type={item.media_type || (item.first_air_date ? "tv" : "movie")}
                  rating={item.vote_average}
                  size="responsive"
                  onClick={() => navigate(`/${item.media_type || (item.first_air_date ? "tv" : "movie")}/${item.id}`)}
                />
              ))}
            </div>
          )}

          {/* Pagination Section untuk Mobile */}
          {!isLoading && totalPages > 1 && (
            <div className="mt-8 mb-4 flex flex-col items-center gap-3">
              <div className="flex items-center justify-between w-full max-w-[280px] bg-secondary/30 rounded-2xl p-2 shadow-sm border border-border/50 backdrop-blur-sm">
                <Button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || isFetching}
                  variant="ghost"
                  size="icon"
                  className="rounded-xl w-12 h-12 bg-background shadow-md disabled:opacity-50 hover:bg-background/80"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                
                <div className="flex flex-col items-center">
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Halaman</span>
                  <span className="text-sm font-bold">
                    {currentPage} <span className="text-muted-foreground font-medium mx-1">/</span> {totalPages}
                  </span>
                </div>

                <Button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || isFetching}
                  variant="ghost"
                  size="icon"
                  className="rounded-xl w-12 h-12 bg-background shadow-md disabled:opacity-50 hover:bg-background/80"
                >
                  {isFetching ? <Loader2 className="h-6 w-6 animate-spin" /> : <ChevronRight className="h-6 w-6" />}
                </Button>
              </div>
            </div>
          )}
        </div>
      </PageLayout>
    );
  }

  // --- DESKTOP VIEW ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl -z-10" />
          <div className="flex items-center gap-4 py-8 px-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="bg-primary/20 p-3 rounded-full">
              <Film className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                {title}
              </h1>
              <p className="text-muted-foreground mt-2">Explore our curated collection of {title?.toLowerCase()}</p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="absolute top-8 right-6 flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="rounded-full"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="rounded-full"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className={
            viewMode === 'grid'
              ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          }>
            {Array(20)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="w-full aspect-[2/3] rounded-xl" />
                  <Skeleton className="w-3/4 h-5" />
                  <Skeleton className="w-1/2 h-4" />
                </div>
              ))}
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          }>
            {items.map((item: TMDBMediaItem) => (
              <div key={item.id} className="w-full transition-transform duration-300 hover:scale-105">
                <MovieCard
                  id={Number(item.id)}
                  title={item.title || item.name}
                  posterPath={item.poster_path}
                  overview={item.overview}
                  mediaType={item.media_type || (item.first_air_date ? "tv" : "movie")}
                  voteAverage={item.vote_average}
                  releaseDate={item.release_date || item.first_air_date}
                />
              </div>
            ))}
          </div>
        )}

        {/* Pagination Section */}
        {!isLoading && totalPages > 1 && (
          <div className="mt-16 mb-8 flex flex-col items-center">
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center gap-4">
              <Button
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 1 || isFetching}
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-2">
                {/* Page indicators */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={i}
                      variant={currentPage === pageNum ? "default" : "ghost"}
                      className={`h-10 w-10 rounded-full ${currentPage === pageNum ? "pointer-events-none" : ""}`}
                      onClick={() => setCurrentPage(pageNum)}
                      disabled={isFetching}
                    >
                      {pageNum}
                    </Button>
                  )
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="text-muted-foreground">...</span>
                    <Button
                      variant="ghost"
                      className="h-10 w-10 rounded-full"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={isFetching}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={currentPage === totalPages || isFetching}
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
              >
                {isFetching ? <Loader2 className="h-5 w-5 animate-spin" /> : <ChevronRight className="h-5 w-5" />}
              </Button>
            </div>

            <p className="text-muted-foreground text-sm mt-4">
              Showing page {currentPage} of {totalPages}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailListCollection;
