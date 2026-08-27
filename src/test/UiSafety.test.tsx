import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MovieCard } from '@/components/MovieCard';
import { PosterCard } from '@/components/mobile/PosterCard';
import { BottomNav } from '@/components/mobile/BottomNav';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/components/mobile/Toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <ToastProvider>
      <BrowserRouter>{children}</BrowserRouter>
    </ToastProvider>
  </QueryClientProvider>
);

describe('🛡️ UI Safety & Anti-Crash Smoke Tests', () => {
  test('MovieCard renders correctly with valid props', () => {
    render(
      <TestWrapper>
        <MovieCard
          id={101}
          title="Inception"
          posterPath="/poster.jpg"
          overview="A thief who steals corporate secrets through the use of dream-sharing technology..."
          mediaType="movie"
          voteAverage={8.8}
          releaseDate="2010-07-16"
        />
      </TestWrapper>
    );

    expect(screen.getByText('Inception')).toBeInTheDocument();
  });

  test('MovieCard handles null poster & voteAverage gracefully without crashing', () => {
    render(
      <TestWrapper>
        <MovieCard
          id={102}
          title="Movie With Null Data"
          posterPath=""
          overview=""
          mediaType="movie"
          voteAverage={0}
        />
      </TestWrapper>
    );

    expect(screen.getByText('Movie With Null Data')).toBeInTheDocument();
  });

  test('PosterCard (Mobile) renders safely with missing optional fields', () => {
    render(
      <TestWrapper>
        <PosterCard
          id={201}
          title="Mobile Film Test"
          posterPath={null}
          type="movie"
        />
      </TestWrapper>
    );

    expect(screen.getByText('Mobile Film Test')).toBeInTheDocument();
  });

  test('BottomNav renders safe navigation items', () => {
    render(
      <TestWrapper>
        <BottomNav />
      </TestWrapper>
    );

    expect(screen.getByText('Beranda')).toBeInTheDocument();
    expect(screen.getByText('Jelajahi')).toBeInTheDocument();
    expect(screen.getByText('Cari')).toBeInTheDocument();
  });

  test('ErrorBoundary catches runtime errors and shows fallback UI instead of White Screen', () => {
    const ProblematicComponent = () => {
      throw new Error('Test Runtime Failure');
    };

    // Suppress console.error in test log during intentional throw
    const originalError = console.error;
    console.error = () => {};

    render(
      <ErrorBoundary>
        <ProblematicComponent />
      </ErrorBoundary>
    );

    console.error = originalError;

    expect(screen.getByText(/Oops, Terjadi Kesalahan!/i)).toBeInTheDocument();
  });
});
