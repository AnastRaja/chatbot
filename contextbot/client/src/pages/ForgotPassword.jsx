import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import WhiteLogo from '../components/WhiteLogo';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { forgotPassword } = useAppContext();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setError('');

        try {
            await forgotPassword(email);
            setStatus('success');
        } catch (err) {
            setError(err.message || "Failed to send reset link");
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans">
            {/* Left Side - Green Gradient */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-600 to-green-900 p-12 flex-col justify-between relative overflow-hidden">
                <div className="relative z-10">
                    <WhiteLogo className="h-8 w-auto text-white" />
                </div>

                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl mix-blend-overlay"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl mix-blend-overlay"></div>
                </div>

                <div className="relative z-10 text-white max-w-lg">
                    <h1 className="text-4xl font-bold mb-6 leading-tight">
                        Turn Conversations Into Qualified Leads
                    </h1>
                    <p className="text-green-100 text-lg mb-8">
                        Log in to Leadvox and manage your AI sales agent that understands your website, answers real customer questions, and captures high-intent leads automatically.
                    </p>

                    {/* <div className="flex gap-4 items-center opacity-80">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-green-800 bg-green-700 flex items-center justify-center text-xs font-bold">
                                    U{i}
                                </div>
                            ))}
                        </div>
                        <span className="text-sm font-medium">Trusted by teams everywhere</span>
                    </div> */}
                </div>


            </div>

            {/* Right Side - Forgot Password Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-16">
                <div className="w-full max-w-md space-y-8">
                    {status === 'success' ? (
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">Check your email</h2>
                            <p className="text-gray-500 mb-8">
                                We've sent password reset instructions to <strong>{email}</strong>.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-all duration-200"
                            >
                                Return to Sign In
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="text-center lg:text-left">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="flex items-center text-gray-500 hover:text-gray-900 transition mb-6 lg:mb-8"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mr-1">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                    </svg>
                                    Back to Login
                                </button>
                                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                                    Forgot Password?
                                </h2>
                                <p className="mt-2 text-gray-500">
                                    Enter your email address and we'll send you a link to reset your password.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-start animate-fade-in">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition duration-200"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 focus:ring-4 focus:ring-green-100 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform active:scale-[0.98]"
                                >
                                    {status === 'loading' ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending...
                                        </span>
                                    ) : 'Send Reset Link'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
