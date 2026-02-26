export interface Migration {
    pluginVersion: string;
    jenkinsBaseline: string;
    targetBaseline: string;
    effectiveBaseline: string;
    jenkinsVersion: string;
    migrationName: string;
    migrationDescription: string;
    tags: string[];
    migrationId: string;
    migrationStatus: 'success' | 'fail' | '';
    pullRequestUrl: string;
    pullRequestStatus: 'open' | 'closed' | 'merged' | '';
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

export interface PluginReport {
    pluginName: string;
    pluginRepository: string;
    migrations: Migration[];
}

export interface RecipePlugin {
    pluginName: string;
    status: string;
    timestamp: string;
}

export interface RecipeReport {
    recipeId: string;
    totalApplications: number;
    successCount: number;
    failureCount: number;
    plugins: RecipePlugin[];
}

export interface SummaryStats {
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

export interface AppData {
    plugins: PluginReport[];
    recipes: RecipeReport[];
    summary: SummaryStats;
}

export type MigrationStatusFilter = 'all' | 'success' | 'fail';
export type PRStatusFilter = 'all' | 'open' | 'closed' | 'merged';
