/**
 * Generate optimized WebP versions of the logo for different display sizes.
 * Run: node scripts/generate-logo-webp.js
 */
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const INPUT = path.join(__dirname, '../public/image.png');
const OUTPUT_DIR = path.join(__dirname, '../public');

const sizes = [36, 96, 112];

(async () => {
  for (const size of sizes) {
    const out = path.join(OUTPUT_DIR, `image-${size}.webp`);
    await sharp(INPUT)
      .resize(size, size, { fit: 'cover' })
      .webp({ quality: 85 })
      .toFile(out);
    console.log(`✅ Generated ${out}`);
  }
  console.log('Done!');
})();
