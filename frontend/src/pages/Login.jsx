import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";

import { Lock, Mail, ArrowRight, Shield } from "lucide-react";
import { EnhanceLogo } from "../components/common/EnhanceLogo";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, loginWithAuth0, user, isAuth0Available } = useAuth();
    const navigate = useNavigate();

    // If already logged in, redirect to home
    if (user) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        const success = await login(email, password);
        if (success) {
            navigate("/");
        } else {
            setError("Invalid credentials. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
            {/* Main Login Card */}
            <div className="relative z-10 w-full max-w-[500px] px-6">
                <div className="animate-in fade-in zoom-in duration-700">
                    {/* Logo Section */}
                    <div className="flex justify-center mb-8">
                        <EnhanceLogo height={96} />
                    </div>

                    {/* Form Container */}
                    <div className="bg-card border border-border rounded-xl p-12 shadow-sm">
                        <div className="mb-10">
                            <h2 className="text-4xl font-black text-foreground mb-1">Welcome back</h2>
                        </div>

                        {/* Auth0 Login Button */}
                        {isAuth0Available && (
                            <>
                                <button
                                    onClick={loginWithAuth0}
                                    className="w-full flex items-center justify-center gap-3 bg-brand-500 py-5 rounded-lg font-black text-lg text-white shadow-sm hover:bg-brand-600 transition-colors mb-6"
                                >
                                    <Shield className="h-5 w-5" />
                                    <span>Continue with Auth0</span>
                                </button>

                                <div className="relative mb-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-border" />
                                    </div>
                                    <div className="relative flex justify-center text-xs">
                                        <span className="bg-card px-4 text-muted-foreground font-bold tracking-widest uppercase">
                                            or sign in with email
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Input */}
                            <div className="space-y-3">
                                <label className="text-sm font-black tracking-widest text-muted-foreground ml-1">Email address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                        <Mail className="h-6 w-6 text-muted-foreground group-focus-within:text-brand-500 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-16 pr-6 py-5 bg-background border border-border rounded-lg text-lg font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-black tracking-widest text-muted-foreground">Password</label>
                                    <a href="#" className="text-sm font-black tracking-widest text-brand-500 hover:text-brand-600 transition-colors">Forgot?</a>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                        <Lock className="h-6 w-6 text-muted-foreground group-focus-within:text-brand-500 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-16 pr-6 py-5 bg-background border border-border rounded-lg text-lg font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-3 bg-foreground py-5 rounded-lg font-black text-lg text-background shadow-sm hover:opacity-90 transition-opacity disabled:opacity-70"
                            >
                                <span className="flex items-center gap-2">
                                    {isSubmitting ? 'Logging in...' : 'Log in to Portal'}
                                    {!isSubmitting && <ArrowRight className="h-5 w-5" />}
                                </span>
                            </button>
                        </form>

                        {/* Footer */}
                        <div className="mt-10 text-center">
                            <p className="text-sm font-bold text-muted-foreground tracking-wider">
                                Contact your administrator for access.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Credits */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-40">
                <span className="text-[10px] font-black tracking-widest text-muted-foreground italic">Powered by Enhance vision</span>
            </div>

        </div>
    );
}
