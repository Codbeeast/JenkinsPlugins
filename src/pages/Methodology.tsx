import { Link } from 'react-router-dom';

export default function Methodology() {
    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Methodology</h1>
                <p className="page-description">How this data is collected, processed, and presented.</p>
            </div>

            <div className="chart-card" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="chart-card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                    Data Source
                </div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--font-size-sm)' }}>
                    <p>
                        All data is sourced from the <a href="https://github.com/jenkins-infra/metadata-plugin-modernizer" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600 }}>jenkins-infra/metadata-plugin-modernizer</a> GitHub repository,
                        which is maintained by the Jenkins Infrastructure team. This repository contains the outputs of the{' '}
                        <a href="https://github.com/jenkinsci/plugin-modernizer-tool" target="_blank" rel="noopener noreferrer" style={{ fontWeight: 600 }}>Plugin Modernizer Tool</a>,
                        which automates common Jenkins plugin maintenance tasks.
                    </p>
                </div>
            </div>

            <div className="chart-card" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="chart-card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
                    Data Pipeline
                </div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--font-size-sm)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
                        {[
                            { step: '1', title: 'Plugin Modernizer Tool Runs', desc: 'The tool applies OpenRewrite recipes to Jenkins plugins, generating migration reports and opening pull requests.' },
                            { step: '2', title: 'Results Stored on GitHub', desc: 'Each plugin directory (e.g., credentials/) contains reports/aggregated_migrations.json with its full migration history. Summary statistics are stored in reports/summary.md.' },
                            { step: '3', title: 'Build-Time Data Fetch', desc: 'During the site build, a script fetches all plugin data, recipe reports, and the summary from the GitHub API. This data is saved as JSON bundles in public/data/.' },
                            { step: '4', title: 'Static Site Generation', desc: 'The React application consumes the pre-built JSON data and renders the dashboards, plugin reports, and data explorer as a fully static site.' },
                        ].map(s => (
                            <div key={s.step} style={{ display: 'flex', gap: 'var(--space-md)' }}>
                                <div style={{
                                    minWidth: 32, height: 32, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #58a6ff, #3fb9a4)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 800, fontSize: 'var(--font-size-sm)', color: '#fff',
                                }}>
                                    {s.step}
                                </div>
                                <div>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{s.title}</div>
                                    <div>{s.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="chart-card" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="chart-card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    Status Definitions
                </div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--font-size-sm)' }}>
                    <table className="data-table" style={{ marginTop: 'var(--space-md)' }}>
                        <thead>
                            <tr>
                                <th style={{ width: 160 }}>Status</th>
                                <th>Meaning</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><span className="status-badge success">success</span></td>
                                <td>The migration recipe was applied successfully. The code changes passed validation checks.</td>
                            </tr>
                            <tr>
                                <td><span className="status-badge fail">fail</span></td>
                                <td>The recipe could not be applied or the result failed validation. May require manual intervention.</td>
                            </tr>
                            <tr>
                                <td><span className="status-badge" style={{ background: 'rgba(139,148,158,0.15)', color: '#8b949e' }}>empty</span></td>
                                <td>No status was recorded for this migration. Typically occurs for in-progress or skipped migrations.</td>
                            </tr>
                        </tbody>
                    </table>

                    <h3 style={{ marginTop: 'var(--space-xl)', color: 'var(--text-primary)', fontWeight: 600, fontSize: 'var(--font-size-md)' }}>Pull Request Lifecycle</h3>
                    <table className="data-table" style={{ marginTop: 'var(--space-md)' }}>
                        <thead>
                            <tr>
                                <th style={{ width: 160 }}>PR Status</th>
                                <th>Meaning</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><span className="status-badge" style={{ background: 'rgba(88,166,255,0.15)', color: '#58a6ff' }}>open</span></td>
                                <td>A PR has been created and is awaiting review or merge by a plugin maintainer.</td>
                            </tr>
                            <tr>
                                <td><span className="status-badge merged">merged</span></td>
                                <td>The PR was approved and merged into the plugin's main branch.</td>
                            </tr>
                            <tr>
                                <td><span className="status-badge" style={{ background: 'rgba(240,136,62,0.15)', color: '#f0883e' }}>closed</span></td>
                                <td>The PR was closed without merging, typically due to issues or superseded changes.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="chart-card" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="chart-card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                    Recipe Topics
                </div>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: 'var(--font-size-sm)' }}>
                    <p>Recipes are grouped into modernization topics on the <Link to="/dashboards" style={{ fontWeight: 600 }}>Dashboards</Link> page:</p>
                    <ul style={{ marginTop: 'var(--space-md)', paddingLeft: 'var(--space-lg)' }}>
                        <li><strong>Parent POM</strong> — Upgrading the parent POM version, setting up Jenkinsfile, Code Owners, Dependabot, and auto-merge workflows.</li>
                        <li><strong>BOM (Bill of Materials)</strong> — Upgrading to recommended core versions and ensuring BOM compatibility.</li>
                        <li><strong>Test Frameworks</strong> — Migrating to JUnit 5, upgrading Java versions, and removing outdated Java requirements.</li>
                        <li><strong>Deprecated APIs</strong> — Replacing Commons Lang 2, fixing Jelly issues, and migrating library usages to API plugins.</li>
                    </ul>
                </div>
            </div>
        </>
    );
}
