/**
 * Run with Node.js to generate icon16.png, icon48.png, icon128.png from icon.svg.
 * Requires: npm install sharp  (or use any SVG→PNG tool you prefer)
 *
 * Usage:
 *   npm install sharp
 *   node generate-icons.js
 */

const sharp = require('sharp');
const path  = require('path');
const src   = path.join(__dirname, 'icon.svg');

[16, 48, 128].forEach(size => {
  sharp(src)
    .resize(size, size)
    .png()
    .toFile(path.join(__dirname, `icon${size}.png`))
    .then(() => console.log(`icon${size}.png created`))
    .catch(err => console.error(`Failed icon${size}.png:`, err));
});
