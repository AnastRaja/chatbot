import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';

const StatCard = ({ title, value, color, icon, trend }) => (
    <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100/50 hover:shadow-md transition duration-200">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
                    {trend && <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{trend}</span>}
                </div>
            </div>
            <div className={`p-3 rounded-lg ${color} bg-opacity-10 text-xl`}>
                {icon}
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const navigate = useNavigate();
    const { profiles } = useAppContext();
    const [stats, setStats] = useState({ profiles: 0, leads: 0, active_chats: 0 });
    const profilesArray = Object.values(profiles || {});

    useEffect(() => {
        const getStats = async () => {
            try {
                const res = await axios.get('/api/stats');
                setStats(res.data);
            } catch (e) {
                console.error(e);
            }
        };
        getStats();
        const interval = setInterval(getStats, 5000);
        return () => clearInterval(interval);
    }, []);

    // Empty State
    if (profilesArray.length === 0) {
        return (
            <div className="p-8 h-full flex flex-col items-center justify-center bg-slate-50/50">
                <div className="text-center max-w-2xl animate-fade-in">
                    <div className="w-20 h-20 bg-blue-100/50 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-4 tracking-tight">Welcome to ContextBot</h1>
                    <p className="text-lg text-slate-500 mb-10 leading-relaxed max-w-lg mx-auto">
                        Create intelligent AI chat agents for your business in minutes. Start by creating your first project.
                    </p>

                    <button
                        onClick={() => navigate('/create-project')}
                        className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
                    >
                        <span className="flex items-center gap-2">
                            Create First Project
                            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </span>
                    </button>

                    <div className="mt-16 grid grid-cols-3 gap-8 text-left">
                        {[
                            { title: 'AI-Powered', desc: 'Smart responses using GPT-4o', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                            { title: 'Lead Capture', desc: 'Auto-collect emails & phones', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
                            { title: 'Customizable', desc: 'Match your brand identity', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' }
                        ].map((feature, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 bg-white rounded-lg border border-slate-100 shadow-sm flex items-center justify-center text-blue-600">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800 text-sm">{feature.title}</h3>
                                    <p className="text-xs text-slate-500 mt-1">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Main Dashboard
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Overview</h2>
                    <p className="text-slate-500 text-sm mt-1">Here's what's happening with your projects today.</p>
                </div>
                <button
                    onClick={() => navigate('/create-project')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition shadow-sm hover:shadow flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Project
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard
                    title="Total Projects"
                    value={stats.profiles}
                    color="bg-blue-600 text-blue-600"
                    icon="📂"
                />
                <StatCard
                    title="Captured Leads"
                    value={stats.leads}
                    color="bg-emerald-600 text-emerald-600"
                    icon="👥"
                    trend="+12%"
                />
                <StatCard
                    title="Active Conversations"
                    value={stats.active_chats}
                    color="bg-violet-600 text-violet-600"
                    icon="💬"
                    trend="+5%"
                />
            </div>

            <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-slate-800">Recent Projects</h3>
                    <button
                        onClick={() => navigate('/projects')}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
                    >
                        View All
                    </button>
                </div>
                <div className="divide-y divide-slate-50">
                    {profilesArray.slice(0, 5).map(project => (
                        <div key={project.id} className="p-4 hover:bg-slate-50/50 transition flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-sm"
                                    style={{ background: project.context?.widgetColor ? `linear-gradient(135deg, ${project.context.widgetColor}, ${project.context.widgetColor}dd)` : undefined }}>
                                    {project.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800">{project.name}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-1 max-w-md">{project.context?.description || 'No description'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex gap-4 text-xs text-slate-500">
                                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                                        👥 {project.leads?.length || 0} leads
                                    </span>
                                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                                        💬 {project.chats?.length || 0} chats
                                    </span>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => navigate(`/edit-project/${project.id}`)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        title="Edit"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => navigate(`/configure-widget/${project.id}`)}
                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                        title="Configure"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {profilesArray.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            No projects yet. Create one to get started!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
