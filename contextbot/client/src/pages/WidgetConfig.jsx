import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const WidgetConfig = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [config, setConfig] = useState({
        agentName: '',
        welcomeMessage: '',
        widgetColor: '#2563eb',
        autoOpenDelay: 5000
    });

    useEffect(() => {
        const fetchProject = async () => {
            try {
                // We'll use the profile map or fetch individual project if API supports it
                // For now, let's fetch profiles and filter (or we could add a specific GET /project/:id)
                // Assuming we can leverage the existing POST /profiles (create/update) or GET /profiles logic
                // Actually, the user might not have a dedicated GET single project route exposed for editing easily
                // Let's rely on GET /api/profiles which returns a map.
                const res = await axios.get('/api/profiles');
                const project = res.data[id];
                if (project) {
                    setConfig({
                        agentName: project.settings?.agentName || 'Support Agent',
                        welcomeMessage: project.settings?.welcomeMessage || 'Hello! How can I help you today?',
                        widgetColor: project.widgetColor || '#2563eb',
                        autoOpenDelay: project.settings?.autoOpenDelay ?? 5000
                    });
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // We need to fetch the existing project data first to preserve other fields
            // Or the endpoint handles partial updates. 
            // The current POST /api/profiles runs createOrUpdateProject.
            // We should ideally fetch the full object first.

            // Re-fetch to be safe
            const res = await axios.get('/api/profiles');
            const currentProject = res.data[id];

            const updatedProject = {
                ...currentProject,
                widgetColor: config.widgetColor,
                settings: {
                    ...currentProject.settings,
                    agentName: config.agentName,
                    welcomeMessage: config.welcomeMessage,
                    autoOpenDelay: parseInt(config.autoOpenDelay)
                }
            };

            await axios.post('/api/profiles', updatedProject);
            alert('Widget configuration saved!');
        } catch (err) {
            console.error(err);
            alert('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Widget Configuration</h2>
                <button onClick={() => navigate('/projects')} className="text-slate-500 hover:text-slate-700">
                    &larr; Back to Projects
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Agent Name</label>
                            <input
                                type="text"
                                value={config.agentName}
                                onChange={e => setConfig({ ...config, agentName: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="e.g. Sarah, Support Team"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Brand Color</label>
                            <div className="flex gap-4 items-center">
                                <input
                                    type="color"
                                    value={config.widgetColor}
                                    onChange={e => setConfig({ ...config, widgetColor: e.target.value })}
                                    className="h-10 w-20 cursor-pointer rounded border p-1"
                                />
                                <span className="text-sm text-slate-500 uppercase">{config.widgetColor}</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Welcome Message</label>
                            <textarea
                                value={config.welcomeMessage}
                                onChange={e => setConfig({ ...config, welcomeMessage: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                                placeholder="Hello! How can we help you?"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Auto-Open Delay (ms)</label>
                            <input
                                type="number"
                                value={config.autoOpenDelay}
                                onChange={e => setConfig({ ...config, autoOpenDelay: e.target.value })}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="5000"
                            />
                            <p className="text-xs text-slate-500 mt-1">Set to 0 to disable auto-open. Defaults to 5000 (5 seconds).</p>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-800 transition disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Preview */}
                <div className="relative h-[600px] border border-slate-200 rounded-2xl bg-gray-50 overflow-hidden flex flex-col items-center justify-center">
                    <p className="text-slate-400 text-sm mb-4">Live Preview</p>

                    {/* Fake Widget Preview */}
                    <div className="w-[350px] bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col border border-slate-100" style={{ height: '500px' }}>
                        <div className="p-4 text-white flex justify-between items-center" style={{ backgroundColor: config.widgetColor }}>
                            <div>
                                <h3 className="font-bold">{config.agentName}</h3>
                                <div className="flex items-center gap-1.5 opacity-90">
                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                    <span className="text-xs">Online</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 p-4 bg-gray-50 flex flex-col gap-4">
                            <div className="flex justify-start">
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none border text-sm text-gray-800 shadow-sm">
                                    {config.welcomeMessage}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t bg-white">
                            <div className="h-10 bg-gray-100 rounded-full w-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WidgetConfig;
