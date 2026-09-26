import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outDir = './public/images/packaging';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const files = [
  {
    src: 'C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\a5045fec-e69e-4e57-9006-387f7d0a7e46\\kraft_takeout_bag_1790440992288.jpg',
    out: './public/images/packaging/kraft-takeout-bag.png',
  },
  {
    src: 'C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\a5045fec-e69e-4e57-9006-387f7d0a7e46\\takeout_paper_bowl_1790441039599.jpg',
    out: './public/images/packaging/takeout-paper-bowl.png',
  },
];

async function processImage(srcPath, outPath) {
  const image = sharp(srcPath);
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const visited = new Uint8Array(width * height);
  const queue = [];

  function isBg(x, y) {
    const idx = (y * width + x) * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const isNeutral = Math.abs(r - g) < 25 && Math.abs(g - b) < 25 && Math.abs(r - b) < 25;
    const brightness = (r + g + b) / 3;
    return brightness > 195 && isNeutral;
  }

  for (let x = 0; x < width; x++) {
    if (isBg(x, 0)) { visited[0 * width + x] = 1; queue.push(x, 0); }
    if (isBg(x, height - 1)) { visited[(height - 1) * width + x] = 1; queue.push(x, height - 1); }
  }
  for (let y = 0; y < height; y++) {
    if (isBg(0, y)) { visited[y * width + 0] = 1; queue.push(0, y); }
    if (isBg(width - 1, y)) { visited[y * width + (width - 1)] = 1; queue.push(width - 1, y); }
  }

  let head = 0;
  while (head < queue.length) {
    const cx = queue[head++];
    const cy = queue[head++];

    const neighbors = [
      [cx + 1, cy],
      [cx - 1, cy],
      [cx, cy + 1],
      [cx, cy - 1],
    ];

    for (const [nx, ny] of neighbors) {
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nIndex = ny * width + nx;
        if (!visited[nIndex] && isBg(nx, ny)) {
          visited[nIndex] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      if (visited[y * width + x] === 1) {
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const brightness = (r + g + b) / 3;
        if (brightness >= 210) {
          data[idx + 3] = 0;
        } else if (brightness >= 185) {
          const alpha = Math.max(0, Math.min(255, Math.round(((210 - brightness) / 25) * 255)));
          data[idx + 3] = alpha;
        }
      }
    }
  }

  await sharp(data, {
    raw: {
      width,
      height,
      channels,
    },
  })
    .png()
    .toFile(outPath);

  console.log(`Saved: ${outPath}`);
}

async function main() {
  for (const f of files) {
    await processImage(f.src, f.out);
  }
}

main().catch(console.error);
