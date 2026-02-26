import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadAppData, getPluginByName, getRecipeDisplayName } from '../utils/dataLoader';
import type { AppData, PluginReport } from '../types';

function getRecommendedSteps(plugin: PluginReport): { text: string; url?: string; severity: 'high' | 'medium' | 'low' }[] {
    const steps: { text: string; url?: string; severity: 'high' | 'medium' | 'low' }[] = [];
    const failedRecipes = new Set(
        plugin.migrations.filter(m => m.migrationStatus === 'fail').map(m => m.migrationId)
    );
    const openPRs = plugin.migrations.filter(m => m.pullRequestStatus === 'open');

    if (openPRs.length > 0) {
        steps.push({
            text: `Review and merge ${openPRs.length} open pull request${openPRs.length > 1 ? 's' : ''}`,
            url: openPRs[0].pullRequestUrl,
            severity: 'high',
        });
    }

    if (failedRecipes.has('io.jenkins.tools.pluginmodernizer.SetupJenkinsfile')) {
        steps.push({ text: 'Set up a Jenkinsfile for CI/CD', severity: 'high' });
    }
    if (failedRecipes.has('io.jenkins.tools.pluginmodernizer.UpgradeNextMajorParentVersion')) {
        steps.push({ text: 'Upgrade to the latest parent POM version', severity: 'high' });
    }
    if (failedRecipes.has('io.jenkins.tools.pluginmodernizer.MigrateToJUnit5')) {
        steps.push({ text: 'Migrate test suite from JUnit 4 to JUnit 5', severity: 'medium' });
    }
    if (failedRecipes.has('io.jenkins.tools.pluginmodernizer.MigrateCommonsLang2ToLang3AndCommonText')) {
        steps.push({ text: 'Replace deprecated Commons Lang 2 usage with Lang 3', severity: 'medium' });
    }
    if (failedRecipes.has('io.jenkins.tools.pluginmodernizer.UpgradeToRecommendCoreVersion')) {
        steps.push({ text: 'Upgrade to the recommended Jenkins core version', severity: 'medium' });
    }
    if (failedRecipes.has('io.jenkins.tools.pluginmodernizer.SetupDependabot')) {
        steps.push({ text: 'Enable Dependabot for dependency updates', severity: 'low' });
    }
    if (failedRecipes.has('io.jenkins.tools.pluginmodernizer.AddCodeOwner')) {
        steps.push({ text: 'Add a CODEOWNERS file', severity: 'low' });
    }

    if (steps.length === 0 && plugin.migrations.every(m => m.migrationStatus === 'success')) {
        steps.push({ text: 'This plugin is fully modernized — great work! 🎉', severity: 'low' });
    }

    return steps;
}

export default function PluginDetail() {
    const { pluginName } = useParams<{ pluginName: string }>();
    const [data, setData] = useState<AppData | null>(null);

    useEffect(() => { loadAppData().then(setData); }, []);

    if (!data) {
        return <div className="loading-container"><div className="loading-spinner" /><div className="loading-text">Loading…</div></div>;
    }

    const plugin: PluginReport | undefined = pluginName ? getPluginByName(data, pluginName) : undefined;

    if (!plugin) {
        return (
            <div>
                <Link to="/" className="back-link">← Back to Overview</Link>
                <div className="empty-state">
                    <h2>Plugin Not Found</h2>
                    <p>The plugin "{pluginName}" was not found in the dataset.</p>
                </div>
            </div>
        );
    }

    const successCount = plugin.migrations.filter(m => m.migrationStatus === 'success').length;
    const failCount = plugin.migrations.filter(m => m.migrationStatus === 'fail').length;
    const mergedPRs = plugin.migrations.filter(m => m.pullRequestStatus === 'merged').length;
    const openPRs = plugin.migrations.filter(m => m.pullRequestStatus === 'open').length;
    const repoUrl = plugin.pluginRepository.replace('.git', '');

    const sortedMigrations = [...plugin.migrations].sort((a, b) =>
        (b.timestamp || '').localeCompare(a.timestamp || '')
    );

    const recommendedSteps = getRecommendedSteps(plugin);

    const severityColors = { high: '#f85149', medium: '#f0883e', low: '#39d353' };
    const severityLabels = { high: 'High', medium: 'Medium', low: 'Low' };

    return (
        <>
            <Link to="/" className="back-link">← Back to Overview</Link>

            <div className="plugin-header">
                <div className="plugin-header-info">
                    <h1>{plugin.pluginName}</h1>
                    <div style={{ display: 'flex', gap: 'var(--space-md)', flexWrap: 'wrap', marginTop: 'var(--space-xs)' }}>
                        <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="repo-link">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                            </svg>
                            Repository
                        </a>
                        <a href={`${repoUrl}/issues`} target="_blank" rel="noopener noreferrer" className="repo-link" style={{ color: 'var(--accent-warning)' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            Issues
                        </a>
                        <a href={`${repoUrl}/pulls`} target="_blank" rel="noopener noreferrer" className="repo-link" style={{ color: '#bc8cff' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="18" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><path d="M13 6h3a2 2 0 0 1 2 2v7" /><line x1="6" y1="9" x2="6" y2="21" />
                            </svg>
                            Pull Requests
                        </a>
                    </div>
                    <div className="plugin-stats-row">
                        <div className="plugin-stat"><strong>{plugin.migrations.length}</strong> migrations</div>
                        <div className="plugin-stat" style={{ color: 'var(--accent-secondary)' }}><strong>{successCount}</strong> success</div>
                        <div className="plugin-stat" style={{ color: 'var(--accent-danger)' }}><strong>{failCount}</strong> failed</div>
                        <div className="plugin-stat"><strong>{mergedPRs}</strong> merged PRs</div>
                        {openPRs > 0 && <div className="plugin-stat" style={{ color: 'var(--accent-primary)' }}><strong>{openPRs}</strong> open PRs</div>}
                    </div>
                </div>
            </div>

            {/* Recommended Next Steps */}
            {recommendedSteps.length > 0 && (
                <div className="chart-card" style={{ marginBottom: 'var(--space-xl)' }}>
                    <div className="chart-card-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        Recommended Next Steps
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                        {recommendedSteps.map((step, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 'var(--space-md)',
                                padding: 'var(--space-sm) var(--space-md)',
                                background: `${severityColors[step.severity]}08`,
                                borderRadius: 'var(--border-radius-sm)',
                                borderLeft: `3px solid ${severityColors[step.severity]}`,
                            }}>
                                <span style={{
                                    fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                                    padding: '2px 8px', borderRadius: 'var(--border-radius-xl)',
                                    background: `${severityColors[step.severity]}15`,
                                    color: severityColors[step.severity],
                                    minWidth: 55, textAlign: 'center',
                                }}>
                                    {severityLabels[step.severity]}
                                </span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', flex: 1 }}>{step.text}</span>
                                {step.url && (
                                    <a href={step.url} target="_blank" rel="noopener noreferrer"
                                        style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                                        Open PR →
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: 'var(--space-lg)', color: 'var(--text-primary)' }}>
                Migration History
            </h2>

            <div className="migration-timeline">
                {sortedMigrations.map((m, i) => (
                    <div key={i} className={`migration-item ${m.migrationStatus}`}>
                        <div className="migration-item-header">
                            <span className="migration-item-title">{m.migrationName || getRecipeDisplayName(m.migrationId)}</span>
                            <span className={`status-badge ${m.migrationStatus}`}>{m.migrationStatus || 'unknown'}</span>
                        </div>
                        <div className="migration-item-description">{m.migrationDescription}</div>
                        <div className="migration-item-meta">
                            <span>📅 {m.timestamp?.replace(/T/g, ' ').substring(0, 10) || 'N/A'}</span>
                            <span>📦 v{m.pluginVersion}</span>
                            {m.pullRequestUrl && (
                                <span>
                                    <a href={m.pullRequestUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        🔗 PR
                                        <span className={`status-badge ${m.pullRequestStatus}`} style={{ fontSize: '10px', padding: '0 6px' }}>
                                            {m.pullRequestStatus}
                                        </span>
                                    </a>
                                </span>
                            )}
                            <span>+{m.additions} / -{m.deletions} ({m.changedFiles} files)</span>
                            {m.tags.length > 0 && (
                                <span>
                                    {m.tags.map(tag => (
                                        <span key={tag} style={{ background: 'rgba(88,166,255,0.1)', padding: '1px 6px', borderRadius: '4px', marginRight: '4px', fontSize: '10px' }}>{tag}</span>
                                    ))}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
