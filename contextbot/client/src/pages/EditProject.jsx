import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';
import DocumentList from '../components/DocumentList';

const EditProject = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { profiles, fetchProfiles } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const project = profiles ? (Array.isArray(profiles) ? profiles.find(p => p.id === id) : profiles[id]) : null;

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

    const [quickQuestions, setQuickQuestions] = useState([]);

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || '',
                description: project.context?.description || '',
                email: project.context?.contact?.email || '',
                phone: project.context?.contact?.phone || '',
                address: project.context?.contact?.address || '',
                website: project.context?.contact?.website || '',
                facebook: project.context?.socialMedia?.facebook || '',
                twitter: project.context?.socialMedia?.twitter || '',
                instagram: project.context?.socialMedia?.instagram || '',
                linkedin: project.context?.socialMedia?.linkedin || '',
                availableHours: project.context?.hours || '',
                widgetColor: project.context?.widgetColor || '#2563eb',
                agentName: project.settings?.agentName || 'Support Agent',
                agentAvatar: project.settings?.agentAvatar || ''
            });

            if (project.quickQuestions && project.quickQuestions.length > 0) {
                setQuickQuestions(project.quickQuestions);
            } else {
                setQuickQuestions([]);
            }
        }
    }, [project]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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

    const handleQuestionChange = (index, field, value) => {
        const newQs = [...quickQuestions];
        newQs[index][field] = value;
        setQuickQuestions(newQs);
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

            await axios.post('/api/profiles', {
                id: id,
                name: formData.name,
                context: context,
                widgetColor: formData.widgetColor,
                quickQuestions: cleanQuestions,
                settings: {
                    agentName: formData.agentName,
                    agentAvatar: formData.agentAvatar
                }
            });

            await fetchProfiles();
            navigate('/projects');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update project');
        } finally {
            setLoading(false);
        }
    };

    if (!profiles) {
        return (
            <div className="p-8 flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="p-8">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    Project not found
                </div>
                <button
                    onClick={() => navigate('/projects')}
                    className="mt-4 text-blue-600 hover:text-blue-700"
                >
                    ← Back to Projects
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <button
                    onClick={() => navigate('/projects')}
                    className="text-blue-600 hover:text-blue-700 font-medium mb-4 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Projects
                </button>
                <h1 className="text-3xl font-bold text-slate-900">Edit Project</h1>
                <p className="text-slate-600 mt-2">Update your business details and widget settings</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Basic Information */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Business Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                rows={3}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Agent Name
                            </label>
                            <input
                                type="text"
                                name="agentName"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Contact Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                            <input
                                type="email"
                                name="email"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                            <input
                                type="tel"
                                name="phone"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                            <input
                                type="text"
                                name="address"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.address}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Website</label>
                            <input
                                type="url"
                                name="website"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.website}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Social Media */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Social Media</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {['facebook', 'twitter', 'instagram', 'linkedin'].map((platform) => (
                            <div key={platform}>
                                <label className="block text-sm font-medium text-slate-700 mb-2 capitalize">
                                    {platform}
                                </label>
                                <input
                                    type="url"
                                    name={platform}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    value={formData[platform]}
                                    onChange={handleChange}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Business Hours & Widget Customization */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Additional Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Available Hours
                            </label>
                            <input
                                type="text"
                                name="availableHours"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={formData.availableHours}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Widget Color
                            </label>
                            <div className="flex gap-3 items-center">
                                <input
                                    type="color"
                                    name="widgetColor"
                                    className="h-10 w-20 rounded border border-slate-300 cursor-pointer"
                                    value={formData.widgetColor}
                                    onChange={handleChange}
                                />
                                <input
                                    type="text"
                                    value={formData.widgetColor}
                                    onChange={(e) => setFormData({ ...formData, widgetColor: e.target.value })}
                                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Chat Questions */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-slate-900">Quick Chat Questions</h2>
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
                                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                            placeholder="e.g., What are your pricing plans?"
                                            value={q.question}
                                            onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Predefined Answer (Optional)</label>
                                        <textarea
                                            rows="2"
                                            className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none"
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

                {/* Knowledge Base */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Business Knowledge Base</h2>
                    <p className="text-sm text-slate-500 mb-6">
                        Upload documents (PDF, Text) to train your AI. The chatbot will use this information to answer visitor questions.
                    </p>
                    <DocumentList projectId={id} />
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-semibold disabled:opacity-50 transition"
                    >
                        {loading ? 'Updating...' : 'Update Project'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/projects')}
                        className="px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-lg font-semibold transition"
                    >
                        Cancel
                    </button>
                </div>
            </form >
        </div >
    );
};

export default EditProject;
