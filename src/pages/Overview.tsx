import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Link } from 'react-router-dom';
import { loadAppData, getRecipeDisplayName, getMigrationTimeline } from '../utils/dataLoader';
import type { AppData } from '../types';

export default function Overview() {
    const [data, setData] = useState<AppData | null>(null);

    useEffect(() => {
        loadAppData().then(setData);
    }, []);

    if (!data) {
        return (
            <div className="loading-container">
                <div className="loading-spinner" />
                <div className="loading-text">Loading modernization data…</div>
            </div>
        );
    }

    const { summary, recipes } = data;
    const timeline = getMigrationTimeline(data);

    const donutOption = {
        tooltip: { trigger: 'item' as const, backgroundColor: '#1c2333', borderColor: '#30363d', textStyle: { color: '#e6edf3' } },
        legend: { show: false },
        series: [{
            type: 'pie',
            radius: ['55%', '80%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 6, borderColor: '#0c1117', borderWidth: 3 },
            label: {
                show: true, position: 'center',
                formatter: `{a|${summary.successRate}%}\n{b|Success}`,
                rich: {
                    a: { fontSize: 28, fontWeight: 800, color: '#39d353', lineHeight: 36 },
                    b: { fontSize: 13, color: '#8b949e', lineHeight: 20 }
                }
            },
            data: [
                { value: summary.totalMigrations - summary.failedMigrations, name: 'Success', itemStyle: { color: '#39d353' } },
                { value: summary.failedMigrations, name: 'Failed', itemStyle: { color: '#f85149' } },
            ]
        }]
    };

    const prOption = {
        tooltip: { trigger: 'item' as const, backgroundColor: '#1c2333', borderColor: '#30363d', textStyle: { color: '#e6edf3' } },
        legend: { bottom: 0, textStyle: { color: '#8b949e', fontSize: 11 }, itemWidth: 12, itemHeight: 12, itemGap: 16 },
        series: [{
            type: 'pie',
            radius: ['45%', '72%'],
            center: ['50%', '42%'],
            itemStyle: { borderRadius: 4, borderColor: '#0c1117', borderWidth: 2 },
            label: { show: false },
            data: [
                { value: summary.mergedPRs, name: 'Merged', itemStyle: { color: '#bc8cff' } },
                { value: summary.openPRs, name: 'Open', itemStyle: { color: '#58a6ff' } },
                { value: summary.closedPRs, name: 'Closed', itemStyle: { color: '#f0883e' } },
            ]
        }]
    };

    const recipeBarOption = {
        tooltip: {
            trigger: 'axis' as const,
            backgroundColor: '#1c2333', borderColor: '#30363d', textStyle: { color: '#e6edf3' },
            axisPointer: { type: 'shadow' as const }
        },
        grid: { left: 180, right: 30, top: 10, bottom: 20 },
        xAxis: { type: 'value' as const, splitLine: { lineStyle: { color: 'rgba(48,54,61,0.4)' } }, axisLabel: { color: '#6e7681' } },
        yAxis: {
            type: 'category' as const,
            data: recipes.slice(0, 10).map(r => getRecipeDisplayName(r.recipeId)),
            axisLabel: { color: '#8b949e', fontSize: 11 },
            axisTick: { show: false },
            axisLine: { show: false }
        },
        series: [
            {
                name: 'Success', type: 'bar', stack: 'total', barWidth: 16,
                itemStyle: { color: '#39d353', borderRadius: [0, 0, 0, 0] },
                data: recipes.slice(0, 10).map(r => r.successCount)
            },
            {
                name: 'Failed', type: 'bar', stack: 'total', barWidth: 16,
                itemStyle: { color: '#f85149', borderRadius: [0, 4, 4, 0] },
                data: recipes.slice(0, 10).map(r => r.failureCount)
            }
        ]
    };

    const timelineOption = {
        tooltip: { trigger: 'axis' as const, backgroundColor: '#1c2333', borderColor: '#30363d', textStyle: { color: '#e6edf3' } },
        grid: { left: 50, right: 20, top: 20, bottom: 30 },
        xAxis: {
            type: 'category' as const,
            data: timeline.map(t => t.date),
            axisLabel: { color: '#6e7681', fontSize: 10, rotate: 45 },
            axisLine: { lineStyle: { color: '#30363d' } }
        },
        yAxis: {
            type: 'value' as const,
            splitLine: { lineStyle: { color: 'rgba(48,54,61,0.4)' } },
            axisLabel: { color: '#6e7681' }
        },
        series: [{
            type: 'bar',
            data: timeline.map(t => t.count),
            itemStyle: {
                color: {
                    type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                    colorStops: [
                        { offset: 0, color: '#58a6ff' },
                        { offset: 1, color: '#3fb9a4' }
                    ]
                },
                borderRadius: [3, 3, 0, 0]
            },
            barMaxWidth: 20,
        }]
    };

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Ecosystem Overview</h1>
                <p className="page-description">
                    Real-time modernization status for the Jenkins plugin ecosystem — migrations, recipes, and pull requests at a glance.
                </p>
            </div>

            <div className="metrics-grid">
                <div className="metric-card blue">
                    <div className="metric-label">Total Plugins</div>
                    <div className="metric-value blue">{summary.totalPlugins}</div>
                    <div className="metric-detail">Tracked in modernizer</div>
                </div>
                <div className="metric-card green">
                    <div className="metric-label">Total Migrations</div>
                    <div className="metric-value green">{summary.totalMigrations.toLocaleString()}</div>
                    <div className="metric-detail">{summary.successRate}% success rate</div>
                </div>
                <div className="metric-card orange">
                    <div className="metric-label">Failed Migrations</div>
                    <div className="metric-value orange">{summary.failedMigrations}</div>
                    <div className="metric-detail">Across {summary.failuresByRecipe.length} recipes</div>
                </div>
                <div className="metric-card purple">
                    <div className="metric-label">Pull Requests</div>
                    <div className="metric-value purple">{summary.totalPRs}</div>
                    <div className="metric-detail">{summary.mergedPRs} merged · {summary.openPRs} open</div>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <div className="chart-card-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 2a10 10 0 0 1 0 20" /></svg>
                        Migration Success Rate
                    </div>
                    <ReactECharts option={donutOption} style={{ height: 260 }} />
                </div>

                <div className="chart-card">
                    <div className="chart-card-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10" /></svg>
                        Pull Request Status
                    </div>
                    <ReactECharts option={prOption} style={{ height: 260 }} />
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <div className="chart-card-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
                        Recipe Coverage (Top 10)
                    </div>
                    <ReactECharts option={recipeBarOption} style={{ height: 350 }} />
                </div>

                <div className="chart-card">
                    <div className="chart-card-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                        Migration Activity Timeline
                    </div>
                    <ReactECharts option={timelineOption} style={{ height: 350 }} />
                </div>
            </div>

            <div className="chart-card" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="chart-card-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                    Top Failing Recipes
                </div>
                <div className="recipe-list">
                    {summary.failuresByRecipe.slice(0, 8).map(({ recipe, failures }) => {
                        const recipeData = recipes.find(r => r.recipeId === recipe);
                        const total = recipeData?.totalApplications || failures;
                        const successPct = total > 0 ? ((total - failures) / total) * 100 : 0;
                        return (
                            <Link to={`/dashboards?recipe=${encodeURIComponent(recipe)}`} className="recipe-item" key={recipe}>
                                <span className="recipe-item-name">{getRecipeDisplayName(recipe)}</span>
                                <div className="recipe-bar">
                                    <div className="recipe-bar-fill" style={{ width: `${successPct}%` }} />
                                </div>
                                <span className="recipe-item-stats">
                                    <span style={{ color: '#f85149' }}>{failures} failed</span>
                                    <span>/ {total} total</span>
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
