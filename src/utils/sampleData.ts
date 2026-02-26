import type { AppData, PluginReport, RecipeReport, SummaryStats, Migration } from '../types';

function makeMigration(overrides: Partial<Migration> = {}): Migration {
    return {
        pluginVersion: '1.0.0',
        jenkinsBaseline: '',
        targetBaseline: '2.361',
        effectiveBaseline: '2.361',
        jenkinsVersion: '2.361',
        migrationName: 'Setup the Jenkinsfile',
        migrationDescription: 'Add a missing Jenkinsfile to the Jenkins plugin.',
        tags: ['chore'],
        migrationId: 'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile',
        migrationStatus: 'success',
        pullRequestUrl: 'https://github.com/jenkinsci/example-plugin/pull/1',
        pullRequestStatus: 'merged',
        dryRun: false,
        additions: 12,
        deletions: 0,
        changedFiles: 1,
        key: '2025-07-23T07-51-56.json',
        path: '',
        checkRuns: {},
        checkRunsSummary: 'success',
        defaultBranch: 'main',
        defaultBranchLatestCommitSha: 'abc123',
        timestamp: '2025-07-23T07-51-56',
        ...overrides,
    };
}

const recipeIds = [
    'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile',
    'io.jenkins.tools.pluginmodernizer.UpgradeNextMajorParentVersion',
    'io.jenkins.tools.pluginmodernizer.UpgradeParent6Version',
    'io.jenkins.tools.pluginmodernizer.MigrateToJUnit5',
    'io.jenkins.tools.pluginmodernizer.MigrateToJava25',
    'io.jenkins.tools.pluginmodernizer.UpgradeToRecommendCoreVersion',
    'io.jenkins.tools.pluginmodernizer.SwitchToRenovate',
    'io.jenkins.tools.pluginmodernizer.AutoMergeWorkflows',
    'io.jenkins.tools.pluginmodernizer.RemoveOldJavaVersionForModernJenkins',
    'io.jenkins.tools.pluginmodernizer.AddCodeOwner',
    'io.jenkins.tools.pluginmodernizer.SetupDependabot',
    'io.jenkins.tools.pluginmodernizer.UpgradeBomVersion',
    'io.jenkins.tools.pluginmodernizer.MigrateCommonsLang2ToLang3AndCommonText',
    'io.jenkins.tools.pluginmodernizer.UpgradeToLatestJava11CoreVersion',
    'io.jenkins.tools.pluginmodernizer.SetupRenovate',
    'io.jenkins.tools.pluginmodernizer.UpgradeParent5Version',
    'io.jenkins.tools.pluginmodernizer.FixJellyIssues',
];

const recipeNames: Record<string, string> = {};
recipeIds.forEach(id => {
    const parts = id.split('.');
    recipeNames[id] = parts[parts.length - 1].replace(/([A-Z])/g, ' $1').trim();
});

const pluginNames = [
    'credentials', 'git', 'pipeline-model-definition', 'workflow-cps',
    'kubernetes', 'docker-workflow', 'blueocean', 'junit',
    'matrix-auth', 'ssh-credentials', 'github', 'gradle',
    'maven-invoker-plugin', 'configuration-as-code', 'ldap',
    'active-directory', 'artifactory', 'sonar', 'checkstyle',
    'cobertura', 'jacoco', 'findbugs', 'pmd', 'warnings-ng',
    'badge', 'build-blocker-plugin', 'cloudbees-folder',
    'ec2', 'amazon-ecs', 'azure-vm-agents', 'timestamper',
    'ansicolor', 'rebuild', 'conditional-buildstep', 'parameterized-trigger',
    'copyartifact', 'email-ext', 'slack', 'mattermost',
    'jira', 'bitbucket', 'gitlab-plugin', 'gerrit-trigger',
    'dashboard-view', 'build-monitor-plugin', 'view-job-filters',
    'role-strategy', 'authorize-project', 'script-security',
];

function randomStatus(): 'success' | 'fail' {
    return Math.random() > 0.25 ? 'success' : 'fail';
}

function randomPRStatus(): 'open' | 'closed' | 'merged' {
    const r = Math.random();
    if (r < 0.15) return 'open';
    if (r < 0.20) return 'closed';
    return 'merged';
}

function randomTimestamp(yearMonth: string): string {
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    const hour = String(Math.floor(Math.random() * 24)).padStart(2, '0');
    const min = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    const sec = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    return `${yearMonth}-${day}T${hour}-${min}-${sec}`;
}

const months = ['2025-06', '2025-07', '2025-08', '2025-09', '2025-10', '2025-11', '2025-12', '2026-01', '2026-02'];

function generatePlugins(): PluginReport[] {
    return pluginNames.map(name => {
        const numMigrations = Math.floor(Math.random() * 6) + 1;
        const usedRecipes = new Set<string>();
        const migrations: Migration[] = [];

        for (let i = 0; i < numMigrations; i++) {
            let rId: string;
            do {
                rId = recipeIds[Math.floor(Math.random() * recipeIds.length)];
            } while (usedRecipes.has(rId) && usedRecipes.size < recipeIds.length);
            usedRecipes.add(rId);

            const status = randomStatus();
            const month = months[Math.floor(Math.random() * months.length)];

            migrations.push(makeMigration({
                pluginVersion: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 20)}`,
                migrationId: rId,
                migrationName: recipeNames[rId],
                migrationDescription: `Apply ${recipeNames[rId]} recipe to ${name}`,
                migrationStatus: status,
                pullRequestUrl: status === 'success' ? `https://github.com/jenkinsci/${name}/pull/${Math.floor(Math.random() * 50) + 1}` : '',
                pullRequestStatus: status === 'success' ? randomPRStatus() : '',
                additions: Math.floor(Math.random() * 200),
                deletions: Math.floor(Math.random() * 100),
                changedFiles: Math.floor(Math.random() * 15) + 1,
                timestamp: randomTimestamp(month),
                key: `${randomTimestamp(month)}.json`,
            }));
        }

        return {
            pluginName: name,
            pluginRepository: `https://github.com/jenkinsci/${name}.git`,
            migrations,
        };
    });
}

function generateRecipes(plugins: PluginReport[]): RecipeReport[] {
    return recipeIds.map(id => {
        const recipePlugins: { pluginName: string; status: string; timestamp: string }[] = [];

        for (const p of plugins) {
            for (const m of p.migrations) {
                if (m.migrationId === id) {
                    recipePlugins.push({
                        pluginName: p.pluginName,
                        status: m.migrationStatus,
                        timestamp: m.timestamp,
                    });
                }
            }
        }

        return {
            recipeId: id,
            totalApplications: recipePlugins.length,
            successCount: recipePlugins.filter(p => p.status === 'success').length,
            failureCount: recipePlugins.filter(p => p.status === 'fail').length,
            plugins: recipePlugins,
        };
    });
}

function generateSummary(plugins: PluginReport[], recipes: RecipeReport[]): SummaryStats {
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
        totalMigrations,
        failedMigrations,
        successRate: totalMigrations > 0 ? Math.round(((totalMigrations - failedMigrations) / totalMigrations) * 10000) / 100 : 0,
        totalPRs: prUrls.size,
        openPRs,
        closedPRs,
        mergedPRs,
        totalPlugins: plugins.length,
        failuresByRecipe: recipes
            .filter(r => r.failureCount > 0)
            .sort((a, b) => b.failureCount - a.failureCount)
            .map(r => ({ recipe: r.recipeId, failures: r.failureCount })),
    };
}

let sampleData: AppData | null = null;

export function getSampleData(): AppData {
    if (sampleData) return sampleData;
    const plugins = generatePlugins();
    const recipes = generateRecipes(plugins);
    const summary = generateSummary(plugins, recipes);
    sampleData = { plugins, recipes, summary };
    return sampleData;
}
