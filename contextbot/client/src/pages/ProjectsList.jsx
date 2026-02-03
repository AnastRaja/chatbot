import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const CopyableCode = ({ code }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 relative group">
            <code className="text-xs font-mono text-slate-600 break-all block pr-8">
                {code}
            </code>
            <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-white text-slate-400 hover:text-blue-600 transition-colors shadow-sm border border-transparent hover:border-slate-200"
                title="Copy code"
            >
                {copied ? (
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                )}
            </button>
        </div>
    );
};

const ProjectsList = () => {
    const navigate = useNavigate();
    const { profiles } = useAppContext();
    const profilesArray = Object.values(profiles || {});

    if (profiles === null) {
        return (
            <div className="p-8 max-w-7xl mx-auto">
                <div className="animate-pulse space-y-8">
                    <div className="flex justify-between items-center mb-10">
                        <div className="space-y-2">
                            <div className="h-8 w-48 bg-slate-200 rounded"></div>
                            <div className="h-4 w-64 bg-slate-200 rounded"></div>
                        </div>
                        <div className="h-10 w-32 bg-slate-200 rounded-lg"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-slate-100 rounded-xl border border-slate-200"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Your Projects</h1>
                    <p className="text-slate-500 mt-1 text-sm">Manage and monitor your AI chat widgets.</p>
                </div>
                <button
                    onClick={() => navigate('/create-project')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-sm hover:shadow flex items-center gap-2 text-sm"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Project
                </button>
            </div>

            {profilesArray.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">No projects yet</h3>
                    <p className="text-slate-500 mb-6 text-sm">Create your first project to start capturing leads.</p>
                    <button
                        onClick={() => navigate('/create-project')}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm hover:underline"
                    >
                        Create Project →
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profilesArray.map(project => (
                        <div key={project.id} className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-md transition-all duration-200 group flex flex-col">
                            {/* Card Header with Color Accent */}
                            <div className="p-5 flex items-start justify-between border-b border-slate-50 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"
                                    style={{ backgroundColor: project.context?.widgetColor }}></div>
                                <div className="pl-3">
                                    <h3 className="font-bold text-lg text-slate-800 leading-tight mb-1">{project.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">ID: {project.id}</span>
                                        <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full ring-1 ring-emerald-100">
                                            <span className="block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            Active
                                        </span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 flex-1 flex flex-col">
                                <p className="text-sm text-slate-600 mb-6 line-clamp-2 flex-1 leading-relaxed">
                                    {project.context?.description || 'No description available for this project.'}
                                </p>

                                <div className="flex gap-4 p-3 bg-slate-50/50 rounded-lg border border-slate-100 mb-5">
                                    <div className="flex-1 text-center border-r border-slate-200">
                                        <div className="text-lg font-bold text-slate-700">{project.leads?.length || 0}</div>
                                        <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Leads</div>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <div className="text-lg font-bold text-slate-700">{project.chats?.length || 0}</div>
                                        <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">Chats</div>
                                    </div>
                                </div>

                                <CopyableCode
                                    code={`<script src="http://localhost:3000/widget.js" data-id="${project.id}" data-color="${project.context?.widgetColor || '#2563eb'}"></script>`}
                                />
                            </div>

                            {/* Card Actions */}
                            <div className="p-4 border-t border-slate-50 bg-slate-50/30 flex items-center gap-2">
                                <button
                                    onClick={() => navigate(`/configure-widget/${project.id}`)}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Configure
                                </button>
                                <button
                                    onClick={() => navigate(`/edit-project/${project.id}`)}
                                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white bg-white border border-slate-200 rounded-lg transition"
                                    title="Edit Details"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={async () => {
                                        if (window.confirm('Delete this project? This action cannot be undone.')) {
                                            try {
                                                await import('axios').then(m => m.default.delete(`/api/profiles/${project.id}`));
                                                window.location.reload();
                                            } catch (e) {
                                                alert('Failed to delete');
                                            }
                                        }
                                    }}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 bg-white border border-slate-200 rounded-lg transition"
                                    title="Delete Project"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectsList;
