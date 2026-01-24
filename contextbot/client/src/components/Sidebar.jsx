import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAppContext();

    const links = [
        { name: 'Dashboard', path: '/' },
        { name: 'Leads', path: '/leads' },
        { name: 'Activity', path: '/activity' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="w-64 bg-slate-900 text-white min-h-screen flex flex-col p-4">
            <h1 className="text-2xl font-bold mb-8 text-blue-500">ContextBot</h1>
            <nav className="flex flex-col gap-2">
                {links.map((link) => (
                    <Link
                        key={link.path}
                        to={link.path}
                        className={`p-3 rounded-lg transition-colors ${location.pathname === link.path
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-slate-800 text-slate-300'
                            }`}
                    >
                        {link.name}
                    </Link>
                ))}
            </nav>

            <div className="mt-auto space-y-3">
                <div className="p-4 bg-slate-800 rounded-lg">
                    <p className="text-xs text-slate-400">Logged in as</p>
                    <p className="font-semibold text-sm truncate">{user?.email || user?.name}</p>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition text-sm font-medium"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
