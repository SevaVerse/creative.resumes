#!/usr/bin/env node

/**
 * Build Script for Static Export to Spaceship Hosting
 * 
 * This script:
 * 1. Builds the Next.js app with standard build (not static export)
 * 2. Copies public assets and _next/static to out/ folder
 * 3. Copies .htaccess-cdn to out/.htaccess
 * 4. Generates a deployment manifest
 * 
 * Note: For hybrid deployment, the full Next.js build should be deployed to Vercel
 * for API routes and server-side rendering. The out/ folder contains only static
 * assets that can optionally be served via CDN/Spaceship.
 * 
 * RECOMMENDED: Deploy full project to Vercel, use Cloudflare for caching
 * 
 * Usage:
 *   npm run build:static
 *   node scripts/build-static.mjs
 */

import { readFile, writeFile, copyFile, readdir, stat, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n[${step}] ${message}`, 'bright');
}

function logSuccess(message) {
  log(`✓ ${message}`, 'green');
}

function logWarning(message) {
  log(`⚠ ${message}`, 'yellow');
}

function logError(message) {
  log(`✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ ${message}`, 'cyan');
}

// Configuration
const HTACCESS_SOURCE = join(rootDir, '.htaccess-cdn');
const OUT_DIR = join(rootDir, 'out');
const HTACCESS_DEST = join(OUT_DIR, '.htaccess');
const MANIFEST_FILE = join(OUT_DIR, 'deployment-manifest.json');

async function buildNextApp() {
  logStep('1', 'Building Next.js application');
  log('Running: next build --turbopack', 'cyan');
  
  try {
    // Run standard Next.js build with Turbopack
    execSync('npx next build --turbopack', {
      cwd: rootDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'production',
      },
    });
    logSuccess('Next.js build completed successfully');
  } catch (error) {
    logError('Build failed');
    throw error;
  }
}

async function copyDirectory(src, dest) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

async function copyStaticFiles() {
  logStep('2', 'Copying static files to out/ directory');
  
  const publicDir = join(rootDir, 'public');
  const nextStaticDir = join(rootDir, '.next', 'static');
  
  try {
    // Create out directory if it doesn't exist
    await mkdir(OUT_DIR, { recursive: true });
    
    // Copy public folder contents
    await copyDirectory(publicDir, OUT_DIR);
    logSuccess('Copied public/ directory');
    
    // Copy Next.js static assets (_next/static)
    const nextStaticDest = join(OUT_DIR, '_next', 'static');
    await mkdir(join(OUT_DIR, '_next'), { recursive: true });
    await copyDirectory(nextStaticDir, nextStaticDest);
    logSuccess('Copied _next/static/ directory');
    
    // Create a simple index.html that explains the setup
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SecureCV - Hybrid Deployment</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            line-height: 1.6;
        }
        .info { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .warning { background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; }
        code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; }
        h1 { color: #1976d2; }
    </style>
</head>
<body>
    <h1>🚀 SecureCV - Hybrid Deployment</h1>
    
    <div class="info">
        <h2>Deployment Architecture</h2>
        <p>This project uses a <strong>hybrid deployment</strong> strategy:</p>
        <ul>
            <li><strong>Static Assets</strong>: Can be served from CDN (this folder)</li>
            <li><strong>API Routes &amp; Dynamic Pages</strong>: Must be deployed to Vercel</li>
            <li><strong>Serverless Functions</strong>: Supabase Edge Functions</li>
        </ul>
    </div>
    
    <div class="warning">
        <h2>⚠️ Important</h2>
        <p>This static build only contains public assets (images, fonts, etc.) and static JS/CSS bundles.</p>
        <p><strong>RECOMMENDED</strong>: Deploy the full Next.js project to Vercel for simplicity.</p>
        <p>Use Cloudflare in front of Vercel for caching and CDN benefits.</p>
    </div>
    
    <h2>Recommended Deployment</h2>
    <ol>
        <li>Deploy full project to Vercel (handles everything)</li>
        <li>Configure Cloudflare DNS to point to Vercel</li>
        <li>Enable Cloudflare Page Rules for aggressive caching</li>
        <li>Cloudflare will cache static assets, reducing Vercel bandwidth</li>
    </ol>
    
    <h2>Why Deploy Everything to Vercel?</h2>
    <ul>
        <li>✅ Single deployment target (simpler)</li>
        <li>✅ Automatic static optimization</li>
        <li>✅ Built-in CDN and edge network</li>
        <li>✅ Serverless API routes work seamlessly</li>
        <li>✅ No need to manage multiple hosting platforms</li>
    </ul>
    
    <p><em>Built: ${new Date().toISOString()}</em></p>
</body>
</html>`;
    
    await writeFile(join(OUT_DIR, 'index.html'), indexHtml, 'utf-8');
    logSuccess('Created deployment guide (index.html)');
    
  } catch (error) {
    logWarning('Error copying static files: ' + error.message);
    throw error;
  }
}

async function copyHtaccess() {
  logStep('3', 'Copying .htaccess-cdn to out folder');
  
  try {
    // Check if .htaccess-cdn exists
    await stat(HTACCESS_SOURCE);
    
    // Copy to out/.htaccess
    await copyFile(HTACCESS_SOURCE, HTACCESS_DEST);
    logSuccess('.htaccess copied successfully');
    logInfo(`${HTACCESS_SOURCE} → ${HTACCESS_DEST}`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      logWarning('.htaccess-cdn not found, skipping');
      logInfo('Create .htaccess-cdn in root directory for Apache configuration');
    } else {
      throw error;
    }
  }
}

async function getDirectorySize(dirPath) {
  let totalSize = 0;
  
  async function walk(dir) {
    const files = await readdir(dir);
    
    for (const file of files) {
      const filePath = join(dir, file);
      const stats = await stat(filePath);
      
      if (stats.isDirectory()) {
        await walk(filePath);
      } else {
        totalSize += stats.size;
      }
    }
  }
  
  await walk(dirPath);
  return totalSize;
}

async function countFiles(dirPath) {
  let fileCount = 0;
  
  async function walk(dir) {
    const files = await readdir(dir);
    
    for (const file of files) {
      const filePath = join(dir, file);
      const stats = await stat(filePath);
      
      if (stats.isDirectory()) {
        await walk(filePath);
      } else {
        fileCount++;
      }
    }
  }
  
  await walk(dirPath);
  return fileCount;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function generateManifest() {
  logStep('4', 'Generating deployment manifest');
  
  try {
    const stats = await stat(OUT_DIR);
    const totalSize = await getDirectorySize(OUT_DIR);
    const fileCount = await countFiles(OUT_DIR);
    
    const manifest = {
      buildDate: new Date().toISOString(),
      buildTool: 'Next.js 15.5.2 + Turbopack',
      outputDir: 'out/',
      totalSize: totalSize,
      totalSizeFormatted: formatBytes(totalSize),
      fileCount: fileCount,
      environment: process.env.NODE_ENV || 'production',
      deploymentStrategy: 'HYBRID',
      configuration: {
        staticExport: false,
        note: 'Full Next.js build - deploy to Vercel',
        staticAssets: 'out/ folder contains public + _next/static',
        imageOptimization: 'Disabled for static compatibility',
        trailingSlash: true,
      },
      deployment: {
        recommended: 'Deploy full build to Vercel',
        alternative: 'Static assets in out/, API on Vercel',
        cdn: 'Cloudflare',
        domain: 'securecv.co.in',
      },
      fullBuildLocation: '.next/',
      apiRoutes: {
        note: 'API routes require Node.js runtime (Vercel only)',
        routes: [
          '/api/export-pdf',
          '/api/metrics',
          '/api/pdf-data',
          '/api/rewrite',
          '/api/send-login-link',
          '/api/verify-login-token',
          '/api/verify-turnstile',
        ],
      },
      edgeFunctions: {
        platform: 'Supabase Edge Functions (Deno)',
        functions: [
          'ai-rewrite',
          'parse-resume',
          'health',
        ],
      },
      instructions: {
        recommended: 'Deploy entire project to Vercel, use Cloudflare for caching',
        vercel: 'Connect GitHub repo to Vercel, auto-deploy on push',
        cloudflare: 'Point domain to Vercel, enable Page Rules for aggressive caching',
        alternative: 'out/ folder can be served from Spaceship, but API routes need Vercel',
      },
    };
    
    await writeFile(MANIFEST_FILE, JSON.stringify(manifest, null, 2), 'utf-8');
    
    logSuccess('Deployment manifest generated');
    logInfo(`Location: ${MANIFEST_FILE}`);
    log('\nBuild Summary:', 'bright');
    log(`  Files: ${fileCount}`, 'cyan');
    log(`  Total Size: ${formatBytes(totalSize)}`, 'cyan');
    log(`  Output Directory: out/`, 'cyan');
  } catch (error) {
    logWarning('Could not generate manifest: ' + error.message);
  }
}

async function displayNextSteps() {
  log('\n' + '═'.repeat(60), 'green');
  log('🚀 Build Complete!', 'bright');
  log('═'.repeat(60), 'green');
  
  log('\n📦 Deployment Options:', 'bright');
  log('', 'reset');
  log('  RECOMMENDED: Full Vercel Deployment', 'yellow');
  log('  ─────────────────────────────────────', 'yellow');
  log('  1. Connect GitHub repo to Vercel', 'cyan');
  log('  2. Configure Cloudflare:', 'cyan');
  log('     - Point domain to Vercel deployment', 'reset');
  log('     - Enable Page Rules for caching', 'reset');
  log('  3. Benefits:', 'cyan');
  log('     ✓ Single deployment target', 'green');
  log('     ✓ Automatic static optimization', 'green');
  log('     ✓ Built-in CDN', 'green');
  log('     ✓ Serverless API routes', 'green');
  log('', 'reset');
  log('  ALTERNATIVE: Hybrid Deployment (Advanced)', 'yellow');
  log('  ─────────────────────────────────────', 'yellow');
  log('  1. Deploy full build to Vercel (for API routes)', 'cyan');
  log('  2. Upload out/ folder to Spaceship (for static assets)', 'cyan');
  log('  3. Configure DNS split (complex routing)', 'cyan');
  log('  4. Not recommended unless specific requirement', 'red');
  log('', 'reset');
  log('  Next Commands:', 'bright');
  log('  - Test build: npm start', 'cyan');
  log('  - Deploy to Vercel: vercel --prod', 'cyan');
  log('  - View manifest: type out\\deployment-manifest.json', 'cyan');
  
  log('\n' + '═'.repeat(60), 'green');
}

async function main() {
  log('\n' + '═'.repeat(60), 'blue');
  log('Static Export Build Script', 'bright');
  log('SecureCV - Resume Builder', 'bright');
  log('═'.repeat(60), 'blue');
  
  try {
    // Step 1: Build Next.js app (standard build)
    await buildNextApp();
    
    // Step 2: Copy static files to out/ directory
    await copyStaticFiles();
    
    // Step 3: Copy .htaccess
    await copyHtaccess();
    
    // Step 4: Generate manifest
    await generateManifest();
    
    // Display next steps
    await displayNextSteps();
    
    process.exit(0);
  } catch (error) {
    logError('\nBuild failed: ' + error.message);
    process.exit(1);
  }
}

// Run the script
main();
