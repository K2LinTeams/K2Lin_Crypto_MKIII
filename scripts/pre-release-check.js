const fs = require('fs');
const path = require('path');

const errors = [];

console.log('Running Pre-Release Checks...');

// 1. Check Icon
const iconPath = path.join(__dirname, '../resources/icon.png');
if (fs.existsSync(iconPath)) {
    console.log('✅ Icon exists at resources/icon.png');
} else {
    console.error('❌ Icon MISSING at resources/icon.png');
    errors.push('Icon missing');
}

// 2. Check electron-builder.yml
const builderConfigPath = path.join(__dirname, '../electron-builder.yml');
if (fs.existsSync(builderConfigPath)) {
    const content = fs.readFileSync(builderConfigPath, 'utf8');

    // Check for win target: portable
    // Using simple string inclusion check for robustness since js-yaml is not installed
    if (content.includes('target: portable')) {
        console.log('✅ Windows target is set to portable');
    } else {
        console.error('❌ Windows target is NOT set to portable');
        errors.push('Incorrect build target');
    }

    if (content.includes('icon: resources/icon.png') || content.includes('icon: build/icon.ico')) {
         console.log('✅ Icon configured in electron-builder.yml');
    } else {
         console.error('❌ Icon NOT explicitly configured in electron-builder.yml (check win.icon)');
         // Warn but maybe not fail if relying on default, but we want no compromises
         errors.push('Icon config missing');
    }
} else {
    console.error('❌ electron-builder.yml missing');
    errors.push('Config missing');
}

// 3. Check package.json version format
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = require(packageJsonPath);
const version = packageJson.version;
if (/^\d+\.\d+\.\d+/.test(version)) {
    console.log(`✅ Version format is valid: ${version}`);
} else {
    console.error(`❌ Invalid version format: ${version}`);
    errors.push('Invalid version');
}

// Summary
if (errors.length > 0) {
    console.error('\nPre-release check FAILED with the following errors:');
    errors.forEach(e => console.error(`- ${e}`));
    process.exit(1);
} else {
    console.log('\n✅ All checks passed! Ready for release.');
    process.exit(0);
}
