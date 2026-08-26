import { useSearchParams } from 'react-router-dom';
import ItemMoreCollection from '@/pages/ItemMoreCollection';
import { getEnjunChoice, getPopularMovies, getTopRatedMovies } from '@/services/tmdb';
import { TMDBMediaItem } from '@/types/tmdb';

const apiMapping: Record<string, (page: number) => Promise<{ items: TMDBMediaItem[]; totalPages: number }>> = {
  enjunChoice: getEnjunChoice,
  popularMovies: getPopularMovies,
  topRatedMovies: getTopRatedMovies,
};

const ItemMoreCollectionRouter = () => {
  const [searchParams] = useSearchParams();
  const queryKey = searchParams.get("queryKey");
  const queryFn = apiMapping[queryKey];

  return <ItemMoreCollection title="More Collection" queryKey={queryKey} queryFn={queryFn} />;
};

export default ItemMoreCollectionRouter;
