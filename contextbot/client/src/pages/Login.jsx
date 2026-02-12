import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Logo from '../components/Logo';
import { CheckCircle2 } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { login, googleLogin, user } = useAppContext();

    // Redirect when authenticated
    React.useEffect(() => {
        // Debug logging to verify user state
        // console.log('Login Page: Auth State Check', user); 
        if (user && user.emailVerified) {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login(formData.email, formData.password);
            if (!user.emailVerified) {
                setError('Please verify your email address to continue.');
                setLoading(false);
                return;
            }
            // Navigation handled by useEffect
        } catch (err) {
            // Handle specific firebase error codes
            console.error(err);
            if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                setError('Invalid email or password.');
            } else {
                setError(err.message || 'Failed to login');
            }
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        try {
            await googleLogin();
            // Navigation handled by useEffect
        } catch (err) {
            setError(err.message || 'Google sign-in failed');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-white font-sans">
            {/* Left Side - Green Gradient */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-600 to-green-900 p-12 flex-col justify-between relative overflow-hidden">
                {/* <div className="relative z-10">
                    <Logo className="h-10 w-auto text-white" />
                </div> */}

                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl mix-blend-overlay"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl mix-blend-overlay"></div>
                </div>

                <div className="relative z-10 text-white max-w-lg">
                    <h1 className="text-5xl font-bold mb-6 leading-tight">
                        Speed up your work with our Web App
                    </h1>
                    <p className="text-green-100 text-lg mb-8">
                        Experience productivity like never before. Join thousands of users who have streamlined their workflow.
                    </p>

                    {/* Feature list equivalent to "Our partners" or just visual filler */}
                    <div className="flex gap-4 items-center opacity-80">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-green-800 bg-green-700 flex items-center justify-center text-xs font-bold">
                                    U{i}
                                </div>
                            ))}
                        </div>
                        <span className="text-sm font-medium">Trusted by teams everywhere</span>
                    </div>
                </div>

                <div className="relative z-10 flex gap-6 text-green-200 text-sm font-medium">
                    <span>© 2024 ContextBot</span>
                    <span>Privacy Policy</span>
                    <span>Terms of Service</span>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-16">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                            Get Started Now
                        </h2>
                        <p className="mt-2 text-gray-500">
                            Please login to your account to continue.
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
                                Email address
                            </label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition duration-200"
                                placeholder="workmail@gmail.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => navigate('/forgot-password')}
                                    className="text-sm text-green-600 hover:text-green-700 font-semibold"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <input
                                type="password"
                                required
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition duration-200"
                                placeholder="••••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-500">
                                I agree to the <a href="#" className="font-medium text-gray-900 hover:underline">Terms & Privacy</a>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 focus:ring-4 focus:ring-green-100 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform active:scale-[0.98]"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Logging in...
                                </span>
                            ) : 'Log in'}
                        </button>

                        <div className="text-center text-sm">
                            <span className="text-gray-500">Have an account? </span>
                            <button
                                type="button"
                                onClick={() => navigate('/register')}
                                className="font-bold text-green-600 hover:text-green-700"
                            >
                                Sign up
                            </button>
                        </div>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">Or</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition duration-200"
                            >
                                <img
                                    src="https://www.svgrepo.com/show/475656/google-color.svg"
                                    className="w-5 h-5"
                                    alt="Google logo"
                                />
                                <span>Login with Google</span>
                            </button>
                            {/* Apple login placeholder to match screenshot style if needed, but kept hidden or omitted to strictly follow 'no function change' unless the user insisted on exact UI match. 
                                The user said 'simlar to like that', so mimicking the layout is good. I won't add Apple login functionality as it doesn't exist.
                            */}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
