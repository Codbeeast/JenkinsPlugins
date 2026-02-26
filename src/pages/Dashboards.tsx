import { useState, useEffect, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Link, useSearchParams } from 'react-router-dom';
import { loadAppData, getRecipeDisplayName } from '../utils/dataLoader';
import type { AppData, MigrationStatusFilter, RecipeReport } from '../types';

/** Map every recipe to a modernization topic */
const TOPIC_MAP: Record<string, string> = {
    // Parent POM
    'io.jenkins.tools.pluginmodernizer.UpgradeNextMajorParentVersion': 'parent-pom',
    'io.jenkins.tools.pluginmodernizer.SetupJenkinsfile': 'parent-pom',
    'io.jenkins.tools.pluginmodernizer.AddCodeOwner': 'parent-pom',
    'io.jenkins.tools.pluginmodernizer.SetupDependabot': 'parent-pom',
    'io.jenkins.tools.pluginmodernizer.AutoMergeWorkflows': 'parent-pom',
    // BOM
    'io.jenkins.tools.pluginmodernizer.UpgradeToRecommendCoreVersion': 'bom',
    'io.jenkins.tools.pluginmodernizer.UpgradeToLatestJava11CoreVersion': 'bom',
    // Test Frameworks
    'io.jenkins.tools.pluginmodernizer.MigrateToJUnit5': 'test-frameworks',
    'io.jenkins.tools.pluginmodernizer.MigrateToJava25': 'test-frameworks',
    'io.jenkins.tools.pluginmodernizer.RemoveOldJavaVersionForModernJenkins': 'test-frameworks',
    // Deprecated APIs
    'io.jenkins.tools.pluginmodernizer.MigrateCommonsLang2ToLang3AndCommonText': 'deprecated-apis',
    'io.jenkins.tools.pluginmodernizer.FixJellyIssues': 'deprecated-apis',
    'io.jenkins.tools.pluginmodernizer.ReplaceLibrariesWithApiPlugin': 'deprecated-apis',
};

interface TopicDef {
    id: string;
    label: string;
    icon: string;
    description: string;
    color: string;
}

const TOPICS: TopicDef[] = [
    { id: 'all', label: 'All Recipes', icon: '📊', description: 'All modernization recipes across the ecosystem', color: '#58a6ff' },
    { id: 'parent-pom', label: 'Parent POM', icon: '📦', description: 'Parent POM upgrades, Jenkinsfile setup, code ownership, and dependency management', color: '#bc8cff' },
    { id: 'bom', label: 'BOM', icon: '📋', description: 'Bill of Materials and core version upgrades', color: '#3fb9a4' },
    { id: 'test-frameworks', label: 'Test Frameworks', icon: '🧪', description: 'JUnit 5 migration, Java version upgrades, and test modernization', color: '#f0883e' },
    { id: 'deprecated-apis', label: 'Deprecated APIs', icon: '⚠️', description: 'Replacing deprecated libraries: Commons Lang, Jelly fixes, API plugin migrations', color: '#f85149' },
];

function getTopicForRecipe(recipeId: string): string {
    return TOPIC_MAP[recipeId] || 'other';
}

export default function Dashboards() {
    const [data, setData] = useState<AppData | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<MigrationStatusFilter>('all');

    const activeTopic = searchParams.get('topic') || 'all';
    const selectedRecipe = searchParams.get('recipe') || '';

    useEffect(() => { loadAppData().then(setData); }, []);

    const allRecipes = useMemo(() => {
        if (!data) return [];
        return [...data.recipes].sort((a, b) => b.totalApplications - a.totalApplications);
    }, [data]);

    const filteredRecipes = useMemo(() => {
        if (activeTopic === 'all') return allRecipes;
        return allRecipes.filter(r => getTopicForRecipe(r.recipeId) === activeTopic);
    }, [allRecipes, activeTopic]);

    const activeRecipe = useMemo(() => {
        if (selectedRecipe) {
            const found = filteredRecipes.find(r => r.recipeId === selectedRecipe);
            if (found) return found;
        }
        return filteredRecipes[0] || null;
    }, [filteredRecipes, selectedRecipe]);

    const filteredPlugins = useMemo(() => {
        if (!activeRecipe) return [];
        let plugins = activeRecipe.plugins;
        if (search) {
            const q = search.toLowerCase();
            plugins = plugins.filter(p => p.pluginName.toLowerCase().includes(q));
        }
        if (statusFilter !== 'all') {
            plugins = plugins.filter(p => p.status === statusFilter);
        }
        return plugins;
    }, [activeRecipe, search, statusFilter]);

    // Topic-level aggregated stats
    const topicStats = useMemo(() => {
        const total = filteredRecipes.reduce((s, r) => s + r.totalApplications, 0);
        const success = filteredRecipes.reduce((s, r) => s + r.successCount, 0);
        const fail = filteredRecipes.reduce((s, r) => s + r.failureCount, 0);
        const rate = total > 0 ? ((success / total) * 100).toFixed(1) : '0';
        const uniquePlugins = new Set(filteredRecipes.flatMap(r => r.plugins.map(p => p.pluginName))).size;
        return { total, success, fail, rate, uniquePlugins, recipeCount: filteredRecipes.length };
    }, [filteredRecipes]);

    if (!data) {
        return <div className="loading-container"><div className="loading-spinner" /><div className="loading-text">Loading…</div></div>;
    }

    const currentTopicDef = TOPICS.find(t => t.id === activeTopic) || TOPICS[0];

    const isMobile = window.innerWidth < 768;

    const comparisonOption = {
        tooltip: { trigger: 'axis' as const, backgroundColor: '#1c2333', borderColor: '#30363d', textStyle: { color: '#e6edf3' }, axisPointer: { type: 'shadow' as const } },
        grid: { left: isMobile ? 100 : 200, right: isMobile ? 15 : 40, top: 10, bottom: 20 },
        xAxis: {
            type: 'value' as const,
            splitLine: { lineStyle: { color: 'rgba(48,54,61,0.4)' } },
            axisLabel: { color: '#6e7681', fontSize: isMobile ? 10 : 12 }
        },
        yAxis: {
            type: 'category' as const,
            data: filteredRecipes.map(r => {
                const name = getRecipeDisplayName(r.recipeId);
                return isMobile && name.length > 12 ? name.slice(0, 12) + '…' : name;
            }),
            axisLabel: { color: '#8b949e', fontSize: isMobile ? 10 : 11, width: isMobile ? 90 : 180, overflow: 'truncate' as const },
            axisTick: { show: false }, axisLine: { show: false }
        },
        series: [
            { name: 'Success', type: 'bar', stack: 'total', barWidth: isMobile ? 10 : 14, itemStyle: { color: '#39d353' }, data: filteredRecipes.map(r => r.successCount) },
            { name: 'Failed', type: 'bar', stack: 'total', barWidth: isMobile ? 10 : 14, itemStyle: { color: '#f85149', borderRadius: [0, 3, 3, 0] }, data: filteredRecipes.map(r => r.failureCount) }
        ]
    };

    function selectTopic(topicId: string) {
        const params: Record<string, string> = { topic: topicId };
        setSearchParams(params);
        setSearch('');
        setStatusFilter('all');
    }

    function selectRecipe(recipe: RecipeReport) {
        setSearchParams({ topic: activeTopic, recipe: recipe.recipeId });
    }

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Modernization Dashboards</h1>
                <p className="page-description">Filter by modernization topic to explore parent POM, BOM, test framework, and deprecated API migrations.</p>
            </div>

            {/* Topic Tabs */}
            <div style={{
                display: 'flex', gap: 'var(--space-xs)', marginBottom: 'var(--space-lg)',
                overflowX: 'auto', padding: '2px 0',
            }}>
                {TOPICS.map(topic => (
                    <button
                        key={topic.id}
                        onClick={() => selectTopic(topic.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '8px 16px', borderRadius: 'var(--border-radius-md)',
                            border: activeTopic === topic.id ? `2px solid ${topic.color}` : '2px solid transparent',
                            background: activeTopic === topic.id ? `${topic.color}15` : 'var(--bg-secondary)',
                            color: activeTopic === topic.id ? topic.color : 'var(--text-secondary)',
                            fontWeight: activeTopic === topic.id ? 700 : 500,
                            fontSize: 'var(--font-size-sm)',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all var(--transition-fast)',
                        }}
                    >
                        <span>{topic.icon}</span>
                        {topic.label}
                    </button>
                ))}
            </div>

            {/* Topic Summary */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 'var(--space-md)',
                marginBottom: 'var(--space-lg)',
            }}>
                <div className="metric-card" style={{ padding: 'var(--space-md)' }}>
                    <div className="metric-label" style={{ fontSize: '11px' }}>Recipes</div>
                    <div className="metric-value" style={{ fontSize: '24px', color: currentTopicDef.color }}>{topicStats.recipeCount}</div>
                </div>
                <div className="metric-card" style={{ padding: 'var(--space-md)' }}>
                    <div className="metric-label" style={{ fontSize: '11px' }}>Plugins Affected</div>
                    <div className="metric-value" style={{ fontSize: '24px', color: currentTopicDef.color }}>{topicStats.uniquePlugins}</div>
                </div>
                <div className="metric-card" style={{ padding: 'var(--space-md)' }}>
                    <div className="metric-label" style={{ fontSize: '11px' }}>Total Migrations</div>
                    <div className="metric-value" style={{ fontSize: '24px', color: currentTopicDef.color }}>{topicStats.total}</div>
                </div>
                <div className="metric-card" style={{ padding: 'var(--space-md)' }}>
                    <div className="metric-label" style={{ fontSize: '11px' }}>Success Rate</div>
                    <div className="metric-value" style={{ fontSize: '24px', color: parseFloat(topicStats.rate) >= 70 ? '#39d353' : parseFloat(topicStats.rate) >= 40 ? '#f0883e' : '#f85149' }}>{topicStats.rate}%</div>
                </div>
            </div>

            {/* Topic Description */}
            <div style={{
                padding: 'var(--space-md) var(--space-lg)',
                marginBottom: 'var(--space-lg)',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--border-radius-md)',
                borderLeft: `3px solid ${currentTopicDef.color}`,
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-sm)',
            }}>
                <strong style={{ color: 'var(--text-primary)' }}>{currentTopicDef.icon} {currentTopicDef.label}</strong>
                <span style={{ margin: '0 8px' }}>—</span>
                {currentTopicDef.description}
            </div>

            {/* Recipe Comparison Chart */}
            {filteredRecipes.length > 0 && (
                <div className="chart-card" style={{ marginBottom: 'var(--space-xl)' }}>
                    <div className="chart-card-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
                        {currentTopicDef.label} — Recipe Comparison
                    </div>
                    <ReactECharts option={comparisonOption} style={{ height: Math.max(200, filteredRecipes.length * 32) }} />
                </div>
            )}

            {/* Recipe Selector + Plugin Table */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '280px 1fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
                {/* Recipe Selector */}
                <div className="chart-card" style={{ maxHeight: 500, overflowY: 'auto' }}>
                    <div className="chart-card-title" style={{ fontSize: 'var(--font-size-sm)' }}>Select Recipe</div>
                    <div className="recipe-list">
                        {filteredRecipes.length === 0 ? (
                            <div style={{ padding: 'var(--space-lg)', color: 'var(--text-muted)', textAlign: 'center', fontSize: 'var(--font-size-sm)' }}>
                                No recipes in this topic
                            </div>
                        ) : filteredRecipes.map(r => (
                            <div
                                key={r.recipeId}
                                className={`recipe-item ${activeRecipe?.recipeId === r.recipeId ? 'active' : ''}`}
                                style={activeRecipe?.recipeId === r.recipeId ? { borderColor: currentTopicDef.color, background: `${currentTopicDef.color}10` } : {}}
                                onClick={() => selectRecipe(r)}
                            >
                                <span className="recipe-item-name">{getRecipeDisplayName(r.recipeId)}</span>
                                <div style={{ display: 'flex', gap: '6px', fontSize: 'var(--font-size-xs)' }}>
                                    <span style={{ color: '#39d353' }}>{r.successCount}✓</span>
                                    {r.failureCount > 0 && <span style={{ color: '#f85149' }}>{r.failureCount}✕</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Plugin Table */}
                <div className="data-table-wrapper">
                    <div className="data-table-toolbar">
                        <div className="search-input">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                            <input type="text" placeholder="Search plugins…" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <div className="filter-chips">
                            {(['all', 'success', 'fail'] as MigrationStatusFilter[]).map(f => (
                                <button key={f} className={`filter-chip ${statusFilter === f ? 'active' : ''}`} onClick={() => setStatusFilter(f)}>
                                    {f === 'all' ? 'All' : f === 'success' ? '✓ Success' : '✕ Failed'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {activeRecipe ? (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Plugin</th>
                                    <th>Status</th>
                                    <th>Timestamp</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPlugins.length === 0 ? (
                                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>No plugins match the current filters</td></tr>
                                ) : filteredPlugins.map((p, i) => (
                                    <tr key={`${p.pluginName}-${i}`}>
                                        <td><Link to={`/plugin/${p.pluginName}`} style={{ fontWeight: 500 }}>{p.pluginName}</Link></td>
                                        <td><span className={`status-badge ${p.status}`}>{p.status || 'unknown'}</span></td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>{p.timestamp?.substring(0, 10) || 'N/A'}</td>
                                        <td><Link to={`/plugin/${p.pluginName}`} style={{ fontSize: 'var(--font-size-xs)' }}>View Details →</Link></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>Select a recipe to view plugins</div>
                    )}

                    <div className="table-pagination">
                        <span>{filteredPlugins.length} plugin{filteredPlugins.length !== 1 ? 's' : ''} shown</span>
                    </div>
                </div>
            </div>
        </>
    );
}
