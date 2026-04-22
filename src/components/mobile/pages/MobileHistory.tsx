import React from 'react';
import { PageLayout } from '../MobileLayout';
import { ComingSoon } from '../EmptyState';

export const MobileHistory: React.FC = () => {
  return (
    <PageLayout title="Riwayat Tontonan">
      <div className="flex-1 flex items-center justify-center h-full pt-16">
        <ComingSoon feature="Fitur Riwayat Tontonan" />
      </div>
    </PageLayout>
  );
};
