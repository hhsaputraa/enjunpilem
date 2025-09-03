import { useSearchParams } from 'react-router-dom';
import DetailListCollection from '@/pages/DetailListCollection';
import {
  getEnjunChoice,
  get250LetterBoxPaginated,
  getOscarWonPaginated
} from '@/services/tmdb';

// Mapping API functions that support pagination
const apiMapping: Record<string, (page: number) => Promise<any>> = {
  enjunChoice: getEnjunChoice,
  letterbox250: get250LetterBoxPaginated,
  oscarWon: getOscarWonPaginated,
};

// Mapping titles for each collection
const titleMapping: Record<string, string> = {
  enjunChoice: 'Top Choice by Enjun',
  letterbox250: 'Top 250 Letterbox',
  oscarWon: 'Oscar Won Movies',
};

const DetailListCollectionRouter = () => {
  const [searchParams] = useSearchParams();
  const queryKey = searchParams.get("queryKey") || "letterbox250";
  const queryFn = apiMapping[queryKey];
  const title = titleMapping[queryKey] || "Collection";

  if (!queryFn) {
    return (
      <div className="min-h-screen p-6 bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Collection not found</h2>
          <p className="text-muted-foreground mb-4">
            Query key "{queryKey}" is not supported
          </p>
        </div>
      </div>
    );
  }

  return (
    <DetailListCollection 
      title={title}
      queryKey={queryKey}
      queryFn={queryFn}
      collectionId={queryKey}
    />
  );
};

export default DetailListCollectionRouter;
