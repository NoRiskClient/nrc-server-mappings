## Validation

This repository includes automated validation for server manifest files. All `manifest.json` files must conform to the schema defined in `servers/manifest-schema.json`.

### Local Validation

To validate manifests locally:

```bash
# Install dependencies
npm install

# Run validation
npm run validate
```

### GitHub Actions

The repository includes a GitHub Action that automatically validates manifest files when they are added or modified. The action will:

1. Validate JSON structure against the schema
2. Check that required asset files (icon, background) exist
3. Verify that all URLs in socials are valid URIs
4. Ensure all required fields are present

### Adding a New Server

When adding a new server:

1. Create a new directory under `servers/` with your server name
2. Add a `manifest.json` file following the schema
3. Include the required asset files (icon.png, bg.png)
4. Optionally add a local `manifest-schema.json` for custom validation rules

The validation will run automatically on pull requests and pushes.

## Manifest Merging

The repository includes a merge script that combines all individual server manifests into a unified manifest file.

### Running the Merge Script

```bash
# Merge all manifests
node scripts/merge-manifests.js
```

### Merge Process

The merge script will:

1. **Scan all server directories** in `servers/`
2. **Read and validate** each `manifest.json` file
3. **Copy assets** to `merged/assets/[server-id]/`
4. **Update asset paths** to reflect the new structure
5. **Create merged manifest** at `merged/merged-manifest.json`
6. **Validate the result** against the schema

### Merge Output

The merged manifest includes:

- All server data organized under `servers` object
- Metadata about the merge process
- Copied assets with updated paths
- Validation results and error reporting

### Merge Validation

The merged manifest is automatically validated to ensure:

- All required fields are present
- Asset files exist and are accessible
- JSON structure is valid
- No duplicate server IDs exist
