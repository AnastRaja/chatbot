import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const ProjectsList = () => {
    const navigate = useNavigate();
    const { profiles } = useAppContext();
    const profilesArray = Object.values(profiles || {});

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">All Projects</h1>
                    <p className="text-slate-600 mt-1">Manage your AI chat widget projects</p>
                </div>
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

            {profilesArray.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No projects yet</h3>
                    <p className="text-slate-600 mb-6">Create your first project to get started</p>
                    <button
                        onClick={() => navigate('/create-project')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition"
                    >
                        Create Project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profilesArray.map(project => (
                        <div key={project.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition overflow-hidden">
                            <div
                                className="h-24 bg-gradient-to-r from-blue-500 to-blue-600"
                                style={{
                                    background: project.context?.widgetColor
                                        ? `linear-gradient(135deg, ${project.context.widgetColor}, ${project.context.widgetColor}dd)`
                                        : undefined
                                }}
                            />

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-slate-900 mb-1">{project.name}</h3>
                                        <p className="text-xs text-slate-500">ID: {project.id}</p>
                                    </div>
                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>
                                </div>

                                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                                    {project.context?.description || 'No description available'}
                                </p>

                                <div className="flex gap-4 mb-4 text-xs text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        {project.leads?.length || 0} leads
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        {project.chats?.length || 0} chats
                                    </div>
                                </div>

                                <div className="border-t border-slate-200 pt-4 space-y-2">
                                    <button
                                        onClick={() => navigate(`/edit-project/${project.id}`)}
                                        className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 px-4 rounded-lg font-medium transition text-sm flex items-center justify-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        Edit Project
                                    </button>

                                    <details className="bg-slate-50 rounded-lg">
                                        <summary className="cursor-pointer p-3 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition">
                                            Widget Embed Code
                                        </summary>
                                        <div className="p-3 pt-0">
                                            <div className="bg-slate-900 text-slate-300 p-3 rounded text-xs font-mono break-all">
                                                {`<script src="http://localhost:3000/widget.js" data-id="${project.id}" data-color="${project.context?.widgetColor || '#2563eb'}"></script>`}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(
                                                        `<script src="http://localhost:3000/widget.js" data-id="${project.id}" data-color="${project.context?.widgetColor || '#2563eb'}"></script>`
                                                    );
                                                    alert('Copied to clipboard!');
                                                }}
                                                className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-xs font-medium transition"
                                            >
                                                Copy Code
                                            </button>
                                        </div>
                                    </details>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectsList;
