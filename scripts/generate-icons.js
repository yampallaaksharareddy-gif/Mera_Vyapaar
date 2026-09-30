import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function generate() {
  const publicDir = path.resolve('public');
  const svgPath = path.join(publicDir, 'icon.svg');
  const svgBuffer = fs.readFileSync(svgPath);

  // 1. Standard 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  // 2. Standard 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  // 3. Apple Touch Icon 180x180
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // 4. Maskable 512x512 (with 15% safe zone margin on solid dark background #0c0a09)
  const innerSize = Math.round(512 * 0.76); // ~390px
  const innerBuffer = await sharp(svgBuffer).resize(innerSize, innerSize).png().toBuffer();
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 12, g: 10, b: 9, alpha: 1 }
    }
  })
    .composite([{ input: innerBuffer, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Created pwa-maskable-512x512.png');

  // 5. Favicon 64x64 png
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));
  console.log('Created favicon.ico');
}

generate().catch(err => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
