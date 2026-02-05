import React, { useState } from 'react';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';

const Profiles = () => {
    const { profiles, fetchProfiles } = useAppContext();
    const [crawlUrl, setCrawlUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCrawl = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post('/api/crawl', { url: crawlUrl });
            const summary = res.data.summary;

            // Auto-create profile from crawl
            await axios.post('/api/profiles', {
                id: summary.name.toLowerCase().replace(/[^a-z0-9]/g, '-'), // Simple slug
                name: summary.name,
                context: summary
            });

            await fetchProfiles();
            setCrawlUrl('');
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Business Profiles</h2>

            {/* Crawl Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                <h3 className="font-bold text-lg mb-4">Create New Profile via Crawler</h3>
                <form onSubmit={handleCrawl} className="flex gap-4">
                    <input
                        type="url"
                        placeholder="https://example.com"
                        className="flex-1 border p-2 rounded-lg"
                        value={crawlUrl}
                        onChange={(e) => setCrawlUrl(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Crawling...' : 'Sync Website'}
                    </button>
                </form>
                {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
            </div>

            {/* Profiles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.values(profiles).map(profile => (
                    <div key={profile.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900">{profile.name}</h3>
                                <p className="text-slate-500 text-sm">ID: {profile.id}</p>
                            </div>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
                        </div>

                        <div className="text-sm text-slate-600 mb-4 h-24 overflow-y-auto bg-slate-50 p-2 rounded">
                            <pre className="whitespace-pre-wrap font-sans">{JSON.stringify(profile.context, null, 2)}</pre>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <p className="text-xs font-semibold uppercase text-slate-400 mb-2">Embed Code</p>
                            <div className="bg-slate-900 text-slate-300 p-3 rounded text-xs font-mono break-all md:break-normal">
                                {`<script src="${window.location.origin}/widget.js" data-id="${profile.id}"></script>`}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Profiles;
