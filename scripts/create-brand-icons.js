const sharp = require('sharp');

async function processIcons() {
  const inset = 4;
  const size = 160;
  const circleMask = Buffer.from(
    `<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`
  );

  const metaYellow = await sharp('public/images/chef_apedo_logo_variations/brand_icon_yellow_cropped.png').metadata();

  // Inset 5px to eliminate any dark outer border
  await sharp('public/images/chef_apedo_logo_variations/brand_icon_yellow_cropped.png')
    .extract({
      left: inset + 1,
      top: inset + 1,
      width: metaYellow.width - (inset + 1) * 2,
      height: metaYellow.height - (inset + 1) * 2
    })
    .resize(size, size, { fit: 'cover' })
    .composite([{ input: circleMask, blend: 'dest-in' }])
    .png()
    .toFile('public/images/chef_apedo_logo_variations/brand_mark_circle_yellow.png');

  console.log('Successfully generated clean yellow circle brand mark!');
}

processIcons().catch(console.error);
