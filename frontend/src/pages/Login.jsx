import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";

import { Shield } from "lucide-react";
import { EnhanceLogo } from "../components/common/EnhanceLogo";

export default function Login() {
    const { loginWithAuth0, user } = useAuth();

    if (user) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background">
            <div className="relative z-10 w-full max-w-[500px] px-6">
                <div className="animate-in fade-in zoom-in duration-700">
                    <div className="flex justify-center mb-8">
                        <EnhanceLogo height={96} />
                    </div>

                    <div className="bg-card border border-border rounded-xl p-12 shadow-sm">
                        <div className="mb-10">
                            <h2 className="text-4xl font-black text-foreground mb-1">Welcome back</h2>
                        </div>

                        <button
                            onClick={loginWithAuth0}
                            className="w-full flex items-center justify-center gap-3 bg-brand-500 py-5 rounded-lg font-black text-lg text-white shadow-sm hover:bg-brand-600 transition-colors"
                        >
                            <Shield className="h-5 w-5" />
                            <span>Continue with Auth0</span>
                        </button>

                        <div className="mt-10 text-center">
                            <p className="text-sm font-bold text-muted-foreground tracking-wider">
                                Contact your administrator for access.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 opacity-40">
                <span className="text-[10px] font-black tracking-widest text-muted-foreground italic">Powered by Enhance vision</span>
            </div>
        </div>
    );
}
