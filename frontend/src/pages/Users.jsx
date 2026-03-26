import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import {
    fetchUsers, updateUser, deleteUser, createUser, resetUserPassword,
    fetchAthletes, getAssignedAthletes, setAssignedAthletes,
} from "../utils/dataService";
import {
    ShieldCheck, UserCog, User, Loader2, Users as UsersIcon,
    Plus, Mail, Lock, Eye, EyeOff, KeyRound, Trash2, ChevronDown,
} from "lucide-react";

const ROLES = ["admin", "coach", "athlete"];
const CREATE_ROLES = ["coach", "athlete"];

const TABS = [
    { key: "view", label: "View Users", icon: UsersIcon },
    { key: "create", label: "Create User", icon: Plus },
    { key: "password", label: "Reset Password", icon: KeyRound },
    { key: "roles", label: "Assign Roles", icon: ShieldCheck },
];

const roleBadge = {
    admin: "bg-red-500/10 text-red-500 border-red-500/20",
    coach: "bg-brand-500/10 text-brand-500 border-brand-500/20",
    athlete: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

const roleIcon = {
    admin: ShieldCheck,
    coach: UserCog,
    athlete: User,
};


export default function Users() {
    const { user: currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState("view");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionMsg, setActionMsg] = useState("");

    if (currentUser?.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    const load = async () => {
        try {
            setError("");
            const data = await fetchUsers();
            setUsers(data || []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const flash = (msg) => {
        setActionMsg(msg);
        setTimeout(() => setActionMsg(""), 3000);
    };

    const handleDelete = async (id) => {
        try {
            await deleteUser(id);
            setUsers((prev) => prev.filter((u) => u.id !== id));
            flash("User deleted.");
        } catch (e) { flash(e.message); }
    };

    const handleToggleActive = async (id, active) => {
        try {
            await updateUser(id, { is_active: !active });
            setUsers((prev) => prev.map((u) => u.id === id ? { ...u, is_active: !active } : u));
            flash(active ? "User deactivated." : "User activated.");
        } catch (e) { flash(e.message); }
    };

    const handleRoleChange = async (id, role) => {
        try {
            await updateUser(id, { role });
            setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role } : u));
            flash("Role updated.");
        } catch (e) { flash(e.message); }
    };

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            <main className="container mx-auto pt-32 pb-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-2">
                            Admin <span className="text-brand-500">dashboard</span>
                        </h1>

                    </div>
                    <div className="flex items-center gap-3">
                        {actionMsg && (
                            <span className="text-xs font-bold text-brand-500 animate-in fade-in">{actionMsg}</span>
                        )}
                        <span className="text-xs font-medium text-muted-foreground px-3 py-1.5 rounded-full border border-border bg-card/50">
                            {users.length} user{users.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 p-1.5 bg-card border border-border rounded-lg mb-8 w-fit">
                    {TABS.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === key
                                ? "bg-foreground text-background shadow-lg"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold mb-6">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                    </div>
                ) : (
                    <>
                        {activeTab === "view" && (
                            <ViewUsersTab users={users} currentUser={currentUser} />
                        )}
                        {activeTab === "create" && (
                            <CreateUserTab onCreated={() => { flash("User created."); load(); }} />
                        )}
                        {activeTab === "password" && (
                            <ResetPasswordTab users={users} currentUser={currentUser} onReset={() => flash("Password reset.")} />
                        )}
                        {activeTab === "roles" && (
                            <AssignRolesTab
                                users={users}
                                currentUser={currentUser}
                                onRoleChange={handleRoleChange}
                                onDelete={handleDelete}
                                onToggleActive={handleToggleActive}
                            />
                        )}
                    </>
                )}
            </main>
        </div>
    );
}


// ── View Users Tab ──────────────────────────────────────────────────────────

function ViewUsersTab({ users, currentUser }) {
    const formatDate = (iso) => {
        if (!iso) return "\u2014";
        return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    };

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-border/50 bg-secondary/30 text-muted-foreground uppercase text-[11px] font-semibold tracking-[0.15em]">
                        <th className="text-left px-8 py-5">User</th>
                        <th className="text-left px-6 py-5">Role</th>
                        <th className="text-center px-6 py-5">Status</th>
                        <th className="text-center px-6 py-5">Auth</th>
                        <th className="text-left px-6 py-5">Joined</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => {
                        const RoleIcon = roleIcon[u.role] || User;
                        const isCurrentUser = u.email === currentUser.email;
                        const isAuth0User = u.auth_provider === "auth0";
                        return (
                            <tr key={u.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center border border-border/50">
                                            <RoleIcon className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground text-base">
                                                {u.name}
                                                {isCurrentUser && <span className="text-xs text-muted-foreground ml-2">(you)</span>}
                                            </p>
                                            <p className="text-sm text-muted-foreground">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={`text-sm font-bold px-3 py-1.5 rounded-lg border ${roleBadge[u.role]}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl border ${u.is_active
                                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                                        : "bg-red-500/10 text-red-500 border-red-500/20"
                                        }`}>
                                        <span className={`w-2 h-2 rounded-full ${u.is_active ? "bg-green-500" : "bg-red-500"}`} />
                                        {u.is_active ? "Active" : "Inactive"}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${isAuth0User
                                        ? "bg-purple-500/10 text-purple-500 border-purple-500/20"
                                        : "bg-muted/50 text-muted-foreground border-border/50"
                                        }`}>
                                        {isAuth0User ? "Auth0" : "Local"}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-sm text-muted-foreground font-medium">
                                    {formatDate(u.created_at)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}


// ── Create User Tab ─────────────────────────────────────────────────────────

function CreateUserTab({ onCreated }) {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("coach");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

        setIsSubmitting(true);
        try {
            await createUser({ name, email, password, role });
            setName(""); setEmail(""); setPassword(""); setRole("coach");
            onCreated();
        } catch (err) {
            setError(err.message || "Failed to create user.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-lg">
            <div className="bg-card border border-border rounded-xl p-10 shadow-sm">
                <h3 className="text-2xl font-bold text-foreground mb-1">New User</h3>
                <p className="text-sm text-muted-foreground font-medium mb-8">Add a new user to the platform</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold tracking-widest text-muted-foreground ml-1">FULL NAME</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-muted-foreground group-focus-within:text-brand-500 transition-colors" />
                            </div>
                            <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                                className="block w-full pl-14 pr-5 py-4 bg-background/50 border border-border/50 rounded-2xl text-base font-medium focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold tracking-widest text-muted-foreground ml-1">EMAIL ADDRESS</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-brand-500 transition-colors" />
                            </div>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-14 pr-5 py-4 bg-background/50 border border-border/50 rounded-2xl text-base font-medium focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold tracking-widest text-muted-foreground ml-1">PASSWORD</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-brand-500 transition-colors" />
                            </div>
                            <input type={showPw ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-14 pr-14 py-4 bg-background/50 border border-border/50 rounded-2xl text-base font-medium focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all" />
                            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute inset-y-0 right-0 pr-5 flex items-center text-muted-foreground hover:text-foreground transition-colors">
                                {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold tracking-widest text-muted-foreground ml-1">ROLE</label>
                        <div className="flex gap-2">
                            {CREATE_ROLES.map((r) => (
                                <button key={r} type="button" onClick={() => setRole(r)}
                                    className={`flex-1 py-3 rounded-xl text-sm font-bold border transition-all ${role === r
                                        ? `${roleBadge[r]} scale-[1.02]`
                                        : "border-border/50 text-muted-foreground hover:bg-muted/30"
                                        }`}
                                >
                                    {r.charAt(0).toUpperCase() + r.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <button type="submit" disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm bg-foreground text-background hover:opacity-90 transition-all disabled:opacity-70 shadow-lg mt-2"
                    >
                        <Plus className="h-4 w-4" />
                        {isSubmitting ? "Creating..." : "Create User"}
                    </button>
                </form>
            </div>
        </div>
    );
}


// ── Reset Password Tab ──────────────────────────────────────────────────────

function ResetPasswordTab({ users, currentUser, onReset }) {
    const [selectedUserId, setSelectedUserId] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const otherUsers = users.filter((u) => u.email !== currentUser.email);
    const selectedUser = otherUsers.find((u) => u.id === Number(selectedUserId));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!selectedUser) { setError("Select a user first."); return; }
        if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }

        setIsSubmitting(true);
        try {
            await resetUserPassword(selectedUser.id, newPassword);
            setNewPassword("");
            setSelectedUserId("");
            onReset();
        } catch (err) {
            setError(err.message || "Failed to reset password.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-lg">
            <div className="bg-card border border-border rounded-xl p-10 shadow-sm">
                <h3 className="text-2xl font-bold text-foreground mb-1">Reset Password</h3>
                <p className="text-sm text-muted-foreground font-medium mb-8">Set a new password for any user</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold tracking-widest text-muted-foreground ml-1">SELECT USER</label>
                        <div className="relative">
                            <select
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="block w-full px-5 py-4 bg-background/50 border border-border/50 rounded-2xl text-base font-medium focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all cursor-pointer appearance-none"
                            >
                                <option value="">Choose a user</option>
                                {otherUsers.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} — {u.role}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                                <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </div>
                    </div>

                    {selectedUser && (
                        <div className="p-4 rounded-2xl bg-brand-500/5 border border-brand-500/20">
                            <p className="text-xs font-semibold tracking-widest text-muted-foreground mb-1">RESETTING PASSWORD FOR</p>
                            <p className="text-base font-bold text-foreground">{selectedUser.name}</p>
                            <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-semibold tracking-widest text-muted-foreground ml-1">NEW PASSWORD</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-brand-500 transition-colors" />
                            </div>
                            <input type={showPw ? "text" : "password"} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                className="block w-full pl-14 pr-14 py-4 bg-background/50 border border-border/50 rounded-2xl text-base font-medium focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all" />
                            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute inset-y-0 right-0 pr-5 flex items-center text-muted-foreground hover:text-foreground transition-colors">
                                {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <button type="submit" disabled={isSubmitting || !selectedUser}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm bg-foreground text-background hover:opacity-90 transition-all disabled:opacity-70 shadow-lg mt-2"
                    >
                        <KeyRound className="h-4 w-4" />
                        {isSubmitting ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}


// ── Assign Roles Tab ────────────────────────────────────────────────────────

function AssignRolesTab({ users, currentUser, onRoleChange, onDelete, onToggleActive }) {
    const [assignModal, setAssignModal] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    return (
        <>
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border/50 bg-secondary/30 text-muted-foreground uppercase text-[11px] font-semibold tracking-[0.15em]">
                            <th className="text-left px-8 py-5">User</th>
                            <th className="text-left px-6 py-5">Current Role</th>
                            <th className="text-left px-6 py-5">Change Role</th>
                            <th className="text-center px-6 py-5">Status</th>
                            <th className="text-center px-6 py-5">Athletes</th>
                            <th className="text-center px-8 py-5">Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => {
                            const RoleIcon = roleIcon[u.role] || User;
                            const isSelf = u.email === currentUser.email;
                            return (
                                <tr key={u.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center border border-border/50">
                                                <RoleIcon className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground text-base">
                                                    {u.name}
                                                    {isSelf && <span className="text-xs text-muted-foreground ml-2">(you)</span>}
                                                </p>
                                                <p className="text-sm text-muted-foreground">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`text-sm font-bold px-3 py-1.5 rounded-lg border ${roleBadge[u.role]}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        <select
                                            value={u.role}
                                            onChange={(e) => onRoleChange(u.id, e.target.value)}
                                            disabled={isSelf || u.role === "admin"}
                                            className={`text-sm font-bold px-4 py-2.5 rounded-xl border cursor-pointer bg-background/50 outline-none transition-all focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 ${isSelf || u.role === "admin" ? "opacity-50 cursor-not-allowed" : ""
                                                }`}
                                        >
                                            {(u.role === "admin" ? ROLES : CREATE_ROLES).map((r) => (
                                                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <button
                                            onClick={() => !isSelf && onToggleActive(u.id, u.is_active)}
                                            disabled={isSelf}
                                            className={`inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl border transition-all ${u.is_active
                                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                                : "bg-red-500/10 text-red-500 border-red-500/20"
                                                } ${isSelf ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:opacity-80"}`}
                                        >
                                            <span className={`w-2 h-2 rounded-full ${u.is_active ? "bg-green-500" : "bg-red-500"}`} />
                                            {u.is_active ? "Active" : "Inactive"}
                                        </button>
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        {u.role === "coach" ? (
                                            <button
                                                onClick={() => setAssignModal(u)}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border border-brand-500/20 text-brand-500 bg-brand-500/5 hover:bg-brand-500/10 transition-all"
                                            >
                                                <UsersIcon className="h-4 w-4" />
                                                Assign
                                            </button>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">&mdash;</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        {isSelf ? (
                                            <span className="text-xs text-muted-foreground">&mdash;</span>
                                        ) : confirmDelete === u.id ? (
                                            <div className="flex items-center justify-center gap-3">
                                                <button onClick={() => { onDelete(u.id); setConfirmDelete(null); }} className="text-sm font-bold text-red-500 hover:underline">Confirm</button>
                                                <button onClick={() => setConfirmDelete(null)} className="text-sm font-bold text-muted-foreground hover:underline">Cancel</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setConfirmDelete(u.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all">
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {assignModal && (
                <AssignAthletesModal
                    user={assignModal}
                    onClose={() => setAssignModal(null)}
                    onSave={() => setAssignModal(null)}
                />
            )}
        </>
    );
}


// ── Assign Athletes Modal (shared) ─────────────────────────────────────────

function AssignAthletesModal({ user, onClose, onSave }) {
    const [allAthletes, setAllAthletes] = useState([]);
    const [selected, setSelected] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [athletes, assigned] = await Promise.all([
                    fetchAthletes(),
                    getAssignedAthletes(user.id),
                ]);
                setAllAthletes(athletes || []);
                setSelected(new Set(assigned || []));
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user.id]);

    const toggle = (id) => {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        if (selected.size === allAthletes.length) setSelected(new Set());
        else setSelected(new Set(allAthletes.map((a) => a.id)));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await setAssignedAthletes(user.id, [...selected]);
            onSave();
            onClose();
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 animate-in fade-in duration-200" onClick={onClose} />
            <div className="relative z-10 w-full max-w-[500px] mx-6 bg-card border border-border rounded-xl p-8 shadow-md ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-300">
                <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-lg hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
                    <span className="text-lg font-bold">&times;</span>
                </button>

                <h3 className="text-2xl font-bold text-foreground mb-1">Assign Athletes</h3>
                <p className="text-base text-muted-foreground font-medium mb-6">
                    Select athletes for <span className="text-brand-500 font-bold">{user.name}</span>
                </p>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                                {selected.size} of {allAthletes.length} selected
                            </span>
                            <button onClick={selectAll} className="text-xs font-bold text-brand-500 hover:underline">
                                {selected.size === allAthletes.length ? "Deselect all" : "Select all"}
                            </button>
                        </div>

                        <div className="max-h-[320px] overflow-y-auto space-y-1.5 pr-1">
                            {allAthletes.map((a) => (
                                <label key={a.id}
                                    className={`flex items-center gap-3 p-3.5 rounded-xl cursor-pointer transition-all border ${selected.has(a.id) ? "bg-brand-500/5 border-brand-500/20" : "bg-transparent border-transparent hover:bg-muted/30"
                                        }`}
                                >
                                    <input type="checkbox" checked={selected.has(a.id)} onChange={() => toggle(a.id)} className="accent-brand-500 w-4.5 h-4.5 rounded" />
                                    <img src={a.img || `https://api.dicebear.com/7.x/avataaars/svg?seed=${a.name}`} alt={a.name} className="w-10 h-10 rounded-full object-cover bg-muted/50" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base font-medium text-foreground truncate">{a.name}</p>
                                        <p className="text-sm text-muted-foreground">{a.sport || "N/A"} &middot; {a.id}</p>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button onClick={onClose} className="flex-1 py-3.5 rounded-xl font-bold text-base border border-border hover:bg-muted/30 transition-all">Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="flex-1 py-3.5 rounded-xl font-bold text-base bg-foreground text-background hover:opacity-90 transition-all disabled:opacity-70">
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
