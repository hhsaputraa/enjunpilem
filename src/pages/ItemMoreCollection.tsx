"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { MovieCard } from "@/components/MovieCard"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Film, Loader2 } from "lucide-react"

const ItemMoreCollection = ({
  title,
  queryKey,
  queryFn,
}: { title: string; queryKey: string; queryFn: (page: number) => Promise<any> }) => {
  const [page, setPage] = useState(1)

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [queryKey, page],
    queryFn: () => queryFn(page),
  })

  const items = data?.items || []
  const totalPages = data?.totalPages || 1

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-2xl -z-10" />
          <div className="flex items-center gap-4 py-8 px-6">
            <div className="bg-primary/20 p-3 rounded-full">
              <Film className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 text-transparent bg-clip-text">
                {title}
              </h1>
              <p className="text-muted-foreground mt-2">Explore our curated collection of {title.toLowerCase()}</p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10">
            {Array(10)
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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 gap-y-10">
            {items.map((item: any) => (
              <div key={item.id} className="w-full transition-transform duration-300 hover:scale-105">
                <MovieCard
                  id={item.id}
                  title={item.title || item.name}
                  posterPath={item.poster_path}
                  overview={item.overview}
                  mediaType="movie"
                  voteAverage={item.vote_average}
                  releaseDate={item.release_date}
                />
              </div>
            ))}
          </div>
        )}

        {/* Pagination Section */}
        {!isLoading && (
          <div className="mt-16 mb-8 flex flex-col items-center">
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center gap-4">
              <Button
                onClick={() => setPage((prev) => prev - 1)}
                disabled={page === 1 || isFetching}
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="flex items-center gap-2">
                {/* Page indicators */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Logic to show pages around current page
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (page <= 3) {
                    pageNum = i + 1
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = page - 2 + i
                  }

                  return (
                    <Button
                      key={i}
                      variant={page === pageNum ? "default" : "ghost"}
                      className={`h-10 w-10 rounded-full ${page === pageNum ? "pointer-events-none" : ""}`}
                      onClick={() => setPage(pageNum)}
                      disabled={isFetching}
                    >
                      {pageNum}
                    </Button>
                  )
                })}

                {totalPages > 5 && page < totalPages - 2 && (
                  <>
                    <span className="text-muted-foreground">...</span>
                    <Button
                      variant="ghost"
                      className="h-10 w-10 rounded-full"
                      onClick={() => setPage(totalPages)}
                      disabled={isFetching}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>

              <Button
                onClick={() => setPage((prev) => prev + 1)}
                disabled={page === totalPages || isFetching}
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full"
              >
                {isFetching ? <Loader2 className="h-5 w-5 animate-spin" /> : <ChevronRight className="h-5 w-5" />}
              </Button>
            </div>

            <p className="text-muted-foreground text-sm mt-4">
              Showing page {page} of {totalPages}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ItemMoreCollection

