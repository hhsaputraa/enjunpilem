/**
 * LogoImage — Komponen logo yang dioptimasi dengan WebP + fallback PNG.
 * Menghemat ~54 KiB untuk tampilan kecil (Navbar/Footer) dibanding
 * mendownload image.png 640×640 asli.
 */

interface LogoImageProps {
  /** Ukuran display dalam px */
  size: 32 | 36 | 96 | 112;
  className?: string;
  alt?: string;
}

// 32px pakai file 36px (cukup, selisih kecil)
const WEBP_MAP: Record<number, string> = {
  32:  '/image-36.webp',
  36:  '/image-36.webp',
  96:  '/image-96.webp',
  112: '/image-112.webp',
};

export const LogoImage = ({ size, className = '', alt = 'EnjunPilem Logo' }: LogoImageProps) => (
  <picture>
    <source srcSet={WEBP_MAP[size]} type="image/webp" />
    <img
      src="/image.png"
      alt={alt}
      width={size}
      height={size}
      className={className}
      loading="eager"
      fetchpriority="high"
      decoding="async"
    />
  </picture>
);
