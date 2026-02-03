import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAppContext();

    const links = [
        {
            name: 'Dashboard', path: '/', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            )
        },
        {
            name: 'Projects', path: '/projects', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            )
        },
        {
            name: 'Leads', path: '/leads', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        },
        {
            name: 'Chats', path: '/chats', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            )
        },
        {
            name: 'Activity', path: '/activity', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            )
        },
        {
            name: 'Subscription', path: '/subscription', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            )
        },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-[280px] bg-[#0B1120] border-r border-[#1e293b] text-slate-300 min-h-screen flex flex-col font-sans relative z-50">
            {/* Gradient Blur Effect for visual depth */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />

            {/* Logo Section */}
            <div className="h-24 flex items-center px-8">
                <div className="flex items-center gap-3.5 group cursor-pointer">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-600 rounded-xl blur-[6px] opacity-20 group-hover:opacity-40 transition-opacity duration-300"></div>
                        <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-500/20">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                    </div>
                    <div>
                        <span className="block text-xl font-bold text-white tracking-tight leading-none">ContextBot</span>
                        <span className="block text-[10px] font-medium text-blue-500/80 uppercase tracking-wider mt-1">Workspace</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-2 space-y-8 overflow-y-auto">
                <div>
                    <h3 className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-[0.15em] mb-4">Main Menu</h3>
                    <div className="space-y-2">
                        {links.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`relative group flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-300 ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/10'
                                        : 'text-slate-400 hover:text-white hover:bg-[#1e293b]/60'
                                        }`}
                                >
                                    {/* Active Indicator Glow */}
                                    {isActive && (
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                                    )}

                                    <span className={`relative transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`}>
                                        {link.icon}
                                    </span>
                                    <span className="relative">{link.name}</span>

                                    {/* Chevron for hover effect */}
                                    {!isActive && (
                                        <svg className="w-4 h-4 ml-auto text-slate-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* Footer / User Profile */}
            <div className="p-4 border-t border-[#1e293b]/60">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1e293b]/40 border border-[#1e293b] hover:border-slate-600/50 hover:bg-[#1e293b] transition-all duration-300 group">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-sm ring-2 ring-[#0B1120]">
                        {user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-slate-400 truncate group-hover:text-slate-300 transition-colors">{user?.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Sign Out"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
