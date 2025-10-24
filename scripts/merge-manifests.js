#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function mergeManifests() {
    const serversDir = path.join(__dirname, '..', 'servers');
    const outputDir = path.join(__dirname, '..', 'merged');
    const outputManifestPath = path.join(outputDir, 'merged-manifest.json');

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, {recursive: true});
    }

    console.log('🔍 Scanning servers directory...');

    const serverFolders = fs.readdirSync(serversDir, {withFileTypes: true})
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
        .filter(name => name !== 'merged');

    console.log(`📁 Found ${serverFolders.length} server folders:`, serverFolders);

    const mergedManifest = {
        servers: {},
        metadata: {
            totalServers: 0,
            mergedAt: new Date().toISOString(),
            sourceFolders: serverFolders
        }
    };

    let processedCount = 0;
    let errorCount = 0;

    for (const folderName of serverFolders) {
        const folderPath = path.join(serversDir, folderName);
        const manifestPath = path.join(folderPath, 'manifest.json');

        try {
            if (!fs.existsSync(manifestPath)) {
                console.warn(`⚠️  No manifest.json found in ${folderName}`);
                continue;
            }

            const manifestContent = fs.readFileSync(manifestPath, 'utf8');
            const manifest = JSON.parse(manifestContent);

            if (!manifest['server-address'] || !manifest['pretty-name'] || !manifest['categories']) {
                console.warn(`⚠️  Invalid manifest in ${folderName}: missing required fields`);
                errorCount++;
                continue;
            }

            const processedManifest = processAssets(manifest, folderName, folderPath, outputDir);

            mergedManifest.servers[folderName] = processedManifest;
            processedCount++;

            console.log(`✅ Processed ${folderName}`);

        } catch (error) {
            console.error(`❌ Error processing ${folderName}:`, error.message);
            errorCount++;
        }
    }

    mergedManifest.metadata.totalServers = processedCount;

    fs.writeFileSync(outputManifestPath, JSON.stringify(mergedManifest, null, 2));

    console.log('\n📊 Merge Summary:');
    console.log(`✅ Successfully processed: ${processedCount} servers`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📄 Output: ${outputManifestPath}`);

    return {
        success: processedCount,
        errors: errorCount,
        outputPath: outputManifestPath
    };
}

function processAssets(manifest, folderName, sourceFolderPath, outputDir) {
    const processedManifest = {...manifest};

    if (manifest.assets) {
        const assetsDir = path.join(outputDir, 'assets', folderName);

        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, {recursive: true});
        }

        if (manifest.assets.icon) {
            const iconSource = path.join(sourceFolderPath, manifest.assets.icon.replace('./', ''));
            const iconDest = path.join(assetsDir, 'icon.png');

            if (fs.existsSync(iconSource)) {
                fs.copyFileSync(iconSource, iconDest);
                processedManifest.assets.icon = `./assets/${folderName}/icon.png`;
            }
        }

        if (manifest.assets.background) {
            const bgSource = path.join(sourceFolderPath, manifest.assets.background.replace('./', ''));
            const bgDest = path.join(assetsDir, 'background.png');

            if (fs.existsSync(bgSource)) {
                fs.copyFileSync(bgSource, bgDest);
                processedManifest.assets.background = `./assets/${folderName}/background.png`;
            }
        }
    }

    return processedManifest;
}


function validateMergedManifest(mergedManifestPath) {
    try {
        const schemaPath = path.join(__dirname, '..', 'servers', 'manifest-schema.json');

        if (!fs.existsSync(schemaPath)) {
            console.warn('⚠️  Schema file not found, skipping validation');
            return;
        }

        const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
        const manifest = JSON.parse(fs.readFileSync(mergedManifestPath, 'utf8'));

        console.log('🔍 Validating merged manifest...');

        let isValid = true;
        const errors = [];

        for (const [serverId, serverData] of Object.entries(manifest.servers)) {
            if (!serverData['server-address'] || !Array.isArray(serverData['server-address'])) {
                errors.push(`${serverId}: Missing or invalid server-address`);
                isValid = false;
            }

            if (!serverData['pretty-name']) {
                errors.push(`${serverId}: Missing pretty-name`);
                isValid = false;
            }

            if (!serverData['categories'] || !Array.isArray(serverData['categories'])) {
                errors.push(`${serverId}: Missing or invalid categories`);
                isValid = false;
            }

            if (!serverData['assets'] || !serverData['assets']['icon'] || !serverData['assets']['background']) {
                errors.push(`${serverId}: Missing required assets`);
                isValid = false;
            }
        }

        if (isValid) {
            console.log('✅ Merged manifest validation passed');
        } else {
            console.log('❌ Validation errors:');
            errors.forEach(error => console.log(`  - ${error}`));
        }

    } catch (error) {
        console.error('❌ Validation error:', error.message);
    }
}

if (require.main === module) {
    console.log('🚀 Starting manifest merge process...\n');

    const result = mergeManifests();

    if (result.success > 0) {
        console.log('\n🎉 Merge completed successfully!');
        validateMergedManifest(result.outputPath);
    } else {
        console.log('\n❌ No servers were processed successfully');
        process.exit(1);
    }
}

module.exports = {mergeManifests, validateMergedManifest};
