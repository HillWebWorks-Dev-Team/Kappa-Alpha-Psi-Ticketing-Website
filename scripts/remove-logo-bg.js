const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const srcPath = path.join(__dirname, "../public/logo-src.png");
const outPath = path.join(__dirname, "../public/logo.png");
const iconPath = path.join(__dirname, "../src/app/icon.png");
const applePath = path.join(__dirname, "../src/app/apple-icon.png");

function isBgBlack(r, g, b, a) {
  if (a < 20) return true;
  // Near-black fill (background), not mid-dark gold/crimson
  return r <= 28 && g <= 28 && b <= 28;
}

async function main() {
  const { data, info } = await sharp(srcPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const visited = new Uint8Array(width * height);
  const queue = [];

  const idx = (x, y) => y * width + x;
  const pushIfBg = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = idx(x, y);
    if (visited[i]) return;
    const o = i * 4;
    if (!isBgBlack(data[o], data[o + 1], data[o + 2], data[o + 3])) return;
    visited[i] = 1;
    queue.push(i);
  };

  // Flood-fill background from all edge pixels
  for (let x = 0; x < width; x++) {
    pushIfBg(x, 0);
    pushIfBg(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    pushIfBg(0, y);
    pushIfBg(width - 1, y);
  }

  while (queue.length) {
    const i = queue.pop();
    const x = i % width;
    const y = (i / width) | 0;
    const o = i * 4;
    data[o + 3] = 0; // transparent
    pushIfBg(x + 1, y);
    pushIfBg(x - 1, y);
    pushIfBg(x, y + 1);
    pushIfBg(x, y - 1);
  }

  // Soften fringe: near-black pixels adjacent to transparency get partial alpha
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = idx(x, y);
      const o = i * 4;
      if (data[o + 3] === 0) continue;
      if (!isBgBlack(data[o], data[o + 1], data[o + 2], data[o + 3])) continue;
      let nextToClear = false;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const n = idx(x + dx, y + dy) * 4;
        if (data[n + 3] === 0) {
          nextToClear = true;
          break;
        }
      }
      if (nextToClear) data[o + 3] = 0;
    }
  }

  // Trim transparent padding
  const trimmed = await sharp(data, {
    raw: { width, height, channels: 4 },
  })
    .trim({ threshold: 0 })
    .png()
    .toBuffer();

  fs.writeFileSync(outPath, trimmed);
  fs.writeFileSync(iconPath, trimmed);
  fs.writeFileSync(applePath, trimmed);

  const meta = await sharp(trimmed).metadata();
  console.log(`Wrote transparent logo ${meta.width}x${meta.height}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
