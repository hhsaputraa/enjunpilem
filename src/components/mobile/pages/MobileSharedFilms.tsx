import React from 'react';
import { PageLayout } from '../MobileLayout';
import { ComingSoon } from '../EmptyState';

export const MobileSharedFilms: React.FC = () => {
  return (
    <PageLayout title="Film Bersama">
      <div className="flex-1 flex items-center justify-center h-full pt-16">
        <ComingSoon feature="Fitur Film Bersama" />
      </div>
    </PageLayout>
  );
};
