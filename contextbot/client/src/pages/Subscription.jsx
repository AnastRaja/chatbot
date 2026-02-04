import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const CheckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const Subscription = () => {
    const { user, syncUser } = useAppContext();
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        console.log('Subscription Page - User:', user);
        console.log('Subscription Page - Plan:', user?.subscription?.plan);
    }, [user]);

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        if (query.get('success') === 'true' && query.get('subscription_id')) {
            verifySubscription(query.get('subscription_id'));
        }
    }, [location]);

    const verifySubscription = async (subscriptionId) => {
        setLoading(true);
        try {
            const response = await fetch('/api/payments/verify-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    subscriptionId,
                    userId: user?.uid
                })
            });
            const data = await response.json();
            if (data.success) {
                alert(`Successfully upgraded to ${data.plan} plan!`);
                await syncUser(); // Refresh user state from backend
                navigate('/');
            } else {
                alert('Subscription verification failed. Please contact support.');
            }
        } catch (error) {
            console.error('Verification error:', error);
            alert('Something went wrong during verification.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async (planKey) => {
        setLoading(true);
        try {
            // Product IDs for Dodo Payments (Test Mode)
            const productIds = {
                'starter': 'pdt_0NXkYjtOdaPqAJ2dtluNG',
                'pro': 'pdt_0NXkYqWNBTn5p9rtp5oGY'
            };

            const productId = productIds[planKey];
            if (!productId) return;

            const response = await fetch('/api/payments/checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    productId,
                    userEmail: user?.email,
                    userId: user?.uid
                })
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert('Failed to initiate checkout. Please try again.');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const currentPlan = user?.subscription?.plan || 'free';

    const plans = [
        {
            key: 'free',
            name: 'Free',
            description: 'For AI enthusiasts',
            price: '$0',
            originalPrice: '',
            features: [
                '1 Project',
                '20 MB storage',
                '1,000 AI responses/month',
                'GPT-4o mini',
                'Branded widget (15 days trial)'
            ],
            buttonText: currentPlan === 'free' ? 'Current Plan' : 'Free',
            isPopular: false,
            highlight: false,
            action: null
        },
        {
            key: 'starter',
            name: 'Starter',
            description: 'For freelancers & solopreneurs',
            price: '$29',
            originalPrice: '$39',
            period: '/month',
            features: [
                '5 Projects',
                '200 MB storage',
                '10,000 AI responses/month',
                'GPT-4o mini',
                'Unbranded widget',
                'Email support'
            ],
            buttonText: currentPlan === 'starter' ? 'Current Plan' : 'Upgrade to Starter',
            isPopular: true,
            highlight: true,
            action: currentPlan === 'starter' ? null : () => handleSubscribe('starter')
        },
        {
            key: 'pro',
            name: 'Pro',
            description: 'For professionals & teams',
            price: '$89',
            originalPrice: '$109',
            period: '/month',
            features: [
                'Unlimited projects',
                '1 GB storage',
                '50,000 AI responses/month',
                'GPT-4o + GPT-4o mini',
                'Priority support'
            ],
            buttonText: currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
            isPopular: false,
            highlight: false,
            action: currentPlan === 'pro' ? null : () => handleSubscribe('pro')
        }
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Choose Your Plan</h2>
                <p className="text-slate-500 max-w-2xl mx-auto">
                    Unlock more power and features to build better AI agents.
                </p>
                {/* Yearly toggle removed as per request */}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
                {plans.map((plan, index) => (
                    <div
                        key={index}
                        className={`relative rounded-2xl p-8 transition-all duration-300 ${plan.highlight
                            ? 'bg-[#0B1120] text-white shadow-xl shadow-blue-900/20 scale-105 border border-slate-700/50'
                            : 'bg-white text-slate-800 shadow-sm border border-slate-200 hover:shadow-md'
                            }`}
                    >
                        {plan.isPopular && (
                            <div className="absolute top-0 right-0 -mr-[1px] -mt-3.5">
                                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-md">
                                    Most Popular
                                </span>
                            </div>
                        )}

                        <div className="mb-8">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${plan.highlight ? 'bg-slate-700/50' : 'bg-slate-100'}`}>
                                {index === 0 && (
                                    <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                )}
                                {index === 1 && (
                                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                )}
                                {index === 2 && (
                                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                )}
                            </div>

                            <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                            <p className={`text-sm ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{plan.description}</p>
                        </div>

                        <div className="mb-8">
                            <div className="flex items-baseline gap-1">
                                <span className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                                {plan.originalPrice && (
                                    <span className={`text-lg font-medium line-through decoration-slate-500/50 ${plan.highlight ? 'text-slate-600' : 'text-slate-300'}`}>{plan.originalPrice}</span>
                                )}
                            </div>
                            {plan.period && <p className={`text-sm mt-1 ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>billed {plan.period.replace('/', '')}</p>}
                        </div>

                        <button
                            onClick={plan.action}
                            disabled={!plan.action || loading}
                            className={`w-full py-3.5 px-4 rounded-xl font-semibold transition-all duration-200 mb-8 ${plan.highlight
                                ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-900/20'
                                : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-800 hover:text-slate-900'
                                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading && plan.action ? 'Processing...' : plan.buttonText}
                        </button>

                        <div className="space-y-4">
                            {plan.features.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-3">
                                    <div className={`mt-0.5 rounded-full p-0.5 ${plan.highlight ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                        <CheckIcon className={`w-3.5 h-3.5 ${plan.highlight ? 'text-white' : 'text-slate-600'}`} />
                                    </div>
                                    <span className={`text-sm ${plan.highlight ? 'text-slate-300' : 'text-slate-600'}`}>
                                        {feature}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Subscription;
