import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';

const StatCard = ({ title, value, color, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-sm font-medium">{title}</p>
                <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
            </div>
            <div className={`text-4xl ${color} opacity-20`}>{icon}</div>
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
            <div className="p-8 h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center max-w-2xl">
                    <div className="mb-8">
                        <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 mb-4">Welcome to ContextBot</h1>
                        <p className="text-lg text-slate-600 mb-8">
                            Create AI-powered chat widgets for your websites. Get started by adding your first project.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate('/create-project')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition transform hover:scale-105"
                    >
                        Create Your First Project
                    </button>

                    <div className="mt-12 grid grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="text-blue-600 mb-3">
                                <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-slate-900">AI-Powered</h3>
                            <p className="text-sm text-slate-600 mt-2">Intelligent chat responses using GPT-4o</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="text-green-600 mb-3">
                                <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-slate-900">Lead Capture</h3>
                            <p className="text-sm text-slate-600 mt-2">Automatically capture emails and phone numbers</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <div className="text-purple-600 mb-3">
                                <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-slate-900">Customizable</h3>
                            <p className="text-sm text-slate-600 mt-2">Match your brand with custom colors</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Dashboard with Projects
    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
                <button
                    onClick={() => navigate('/create-project')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Project
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard
                    title="Total Projects"
                    value={stats.profiles}
                    color="text-blue-600"
                    icon="📊"
                />
                <StatCard
                    title="Captured Leads"
                    value={stats.leads}
                    color="text-green-600"
                    icon="👥"
                />
                <StatCard
                    title="Active Chats"
                    value={stats.active_chats}
                    color="text-purple-600"
                    icon="💬"
                />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-slate-900">Recent Projects</h3>
                    <button
                        onClick={() => navigate('/projects')}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                        View All →
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {profilesArray.slice(0, 6).map(project => (
                        <div key={project.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h4 className="font-semibold text-slate-900">{project.name}</h4>
                                    <p className="text-xs text-slate-500">ID: {project.id}</p>
                                </div>
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
                            </div>
                            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                                {project.context?.description || 'No description'}
                            </p>
                            <div className="flex gap-2 text-xs text-slate-500">
                                <span>🎯 {project.leads?.length || 0} leads</span>
                                <span>💬 {project.chats?.length || 0} chats</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
