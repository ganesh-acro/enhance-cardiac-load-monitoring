import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import { useTheme } from "../components/theme-provider";
import { Lock, Mail, ArrowRight, Activity } from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login, user } = useAuth();
    const { resolvedTheme } = useTheme();
    const navigate = useNavigate();

    // If already logged in, redirect to home
    if (user) {
        return <Navigate to="/" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        // Artificial delay for premium feel
        setTimeout(() => {
            const success = login(email, password);
            if (success) {
                navigate("/");
            } else {
                setError("Invalid credentials. Please try again.");
                setIsSubmitting(false);
            }
        }, 800);
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/10 blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[35%] h-[35%] rounded-full bg-blue-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />

            {/* Main Login Card */}
            <div className="relative z-10 w-full max-w-[500px] px-6">
                <div className="animate-in fade-in zoom-in duration-700">
                    {/* Logo Section */}
                    <div className="flex flex-col items-center mb-8">
                        <img
                            src={resolvedTheme === 'dark' ? '/logo dark.png' : '/logo bright.png'}
                            alt="Enhance Health"
                            className="w-[450px] h-auto object-contain"
                        />
                    </div>

                    {/* Glassmorphic Form Container */}
                    <div className="bg-card/40 dark:bg-card/20 backdrop-blur-3xl border border-white/20 dark:border-white/5 rounded-[40px] p-12 shadow-2xl shadow-black/5 ring-1 ring-black/5">
                        <div className="mb-10">
                            <h2 className="text-3xl font-black text-foreground mb-1">Welcome back</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Input */}
                            <div className="space-y-3">
                                <label className="text-[11px] font-black tracking-widest text-muted-foreground ml-1">Email address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                        <Mail className="h-6 w-6 text-muted-foreground group-focus-within:text-brand-500 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full pl-16 pr-6 py-5 bg-background/50 border border-border/50 rounded-2xl text-base font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all placeholder:text-muted-foreground/50"
                                        placeholder=""
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[11px] font-black tracking-widest text-muted-foreground">Password</label>
                                    <a href="#" className="text-[11px] font-black tracking-widest text-brand-500 hover:text-brand-600 transition-colors">Forgot?</a>
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
                                        className="block w-full pl-16 pr-6 py-5 bg-background/50 border border-border/50 rounded-2xl text-base font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all placeholder:text-muted-foreground/50"
                                        placeholder=""
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full flex items-center justify-center gap-3 group relative overflow-hidden bg-foreground py-5 rounded-2xl font-black text-base text-background shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:hover:scale-100"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {isSubmitting ? 'Secure login...' : 'Sign in to portal'}
                                    {!isSubmitting && <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />}
                                </span>
                                {/* Hover Glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-brand-400 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </button>
                        </form>

                        {/* Footer Link */}
                        <div className="mt-10 text-center">
                            <p className="text-sm font-bold text-muted-foreground tracking-wider">
                                New organization? <a href="#" className="text-brand-500 ml-1 hover:underline">Apply for entry</a>
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
