import type { AppData, PluginReport, RecipeReport, SummaryStats } from '../types';

const DATA_BASE_URL = import.meta.env.BASE_URL + 'data/';

let cachedData: AppData | null = null;

export async function loadAppData(): Promise<AppData> {
    if (cachedData) return cachedData;

    try {
        const [pluginsRes, recipesRes, summaryRes] = await Promise.all([
            fetch(DATA_BASE_URL + 'plugins.json'),
            fetch(DATA_BASE_URL + 'recipes.json'),
            fetch(DATA_BASE_URL + 'summary.json'),
        ]);

        const plugins: PluginReport[] = await pluginsRes.json();
        const recipes: RecipeReport[] = await recipesRes.json();
        const summary: SummaryStats = await summaryRes.json();

        cachedData = { plugins, recipes, summary };
        return cachedData;
    } catch {
        console.warn('Failed to load live data, using sample data');
        const { getSampleData } = await import('./sampleData');
        cachedData = getSampleData();
        return cachedData;
    }
}

export function getPluginByName(data: AppData, name: string): PluginReport | undefined {
    return data.plugins.find(p => p.pluginName === name);
}

export function getRecipeById(data: AppData, id: string): RecipeReport | undefined {
    return data.recipes.find(r => r.recipeId === id);
}

export function getRecipeDisplayName(recipeId: string): string {
    const parts = recipeId.split('.');
    const name = parts[parts.length - 1];
    return name.replace(/([A-Z])/g, ' $1').trim();
}

export function getUniqueRecipeIds(data: AppData): string[] {
    return data.recipes.map(r => r.recipeId);
}

export function getPluginsWithFailures(data: AppData): PluginReport[] {
    return data.plugins.filter(p =>
        p.migrations.some(m => m.migrationStatus === 'fail')
    );
}

export function getMigrationTimeline(data: AppData): { date: string; count: number }[] {
    const map = new Map<string, number>();
    for (const plugin of data.plugins) {
        for (const m of plugin.migrations) {
            if (m.timestamp) {
                const date = m.timestamp.substring(0, 10);
                map.set(date, (map.get(date) || 0) + 1);
            }
        }
    }
    return Array.from(map.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
}

export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csv = [
        headers.join(','),
        ...data.map(row =>
            headers.map(h => {
                const val = row[h];
                const str = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
                return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
            }).join(',')
        )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export function exportToJSON(data: unknown, filename: string): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
