import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import WhiteLogo from '../components/WhiteLogo';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification token.');
            return;
        }

        const verify = async () => {
            try {
                await axios.post('/api/auth/verify', { token });
                setStatus('success');
                setMessage('Email verified successfully! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } catch (error) {
                setStatus('error');
                setMessage(error.response?.data?.error || 'Verification failed.');
            }
        };

        verify();
    }, [token, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-green-600 p-2 rounded-lg">
                        <WhiteLogo className="h-8 w-auto text-white" />
                    </div>
                </div>

                <h2 className="text-2xl font-bold mb-4">Email Verification</h2>

                {status === 'verifying' && (
                    <div className="animate-pulse text-gray-600">{message}</div>
                )}

                {status === 'success' && (
                    <div className="text-green-600 font-semibold">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {message}
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-red-600 font-semibold">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                        {message}
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-4 block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg transition"
                        >
                            Go to Login
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
