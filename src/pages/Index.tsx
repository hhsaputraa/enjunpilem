import type React from "react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import {
  getTrending,
  getPopularMovies,
  getPopularTVShows,
  getTopRatedMovies,
  getEnjunChoice,
  getEnjunTop,
  getIndiaAca,
} from "@/services/tmdb"
import IndexHeader from "./index-header"
import { MovieCard } from "@/components/MovieCard"
import { SearchBar } from "@/components/SearchBar"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ChevronRight, Film, Flame, Star, Trophy, TrendingUp } from "lucide-react"

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
  <section className="mt-12">
    <div className="flex items-center gap-2 mb-6">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>
      {showLoadMore && loadMorePath && (
        <Link to={loadMorePath} className="ml-auto">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 flex items-center gap-1">
            <span>View all</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>
    <ScrollArea className="w-full whitespace-nowrap rounded-md">
      <div className="flex space-x-5 pb-4">
        {isLoading ? (
          Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="w-[220px] flex-shrink-0 group">
                <Skeleton className="w-full h-[330px] rounded-xl flex-shrink-0" />
                <Skeleton className="w-3/4 h-5 mt-3" />
                <Skeleton className="w-1/2 h-4 mt-2" />
              </div>
            ))
        ) : (
          <>
            {items?.slice(0, 12).map((item: any) => (
              <div
                key={item.id}
                className="w-[220px] flex-shrink-0 group transition-transform duration-300 hover:scale-105"
              >
                <MovieCard
                  id={item.id}
                  title={item.title || item.name}
                  posterPath={item.poster_path}
                  overview={item.overview}
                  mediaType={item.media_type || (item.first_air_date ? "tv" : "movie")}
                  voteAverage={item.vote_average}
                  releaseDate={item.release_date || item.first_air_date}
                />
              </div>
            ))}
            {showLoadMore && loadMorePath && (
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
  </section>
)

const HeroSection = ({ trending }: { trending: any[] }) => {
  if (!trending || trending.length === 0) return null

  const featuredItem = trending[0]
  const backdropUrl = featuredItem?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${featuredItem.backdrop_path}`
    : null

  return (
    <div className="relative w-full h-[500px] rounded-2xl overflow-hidden mb-16">
      {backdropUrl ? (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backdropUrl})` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-indigo-900" />
      )}

      <div className="relative h-full flex flex-col justify-end p-10 text-white">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-primary/90 text-white text-sm font-medium px-3 py-1 rounded-full">
              {featuredItem.media_type === "tv" ? "TV Series" : "Movie"}
            </span>
            {featuredItem.vote_average && (
              <span className="flex items-center gap-1 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                {featuredItem.vote_average.toFixed(1)}
              </span>
            )}
          </div>

          <h1 className="text-4xl font-bold mb-3">{featuredItem.title || featuredItem.name}</h1>
          <p className="text-gray-200 line-clamp-3 mb-6">{featuredItem.overview}</p>

          <div className="flex gap-4">
            <Link to={`/${featuredItem.media_type || "movie"}/${featuredItem.id}`}>
              <Button className="px-6">Watch Now</Button>
            </Link>
            
          </div>
        </div>
      </div>
    </div>
  )
}

const Index = () => {
  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: getTrending,
  })

  const { data: popularMovies, isLoading: moviesLoading } = useQuery({
    queryKey: ["popularMovies"],
    queryFn: getPopularMovies,
  })

  const { data: popularTV, isLoading: tvLoading } = useQuery({
    queryKey: ["popularTV"],
    queryFn: getPopularTVShows,
  })

  const { data: topRatedMovies, isLoading: topRatedLoading } = useQuery({
    queryKey: ["topRatedMovies"],
    queryFn: getTopRatedMovies,
  })

  const { data: enjunChoice, isLoading: enjunLoading } = useQuery({
    queryKey: ["enjunChoice"],
    queryFn: () => getEnjunChoice(1),
  })

  const { data: enjunTop, isLoading: enjunTopLoading } = useQuery({
    queryKey: ["enjunTop"],
    queryFn: getEnjunTop,
  })

  const { data: indiaAca, isLoading: indiaAcaLoading } = useQuery({
    queryKey: ["indiaAca"],
    queryFn: getIndiaAca,
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

      <main className="max-w-[1400px] mx-auto px-6 py-8">
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

        <ContentRow
          title="Top Choice by Enjun"
          items={enjunChoice?.items || []}
          isLoading={enjunLoading}
          showLoadMore={true}
          loadMorePath="/more-collection"
          icon={<Star className="h-6 w-6 text-yellow-500" />}
        />

        <ContentRow
          title="India ACA - ACA nehi nehi"
          items={indiaAca || []}
          isLoading={indiaAcaLoading}
          icon={<Flame className="h-6 w-6 text-orange-500" />}
        />

        <ContentRow
          title="Top Rated Movies"
          items={topRatedMovies || []}
          isLoading={topRatedLoading}
          icon={<Star className="h-6 w-6 text-emerald-500" />}
          // showLoadMore={true}
          // loadMorePath="/top-rated"
        />
      </main>

      <footer className="border-t border-border/40 mt-16 py-10 bg-background/50">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-pink-600 text-transparent bg-clip-text">
                EnjunPilem
              </h3>
              <p className="text-muted-foreground text-sm">
                Your ultimate destination for movies and TV shows. Discover, explore, and enjoy the best entertainment.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Explore</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/movies" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Movies
                  </Link>
                </li>
                <li>
                  <Link to="/tv" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    TV Shows
                  </Link>
                </li>
                <li>
                  <Link to="/trending" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Trending
                  </Link>
                </li>
                <li>
                  <Link to="/top-rated" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Top Rated
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="/press" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Press
                  </Link>
                </li>
              </ul>
            </div>
            
          </div>
          <div className="mt-10 pt-6 border-t border-border/40 text-center text-sm text-muted-foreground">
            <p>{new Date().getFullYear()} EnjunPilem.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Index

