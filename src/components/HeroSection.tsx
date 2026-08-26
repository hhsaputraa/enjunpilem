import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

import { TMDBMediaItem } from "@/types/tmdb"

interface HeroSectionProps {
  trending: TMDBMediaItem[]
}

export const HeroSection = ({ trending }: HeroSectionProps) => {
  if (!trending || trending.length === 0) return null

  const featuredItem = trending[0]
  const backdropUrl = featuredItem?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${featuredItem.backdrop_path}`
    : null

  return (
    <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/5 group bg-muted/50">
      {/* Background Image — absolute agar tidak mempengaruhi tinggi container */}
      <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-105">
        {backdropUrl ? (
          <>
            <img 
              src={backdropUrl} 
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover"
              loading="eager"
              fetchPriority="high"
              decoding="async"
              width="1280"
              height="720"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background" />
        )}
      </div>

      {/* Content Container */}
      <div className="relative h-full flex flex-col justify-end sm:justify-center p-6 sm:p-10 lg:p-16 text-white pb-12 sm:pb-16">
        <div className="max-w-4xl animate-slide-up space-y-6">
          {/* Tags / Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-primary/90 text-primary-foreground backdrop-blur-md text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full shadow-lg">
              {featuredItem.media_type === "tv" ? "TV Series" : "Movie"}
            </span>
            {featuredItem.vote_average > 0 && (
              <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-white text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full border border-white/10">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{featuredItem.vote_average.toFixed(1)}</span>
              </span>
            )}
            {featuredItem.release_date && (
              <span className="bg-black/40 backdrop-blur-md text-white text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full border border-white/10">
                {new Date(featuredItem.release_date || featuredItem.first_air_date).getFullYear()}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight text-white drop-shadow-xl">
            {featuredItem.title || featuredItem.name}
          </h1>

          {/* Overview */}
          <p className="text-muted-foreground text-sm sm:text-base lg:text-lg leading-relaxed line-clamp-2 md:line-clamp-3 max-w-2xl drop-shadow-md">
            {featuredItem.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link to={`/${featuredItem.media_type || "movie"}/${featuredItem.id}`}>
              <Button 
                size="lg"
                className="w-full sm:w-auto h-12 px-8 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 rounded-full"
              >
                Watch Now
              </Button>
            </Link>
            <Button 
              variant="outline"
              size="lg"
              className="w-full sm:w-auto h-12 px-8 text-base font-semibold backdrop-blur-md bg-white/5 border-white/20 hover:bg-white/10 text-white rounded-full transition-all duration-300"
            >
              More Info
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
