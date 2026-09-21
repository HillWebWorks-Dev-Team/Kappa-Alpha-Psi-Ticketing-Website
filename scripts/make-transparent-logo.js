const sharp = require("sharp");
const path = require("path");

const src = path.join(__dirname, "../public/logo-lockup-src.png");
const out = path.join(__dirname, "../public/logo-header.png");

async function main() {
  const { data, info } = await sharp(src)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Crimson/maroon banner background → transparent.
  // Keep near-black crest plate and light cream typography.
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const isDark = r < 45 && g < 45 && b < 45;
    const isLightText = r > 175 && g > 165 && b > 150;
    const isCrimsonBg =
      r > 70 &&
      r < 200 &&
      g < 90 &&
      b < 90 &&
      r > g * 1.4 &&
      r > b * 1.4;

    if (isCrimsonBg && !isDark && !isLightText) {
      data[i + 3] = 0;
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png()
    .toFile(out);

  const meta = await sharp(out).metadata();
  console.log(`Wrote ${out} (${meta.width}x${meta.height})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
