# Image Conventions for Server Assets

This document describes the conventions for images used in server manifests, specifically for `icon` and `background` assets.

## 1. File Naming

- **icon**: The icon image should be named `icon.png`.
- **background**: The background image should be named `bg.png` in the server source directory, and will be renamed to `background.png` in the merged output.

## 2. File Format

- All images must be in **PNG** format (`.png`).
- Use lossless compression to preserve quality.

## 3. Dimensions

- **icon.png**: Recommended size is **64x64** - **512x512** pixels. Must be square.
- **bg.png**: Size is **1920x1080** pixels.

## 4. Transparency

- **icon.png**: Supports transparency. Use transparent backgrounds where appropriate.
- **bg.png**: Should be fully opaque.

## 5. Usage in Manifest

- In each server's `manifest.json`, reference images as:
  ```json
  "assets": {
    "icon": "./icon.png",
    "background": "./bg.png"
  }
  ```
- The merge script will copy and rename these to the merged output as `icon.png` and `background.png` under `merged/assets/<server>/`.

## 6. Quality

- Avoid visible compression artifacts.
- Use clear, high-contrast images for icons.
- Backgrounds should not contain text or logos that may be obscured by overlays.

---

## 7. Website and Minecraft

- The area with the white overlay and without it will be rendered inside of a website (if its exist at the state of time)
- The are without the white overlay and the Minecraft text is rendered inside of Minecraft Java Edition

![example](assets/example.png)

For questions or updates to these conventions, please update this document and notify contributors.
