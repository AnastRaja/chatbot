import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import WhiteLogo from '../components/WhiteLogo';

const Register = () => {
    const navigate = useNavigate();
    const { register, googleLogin } = useAppContext();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        try {
            await register(formData.email, formData.password, formData.name);
            navigate('/');
        } catch (err) {
            if (err.code === 'auth/email-already-in-use') {
                setError('Email is already registered. Please login.');
            } else {
                setError(err.message || 'Failed to register');
            }
            setLoading(false);
        }
    };

    const handleGoogleRegister = async () => {
        setLoading(true);
        try {
            await googleLogin();
            navigate('/');
        } catch (err) {
            setError(err.message || 'Google sign-up failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans">
            {/* Left Side */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-600 to-green-900 p-12 flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <WhiteLogo className="h-8 w-auto text-white" />
                </div>

                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 text-white max-w-lg">
                    <h1 className="text-5xl font-bold mb-6 leading-tight">
                        Turn Conversations Into Qualified Leads
                    </h1>
                    <p className="text-green-100 text-lg mb-8">
                        Log in to Leadvox and manage your AI sales agent that understands your website, answers real customer questions, and captures high-intent leads automatically.
                    </p>

                    {/* <div className="flex gap-4 items-center opacity-80">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="w-10 h-10 rounded-full border-2 border-green-800 bg-green-700 flex items-center justify-center text-xs font-bold"
                                >
                                    U{i}
                                </div>
                            ))}
                        </div>
                        <span className="text-sm font-medium">
                            Trusted by teams everywhere
                        </span>
                    </div> */}
                </div>


            </div>

            {/* Right Side */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-16">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Create your account
                        </h2>
                        <p className="mt-2 text-gray-500">
                            Sign up to get started with ContextBot.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start">
                                <svg className="h-5 w-5 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {error}
                            </div>
                        )}

                        <input
                            type="text"
                            required
                            placeholder="Full name"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                        />

                        <input
                            type="email"
                            required
                            placeholder="Email address"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                        />

                        <input
                            type="password"
                            required
                            placeholder="Password"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                            value={formData.password}
                            onChange={(e) =>
                                setFormData({ ...formData, password: e.target.value })
                            }
                        />

                        <input
                            type="password"
                            required
                            placeholder="Confirm password"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                            value={formData.confirmPassword}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    confirmPassword: e.target.value
                                })
                            }
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 disabled:opacity-70 transition"
                        >
                            {loading ? 'Creating account…' : 'Sign up'}
                        </button>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">Or</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleRegister}
                            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-50"
                        >
                            <img
                                src="https://www.svgrepo.com/show/475656/google-color.svg"
                                className="w-5 h-5"
                                alt="Google"
                            />
                            Sign up with Google
                        </button>

                        <p className="text-center text-sm text-gray-500">
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="font-bold text-green-600"
                            >
                                Log in
                            </button>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
