import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';

const EditProject = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { profiles, fetchProfiles } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const project = profiles[id];

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
                widgetColor: project.context?.widgetColor || '#2563eb'
            });
        }
    }, [project]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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

            await axios.post('/api/profiles', {
                id: id,
                name: formData.name,
                context: context,
                widgetColor: formData.widgetColor
            });

            await fetchProfiles();
            navigate('/projects');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update project');
        } finally {
            setLoading(false);
        }
    };

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

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-50 transition"
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
            </form>
        </div>
    );
};

export default EditProject;
