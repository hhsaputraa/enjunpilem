import { useQuery } from "@tanstack/react-query"
import { usePerformance } from "@/hooks/usePerformance"
import {
  getTrending,
  getPopularMovies,
  getTopRatedMovies,
  getEnjunTop,
} from "@/services/tmdb"
import { COLLECTIONS } from "@/config/collections"
import { AutoContentRow } from "@/components/AutoContentRow"
import { ContentRow } from "@/components/ContentRow"
import { HeroSection } from "@/components/HeroSection"
import { Film, Star, Trophy, TrendingUp } from "lucide-react"

const Index = () => {
  // Performance monitoring
  const { measureCustom } = usePerformance('Index Page');

  const { data: trending, isLoading: trendingLoading } = useQuery({
    queryKey: ["trending"],
    queryFn: () => getTrending(1),
  })

  const { data: popularMovies, isLoading: moviesLoading } = useQuery({
    queryKey: ["popularMovies"],
    queryFn: () => getPopularMovies(1),
  })

  const { data: topRatedMovies, isLoading: topRatedLoading } = useQuery({
    queryKey: ["topRatedMovies"],
    queryFn: () => getTopRatedMovies(1),
  })

  const { data: enjunTop, isLoading: enjunTopLoading } = useQuery({
    queryKey: ["enjunTop"],
    queryFn: getEnjunTop,
  })

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <main className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 min-h-[150vh] md:min-h-[250vh]">
        
        {/* Hero Section Wrapper to prevent Layout Shift */}
        <div className="min-h-[500px] sm:min-h-[60vh] lg:min-h-[70vh] mb-16 w-full">
          {!trendingLoading && trending?.items && trending.items.length > 0 && (
            <HeroSection trending={trending.items} />
          )}
        </div>

        <div className="space-y-4 sm:space-y-8">
          <ContentRow
            title="Trending Now"
            items={trending?.items || []}
            isLoading={trendingLoading}
            icon={<TrendingUp className="h-5 w-5" />}
          />

          <ContentRow
            title="Popular Movies"
            items={popularMovies?.items || []}
            isLoading={moviesLoading}
            icon={<Film className="h-5 w-5" />}
          />

          <ContentRow
            title="Top 4 Enjun"
            items={enjunTop || []}
            isLoading={enjunTopLoading}
            icon={<Trophy className="h-5 w-5 text-amber-500" />}
          />

          {/* Render Collections from Config */}
          {COLLECTIONS.map((collection) => (
            <AutoContentRow
              key={collection.id}
              collection={collection}
              showLoadMore={true}
            />
          ))}
          
          <ContentRow
            title="Top Rated Movies"
            items={topRatedMovies?.items || []}
            isLoading={topRatedLoading}
            icon={<Star className="h-5 w-5 text-emerald-500" />}
          />
        </div>
      </main>
    </div>
  )
}

export default Index

