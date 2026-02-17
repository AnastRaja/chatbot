import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';

const CreateProject = () => {
    const navigate = useNavigate();
    const { fetchProfiles, user } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        email: '',
        phone: '',
        address: '',
        website: '',
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
        availableHours: '',
        widgetColor: '#2563eb'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Create context object from form data
            const context = {
                name: formData.name,
                description: formData.description,
                contact: {
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    website: formData.website
                },
                socialMedia: {
                    facebook: formData.facebook,
                    twitter: formData.twitter,
                    instagram: formData.instagram,
                    linkedin: formData.linkedin
                },
                hours: formData.availableHours,
                widgetColor: formData.widgetColor
            };

            const res = await axios.post('/api/profiles', {
                name: formData.name,
                context: context,
                widgetColor: formData.widgetColor
            });

            const newProjectId = res.data.id || res.data._id; // Adapt based on actual response structure

            // Upload Document if selected
            if (selectedFile && newProjectId) {
                try {
                    const uploadFormData = new FormData();
                    uploadFormData.append('file', selectedFile);
                    uploadFormData.append('projectId', newProjectId);

                    let token;
                    if (user.provider === 'firebase' || user.provider === 'google') {
                        token = await user.getIdToken();
                    } else {
                        token = localStorage.getItem('authToken');
                    }
                    await axios.post('/api/documents/upload', uploadFormData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${token}`
                        },
                        onUploadProgress: (progressEvent) => {
                            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            setUploadProgress(percentCompleted);
                        }
                    });
                } catch (uploadErr) {
                    console.error("Failed to upload document during creation:", uploadErr);
                    // We don't stop the flow, but maybe alert? 
                    // ideally we just continue as the project is created.
                }
            }

            await fetchProfiles();
            navigate('/projects');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="text-slate-500 hover:text-blue-600 font-medium mb-4 flex items-center gap-2 transition-colors text-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Create New Project</h1>
                <p className="text-slate-500 mt-2">Set up your AI chat widget with business details</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </div>
                )}

                {/* Basic Information */}
                <div className="bg-white p-8 rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">1</span>
                        Basic Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Business Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                placeholder="e.g., Urban Brew Coffee"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Business Description *
                            </label>
                            <textarea
                                name="description"
                                required
                                rows={4}
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
                                placeholder="Describe what your business does, your key services, and what makes you unique..."
                                value={formData.description}
                                onChange={handleChange}
                            />
                            <p className="text-xs text-slate-400 mt-2 text-right">This informs the AI's personality and knowledge base.</p>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white p-8 rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">2</span>
                        Contact Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                placeholder="contact@business.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Phone
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                placeholder="+1 (555) 000-0000"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Address
                            </label>
                            <input
                                type="text"
                                name="address"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                placeholder="123 Main St, City, State"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Website
                            </label>
                            <input
                                type="url"
                                name="website"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                placeholder="https://www.example.com"
                                value={formData.website}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Social Media */}
                <div className="bg-white p-8 rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-sm">3</span>
                        Social Media Links
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Facebook</label>
                            <input
                                type="url"
                                name="facebook"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
                                placeholder="https://facebook.com/..."
                                value={formData.facebook}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Twitter / X</label>
                            <input
                                type="url"
                                name="twitter"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
                                placeholder="https://twitter.com/..."
                                value={formData.twitter}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Instagram</label>
                            <input
                                type="url"
                                name="instagram"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
                                placeholder="https://instagram.com/..."
                                value={formData.instagram}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">LinkedIn</label>
                            <input
                                type="url"
                                name="linkedin"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all outline-none"
                                placeholder="https://linkedin.com/company/..."
                                value={formData.linkedin}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Additional Details */}
                <div className="bg-white p-8 rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-sm">4</span>
                        Additional Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Available Hours
                            </label>
                            <input
                                type="text"
                                name="availableHours"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none"
                                placeholder="e.g., Mon-Fri 9am-5pm"
                                value={formData.availableHours}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Brand Color
                            </label>
                            <div className="flex gap-3 items-center">
                                <input
                                    type="color"
                                    name="widgetColor"
                                    className="h-11 w-20 rounded border border-slate-200 cursor-pointer p-1 bg-white"
                                    value={formData.widgetColor}
                                    onChange={handleChange}
                                />
                                <input
                                    type="text"
                                    value={formData.widgetColor}
                                    onChange={(e) => setFormData({ ...formData, widgetColor: e.target.value })}
                                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none uppercase"
                                    placeholder="#2563EB"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Knowledge Base */}
                <div className="bg-white p-8 rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">5</span>
                        Business Knowledge Base
                    </h2>
                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center transition hover:bg-slate-100/50">
                        <p className="text-sm text-slate-600 mb-2">Upload a PDF or Text file to train your AI immediately.</p>
                        <p className="text-xs text-slate-400 mb-4">You can also do this later in project settings.</p>

                        <div className="relative inline-block">
                            <input
                                type="file"
                                id="create-project-upload"
                                className="hidden"
                                accept=".pdf,.txt"
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                            />
                            <label
                                htmlFor="create-project-upload"
                                className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 shadow-sm rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition"
                            >
                                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                {selectedFile ? selectedFile.name : 'Choose Document'}
                            </label>
                            {selectedFile && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedFile(null)}
                                    className="ml-2 text-xs text-red-500 hover:text-red-700 underline"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div className="mt-4">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-600 font-medium">Uploading...</span>
                                    <span className="text-indigo-600 font-bold">{uploadProgress}%</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-slate-200">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="px-8 py-3.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition shadow-sm hover:shadow"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`flex-1 py-3.5 px-6 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none ${loading ? 'bg-gray-900' : 'bg-gray-900 hover:bg-gray-800 shadow-blue-500/30'
                            }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating Project...
                            </span>
                        ) : (
                            'Create Project'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateProject;
