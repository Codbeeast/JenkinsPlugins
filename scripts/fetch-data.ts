/**
 * Build-time data fetching script.
 * Fetches plugin modernization data from GitHub and writes
 * consolidated JSON bundles to public/data/ for the static site.
 * 
 * Usage: npx tsx scripts/fetch-data.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const REPO = 'jenkins-infra/metadata-plugin-modernizer';
const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/main`;
const API_BASE = `https://api.github.com/repos/${REPO}`;
const OUTPUT_DIR = path.resolve(process.cwd(), 'public', 'data');

interface Migration {
    pluginVersion: string;
    jenkinsBaseline: string;
    targetBaseline: string;
    effectiveBaseline: string;
    jenkinsVersion: string;
    migrationName: string;
    migrationDescription: string;
    tags: string[];
    migrationId: string;
    migrationStatus: string;
    pullRequestUrl: string;
    pullRequestStatus: string;
    dryRun: boolean;
    additions: number;
    deletions: number;
    changedFiles: number;
    key: string;
    path: string;
    checkRuns: Record<string, unknown>;
    checkRunsSummary: string;
    defaultBranch: string;
    defaultBranchLatestCommitSha: string;
    timestamp: string;
}

interface PluginReport {
    pluginName: string;
    pluginRepository: string;
    migrations: Migration[];
}

interface RecipePlugin {
    pluginName: string;
    status: string;
    timestamp: string;
}

interface RecipeReport {
    recipeId: string;
    totalApplications: number;
    successCount: number;
    failureCount: number;
    plugins: RecipePlugin[];
}

interface SummaryStats {
    totalMigrations: number;
    failedMigrations: number;
    successRate: number;
    totalPRs: number;
    openPRs: number;
    closedPRs: number;
    mergedPRs: number;
    totalPlugins: number;
    failuresByRecipe: { recipe: string; failures: number }[];
}

async function fetchJSON(url: string): Promise<unknown> {
    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = { 'User-Agent': 'plugin-modernizer-stats' };
    if (token) headers['Authorization'] = `token ${token}`;

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.json();
}

async function fetchText(url: string): Promise<string> {
    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = { 'User-Agent': 'plugin-modernizer-stats' };
    if (token) headers['Authorization'] = `token ${token}`;

    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return res.text();
}

async function discoverPluginDirs(): Promise<string[]> {
    console.log('📂 Discovering plugin directories...');
    const tree = await fetchJSON(`${API_BASE}/git/trees/main?recursive=1`) as { tree: { path: string; type: string }[] };
    const pluginDirs = new Set<string>();

    for (const item of tree.tree) {
        if (item.path.includes('/reports/aggregated_migrations.json')) {
            const pluginName = item.path.split('/')[0];
            pluginDirs.add(pluginName);
        }
    }

    console.log(`   Found ${pluginDirs.size} plugins`);
    return Array.from(pluginDirs);
}

async function fetchPluginData(pluginName: string): Promise<PluginReport | null> {
    try {
        const url = `${RAW_BASE}/${pluginName}/reports/aggregated_migrations.json`;
        const data = await fetchJSON(url) as PluginReport;
        return data;
    } catch (e) {
        console.warn(`   ⚠ Failed to fetch ${pluginName}: ${e}`);
        return null;
    }
}

async function fetchRecipes(): Promise<RecipeReport[]> {
    console.log('📋 Fetching recipe reports...');
    const contents = await fetchJSON(`${API_BASE}/contents/reports/recipes`) as { name: string }[];
    const recipes: RecipeReport[] = [];

    for (const file of contents) {
        if (file.name.endsWith('.json')) {
            try {
                const data = await fetchJSON(`${RAW_BASE}/reports/recipes/${file.name}`) as RecipeReport;
                recipes.push(data);
            } catch (e) {
                console.warn(`   ⚠ Failed to fetch recipe ${file.name}: ${e}`);
            }
        }
    }

    console.log(`   Fetched ${recipes.length} recipes`);
    return recipes;
}

function parseSummary(summaryMd: string): Partial<SummaryStats> {
    const stats: Partial<SummaryStats> = {};

    const totalMatch = summaryMd.match(/Total Migrations\*\*:\s*(\d+)/);
    if (totalMatch) stats.totalMigrations = parseInt(totalMatch[1]);

    const failedMatch = summaryMd.match(/Failed Migrations\*\*:\s*(\d+)/);
    if (failedMatch) stats.failedMigrations = parseInt(failedMatch[1]);

    const rateMatch = summaryMd.match(/Success Rate\*\*:\s*([\d.]+)%/);
    if (rateMatch) stats.successRate = parseFloat(rateMatch[1]);

    const prMatches = {
        total: summaryMd.match(/Total PRs\s*\|\s*(\d+)/),
        open: summaryMd.match(/Open PRs\s*\|\s*(\d+)/),
        closed: summaryMd.match(/Closed PRs\s*\|\s*(\d+)/),
        merged: summaryMd.match(/Merged PRs\s*\|\s*(\d+)/),
    };

    if (prMatches.total) stats.totalPRs = parseInt(prMatches.total[1]);
    if (prMatches.open) stats.openPRs = parseInt(prMatches.open[1]);
    if (prMatches.closed) stats.closedPRs = parseInt(prMatches.closed[1]);
    if (prMatches.merged) stats.mergedPRs = parseInt(prMatches.merged[1]);

    return stats;
}

function buildSummary(plugins: PluginReport[], recipes: RecipeReport[], parsedSummary: Partial<SummaryStats>): SummaryStats {
    let totalMigrations = 0;
    let failedMigrations = 0;
    let openPRs = 0;
    let closedPRs = 0;
    let mergedPRs = 0;
    const prUrls = new Set<string>();

    for (const p of plugins) {
        for (const m of p.migrations) {
            totalMigrations++;
            if (m.migrationStatus === 'fail') failedMigrations++;
            if (m.pullRequestUrl && !prUrls.has(m.pullRequestUrl)) {
                prUrls.add(m.pullRequestUrl);
                if (m.pullRequestStatus === 'open') openPRs++;
                else if (m.pullRequestStatus === 'closed') closedPRs++;
                else if (m.pullRequestStatus === 'merged') mergedPRs++;
            }
        }
    }

    return {
        totalMigrations: parsedSummary.totalMigrations || totalMigrations,
        failedMigrations: parsedSummary.failedMigrations || failedMigrations,
        successRate: parsedSummary.successRate || (totalMigrations > 0 ? Math.round(((totalMigrations - failedMigrations) / totalMigrations) * 10000) / 100 : 0),
        totalPRs: parsedSummary.totalPRs || prUrls.size,
        openPRs: parsedSummary.openPRs || openPRs,
        closedPRs: parsedSummary.closedPRs || closedPRs,
        mergedPRs: parsedSummary.mergedPRs || mergedPRs,
        totalPlugins: plugins.length,
        failuresByRecipe: recipes
            .filter(r => r.failureCount > 0)
            .sort((a, b) => b.failureCount - a.failureCount)
            .map(r => ({ recipe: r.recipeId, failures: r.failureCount })),
    };
}

async function main() {
    console.log('🚀 Plugin Modernizer Stats - Data Fetcher');
    console.log('=========================================\n');

    // Ensure output directory
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });

    // 1. Discover plugins
    const pluginDirs = await discoverPluginDirs();

    // 2. Fetch all plugin data (in batches to avoid rate limiting)
    console.log('\n📦 Fetching plugin data...');
    const plugins: PluginReport[] = [];
    const BATCH_SIZE = 10;

    for (let i = 0; i < pluginDirs.length; i += BATCH_SIZE) {
        const batch = pluginDirs.slice(i, i + BATCH_SIZE);
        const results = await Promise.all(batch.map(fetchPluginData));
        for (const r of results) {
            if (r) plugins.push(r);
        }
        console.log(`   Progress: ${Math.min(i + BATCH_SIZE, pluginDirs.length)}/${pluginDirs.length}`);

        // Small delay between batches
        if (i + BATCH_SIZE < pluginDirs.length) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }

    console.log(`   ✓ Fetched ${plugins.length} plugins`);

    // 3. Fetch recipes
    const recipes = await fetchRecipes();

    // 4. Fetch and parse summary
    console.log('\n📊 Fetching summary...');
    let parsedSummary: Partial<SummaryStats> = {};
    try {
        const summaryMd = await fetchText(`${RAW_BASE}/reports/summary.md`);
        parsedSummary = parseSummary(summaryMd);
        console.log('   ✓ Summary parsed');
    } catch (e) {
        console.warn(`   ⚠ Could not fetch summary.md: ${e}`);
    }

    // 5. Build final summary
    const summary = buildSummary(plugins, recipes, parsedSummary);

    // 6. Write output files
    console.log('\n💾 Writing data files...');
    fs.writeFileSync(path.join(OUTPUT_DIR, 'plugins.json'), JSON.stringify(plugins, null, 2));
    fs.writeFileSync(path.join(OUTPUT_DIR, 'recipes.json'), JSON.stringify(recipes, null, 2));
    fs.writeFileSync(path.join(OUTPUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));

    console.log(`   ✓ plugins.json  (${plugins.length} plugins)`);
    console.log(`   ✓ recipes.json  (${recipes.length} recipes)`);
    console.log(`   ✓ summary.json`);

    console.log('\n✅ Data fetching complete!');
    console.log(`   Output directory: ${OUTPUT_DIR}`);
}

main().catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
});
