import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { LayoutDashboard, FolderKanban, Users, MessageSquare, Activity, CreditCard, LogOut, Zap } from 'lucide-react';
import Logo from './Logo';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAppContext();

    const links = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Projects', path: '/projects', icon: FolderKanban },
        { name: 'Leads', path: '/leads', icon: Users },
        { name: 'Chats', path: '/chats', icon: MessageSquare },
        { name: 'Activity', path: '/activity', icon: Activity },
        { name: 'Subscription', path: '/subscription', icon: CreditCard },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="w-[260px] bg-white border-r border-gray-200 text-gray-500 h-screen flex flex-col font-sans z-50 transition-all duration-300 fixed left-0 top-0">
            {/* Logo Section */}
            <div className="h-20 flex items-center justify-center px-6 border-b border-gray-100">
                <div className="flex items-center gap-3 cursor-pointer">
                    <Logo className="h-8 w-[153px] mx-auto" />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                <div className="mb-6 px-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Main Menu</p>
                </div>
                {links.map((link) => {
                    const isActive = location.pathname === link.path;
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-gray-900 text-white shadow-xl shadow-gray-900/10'
                                : 'hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-900'}`} />
                            <span>{link.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Upgrade Pro Card */}
            <div className="px-4 pb-4 hidden">
                <div className="bg-gray-900 rounded-2xl p-4 text-center relative overflow-hidden group">
                    {/* Abstract shape */}
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-xl -mr-4 -mt-4 transition-transform group-hover:scale-110" />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mb-3 group-hover:rotate-12 transition-transform">
                            <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        </div>
                        <h4 className="text-white font-bold text-sm mb-1">Upgrade into Pro!</h4>
                        <p className="text-gray-400 text-xs mb-3">Get more features and support</p>
                        <button className="w-full py-2 bg-primary hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors">
                            Upgrade Now
                        </button>
                    </div>
                </div>
            </div>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group mb-2">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-gray-600 font-bold text-sm ring-2 ring-white shadow-sm">
                        {user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-500 bg-gray-50/50 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all w-full border border-transparent hover:border-rose-100"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
