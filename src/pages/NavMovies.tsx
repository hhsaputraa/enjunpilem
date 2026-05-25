"use client"

import type React from "react"

import { useQuery } from "@tanstack/react-query"
import { TMDBMediaItem } from "@/types/tmdb"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import {
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getHarryPotterCollection,
} from "@/services/tmdb"
import { getMovieCollections, getCollectionsByIds } from "@/config/collections"
import { AutoContentRow } from "@/components/AutoContentRow"
import { MovieCard } from "@/components/MovieCard"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Film, Popcorn, Star, Ticket, Wand2 } from "lucide-react"

const ContentRow = ({
  title,
  items,
  isLoading,
  showLoadMore = false,
  loadMorePath = "",
  icon,
}: {
  title: string
  items: TMDBMediaItem[]
  isLoading: boolean
  showLoadMore?: boolean
  loadMorePath?: string
  icon?: React.ReactNode
}) => (
  <section className="mt-12 first:mt-8">
    <div className="flex items-center gap-3 mb-5">
      <div className="flex items-center gap-2">
        {icon && <div className="text-primary/80">{icon}</div>}
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      {showLoadMore && loadMorePath && items?.length > 12 && (
        <Link to={loadMorePath} className="ml-auto">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 flex items-center gap-1">
            <span>View all</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>

    <div className="relative">
      {/* Gradient fade effect on edges */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <ScrollArea className="w-full rounded-xl">
        <div className="flex space-x-5 pb-6 pt-1 px-1">
          {isLoading ? (
            Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="w-[220px] flex-shrink-0 group">
                  <Skeleton className="w-full aspect-[2/3] rounded-xl flex-shrink-0" />
                  <Skeleton className="w-3/4 h-5 mt-3" />
                  <Skeleton className="w-1/2 h-4 mt-2" />
                </div>
              ))
          ) : (
            <>
              {items?.slice(0, 12).map((item: TMDBMediaItem) => (
                <div
                  key={item.id}
                  className="w-[220px] flex-shrink-0 group transition-transform duration-300 hover:scale-105"
                >
                  <MovieCard
                    id={Number(item.id)}
                    title={item.title || item.name}
                    posterPath={item.poster_path}
                    overview={item.overview}
                    mediaType="movie"
                    voteAverage={item.vote_average}
                    releaseDate={item.release_date}
                  />
                </div>
              ))}
              {showLoadMore && loadMorePath && items?.length > 12 && (
                <div className="w-[220px] flex-shrink-0 flex items-center justify-center h-[330px]">
                  <Link to={loadMorePath}>
                    <Button
                      variant="outline"
                      className="h-24 w-40 flex flex-col items-center justify-center gap-3 rounded-xl border-dashed hover:bg-primary/5 transition-all duration-300"
                    >
                      <span className="font-medium">See More</span>
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
        <ScrollBar orientation="horizontal" className="h-2" />
      </ScrollArea>
    </div>
  </section>
)

const HeroSlider = ({ movies }: { movies: TMDBMediaItem[] }) => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const slideCount = Math.min(3, movies?.length || 0)

  // Auto-advance slides
  useEffect(() => {
    if (!movies || movies.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideCount)
    }, 6000) // Change slide every 6 seconds

    return () => clearInterval(interval)
  }, [movies, slideCount])

  // Manual navigation
  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slideCount)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slideCount) % slideCount)
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="relative mb-16 rounded-2xl overflow-hidden h-[300px] md:h-[400px] bg-gradient-to-r from-primary/20 to-primary/5">
        <div className="relative h-full flex flex-col justify-center py-12 px-8 md:py-16 md:px-12 z-10">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary/20 backdrop-blur-md p-2.5 rounded-full">
                <Film className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-4xl font-bold">Movies</h1>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative mb-16 rounded-2xl overflow-hidden h-[300px] md:h-[400px]">
      {/* Slides */}
      {movies.slice(0, slideCount).map((movie, index) => {
        const backdropUrl = movie?.backdrop_path
          ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
          : "/placeholder.svg?height=600&width=1200"

        return (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100 z-20" : "opacity-0 z-10"
            }`}
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center transform scale-105 transition-transform duration-10000"
              style={{
                backgroundImage: `url(${backdropUrl})`,
                animation: index === currentSlide ? "slowZoom 6s ease-out forwards" : "none",
              }}
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

            {/* Movie Info */}
            <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 max-w-md z-30">
              <div className="backdrop-blur-sm p-4 rounded-lg">
                <h3 className="text-xl font-bold text-white mb-1">{movie.title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-yellow-400 flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400" />
                    {movie.vote_average?.toFixed(1)}
                  </span>
                  <span className="text-white/70 text-sm">{movie.release_date?.split("-")[0]}</span>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center py-12 px-8 md:py-16 md:px-12 z-30">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/20 backdrop-blur-md p-2.5 rounded-full">
              <Film className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-white">Movies</h1>
          </div>

          <p className="text-white/80 text-lg mb-8 max-w-xl">
            Discover the latest releases, popular films, and curated collections. From blockbusters to indie gems, find
            your next favorite movie.
          </p>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-sm transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {Array.from({ length: slideCount }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${
              index === currentSlide ? "bg-white w-6" : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

const NavMovies = () => {
  // ✅ KONFIGURASI KOLEKSI YANG INGIN DITAMPILKAN
  // Ganti array ini untuk mengatur koleksi mana yang muncul
  const selectedCollectionIds = [
    'letterbox250',    // Top 250 Letterbox
    'oscarWon',        // Oscar Won Movies
    'enjunChoice',     // Top Choice by Enjun
    'nolanFilm',       // Christopher Nolan Collection
    // 'marvelMovies',  // Uncomment untuk tambah Marvel
    // 'top100Imdb',    // Uncomment untuk tambah IMDB Top 100
  ];

  // Ambil koleksi berdasarkan ID yang dipilih
  const selectedCollections = getCollectionsByIds(selectedCollectionIds);

  // Query untuk hero slider dan content row biasa
  const { data: popularMovies, isLoading: popularLoading } = useQuery({
    queryKey: ["popularMovies"],
    queryFn: () => getPopularMovies(1),
  })

  const { data: topRatedMovies, isLoading: topRatedLoading } = useQuery({
    queryKey: ["topRatedMovies"],
    queryFn: () => getTopRatedMovies(1),
  })

  const { data: nowPlayingMovies, isLoading: nowPlayingLoading } = useQuery({
    queryKey: ["nowPlayingMovies"],
    queryFn: () => getNowPlayingMovies(1),
  })

  const { data: harryPotterMovies, isLoading: harryPotterLoading } = useQuery({
    queryKey: ["harryPotterCollection"],
    queryFn: getHarryPotterCollection,
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Hero Section with Background Image Slider */}
        <HeroSlider movies={popularMovies?.items || []} />

        {/* ✅ AUTO CONTENT ROWS DARI KONFIGURASI */}
        {selectedCollections.map((collection) => (
          <AutoContentRow
            key={collection.id}
            collection={collection}
            showLoadMore={true}
          />
        ))}

        {/* Content Rows Biasa (TMDB API langsung) */}
        <ContentRow
          title="Now Playing"
          items={nowPlayingMovies?.items || []}
          isLoading={nowPlayingLoading}
          icon={<Ticket className="h-5 w-5" />}
        />

        <ContentRow
          title="Harry Potter Collection"
          items={harryPotterMovies || []}
          isLoading={harryPotterLoading}
          icon={<Wand2 className="h-5 w-5" />}
        />

        <ContentRow
          title="Popular Movies"
          items={popularMovies?.items || []}
          isLoading={popularLoading}
          icon={<Popcorn className="h-5 w-5" />}
        />

        <ContentRow
          title="Top Rated Movies"
          items={topRatedMovies?.items || []}
          isLoading={topRatedLoading}
          icon={<Star className="h-5 w-5" />}
        />
      </div>
    </div>
  )
}

export default NavMovies