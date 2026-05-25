import React, { useRef, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CollectionConfig } from '@/config/collections';
import { getCollectionBySlugPreview } from '@/services/tmdb';
import { CarouselRow, CarouselItem } from './CarouselRow';
import { transformTMDBData } from '@/hooks/useMobileApi';

interface MobileAutoCarouselRowProps {
  collection: CollectionConfig;
  showViewAll?: boolean;
  onViewAll?: () => void;
  onItemClick?: (item: CarouselItem) => void;
  onWatchlistToggle?: (id: string) => void;
}

export const MobileAutoCarouselRow: React.FC<MobileAutoCarouselRowProps> = ({ 
  collection, 
  showViewAll = true,
  onViewAll,
  onItemClick,
  onWatchlistToggle
}) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer to defer loading until section is near viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect(); // Stop observing once visible
          }
        });
      },
      {
        rootMargin: '300px', // Start loading 300px before section enters viewport (mobile)
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Only fetch when section is near viewport
  const { data: rawItems = [], isLoading } = useQuery({
    queryKey: ['collection-preview', collection.slug],
    queryFn: () => collection.queryFn 
      ? collection.queryFn(1).then(result => 'items' in result ? result.items : result)
      : getCollectionBySlugPreview(collection.slug),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: isVisible, // Only fetch when visible
  });

  const formattedItems = transformTMDBData(rawItems);

  return (
    <div ref={sectionRef}>
      <CarouselRow
        title={collection.title}
        items={formattedItems}
        isLoading={!isVisible || isLoading}
        showViewAll={showViewAll}
        onViewAll={onViewAll}
        onItemClick={onItemClick}
        onWatchlistToggle={onWatchlistToggle}
      />
    </div>
  );
};
