/**
 * Utility functions for User Collections:
 * - Parsing & formatting custom cover metadata in description
 * - Resolving active hero cover poster
 * - Safe null-tolerant helpers for low-spec device rendering
 */

export interface ParsedCollectionDescription {
  description: string;
  customCoverPath: string | null;
}

/**
 * Extracts clean user description and custom cover path from raw description.
 * Custom cover is stored as invisible/clean HTML comment: <!--cover:/path.jpg-->
 */
export function parseCollectionDescription(rawDescription: string | null | undefined): ParsedCollectionDescription {
  if (!rawDescription) {
    return { description: '', customCoverPath: null };
  }

  const match = rawDescription.match(/<!--cover:(.*?)-->/);
  const customCoverPath = match ? match[1].trim() : null;
  const description = rawDescription.replace(/<!--cover:.*?-->/g, '').trim();

  return { description, customCoverPath };
}

/**
 * Packages clean description and optional coverPath into single persistent string.
 */
export function formatCollectionDescription(cleanDescription: string, coverPath: string | null): string {
  const trimmed = cleanDescription.trim();
  if (!coverPath) return trimmed;
  return trimmed ? `${trimmed} <!--cover:${coverPath}-->` : `<!--cover:${coverPath}-->`;
}

/**
 * Resolves the primary hero poster for a collection:
 * Uses custom cover if it exists and is still in items, otherwise defaults to items[0].
 */
export function resolveCollectionHeroPoster(
  items: Array<{ poster_path: string | null }> | null | undefined,
  customCoverPath: string | null
): string | null {
  if (!items || items.length === 0) return null;
  if (customCoverPath) {
    const isCustomValid = items.some(item => item.poster_path === customCoverPath);
    if (isCustomValid) return customCoverPath;
  }
  return items[0]?.poster_path || null;
}

/**
 * Anti-Crash safe year extractor from release_date or first_air_date string.
 */
export function safeExtractYear(dateStr: string | null | undefined): string {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const year = dateStr.split('-')[0];
  return year && year.length === 4 ? year : '';
}
