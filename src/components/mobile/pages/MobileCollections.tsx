import React from 'react';
import { PageLayout } from '../MobileLayout';
import { ComingSoon } from '../EmptyState';

export const MobileCollections: React.FC = () => {
  return (
    <PageLayout title="Koleksi">
      <div className="flex-1 flex items-center justify-center h-full pt-16">
        <ComingSoon feature="Fitur Koleksi Film" />
      </div>
    </PageLayout>
  );
};
