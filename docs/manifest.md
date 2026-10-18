## 📋 How to Create a Server Manifest

This guide explains how to create a proper `manifest.json` file for your Minecraft server. All manifests must follow the schema defined in `servers/manifest-schema.json`.

### File Structure

Create your server directory like this:

```
servers/
├── your-server-name/
│   ├── manifest.json
│   ├── icon.png
│   └── bg.png
```

### Basic Manifest Structure

```json
{
  "server-address": ["your-server.com"],
  "pretty-name": "Your Server Name",
  "categorys": ["SURVIVAL"],
  "assets": {
    "icon": "./icon.png",
    "background": "./bg.png"
  }
}
```

## Required Fields

| Field            | Type             | Description                         | Example                                            |
| ---------------- | ---------------- | ----------------------------------- | -------------------------------------------------- |
| `server-address` | Array of strings | Server addresses/domains            | `["play.example.com", "mc.example.com"]`           |
| `pretty-name`    | String           | Display name for the server         | `"Epic Survival Server"`                           |
| `categorys`      | Array of strings | Server categories (see table below) | `["SURVIVAL", "PVP"]`                              |
| `assets`         | Object           | Server images (see assets table)    | `{"icon": "./icon.png", "background": "./bg.png"}` |

## Available Categories

| Category    | Description       | Use Case                         |
| ----------- | ----------------- | -------------------------------- |
| `HG`        | Hunger Games      | Battle Royale style servers      |
| `PVP`       | Player vs Player  | Combat-focused servers           |
| `SURVIVAL`  | Survival Mode     | Classic survival gameplay        |
| `CREATIVE`  | Creative Mode     | Building and creation servers    |
| `MINIGAMES` | Mini Games        | Various small game modes         |
| `SKYBLOCK`  | SkyBlock          | Island survival challenges       |
| `PRISON`    | Prison            | Progression-based prison servers |
| `FACTIONS`  | Factions          | Team-based warfare               |
| `SKYWARS`   | SkyWars           | Air combat battles               |
| `BEDWARS`   | BedWars           | Bed destruction game             |
| `UHC`       | Ultra Hardcore    | Hardcore survival challenges     |
| `KITPVP`    | Kit PvP           | Pre-equipped combat              |
| `ANARCHY`   | Anarchy           | No rules servers                 |
| `RPG`       | Role Playing Game | Story-driven gameplay            |
| `ADVENTURE` | Adventure         | Exploration servers              |
| `BUILD`     | Building          | Construction-focused             |
| `TECHNICAL` | Technical         | Redstone and mechanics           |
| `VANILLA`   | Vanilla           | Unmodified Minecraft             |
| `MODDED`    | Modded            | Custom mods and plugins          |
| `CUSTOM`    | Custom            | Unique game modes                |

## Gamemodes (Optional)

Add detailed gamemode information:

```json
{
  "gamemodes": {
    "survival": {
      "name": "Survival",
      "versions": ["1.19.2", "1.20.1"],
      "description": "Classic survival gameplay with economy"
    },
    "creative": {
      "name": "Creative",
      "versions": "1.20.1",
      "description": "Unlimited building and creation"
    }
  }
}
```

### Gamemode Field Details

| Field         | Type            | Description                       | Example                              |
| ------------- | --------------- | --------------------------------- | ------------------------------------ |
| `versions`    | String or Array | Supported Minecraft versions      | `"1.20.1"` or `["1.19.2", "1.20.1"]` |
| `description` | String          | Brief description of the gamemode | `"Classic survival with economy"`    |

## Social Links (Optional)

Connect your social media and external links:

```json
{
  "socials": {
    "website": "https://yourserver.com",
    "store": "https://store.yourserver.com",
    "youtube": "https://youtube.com/@yourserver",
    "instagram": "https://instagram.com/yourserver",
    "tiktok": "https://tiktok.com/@yourserver",
    "x": "https://x.com/yourserver",
    "discord": "https://discord.gg/yourserver",
    "teamspeak": "https://teamspeak.com/yourserver"
  }
}
```

### Social Links Field Details

| Field       | Type | Description           | Example                              |
| ----------- | ---- | --------------------- | ------------------------------------ |
| `website`   | URL  | Official website      | `"https://yourserver.com"`           |
| `store`     | URL  | Store/Donation page   | `"https://store.yourserver.com"`     |
| `youtube`   | URL  | YouTube channel       | `"https://youtube.com/@yourserver"`  |
| `instagram` | URL  | Instagram profile     | `"https://instagram.com/yourserver"` |
| `tiktok`    | URL  | TikTok profile        | `"https://tiktok.com/@yourserver"`   |
| `x`         | URL  | X (Twitter) profile   | `"https://x.com/yourserver"`         |
| `discord`   | URL  | Discord server invite | `"https://discord.gg/yourserver"`    |
| `teamspeak` | URL  | TeamSpeak server      | `"ts3://teamspeak.com/yourserver"`   |

## Assets

Required image files for your server:

```json
{
  "assets": {
    "icon": "./icon.png",
    "background": "./bg.png"
  }
}
```

### Asset Requirements

| Field        | Type   | Description             | File Requirements |
| ------------ | ------ | ----------------------- | ----------------- |
| `icon`       | String | Server icon image       | PNG               |
| `background` | String | Server background image | PNG               |

**File Path Rules:**

- Must start with `./` (relative to manifest.json)
- Supported formats: `.png`
- Files must actually exist in the specified location

## Disabled Modules (Optional)

Specify which client modules are disabled on your server:

```json
{
  "disabled-modules": ["FOV_CHANGER", "FULL_BRIGHT", "ZOOM"]
}
```

### Available Disabled Modules

| Module              | Description                    | Why Disable                                    |
| ------------------- | ------------------------------ | ---------------------------------------------- |
| `FOV_CHANGER`       | Field of View modifications    | Prevents unfair visual advantages              |
| `FULL_BRIGHT`       | Full brightness/gamma          | Prevents night vision exploits                 |
| `ZOOM`              | Zoom functionality             | Prevents unfair targeting                      |
| `FREE_LOOK`         | Free look camera               | Prevents third-person exploits                 |
| `NO_FOG`            | Fog removal                    | Prevents visibility exploits                   |
| `ARROW_TRAIL`       | Arrow trail effects            | Prevents visual clutter                        |
| `PACK_TWEAKS`       | Resource pack modifications    | Ensures fair gameplay                          |
| `ITEM_MODEL`        | Custom item models             | Prevents visual confusion                      |
| `AUTO_TEXT`         | Automatic text input           | Prevents spam/automation                       |
| `ITEM_HIGHLIGHTER`  | Item highlighting              | Prevents unfair advantages                     |
| `TNT_TIMER`         | TNT timer displays             | Prevents timing exploits                       |
| `WEATHER_CHANGER`   | Weather modifications          | Prevents visual exploits                       |
| `TIME_CHANGER`      | Time modifications             | Prevents visual exploits                       |
| `HEALTH_INDICATORS` | Health above players           | Hides enemy health                             |
| `HITBOX`            | Entity hitbox rendering        | Prevents aim and reach advantages              |
| `HIT_COLOR`         | Custom hit flash colour        | Keeps hit feedback vanilla                     |
| `NO_HURT_CAM`       | Removes the hurt camera shake  | Keeps PvP knockback feel vanilla               |
| `LOW_FIRE`          | Lowered fire overlay           | Prevents visibility advantages while burning   |
| `LIGHT_LEVEL`       | Light level overlay            | Prevents mob spawn scouting                    |
| `BLOCK_OUTLINES`    | Custom block outlines          | Keeps block targeting vanilla                  |
| `CUSTOM_CROSSHAIR`  | Custom crosshair               | Prevents aim assist crosshairs                 |
| `SHIELD_STATUS`     | Shield cooldown indicator      | Hides enemy shield timing                      |
| `NAME_TAGS`         | Name tag tweaks                | Keeps name tags vanilla                        |
| `WAYPOINTS`         | Waypoints                      | Prevents location sharing in events            |
| `PINGS`             | Location pings to friends      | Prevents location sharing in events            |
| `SATURATION`        | Saturation and exhaustion info | Hides hidden food values                       |
| `TOGGLE_SPRINT`     | Toggle sprint/sneak            | Prevents input automation                      |
| `COORDINATES`       | Coordinates HUD                | Hides coordinates on hardcore or event servers |
| `DIRECTION_HUD`     | Compass HUD                    | Hides direction on event servers               |
| `ARMOR_STATUS`      | Armor durability HUD           | Keeps durability info vanilla                  |
| `POTION_STATUS`     | Potion effect HUD              | Keeps effect timers vanilla                    |
| `REACH_DISPLAY`     | Hit reach readout              | Hides PvP reach info                           |
| `COMBO_COUNTER`     | Combo counter                  | Hides PvP combo info                           |
| `JUMP_RESET`        | Jump reset indicator           | Hides PvP knockback timing help                |

Important Note:
If a module is not available per enum can enter it as a string like this:

```json
{
  "disabled-modules": ["FovChanger"]
}
```

If you have a valid reason to disable the Module your Pull Request will still be merged!

## Complete Example

Here's a complete example of a valid manifest.json:

```json
{
  "server-address": ["play.example.com", "mc.example.com"],
  "pretty-name": "Epic Survival Network",
  "categorys": ["SURVIVAL", "PVP", "MINIGAMES"],
  "gamemodes": {
    "survival": {
      "versions": ["1.19.2", "1.20.1"],
      "description": "Classic survival with economy and factions"
    },
    "skywars": {
      "versions": "1.20.1",
      "description": "Fast-paced PvP battles in the sky"
    },
    "creative": {
      "versions": ["1.19.2", "1.20.1"],
      "description": "Unlimited building and creation"
    }
  },
  "socials": {
    "website": "https://example.com",
    "store": "https://store.example.com",
    "discord": "https://discord.gg/example",
    "youtube": "https://youtube.com/@exampleserver"
  },
  "assets": {
    "icon": "./icon.png",
    "background": "./bg.png"
  },
  "disabled-modules": ["FOV_CHANGER", "FULL_BRIGHT", "ZOOM"]
}
```

## Validation

### Local Testing

Test your manifest before submitting:

```bash
# Install dependencies
npm install

# Validate your manifest
npm run validate
```

### GitHub Actions

Manifests are automatically validated when you:

- Push changes to the repository
- Create a pull request

The validation checks:

- ✅ JSON structure and syntax
- ✅ Required fields are present
- ✅ Asset files exist
- ✅ URLs are valid
- ✅ Categories are valid
- ✅ Data types are correct

## Merged Manifest Format

When all server manifests are merged together, they create a unified manifest with the following structure:

```json
{
  "servers": {
    "server-id": {
      "server-address": ["server.com"],
      "pretty-name": "Server Name",
      "categorys": ["SURVIVAL"],
      "gamemodes": {
        "gamemode-name": {
          "name": "Gamemode Name",
          "versions": "1.20.1",
          "description": "Description"
        }
      },
      "socials": {
        "website": "https://server.com"
      },
      "assets": {
        "icon": "./assets/server-id/icon.png",
        "background": "./assets/server-id/background.png"
      },
      "disabled-modules": []
    }
  },
  "metadata": {
    "totalServers": 1,
    "mergedAt": "2024-01-01T12:00:00.000Z",
    "sourceFolders": ["server-id"]
  }
}
```

### Merged Manifest Structure

| Field                    | Type   | Description                             |
| ------------------------ | ------ | --------------------------------------- |
| `servers`                | Object | All server manifests keyed by server ID |
| `servers[server-id]`     | Object | Individual server manifest data         |
| `metadata`               | Object | Information about the merge process     |
| `metadata.totalServers`  | Number | Total number of servers processed       |
| `metadata.mergedAt`      | String | ISO timestamp of merge                  |
| `metadata.sourceFolders` | Array  | List of source folder names             |

### Asset Paths in Merged Manifest

In the merged manifest, asset paths are updated to reflect the new structure:

- Original: `"./icon.png"`
- Merged: `"./assets/server-id/icon.png"`

All assets are copied to the `merged/assets/` directory during the merge process.

## Getting Started

1. **Create your server directory:**

   ```bash
   mkdir servers/your-server-name
   cd servers/your-server-name
   ```

2. **Add your images:**
   - `icon.png` (recommended: 64x64 or 128x128)
   - `bg.png` (recommended: 1920x1080 or similar)

3. **Create manifest.json:**
   - Copy the basic structure above
   - Fill in your server details
   - Test with `npm run validate`

4. **Submit your changes:**
   - Create a pull request
   - GitHub Actions will validate automatically

## Common Issues

| Error                             | Cause                    | Solution                                 |
| --------------------------------- | ------------------------ | ---------------------------------------- |
| `"server-address" is required`    | Missing server addresses | Add your server domains                  |
| `"assets.icon" is required`       | Missing icon file        | Add icon.png to your directory           |
| `"assets.background" is required` | Missing background file  | Add bg.png to your directory             |
| `Invalid category`                | Unknown category         | Use one from the categories table        |
| `File not found`                  | Asset files missing      | Ensure icon.png and bg.png exist         |
| `Invalid URI format`              | Bad URL format           | Use proper URLs starting with `https://` |

## Need Help?

- Check the [schema file](servers/manifest-schema.json) for technical details
- Run `npm run validate` to test your manifest
- Look at existing server examples in the `servers/` directory
