#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

const ajv = new Ajv({
  allErrors: true,
  verbose: true
});
addFormats(ajv);

const rootSchemaPath = path.join(__dirname, '..', 'servers', 'manifest-schema.json');
const rootSchema = JSON.parse(fs.readFileSync(rootSchemaPath, 'utf8'));

function validateManifest(manifestPath, schemaPath = null) {
  if (!path.relative(process.cwd(), manifestPath).match(/^[a-z0-9/._-]+$/)) {
    console.error(`❌ Non [a-z0-9/._-] character in path: ${path.relative(process.cwd(), manifestPath)}`);
    return false;
  }

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    const schema = schemaPath ? JSON.parse(fs.readFileSync(schemaPath, 'utf8')) : rootSchema;
    
    const validate = ajv.compile(schema);
    const valid = validate(manifest);
    
    if (!valid) {
      console.error(`❌ Validation failed for ${manifestPath}:`);
      validate.errors.forEach(error => {
        console.error(`  - ${error.instancePath}: ${error.message}`);
      });
      return false;
    }
    
    console.log(`✅ ${manifestPath} is valid`);
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${manifestPath}: ${error.message}`);
    return false;
  }
}

function validateAssets(manifestPath) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const manifestDir = path.dirname(manifestPath);
    
    const assets = manifest.assets;
    if (!assets) {
      console.error(`❌ No assets section found in ${manifestPath}`);
      return false;
    }
    
    let allValid = true;
    
    if (assets.icon) {
      const iconPath = path.join(manifestDir, assets.icon);
      if (!fs.existsSync(iconPath)) {
        console.error(`❌ Icon file not found: ${iconPath}`);
        allValid = false;
      } else {
        console.log(`✅ Icon file exists: ${iconPath}`);
      }
    }
    
    if (assets.background) {
      const backgroundPath = path.join(manifestDir, assets.background);
      if (!fs.existsSync(backgroundPath)) {
        console.error(`❌ Background file not found: ${backgroundPath}`);
        allValid = false;
      } else {
        console.log(`✅ Background file exists: ${backgroundPath}`);
      }
    }
    
    return allValid;
  } catch (error) {
    console.error(`❌ Error checking assets for ${manifestPath}: ${error.message}`);
    return false;
  }
}

function findManifestFiles() {
  const serversDir = path.join(__dirname, '..', 'servers');
  const manifests = [];
  
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (file === 'manifest.json') {
        manifests.push(fullPath);
      }
    }
  }
  
  walkDir(serversDir);
  return manifests;
}

function main() {
  console.log('🔍 Finding manifest files...');
  const manifestFiles = findManifestFiles();
  
  if (manifestFiles.length === 0) {
    console.log('No manifest files found.');
    return;
  }
  
  console.log(`Found ${manifestFiles.length} manifest file(s):`);
  manifestFiles.forEach(file => console.log(`  - ${file}`));
  console.log('');
  
  let allValid = true;
  
  for (const manifestPath of manifestFiles) {
    console.log(`\n📋 Validating ${path.relative(process.cwd(), manifestPath)}...`);
    
    const manifestDir = path.dirname(manifestPath);
    const localSchemaPath = path.join(manifestDir, 'manifest-schema.json');
    const schemaPath = fs.existsSync(localSchemaPath) ? localSchemaPath : null;
    
    if (schemaPath) {
      console.log(`Using local schema: ${path.relative(process.cwd(), schemaPath)}`);
    } else {
      console.log('Using root schema');
    }
    
    const manifestValid = validateManifest(manifestPath, schemaPath);
    const assetsValid = validateAssets(manifestPath);
    
    if (!manifestValid || !assetsValid) {
      allValid = false;
    }
  }
  
  console.log('\n' + '='.repeat(50));
  if (allValid) {
    console.log('🎉 All manifests are valid!');
    process.exit(0);
  } else {
    console.log('❌ Some manifests have validation errors.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateManifest, validateAssets, findManifestFiles }; 