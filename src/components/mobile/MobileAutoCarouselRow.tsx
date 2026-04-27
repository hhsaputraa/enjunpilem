import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { CollectionConfig } from '@/config/collections';
import { getCollectionBySlugPreview } from '@/services/tmdb';
import { CarouselRow } from './CarouselRow';
import { transformTMDBData } from '@/hooks/useMobileApi';

interface MobileAutoCarouselRowProps {
  collection: CollectionConfig;
  showViewAll?: boolean;
  onViewAll?: () => void;
  onItemClick?: (item: any) => void;
  onWatchlistToggle?: (id: string) => void;
}

export const MobileAutoCarouselRow: React.FC<MobileAutoCarouselRowProps> = ({ 
  collection, 
  showViewAll = true,
  onViewAll,
  onItemClick,
  onWatchlistToggle
}) => {
  const { data: rawItems = [], isLoading } = useQuery({
    queryKey: ['collection-preview', collection.slug],
    queryFn: () => collection.queryFn 
      ? collection.queryFn(1).then(result => 'items' in result ? result.items : result)
      : getCollectionBySlugPreview(collection.slug),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const formattedItems = transformTMDBData(rawItems);

  return (
    <CarouselRow
      title={collection.title}
      items={formattedItems}
      isLoading={isLoading}
      showViewAll={showViewAll}
      onViewAll={onViewAll}
      onItemClick={onItemClick}
      onWatchlistToggle={onWatchlistToggle}
    />
  );
};
