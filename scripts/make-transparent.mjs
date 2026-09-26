import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const files = [
  {
    src: 'C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\a5045fec-e69e-4e57-9006-387f7d0a7e46\\isolated_jollof_1790437313320.jpg',
    out: './public/images/meals/jollof-isolated.png',
  },
  {
    src: 'C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\a5045fec-e69e-4e57-9006-387f7d0a7e46\\isolated_fried_rice_1790437359828.jpg',
    out: './public/images/meals/fried-rice-isolated.png',
  },
  {
    src: 'C:\\Users\\ADMIN\\.gemini\\antigravity-ide\\brain\\a5045fec-e69e-4e57-9006-387f7d0a7e46\\isolated_plain_rice_1790437391770.jpg',
    out: './public/images/meals/plain-rice-isolated.png',
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

  // Helper to test if a pixel is near-white background
  function isBg(x, y) {
    const idx = (y * width + x) * channels;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    // Background in studio: near-neutral high value (including soft grey ground shadow)
    const isNeutral = Math.abs(r - g) < 25 && Math.abs(g - b) < 25 && Math.abs(r - b) < 25;
    const brightness = (r + g + b) / 3;
    return brightness > 185 && isNeutral;
  }

  // Push borders into queue
  for (let x = 0; x < width; x++) {
    if (isBg(x, 0)) { visited[0 * width + x] = 1; queue.push(x, 0); }
    if (isBg(x, height - 1)) { visited[(height - 1) * width + x] = 1; queue.push(x, height - 1); }
  }
  for (let y = 0; y < height; y++) {
    if (isBg(0, y)) { visited[y * width + 0] = 1; queue.push(0, y); }
    if (isBg(width - 1, y)) { visited[y * width + (width - 1)] = 1; queue.push(width - 1, y); }
  }

  // BFS flood fill from outside
  let head = 0;
  const centerX = width / 2;
  const centerY = height / 2;
  const safeInnerRadius = width * 0.40; // 100% protect inner food contents

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
        // Do not enter safe food zone inside the bowl
        const distFromCenter = Math.hypot(nx - centerX, ny - centerY);
        if (distFromCenter < safeInnerRadius) {
          continue;
        }

        const nIndex = ny * width + nx;
        if (!visited[nIndex] && isBg(nx, ny)) {
          visited[nIndex] = 1;
          queue.push(nx, ny);
        }
      }
    }
  }

  // Apply transparency to visited pixels with soft edge feathering
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const isVisited = visited[y * width + x] === 1;
      if (isVisited) {
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const brightness = (r + g + b) / 3;
        if (brightness >= 205) {
          data[idx + 3] = 0; // completely transparent
        } else if (brightness >= 180) {
          // soft feather edge
          const alpha = Math.max(0, Math.min(255, Math.round(((205 - brightness) / 25) * 255)));
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

  console.log(`Generated: ${outPath}`);
}

async function main() {
  for (const f of files) {
    await processImage(f.src, f.out);
  }
}

main().catch(console.error);
