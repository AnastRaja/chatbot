import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAppContext } from '../context/AppContext';

const CreateProject = () => {
    const navigate = useNavigate();
    const { fetchProfiles } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

            await axios.post('/api/profiles', {
                name: formData.name,
                context: context,
                widgetColor: formData.widgetColor
            });

            await fetchProfiles();
            navigate('/projects');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="text-blue-600 hover:text-blue-700 font-medium mb-4 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold text-slate-900">Create New Project</h1>
                <p className="text-slate-600 mt-2">Set up your AI chat widget with business details</p>
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
                                rows={3}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Describe what your business does..."
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
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://www.example.com"
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
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Facebook
                            </label>
                            <input
                                type="url"
                                name="facebook"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://facebook.com/yourpage"
                                value={formData.facebook}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Twitter
                            </label>
                            <input
                                type="url"
                                name="twitter"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://twitter.com/yourhandle"
                                value={formData.twitter}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Instagram
                            </label>
                            <input
                                type="url"
                                name="instagram"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://instagram.com/yourprofile"
                                value={formData.instagram}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                LinkedIn
                            </label>
                            <input
                                type="url"
                                name="linkedin"
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://linkedin.com/company/yourcompany"
                                value={formData.linkedin}
                                onChange={handleChange}
                            />
                        </div>
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
                                placeholder="e.g., Mon-Fri 9am-5pm"
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
                                    placeholder="#2563eb"
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
                        {loading ? 'Creating Project...' : 'Create Project'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-lg font-semibold transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateProject;
