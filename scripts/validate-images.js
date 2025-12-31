#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const { logger, reportError } = require("./logger");

function prettyServerName(manifestPath) {
  const name = path.basename(path.dirname(manifestPath));
  return name.replace(/[-_]?smp$/i, "").replace(/[-_]?mc$/i, "");
}

function getImageDimensions(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);

    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      const width =
        (buffer[16] << 24) |
        (buffer[17] << 16) |
        (buffer[18] << 8) |
        buffer[19];
      const height =
        (buffer[20] << 24) |
        (buffer[21] << 16) |
        (buffer[22] << 8) |
        buffer[23];

      return { width, height };
    }

    const header = buffer.subarray(0, 8).toString("hex");
    throw new Error(
      `Not a valid PNG file (header: 0x${header}). Ensure the file is a PNG. If it's another format, convert it to PNG: e.g. using ImageMagick - \`magick input.jpg output.png\` or \`convert input.jpg output.png\`.`,
    );
  } catch (error) {
    throw new Error(`Failed to read image dimensions: ${error.message}`);
  }
}

function validateImageDimensions(
  filePath,
  expectedWidth,
  expectedHeight,
  imageType,
) {
  try {
    const dimensions = getImageDimensions(filePath);

    if (
      dimensions.width === expectedWidth &&
      dimensions.height === expectedHeight
    ) {
      return true;
    } else {
      const label = `servers/${prettyServerName(filePath)}`;
      const rel = path.relative(process.cwd(), filePath);
      reportError(
        `${label}: ${imageType} dimensions are incorrect: ${dimensions.width}x${dimensions.height} (expected: ${expectedWidth}x${expectedHeight}).`,
        [
          `How to fix: Resize/crop the image to exactly ${expectedWidth}x${expectedHeight}.`,
          "",
          "Example (ImageMagick):",
          `  magick "${rel}" -resize ${expectedWidth}x${expectedHeight}^ -gravity center -extent ${expectedWidth}x${expectedHeight} "${rel}"`,
          "",
          "Or recreate/export the background from your editor at the required resolution.",
        ],
      );
      return false;
    }
  } catch (error) {
    const label = `servers/${prettyServerName(filePath)}`;
    const rel = path.relative(process.cwd(), filePath);
    logger(
      "error",
      `${label}: Error validating ${imageType}: ${error.message}`,
      [
        `Suggestion: Open the file and confirm it's a valid PNG. Run: file "${rel}"`,
      ],
    );
    return false;
  }
}

function validateIconDimensions(filePath) {
  try {
    const dimensions = getImageDimensions(filePath);

    const min = 64;
    const max = 512;
    if (
      dimensions.width >= min &&
      dimensions.width <= max &&
      dimensions.height >= min &&
      dimensions.height <= max &&
      dimensions.width === dimensions.height
    ) {
      return true;
    } else {
      const rel = path.relative(process.cwd(), filePath);
      const lines = [];
      lines.push(
        `Icon is ${dimensions.width}x${dimensions.height} (expected: square between ${min}x${min} and ${max}x${max}).`,
      );
      if (dimensions.width !== dimensions.height)
        lines.push("Issue: Icon is not square.");
      if (
        dimensions.width < min ||
        dimensions.height < min ||
        dimensions.width > max ||
        dimensions.height > max
      ) {
        lines.push("Issue: Icon dimensions are outside the allowed range.");
      }
      lines.push(
        "",
        "How to fix: Create a square PNG and resize it to a recommended size (e.g. 256x256).",
        "",
        "Example (ImageMagick):",
        `  magick "${rel}" -resize 256x256^ -gravity center -extent 256x256 "${rel}"`,
        "",
        "Or open your source image in an editor and export a square PNG between 64 and 512 pixels.",
      );
      const label = `servers/${prettyServerName(filePath)}`;
      reportError(`${label}: Icon dimensions incorrect`, lines);
      return false;
    }
  } catch (error) {
    const label = `servers/${prettyServerName(filePath)}`;
    const rel = path.relative(process.cwd(), filePath);
    logger("error", `${label}: Error validating icon: ${error.message}`, [
      `Suggestion: Confirm the file exists and is a PNG. Run: file "${rel}"`,
    ]);
    return false;
  }
}

function validateManifestImages(manifestPath) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const manifestDir = path.dirname(manifestPath);

    const assets = manifest.assets;
    if (!assets) {
      reportError(
        `No assets section found for ${prettyServerName(manifestPath)}`,
      );
      return false;
    }

    let allValid = true;

    if (assets.background) {
      const backgroundPath = path.join(manifestDir, assets.background);
      if (!fs.existsSync(backgroundPath)) {
        reportError(
          `Background file not found for ${prettyServerName(manifestPath)}: ${assets.background}`,
          [
            "How to fix: Ensure the path in the manifest is correct and the file exists. Example manifest entry:",
            '  "assets": { "background": "assets/background.png" }',
          ],
        );
        allValid = false;
      } else {
        const backgroundValid = validateImageDimensions(
          backgroundPath,
          1920,
          1080,
          "Background",
        );
        if (!backgroundValid) {
          allValid = false;
        }
      }
    } else {
      reportError(
        `No background image specified for ${prettyServerName(manifestPath)}`,
        [
          "How to fix: Add a background entry to the manifest under `assets`, pointing to a PNG file (1920x1080).",
        ],
      );
      allValid = false;
    }

    if (assets.icon) {
      const iconPath = path.join(manifestDir, assets.icon);
      if (!fs.existsSync(iconPath)) {
        reportError(
          `Icon file not found for ${prettyServerName(manifestPath)}: ${assets.icon}`,
          [
            "How to fix: Ensure the path in the manifest is correct and the file exists. Example manifest entry:",
            '  "assets": { "icon": "assets/icon.png" }',
          ],
        );
        allValid = false;
      } else {
        const iconValid = validateIconDimensions(iconPath);
        if (!iconValid) {
          allValid = false;
        }
      }
    } else {
      reportError(
        `No icon image specified for ${prettyServerName(manifestPath)}`,
        [
          "How to fix: Add an icon entry to the manifest under `assets`, pointing to a square PNG (recommended 256x256).",
        ],
      );
      allValid = false;
    }

    return allValid;
  } catch (error) {
    reportError(
      `Error checking images for ${prettyServerName(manifestPath)}: ${error.message}`,
    );
    return false;
  }
}

function findManifestFiles() {
  const serversDir = path.join(__dirname, "..", "servers");
  const manifests = [];

  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (file === "manifest.json") {
        manifests.push(fullPath);
      }
    }
  }

  walkDir(serversDir);
  return manifests;
}

function main() {
  const manifestFiles = findManifestFiles();

  if (manifestFiles.length === 0) {
    logger("error", "No manifest files found.");
    process.exit(1);
  }

  let allValid = true;

  for (const manifestPath of manifestFiles) {
    const imagesValid = validateManifestImages(manifestPath);
    if (!imagesValid) allValid = false;
  }

  if (allValid) {
    logger("info", "All checks passed!");
    process.exit(0);
  }

  process.exit(1);
}

if (require.main === module) {
  main();
}

module.exports = {
  validateManifestImages,
  validateImageDimensions,
  validateIconDimensions,
  findManifestFiles,
};
