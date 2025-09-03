import type React from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { usePerformance } from "@/hooks/usePerformance"
import {
  getTrending,
  getPopularMovies,
  getTopRatedMovies,
  getEnjunTop,
} from "@/services/tmdb"
import { COLLECTIONS } from "@/config/collections"
import { AutoContentRow } from "@/components/AutoContentRow"
import IndexHeader from "./index-header"
import { MovieCard } from "@/components/MovieCard"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ChevronRight, Film, Star, Trophy, TrendingUp } from "lucide-react"

const ContentRow = ({
  title,
  items,
  isLoading,
  showLoadMore = false,
  loadMorePath = "",
  icon,
}: {
  title: string
  items: any[]
  isLoading: boolean
  showLoadMore?: boolean
  loadMorePath?: string
  icon?: React.ReactNode
}) => (
  <section className="mt-16 animate-fade-in">
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3 group">
        <div className="p-2 rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            {title}
          </h2>
          <div className="h-1 w-16 bg-gradient-to-r from-primary to-purple-500 rounded-full mt-1"></div>
        </div>
      </div>
      {showLoadMore && loadMorePath && (
        <Link to={loadMorePath} className="group">
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-white bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 rounded-xl px-6 py-2 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/25"
          >
            <span className="font-semibold">View all</span>
            <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </Link>
      )}
    </div>
    <ScrollArea className="w-full whitespace-nowrap rounded-xl">
      <div className="flex space-x-6 pb-6">
        {isLoading ? (
          Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="w-[220px] flex-shrink-0 animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="h-[330px] rounded-xl bg-gray-800/50 skeleton">
                </div>
              </div>
            ))
        ) : (
          <>
            {items?.slice(0, 12).map((item: any, index: number) => (
              <div
                key={item.id}
                className="w-[220px] flex-shrink-0 animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <MovieCard
                  id={item.id}
                  title={item.title || item.name}
                  posterPath={item.poster_path}
                  overview={item.overview}
                  mediaType={item.media_type || (item.first_air_date ? "tv" : "movie")}
                  voteAverage={item.vote_average}
                  releaseDate={item.release_date || item.first_air_date}
                  priority={index < 4} // Priority untuk 4 gambar pertama
                />
              </div>
            ))}
            {showLoadMore && loadMorePath && (
              <div className="w-[220px] flex-shrink-0 flex items-center justify-center h-[330px] animate-fade-in">
                <Link to={loadMorePath} className="group">
                  <Button
                    variant="outline"
                    className="h-32 w-44 flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary/60 bg-gradient-to-br from-primary/5 to-purple-500/5 hover:from-primary/10 hover:to-purple-500/10 transition-all duration-500 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-primary/20 backdrop-blur-sm"
                  >
                    <div className="p-3 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors duration-300">
                      <ChevronRight className="h-6 w-6 text-primary group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                    <span className="font-semibold text-primary group-hover:text-white transition-colors duration-300">
                      See More
                    </span>
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
      <ScrollBar orientation="horizontal" className="h-2" />
    </ScrollArea>
  </section>
)

const HeroSection = ({ trending }: { trending: any[] }) => {
  if (!trending || trending.length === 0) return null

  const featuredItem = trending[0]
  const backdropUrl = featuredItem?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${featuredItem.backdrop_path}`
    : null

  return (
    <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] rounded-2xl sm:rounded-3xl overflow-hidden mb-12 sm:mb-16 lg:mb-20 group">
      {/* Optimized Background Image */}
      {backdropUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-pink-900">
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>
      )}

      <div className="relative h-full flex flex-col justify-center p-6 sm:p-8 lg:p-12 text-white">
        <div className="max-w-3xl animate-fade-in">
          {/* Enhanced Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <span className="bg-gradient-to-r from-primary to-purple-600 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg backdrop-blur-sm border border-white/20">
              {featuredItem.media_type === "tv" ? "📺 TV Series" : "🎬 Movie"}
            </span>
            {featuredItem.vote_average && (
              <span className="flex items-center gap-1 sm:gap-2 bg-black/60 backdrop-blur-sm text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-yellow-400/30 shadow-lg">
                <Star className="h-3 sm:h-4 w-3 sm:w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-bold">{featuredItem.vote_average.toFixed(1)}</span>
                <span className="text-gray-300 hidden sm:inline">/10</span>
              </span>
            )}
            {featuredItem.release_date && (
              <span className="bg-black/60 backdrop-blur-sm text-white text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20 shadow-lg">
                📅 {new Date(featuredItem.release_date || featuredItem.first_air_date).getFullYear()}
              </span>
            )}
          </div>

          {/* Enhanced Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent drop-shadow-2xl">
            {featuredItem.title || featuredItem.name}
          </h1>

          {/* Enhanced Description */}
          <p className="text-gray-200 text-sm sm:text-base lg:text-lg leading-relaxed line-clamp-2 sm:line-clamp-3 mb-6 sm:mb-8 max-w-2xl drop-shadow-lg">
            {featuredItem.overview}
          </p>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link to={`/${featuredItem.media_type || "movie"}/${featuredItem.id}`}>
              <Button className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 text-base sm:text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border border-white/20 backdrop-blur-sm">
                Watch Now
              </Button>
            </Link>
          </div>

          
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
    </div>
  )
}

const Index = () => {
  // Performance monitoring
  const { measureCustom } = usePerformance('Index Page');

  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: getTrending,
  })

  const { data: popularMovies, isLoading: moviesLoading } = useQuery({
    queryKey: ["popularMovies"],
    queryFn: getPopularMovies,
  })



  const { data: topRatedMovies, isLoading: topRatedLoading } = useQuery({
    queryKey: ["topRatedMovies"],
    queryFn: getTopRatedMovies,
  })

  const { data: enjunTop, isLoading: enjunTopLoading } = useQuery({
    queryKey: ["enjunTop"],
    queryFn: getEnjunTop,
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-10 bg-background/80">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-500 to-pink-600 text-transparent bg-clip-text">
              EnjunPilem
            </h1>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/navmovies" className="text-sm font-medium hover:text-primary transition-colors">
                Movies
              </Link>
              <Link to="/tv" className="text-sm font-medium hover:text-primary transition-colors">
                TV Shows
              </Link>
              <Link to="/collections" className="text-sm font-medium hover:text-primary transition-colors">
                Collections
              </Link>
            </nav>
          </div>
          <div className="w-1/3">
            <SearchBar />
          </div>
        </div>
      </header> */}
      <IndexHeader />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!trendingLoading && trending && trending.length > 0 && <HeroSection trending={trending} />}

        <ContentRow
          title="Trending Now"
          items={trending || []}
          isLoading={trendingLoading}
          icon={<TrendingUp className="h-6 w-6 text-rose-500" />}
          // showLoadMore={true}
          // loadMorePath="/trending"
        />

        <ContentRow
          title="Popular Movies"
          items={popularMovies || []}
          isLoading={moviesLoading}
          icon={<Film className="h-6 w-6 text-blue-500" />}
          // showLoadMore={true}
          // loadMorePath="/movies"
        />

        <ContentRow
          title="Top 4 Enjun"
          items={enjunTop || []}
          isLoading={enjunTopLoading}
          icon={<Trophy className="h-6 w-6 text-amber-500" />}
        />

        {/* ✅ OTOMATIS RENDER SEMUA KOLEKSI DARI KONFIGURASI */}
        {COLLECTIONS.map((collection) => (
          <AutoContentRow
            key={collection.id}
            collection={collection}
            showLoadMore={true}
          />
        ))}
        
        <ContentRow
          title="Top Rated Movies"
          items={topRatedMovies || []}
          isLoading={topRatedLoading}
          icon={<Star className="h-6 w-6 text-emerald-500" />}
          // showLoadMore={true}
          // loadMorePath="/top-rated"
        />
      </main>

      <footer className="relative border-t border-white/10 mt-20 py-16 bg-gradient-to-b from-black/50 to-black/80 backdrop-blur-sm overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5"></div>
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 backdrop-blur-sm border border-white/10">
                  <div className="text-2xl">🎬</div>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 text-transparent bg-clip-text">
                  EnjunPilem
                </h3>
              </div>
              <p className="text-gray-300 text-base leading-relaxed mb-6 max-w-md">
                Your ultimate destination for movies and TV shows. Discover, explore, and enjoy the best entertainment from around the world.
              </p>
              
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-primary">🎭</span>
                Explore
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/navmovies" className="text-gray-300 hover:text-white transition-all duration-300 flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-primary rounded-full group-hover:w-2 transition-all duration-300"></span>
                    Movies
                  </Link>
                </li>
                <li>
                  <Link to="/navtvshows" className="text-gray-300 hover:text-white transition-all duration-300 flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-primary rounded-full group-hover:w-2 transition-all duration-300"></span>
                    TV Shows
                  </Link>
                </li>
                <li>
                  <Link to="/collections" className="text-gray-300 hover:text-white transition-all duration-300 flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-primary rounded-full group-hover:w-2 transition-all duration-300"></span>
                    Collections
                  </Link>
                </li>
                <li>
                  <Link to="/more-collection" className="text-gray-300 hover:text-white transition-all duration-300 flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-primary rounded-full group-hover:w-2 transition-all duration-300"></span>
                    Top Rated
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-primary">🏢</span>
                Company
              </h4>
              <ul className="space-y-3">
                <li>
                  <Link to="/about" className="text-gray-300 hover:text-white transition-all duration-300 flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-primary rounded-full group-hover:w-2 transition-all duration-300"></span>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-300 hover:text-white transition-all duration-300 flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-primary rounded-full group-hover:w-2 transition-all duration-300"></span>
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="text-gray-300 hover:text-white transition-all duration-300 flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-primary rounded-full group-hover:w-2 transition-all duration-300"></span>
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="/press" className="text-gray-300 hover:text-white transition-all duration-300 flex items-center gap-2 group">
                    <span className="w-1 h-1 bg-primary rounded-full group-hover:w-2 transition-all duration-300"></span>
                    Press
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <p className="text-gray-400 text-sm">
                  © {new Date().getFullYear()} EnjunPilem. All rights reserved.
                </p>
                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                  <span>Made with</span>
                  <span className="text-red-400 animate-pulse">❤️</span>
                  <span>for movie lovers</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  v2.0.0
                </div>
                <div className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                  🚀 Fast & Secure
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Index

