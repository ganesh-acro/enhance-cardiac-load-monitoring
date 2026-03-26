import { Navigate, Outlet, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/auth-context";

export default function ProtectedRoute() {
    const { user, isLoading } = useAuth();
    const [searchParams] = useSearchParams();

    // Auth0 callback in progress — wait for SDK to process the code
    const hasAuth0Callback = searchParams.has("code") && searchParams.has("state");

    if (isLoading || (hasAuth0Callback && !user)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-pulse text-brand-500 font-bold">Authenticating...</div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
