import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { loadAppData, getRecipeDisplayName, exportToCSV, exportToJSON } from '../utils/dataLoader';
import type { AppData, MigrationStatusFilter, PRStatusFilter } from '../types';

interface FlatRow {
    pluginName: string;
    migrationCount: number;
    successCount: number;
    failCount: number;
    latestMigration: string;
    prsMerged: number;
    prsOpen: number;
    latestRecipe: string;
}

type SortKey = keyof FlatRow;

const PAGE_SIZE = 20;

export default function DataExplorer() {
    const [data, setData] = useState<AppData | null>(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<MigrationStatusFilter>('all');
    const [prFilter, setPrFilter] = useState<PRStatusFilter>('all');
    const [sortKey, setSortKey] = useState<SortKey>('pluginName');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [page, setPage] = useState(0);

    useEffect(() => { loadAppData().then(setData); }, []);

    const rows: FlatRow[] = useMemo(() => {
        if (!data) return [];
        return data.plugins.map(p => {
            const successCount = p.migrations.filter(m => m.migrationStatus === 'success').length;
            const failCount = p.migrations.filter(m => m.migrationStatus === 'fail').length;
            const prsMerged = p.migrations.filter(m => m.pullRequestStatus === 'merged').length;
            const prsOpen = p.migrations.filter(m => m.pullRequestStatus === 'open').length;
            const sorted = [...p.migrations].sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
            return {
                pluginName: p.pluginName,
                migrationCount: p.migrations.length,
                successCount,
                failCount,
                latestMigration: sorted[0]?.timestamp?.substring(0, 10) || '',
                prsMerged,
                prsOpen,
                latestRecipe: sorted[0] ? getRecipeDisplayName(sorted[0].migrationId) : '',
            };
        });
    }, [data]);

    const filtered = useMemo(() => {
        let result = rows;
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(r => r.pluginName.toLowerCase().includes(q) || r.latestRecipe.toLowerCase().includes(q));
        }
        if (statusFilter === 'success') result = result.filter(r => r.failCount === 0);
        if (statusFilter === 'fail') result = result.filter(r => r.failCount > 0);
        if (prFilter === 'open') result = result.filter(r => r.prsOpen > 0);
        if (prFilter === 'merged') result = result.filter(r => r.prsMerged > 0);

        result.sort((a, b) => {
            const av = a[sortKey];
            const bv = b[sortKey];
            const cmp = typeof av === 'string' ? av.localeCompare(bv as string) : (av as number) - (bv as number);
            return sortDir === 'asc' ? cmp : -cmp;
        });
        return result;
    }, [rows, search, statusFilter, prFilter, sortKey, sortDir]);

    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    const handleSort = useCallback((key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
        setPage(0);
    }, [sortKey]);

    const handleExportCSV = useCallback(() => {
        exportToCSV(filtered as unknown as Record<string, unknown>[], 'plugin-modernizer-data.csv');
    }, [filtered]);

    const handleExportJSON = useCallback(() => {
        exportToJSON(filtered, 'plugin-modernizer-data.json');
    }, [filtered]);

    if (!data) {
        return <div className="loading-container"><div className="loading-spinner" /><div className="loading-text">Loading…</div></div>;
    }

    const sortIcon = (key: SortKey) => (
        <span className="sort-icon">{sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
    );

    return (
        <>
            <div className="page-header">
                <h1 className="page-title">Data Explorer</h1>
                <p className="page-description">Browse, search, sort, and export the complete modernization dataset.</p>
            </div>

            <div className="data-table-wrapper">
                <div className="data-table-toolbar">
                    <div className="search-input">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                        <input type="text" placeholder="Search by plugin name or recipe…" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
                    </div>
                    <div className="filter-chips">
                        {(['all', 'success', 'fail'] as MigrationStatusFilter[]).map(f => (
                            <button key={f} className={`filter-chip ${statusFilter === f ? 'active' : ''}`} onClick={() => { setStatusFilter(f); setPage(0); }}>
                                {f === 'all' ? 'All Status' : f === 'success' ? '✓ All Pass' : '✕ Has Failures'}
                            </button>
                        ))}
                        {(['all', 'open', 'merged'] as PRStatusFilter[]).map(f => (
                            <button key={f} className={`filter-chip ${prFilter === f ? 'active' : ''}`} onClick={() => { setPrFilter(f); setPage(0); }}>
                                {f === 'all' ? 'All PRs' : f === 'open' ? '⬤ Open PRs' : '◉ Merged PRs'}
                            </button>
                        ))}
                    </div>
                    <div className="export-buttons">
                        <button className="export-btn" onClick={handleExportCSV}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                            CSV
                        </button>
                        <button className="export-btn" onClick={handleExportJSON}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                            JSON
                        </button>
                    </div>
                </div>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th className={sortKey === 'pluginName' ? 'sorted' : ''} onClick={() => handleSort('pluginName')}>Plugin {sortIcon('pluginName')}</th>
                            <th className={sortKey === 'migrationCount' ? 'sorted' : ''} onClick={() => handleSort('migrationCount')}>Migrations {sortIcon('migrationCount')}</th>
                            <th className={sortKey === 'successCount' ? 'sorted' : ''} onClick={() => handleSort('successCount')}>Success {sortIcon('successCount')}</th>
                            <th className={sortKey === 'failCount' ? 'sorted' : ''} onClick={() => handleSort('failCount')}>Failed {sortIcon('failCount')}</th>
                            <th className={sortKey === 'prsMerged' ? 'sorted' : ''} onClick={() => handleSort('prsMerged')}>Merged PRs {sortIcon('prsMerged')}</th>
                            <th className={sortKey === 'latestRecipe' ? 'sorted' : ''} onClick={() => handleSort('latestRecipe')}>Latest Recipe {sortIcon('latestRecipe')}</th>
                            <th className={sortKey === 'latestMigration' ? 'sorted' : ''} onClick={() => handleSort('latestMigration')}>Last Active {sortIcon('latestMigration')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageRows.map(r => (
                            <tr key={r.pluginName}>
                                <td><Link to={`/plugin/${r.pluginName}`} style={{ fontWeight: 600 }}>{r.pluginName}</Link></td>
                                <td>{r.migrationCount}</td>
                                <td><span style={{ color: 'var(--accent-secondary)' }}>{r.successCount}</span></td>
                                <td>{r.failCount > 0 ? <span style={{ color: 'var(--accent-danger)', fontWeight: 600 }}>{r.failCount}</span> : <span style={{ color: 'var(--text-muted)' }}>0</span>}</td>
                                <td>{r.prsMerged > 0 ? <span style={{ color: 'var(--accent-purple)' }}>{r.prsMerged}</span> : <span style={{ color: 'var(--text-muted)' }}>0</span>}</td>
                                <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 'var(--font-size-xs)' }}>{r.latestRecipe}</td>
                                <td style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>{r.latestMigration}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="table-pagination">
                    <span>Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of {filtered.length} plugins</span>
                    <div className="pagination-buttons">
                        <button className="pagination-btn" disabled={page === 0} onClick={() => setPage(0)}>First</button>
                        <button className="pagination-btn" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pg = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                            if (pg >= totalPages) return null;
                            return (
                                <button key={pg} className={`pagination-btn ${pg === page ? 'active' : ''}`} onClick={() => setPage(pg)}>
                                    {pg + 1}
                                </button>
                            );
                        })}
                        <button className="pagination-btn" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
                        <button className="pagination-btn" disabled={page >= totalPages - 1} onClick={() => setPage(totalPages - 1)}>Last</button>
                    </div>
                </div>
            </div>
        </>
    );
}
