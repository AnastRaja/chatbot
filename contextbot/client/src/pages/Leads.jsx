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
