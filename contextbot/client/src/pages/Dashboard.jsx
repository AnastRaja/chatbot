import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar
} from 'recharts';
import {
    Users, Clock, MousePointerClick, ArrowUpRight, ArrowDownRight,
    MoreHorizontal, Calendar, Filter, Download
} from 'lucide-react';

const StatCard = ({ title, value, trend, icon: Icon, trendValue }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-gray-50 rounded-xl">
                <Icon className="w-6 h-6 text-gray-700" />
            </div>
            <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="w-5 h-5" />
            </button>
        </div>
        <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
        <div className="flex items-end gap-2">
            <h2 className="text-2xl font-bold text-gray-900">{value}</h2>
            {trend && (
                <div className={`flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${trend === 'up' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                    }`}>
                    {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {trendValue}
                </div>
            )}
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
    }, [selectedProjectId]);

    // Loading State
    if (profiles === null) {
        return (
            <div className="p-8 h-full flex flex-col items-center justify-center bg-gray-50/50">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-200 rounded-xl mb-4"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
                </div>
            </div>
        );
    }

    // Empty State
    if (profilesArray.length === 0) {
        return (
            <div className="p-8 h-full flex flex-col items-center justify-center bg-gray-50/50">
                <div className="text-center max-w-2xl bg-white p-12 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
                    <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8">
                        <Users className="w-10 h-10 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">Welcome to OripioFin</h1>
                    <p className="text-lg text-gray-500 mb-10 leading-relaxed max-w-lg mx-auto">
                        Your financial operational dashboard is empty. Start by creating a project to track analytics.
                    </p>
                    <button
                        onClick={() => navigate('/create-project')}
                        className="bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-gray-900/20 hover:-translate-y-1"
                    >
                        Create First Project
                    </button>
                </div>
            </div>
        );
    }

    // Main Dashboard
    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h2>
                    <p className="text-gray-500 text-sm mt-1">Track your key performance indicators in real-time.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <select
                            className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium text-sm shadow-sm hover:border-gray-300 transition-colors min-w-[220px]"
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                        >
                            {profilesArray.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                            <ArrowDownRight className="w-4 h-4" />
                        </div>
                    </div>

                    {/* <button className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
                        <Calendar className="w-5 h-5" />
                    </button>
                    <button className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
                        <Filter className="w-5 h-5" />
                    </button> */}
                </div>
            </div>

            {loading && !analytics ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl"></div>)}
                </div>
            ) : analytics ? (
                <>
                    {/* Top Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Green Balance Card (Main Metric) */}
                        <div className="lg:col-span-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <p className="text-emerald-100 font-medium mb-1">Unique Visitors</p>
                                        <h2 className="text-4xl font-bold tracking-tight">{analytics.uniqueVisitors}</h2>
                                    </div>
                                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                </div>

                                <div className="flex gap-4 mb-8">
                                    <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-300"></div>
                                            <p className="text-xs text-emerald-100">Avg Duration</p>
                                        </div>
                                        <p className="text-lg font-bold">{analytics.avgDuration}s</p>
                                    </div>
                                    <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-300"></div>
                                            <p className="text-xs text-emerald-100">Bounce</p>
                                        </div>
                                        <p className="text-lg font-bold">{analytics.bounceRate}%</p>
                                    </div>

                                </div>
                                <div className="flex-1 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-300"></div>
                                        <p className="text-xs text-emerald-100">Total Visits</p>
                                    </div>
                                    <p className="text-lg font-bold">{analytics.totalVisits}</p>
                                </div>

                                {/* <div className="flex gap-3">
                                    <button className="flex-1 bg-white text-emerald-700 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors shadow-sm">
                                        View Report
                                    </button>
                                    <button className="flex-1 bg-emerald-700/50 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700/70 transition-colors backdrop-blur-sm">
                                        Export
                                    </button>
                                </div> */}
                            </div>
                        </div>

                        {/* Secondary Stats */}
                        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* <StatCard
                                title="Total Sessions"
                                value={analytics.totalVisits}
                                trend="up"
                                trendValue="+12.5%"
                                icon={MousePointerClick}
                            />
                            <StatCard
                                title="Active Now"
                                value="24"
                                trend="up"
                                trendValue="+4"
                                icon={Clock}
                            />
                            <StatCard
                                title="Conversion Rate"
                                value="3.2%"
                                trend="down"
                                trendValue="-0.4%"
                                icon={ArrowUpRight}
                            /> */}

                            {/* Analytics Chart */}
                            <div className="md:col-span-2 lg:col-span-3 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-gray-800">Traffic Activity</h3>
                                    <select className="bg-gray-50 border-none text-xs text-gray-500 rounded-lg py-1 px-3 focus:ring-0">
                                        <option>Last 7 Days</option>
                                        <option>Last 30 Days</option>
                                    </select>
                                </div>
                                <div className="h-[200px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={analytics.chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 11 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 11 }}
                                            />
                                            <Tooltip
                                                cursor={{ fill: '#f8fafc' }}
                                                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                                            />
                                            <Bar
                                                dataKey="visitors"
                                                fill="#10b981"
                                                radius={[4, 4, 0, 0]}
                                                barSize={32}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: "Transactions" style table for Top Pages */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">Top Visited Pages</h3>
                            {/* <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 font-medium">
                                <Download className="w-4 h-4" />
                                Download CSV
                            </button> */}
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50">
                                    <tr className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        <th className="px-6 py-4">Page URL</th>
                                        <th className="px-6 py-4">Visits</th>
                                        <th className="px-6 py-4">Avg Duration</th>
                                        <th className="px-6 py-4">Bounce Rate</th>
                                        <th className="px-6 py-4 text-right">Performance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {analytics.topPages.length > 0 ? (
                                        analytics.topPages.map((page, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                                                            P{idx + 1}
                                                        </div>
                                                        <span className="font-medium text-gray-700 max-w-[200px] truncate" title={page.url}>
                                                            {typeof page.url === 'string' ? page.url.replace(window.location.origin, '') : (page.url || 'Unknown Page')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 font-semibold text-gray-700">{page.visits}</td>
                                                <td className="px-6 py-4 text-gray-500">{page.avgTime}s</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${Number(page.bounceRate) < 40 ? 'bg-emerald-50 text-emerald-700' :
                                                        Number(page.bounceRate) < 70 ? 'bg-yellow-50 text-yellow-700' :
                                                            'bg-rose-50 text-rose-700'
                                                        }`}>
                                                        {page.bounceRate}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="w-24 ml-auto bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                        <div
                                                            className="bg-primary h-full rounded-full"
                                                            style={{ width: `${(page.visits / analytics.totalVisits) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                                                No page data available yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
};

export default Dashboard;
