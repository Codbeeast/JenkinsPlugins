import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    // Close sidebar on route change
    const closeSidebar = () => setSidebarOpen(false);

    return (
        <>
            <header className="app-header">
                <button
                    className="hamburger-btn"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    aria-label="Toggle menu"
                >
                    {sidebarOpen ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="3" y1="6" x2="21" y2="6" />
                            <line x1="3" y1="12" x2="21" y2="12" />
                            <line x1="3" y1="18" x2="21" y2="18" />
                        </svg>
                    )}
                </button>
                <NavLink to="/" className="header-brand" onClick={closeSidebar}>
                    <svg viewBox="0 0 32 32" fill="none">
                        <rect width="32" height="32" rx="8" fill="url(#g1)" />
                        <path d="M8 16L14 10L20 16L14 22Z" fill="white" opacity="0.9" />
                        <path d="M16 12L22 18L16 24" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
                        <defs>
                            <linearGradient id="g1" x1="0" y1="0" x2="32" y2="32">
                                <stop stopColor="#58a6ff" />
                                <stop offset="1" stopColor="#3fb9a4" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <span>Plugin Modernizer Stats</span>
                </NavLink>
                <span className="header-subtitle">Jenkins Ecosystem Health Dashboard</span>
                <div className="header-right">
                    <a
                        href="https://github.com/jenkins-infra/metadata-plugin-modernizer"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="github-link"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                        </svg>
                        Data Source
                    </a>
                </div>
            </header>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={closeSidebar} />
            )}

            <div className="app-shell">
                <nav className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-section-label">Navigation</div>
                    <ul className="sidebar-nav">
                        <li>
                            <NavLink to="/" end className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                    <polyline points="9 22 9 12 15 12 15 22" />
                                </svg>
                                Overview
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/dashboards" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <rect x="3" y="3" width="7" height="7" />
                                    <rect x="14" y="3" width="7" height="7" />
                                    <rect x="3" y="14" width="7" height="7" />
                                    <rect x="14" y="14" width="7" height="7" />
                                </svg>
                                Dashboards
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/explorer" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <line x1="8" y1="6" x2="21" y2="6" />
                                    <line x1="8" y1="12" x2="21" y2="12" />
                                    <line x1="8" y1="18" x2="21" y2="18" />
                                    <line x1="3" y1="6" x2="3.01" y2="6" />
                                    <line x1="3" y1="12" x2="3.01" y2="12" />
                                    <line x1="3" y1="18" x2="3.01" y2="18" />
                                </svg>
                                Data Explorer
                            </NavLink>
                        </li>
                    </ul>
                    <div className="sidebar-section-label">Documentation</div>
                    <ul className="sidebar-nav">
                        <li>
                            <NavLink to="/methodology" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                                </svg>
                                Methodology
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/data-dictionary" className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`} onClick={closeSidebar}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                                Data Dictionary
                            </NavLink>
                        </li>
                    </ul>
                    <div className="sidebar-section-label">Resources</div>
                    <ul className="sidebar-nav">
                        <li>
                            <a href="https://github.com/jenkinsci/plugin-modernizer-tool" target="_blank" rel="noopener noreferrer" className="sidebar-nav-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                                Modernizer Tool
                            </a>
                        </li>
                        <li>
                            <a href="https://jenkins.io" target="_blank" rel="noopener noreferrer" className="sidebar-nav-item">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="2" y1="12" x2="22" y2="12" />
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                                Jenkins.io
                            </a>
                        </li>
                    </ul>
                </nav>

                <main className="app-main">
                    <Outlet />
                </main>
            </div>
        </>
    );
}

