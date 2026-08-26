import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { MovieCard } from "@/components/MovieCard"
import { TMDBMediaItem } from "@/types/tmdb"

interface ContentRowProps {
  title: string
  items: TMDBMediaItem[]
  isLoading: boolean
  showLoadMore?: boolean
  loadMorePath?: string
  icon?: React.ReactNode
}

export const ContentRow = ({
  title,
  items,
  isLoading,
  showLoadMore = false,
  loadMorePath = "",
  icon,
}: ContentRowProps) => (
  <section className="mb-12 relative z-0">
    <div className="flex items-center justify-between mb-6 px-1 min-h-[52px]">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
            {icon}
          </div>
        )}
        <div className="flex flex-col">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {title}
          </h2>
          <div className="h-1 w-12 bg-primary rounded-full mt-1.5 opacity-80"></div>
        </div>
      </div>
      
      {showLoadMore && loadMorePath && (
        <Link to={loadMorePath}>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors gap-1"
          >
            <span className="font-medium">View all</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      )}
    </div>

    <div className="w-full relative">
      <div 
        className="flex space-x-4 pb-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {isLoading ? (
          Array(6)
            .fill(0)
            .map((_, i) => (
              /* Dimensi identik dengan MovieCard: w-[220px] × aspect-[2/3] = 330px */
              <div key={i} className="w-[180px] sm:w-[220px] flex-shrink-0 snap-start">
                <div className="aspect-[2/3] w-full rounded-xl bg-muted/50 animate-pulse border border-white/5" />
              </div>
            ))
        ) : (
          <>
            {items?.slice(0, 12).map((item: TMDBMediaItem, index: number) => (
              <div
                key={item.id}
                className="w-[180px] sm:w-[220px] flex-shrink-0 snap-start"
              >
                <MovieCard
                  id={Number(item.id)}
                  title={item.title || item.name}
                  posterPath={item.poster_path}
                  overview={item.overview}
                  mediaType={item.media_type || (item.first_air_date ? "tv" : "movie")}
                  voteAverage={item.vote_average}
                  releaseDate={item.release_date || item.first_air_date}
                  priority={index < 4}
                />
              </div>
            ))}
            {showLoadMore && loadMorePath && (
              /* Tinggi identik dengan MovieCard via aspect-ratio */
              <div className="w-[180px] sm:w-[220px] flex-shrink-0 snap-start">
                <Link
                  to={loadMorePath}
                  className="group aspect-[2/3] w-full flex flex-col items-center justify-center gap-3 rounded-xl border-dashed border-2 border-muted hover:border-primary/50 bg-transparent hover:bg-accent/5 transition-all duration-300"
                  aria-label="Show more"
                >
                  <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <ChevronRight className="h-6 w-6 text-primary" />
                  </div>
                  <span className="font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                    Show More
                  </span>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  </section>
)
