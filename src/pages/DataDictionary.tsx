export default function DataDictionary() {
    const sections = [
        {
            title: 'Migration Fields',
            description: 'Each migration represents one application of a recipe to a plugin.',
            fields: [
                { name: 'migrationId', type: 'string', description: 'Unique identifier for the migration recipe (fully qualified Java class name)', example: 'io.jenkins.tools.pluginmodernizer.MigrateToJUnit5' },
                { name: 'migrationName', type: 'string', description: 'Human-readable name of the migration recipe', example: 'Migrate To JUnit 5' },
                { name: 'migrationDescription', type: 'string', description: 'Detailed description of what the migration does', example: 'Migrates JUnit 4 tests to JUnit 5...' },
                { name: 'migrationStatus', type: 'enum', description: 'Result of the migration: "success", "fail", or empty string', example: 'success' },
                { name: 'pluginVersion', type: 'string', description: 'Current version of the plugin when migration was applied', example: '1.33.1' },
                { name: 'jenkinsBaseline', type: 'string', description: 'Current Jenkins core baseline the plugin targets', example: '2.401.3' },
                { name: 'targetBaseline', type: 'string', description: 'Target Jenkins baseline after migration', example: '2.440.3' },
                { name: 'effectiveBaseline', type: 'string', description: 'Actual effective baseline achieved', example: '2.440.3' },
                { name: 'jenkinsVersion', type: 'string', description: 'Jenkins version used during migration testing', example: '2.440.3' },
                { name: 'pullRequestUrl', type: 'string', description: 'URL of the GitHub pull request created by the migration', example: 'https://github.com/jenkinsci/credentials-plugin/pull/582' },
                { name: 'pullRequestStatus', type: 'enum', description: 'Current state of the PR: "open", "closed", "merged", or empty', example: 'merged' },
                { name: 'dryRun', type: 'boolean', description: 'Whether this was a dry run (no actual changes committed)', example: 'false' },
                { name: 'additions', type: 'number', description: 'Number of lines added in the PR', example: '42' },
                { name: 'deletions', type: 'number', description: 'Number of lines removed in the PR', example: '38' },
                { name: 'changedFiles', type: 'number', description: 'Number of files changed in the PR', example: '5' },
                { name: 'tags', type: 'string[]', description: 'Labels or categories associated with the migration', example: '["openrewrite", "testing"]' },
                { name: 'timestamp', type: 'string', description: 'ISO-like timestamp when the migration was executed', example: '2026-01-15T14-36-20' },
                { name: 'key', type: 'string', description: 'Unique key identifying this specific migration run', example: 'credentials/MigrateToJUnit5' },
                { name: 'defaultBranch', type: 'string', description: 'Default branch of the plugin repository', example: 'main' },
                { name: 'checkRunsSummary', type: 'string', description: 'Summary of CI check runs on the PR', example: 'All checks passed' },
            ]
        },
        {
            title: 'Plugin Report Fields',
            description: 'Each plugin report aggregates all migrations for a single Jenkins plugin.',
            fields: [
                { name: 'pluginName', type: 'string', description: 'Name of the Jenkins plugin (directory name in the repo)', example: 'credentials' },
                { name: 'pluginRepository', type: 'string', description: 'GitHub repository URL of the plugin', example: 'https://github.com/jenkinsci/credentials-plugin.git' },
                { name: 'migrations', type: 'Migration[]', description: 'Array of all migration records for this plugin', example: '[{...}, {...}]' },
            ]
        },
        {
            title: 'Recipe Report Fields',
            description: 'Each recipe report summarizes one modernization recipe\'s application across all plugins.',
            fields: [
                { name: 'recipeId', type: 'string', description: 'Fully qualified name of the recipe', example: 'io.jenkins.tools.pluginmodernizer.MigrateToJUnit5' },
                { name: 'totalApplications', type: 'number', description: 'Total number of times this recipe was applied', example: '112' },
                { name: 'successCount', type: 'number', description: 'Number of successful applications', example: '96' },
                { name: 'failureCount', type: 'number', description: 'Number of failed applications', example: '16' },
                { name: 'plugins', type: 'RecipePlugin[]', description: 'List of plugins with status and timestamp for this recipe', example: '[{pluginName, status, timestamp}]' },
            ]
        },
        {
            title: 'Summary Statistics Fields',
            description: 'Global statistics aggregated from all plugins and recipes.',
            fields: [
                { name: 'totalMigrations', type: 'number', description: 'Total number of migration attempts across all plugins', example: '1235' },
                { name: 'failedMigrations', type: 'number', description: 'Total number of failed migration attempts', example: '587' },
                { name: 'successRate', type: 'number', description: 'Percentage of successful migrations', example: '52.47' },
                { name: 'totalPRs', type: 'number', description: 'Total number of unique pull requests created', example: '532' },
                { name: 'openPRs', type: 'number', description: 'Number of currently open pull requests', example: '84' },
                { name: 'closedPRs', type: 'number', description: 'Number of closed (not merged) pull requests', example: '26' },
                { name: 'mergedPRs', type: 'number', description: 'Number of successfully merged pull requests', example: '422' },
                { name: 'totalPlugins', type: 'number', description: 'Total number of plugins with migration data', example: '426' },
                { name: 'failuresByRecipe', type: 'object[]', description: 'Breakdown of failures per recipe, sorted by count', example: '[{recipe: "...", failures: 522}]' },
            ]
        }
    ];

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Data Dictionary</h1>
                <p className="page-description">
                    Complete reference of all fields in the plugin modernizer dataset.
                    Data is sourced from <a href="https://github.com/jenkins-infra/metadata-plugin-modernizer" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600 }}>jenkins-infra/metadata-plugin-modernizer</a>.
                </p>
            </div>

            {sections.map(section => (
                <div className="chart-card" key={section.title} style={{ marginBottom: 'var(--space-xl)' }}>
                    <div className="chart-card-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="16" y1="13" x2="8" y2="13" />
                            <line x1="16" y1="17" x2="8" y2="17" />
                        </svg>
                        {section.title}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-md)' }}>
                        {section.description}
                    </p>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th style={{ width: 200 }}>Field</th>
                                    <th style={{ width: 100 }}>Type</th>
                                    <th>Description</th>
                                    <th style={{ width: 200 }}>Example</th>
                                </tr>
                            </thead>
                            <tbody>
                                {section.fields.map(field => (
                                    <tr key={field.name}>
                                        <td>
                                            <code style={{
                                                background: 'rgba(88,166,255,0.1)',
                                                color: '#58a6ff',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                fontSize: 'var(--font-size-xs)',
                                                fontWeight: 600,
                                            }}>
                                                {field.name}
                                            </code>
                                        </td>
                                        <td>
                                            <span style={{
                                                background: 'rgba(63,185,164,0.1)',
                                                color: '#3fb9a4',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                            }}>
                                                {field.type}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>{field.description}</td>
                                        <td>
                                            <code style={{
                                                background: 'rgba(255,255,255,0.05)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontSize: '11px',
                                                color: 'var(--text-muted)',
                                                wordBreak: 'break-all',
                                            }}>
                                                {field.example}
                                            </code>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </>
    );
}
