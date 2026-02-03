import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Legend
} from 'recharts';

const StatCard = ({ title, value, color, icon, trend }) => (
    <div className="bg-white p-6 rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100/50 hover:shadow-md transition duration-200">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
                    {trend && <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>{trend}</span>}
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
    const profilesArray = Object.values(profiles || {});

    // State
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(false);

    // Initialize Default Project
    useEffect(() => {
        if (profilesArray.length > 0 && !selectedProjectId) {
            setSelectedProjectId(profilesArray[0].id);
        }
    }, [profiles]);

    // Fetch Analytics
    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!selectedProjectId) return;
            setLoading(true);
            try {
                const res = await axios.get(`/api/analytics/stats/${selectedProjectId}`);
                setAnalytics(res.data);
            } catch (error) {
                console.error("Failed to load analytics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
        const interval = setInterval(fetchAnalytics, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [selectedProjectId]);



    // Loading State
    if (profiles === null) {
        return (
            <div className="p-8 h-full flex flex-col items-center justify-center bg-slate-50/50">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-slate-200 rounded-xl mb-4"></div>
                    <div className="h-4 w-48 bg-slate-200 rounded mb-2"></div>
                </div>
            </div>
        );
    }

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
                </div>
            </div>
        );
    }

    const selectedProject = profilesArray.find(p => p.id === selectedProjectId);

    // Main Dashboard
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h2>
                    <p className="text-slate-500 text-sm mt-1">Real-time insights for your projects.</p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        className="bg-white border border-slate-200 text-slate-700 py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm font-medium shadow-sm transition min-w-[200px]"
                        value={selectedProjectId}
                        onChange={(e) => setSelectedProjectId(e.target.value)}
                    >
                        {profilesArray.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>

                    <button
                        onClick={() => navigate('/create-project')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition shadow-sm hover:shadow flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Project
                    </button>
                </div>
            </div>

            {loading && !analytics ? (
                <div className="text-center py-20 text-slate-400">Loading analytics...</div>
            ) : analytics ? (
                <>
                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Visitors"
                            value={analytics.uniqueVisitors}
                            color="bg-blue-600 text-blue-600"
                            icon="👥"
                        />
                        <StatCard
                            title="Total Sessions"
                            value={analytics.totalVisits}
                            color="bg-indigo-600 text-indigo-600"
                            icon="📂"
                        />
                        <StatCard
                            title="Avg. Session Duration"
                            value={`${analytics.avgDuration}s`}
                            color="bg-emerald-600 text-emerald-600"
                            icon="⏱"
                        />
                        <StatCard
                            title="Bounce Rate"
                            value={`${analytics.bounceRate}%`}
                            color="bg-orange-500 text-orange-600"
                            icon="📉"
                        />
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Traffic Chart */}
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-lg text-slate-800 mb-6">Traffic Over Time (Last 7 Days)</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={analytics.chartData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                                            itemStyle={{ color: '#1e293b' }}
                                        />
                                        <Line type="monotone" dataKey="visitors" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Top Pages */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-lg text-slate-800 mb-4">Top Pages</h3>
                            <div className="space-y-4">
                                {analytics.topPages.length > 0 ? (
                                    analytics.topPages.map((page, idx) => (
                                        <div key={idx} className="group">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-sm font-medium text-slate-700 truncate max-w-[200px]" title={page.url}>
                                                    {page.url.replace(window.location.origin, '') || page.url}
                                                </p>
                                                <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{page.visits} visits</span>
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-400">
                                                <span>Duration: {page.avgTime}s</span>
                                                <span>Bounce: {page.bounceRate}%</span>
                                            </div>
                                            {/* Mini bar */}
                                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                                                <div
                                                    className="bg-blue-500 h-full rounded-full"
                                                    style={{ width: `${(page.visits / analytics.totalVisits) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-slate-400 py-10">No data available</div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            ) : null}

            {/* Quick Actions / Recent Activity could go here */}
        </div>
    );
};

export default Dashboard;
