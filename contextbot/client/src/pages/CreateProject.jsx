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
        widgetColor: '#2563eb',
        agentName: 'Support Agent',
        agentAvatar: ''
    });

    const [quickQuestions, setQuickQuestions] = useState([{ question: '', answer: '' }]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleQuestionChange = (index, field, value) => {
        const newQs = [...quickQuestions];
        newQs[index][field] = value;
        setQuickQuestions(newQs);
    };

    const handleAvatarUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 150;
                const MAX_HEIGHT = 150;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                setFormData(prev => ({ ...prev, agentAvatar: dataUrl }));
            };
        };
    };

    const addQuestion = () => {
        if (quickQuestions.length < 4) {
            setQuickQuestions([...quickQuestions, { question: '', answer: '' }]);
        }
    };

    const removeQuestion = (index) => {
        const newQs = quickQuestions.filter((_, i) => i !== index);
        setQuickQuestions(newQs);
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

            const cleanQuestions = quickQuestions.filter(q => q.question.trim() !== '');

            const res = await axios.post('/api/profiles', {
                name: formData.name,
                context: context,
                widgetColor: formData.widgetColor,
                quickQuestions: cleanQuestions,
                settings: {
                    agentName: formData.agentName,
                    agentAvatar: formData.agentAvatar
                }
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

                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Agent Name
                            </label>
                            <input
                                type="text"
                                name="agentName"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                placeholder="e.g., Support Agent"
                                value={formData.agentName}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Agent Avatar (Image)
                            </label>
                            <div className="flex items-center gap-4">
                                {formData.agentAvatar ? (
                                    <img src={formData.agentAvatar} alt="Agent Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-slate-200/50 shadow-sm" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 border-dashed text-slate-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <label className="cursor-pointer inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                        <span>Upload Photo</span>
                                        <input type="file" className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={handleAvatarUpload} />
                                    </label>
                                    <p className="text-[11px] text-slate-400 mt-1.5 px-0.5">JPG or PNG (max 5MB)</p>
                                </div>
                            </div>
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

                {/* Quick Chat Questions */}
                <div className="bg-white p-8 rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center text-sm">6</span>
                            Quick Chat Questions
                        </h2>
                        {quickQuestions.length < 4 && (
                            <button
                                type="button"
                                onClick={addQuestion}
                                className="text-sm px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition font-medium"
                            >
                                + Add Question
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-slate-500 mb-6">Pre-fill standard questions users can click directly on the chat widget. You can provide optional answers, ensuring exactly how the AI responds.</p>

                    <div className="space-y-6">
                        {quickQuestions.map((q, index) => (
                            <div key={index} className="p-5 border border-slate-200 rounded-lg bg-slate-50 relative">
                                <button
                                    type="button"
                                    onClick={() => removeQuestion(index)}
                                    className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition"
                                    title="Remove option"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                                <div className="pr-8">
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Clickable Question {index + 1}</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none"
                                            placeholder="e.g., What are your pricing plans?"
                                            value={q.question}
                                            onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Predefined Answer (Optional)</label>
                                        <textarea
                                            rows="2"
                                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all outline-none resize-none"
                                            placeholder="Provide the exact text you want the AI to reply with..."
                                            value={q.answer}
                                            onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
                                        ></textarea>
                                        <p className="text-xs text-slate-400 mt-1">If empty, AI will parse the document context dynamically to find an answer.</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {quickQuestions.length === 0 && (
                            <div className="text-center py-6 text-sm text-slate-500 italic">No quick questions defined.</div>
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
