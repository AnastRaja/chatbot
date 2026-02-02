import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Leads = () => {
    const [leads, setLeads] = useState([]);

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const res = await axios.get('/api/leads');
                setLeads(res.data);
            } catch (e) {
                console.error(e);
            }
        };
        fetchLeads();
        // Poll for new leads
        const interval = setInterval(fetchLeads, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this lead? This action cannot be undone.')) {
            try {
                await axios.delete(`/api/leads/${id}`);
                setLeads(leads.filter(lead => (lead._id || lead.id) !== id));
            } catch (error) {
                console.error('Failed to delete lead', error);
                alert('Failed to delete lead');
            }
        }
    };

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Captured Leads</h2>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-sm uppercase">
                        <tr>
                            <th className="p-4 font-medium border-b">Timestamp</th>
                            <th className="p-4 font-medium border-b">Business</th>
                            <th className="p-4 font-medium border-b">Contact Info</th>
                            <th className="p-4 font-medium border-b">Context</th>
                            <th className="p-4 font-medium border-b w-10"></th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100">
                        {leads.length === 0 && (
                            <tr>
                                <td colSpan="4" className="p-8 text-center text-slate-400">No leads captured yet.</td>
                            </tr>
                        )}
                        {leads.map(lead => {
                            // Backend Compatibility Adapter
                            const details = lead.contactDetails || lead.details || {};
                            const emails = details.emails || (details.email ? [details.email] : []);
                            const phones = details.phones || (details.phone ? [details.phone] : []);
                            const date = lead.createdAt || lead.timestamp;

                            return (
                                <tr key={lead._id || lead.id} className="hover:bg-slate-50">
                                    <td className="p-4 text-slate-600">
                                        {date ? new Date(date).toLocaleString() : 'N/A'}
                                    </td>
                                    <td className="p-4 font-medium text-slate-900">{lead.businessName || lead.projectId || 'Unknown'}</td>
                                    <td className="p-4">
                                        {emails.length > 0 ? (
                                            emails.map((e, i) => <div key={i} className="text-blue-600">{e}</div>)
                                        ) : (
                                            <span className="text-slate-400 text-xs">No email</span>
                                        )}
                                        {phones.length > 0 && (
                                            phones.map((p, i) => <div key={i} className="text-green-600">{p}</div>)
                                        )}
                                    </td>
                                    <td className="p-4 text-slate-500 italic max-w-xs truncate">
                                        "{lead.rawMessage}"
                                    </td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => handleDelete(lead._id || lead.id)}
                                            className="text-slate-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50"
                                            title="Delete Lead"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leads;
