import { useSearchParams } from 'react-router-dom';
import DetailListCollection from '@/pages/DetailListCollection';
import { getCollectionById } from '@/config/collections';
import { getCollectionBySlug, getTrending, getNowPlayingMovies, getTopRatedMovies, getPopularTVShows } from '@/services/tmdb';

const DetailListCollectionRouter = () => {
  const [searchParams] = useSearchParams();
  const queryKey = searchParams.get("queryKey") || "letterbox250";

  // Check if it's a dynamic TMDB category
  if (queryKey === 'trending') {
     return <DetailListCollection title="Film Sedang Tren" queryKey="trending" queryFn={getTrending} collectionId="trending" />;
  }
  if (queryKey === 'new') {
     return <DetailListCollection title="Rilis Terbaru" queryKey="new" queryFn={getNowPlayingMovies as any} collectionId="new" />;
  }
  if (queryKey === 'top-rated') {
     return <DetailListCollection title="Top Rated" queryKey="top-rated" queryFn={getTopRatedMovies} collectionId="top-rated" />;
  }
  if (queryKey === 'recommended') {
     return <DetailListCollection title="Rekomendasi" queryKey="recommended" queryFn={getPopularTVShows} collectionId="recommended" />;
  }

  // ✅ Ambil konfigurasi dari collections.ts
  const collection = getCollectionById(queryKey);

  if (!collection) {
    return (
      <div className="min-h-screen p-6 bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Collection not found</h2>
          <p className="text-muted-foreground mb-4">
            Collection "{queryKey}" is not configured
          </p>
        </div>
      </div>
    );
  }

  // ✅ Gunakan custom function jika ada, atau generic function
  const queryFn = collection.queryFn ||
    ((page: number) => getCollectionBySlug(collection.slug, page));

  return (
    <DetailListCollection
      title={collection.title}
      queryKey={queryKey}
      queryFn={queryFn}
      collectionId={queryKey}
    />
  );
};

export default DetailListCollectionRouter;
