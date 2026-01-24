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
                        {leads.map(lead => (
                            <tr key={lead.id} className="hover:bg-slate-50">
                                <td className="p-4 text-slate-600">
                                    {new Date(lead.timestamp).toLocaleString()}
                                </td>
                                <td className="p-4 font-medium text-slate-900">{lead.businessName}</td>
                                <td className="p-4">
                                    {lead.details.emails.map(e => <div key={e} className="text-blue-600">{e}</div>)}
                                    {lead.details.phones.map(p => <div key={p} className="text-green-600">{p}</div>)}
                                </td>
                                <td className="p-4 text-slate-500 italic max-w-xs truncate">
                                    "{lead.rawMessage}"
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Leads;
