import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth-context";
import {
    fetchUsers, updateUser, deleteUser,
    fetchAthletes, getAssignedAthletes, setAssignedAthletes,
} from "../utils/dataService";
import { Trash2, ShieldCheck, UserCog, User, Loader2, Users as UsersIcon, X } from "lucide-react";

const ROLES = ["admin", "coach", "athlete"];

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
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionMsg, setActionMsg] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [assignModal, setAssignModal] = useState(null); // user object or null

    // Redirect non-admins
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

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateUser(userId, { role: newRole });
            setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
            flash("Role updated.");
        } catch (e) {
            flash(e.message);
        }
    };

    const handleToggleActive = async (userId, currentlyActive) => {
        try {
            await updateUser(userId, { is_active: !currentlyActive });
            setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, is_active: !currentlyActive } : u)));
            flash(currentlyActive ? "User deactivated." : "User activated.");
        } catch (e) {
            flash(e.message);
        }
    };

    const handleDelete = async (userId) => {
        try {
            await deleteUser(userId);
            setUsers((prev) => prev.filter((u) => u.id !== userId));
            setConfirmDelete(null);
            flash("User deleted.");
        } catch (e) {
            flash(e.message);
            setConfirmDelete(null);
        }
    };

    const formatDate = (iso) => {
        if (!iso) return "\u2014";
        return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    };

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            <main className="container mx-auto pt-32 pb-12 shadow-none">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-2">
                            User <span className="text-brand-500">management</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {actionMsg && (
                            <span className="text-xs font-bold text-brand-500 animate-in fade-in">{actionMsg}</span>
                        )}
                        <span className="text-xs font-bold text-muted-foreground px-3 py-1.5 rounded-full border border-border bg-card/50">
                            {users.length} user{users.length !== 1 ? "s" : ""}
                        </span>
                    </div>
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
                    <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl overflow-hidden shadow-xl">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border/50 text-muted-foreground">
                                    <th className="text-left font-black text-[11px] tracking-widest uppercase px-6 py-4">User</th>
                                    <th className="text-left font-black text-[11px] tracking-widest uppercase px-6 py-4">Role</th>
                                    <th className="text-center font-black text-[11px] tracking-widest uppercase px-6 py-4">Status</th>
                                    <th className="text-left font-black text-[11px] tracking-widest uppercase px-6 py-4">Joined</th>
                                    <th className="text-center font-black text-[11px] tracking-widest uppercase px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => {
                                    const RoleIcon = roleIcon[u.role] || User;
                                    const isCurrentUser = u.email === currentUser.email;
                                    const isCoach = u.role === "coach";
                                    return (
                                        <tr key={u.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                                            {/* User info */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-muted/50 flex items-center justify-center">
                                                        <RoleIcon className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-foreground">
                                                            {u.name}
                                                            {isCurrentUser && <span className="text-[10px] text-muted-foreground ml-2">(you)</span>}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role dropdown */}
                                            <td className="px-6 py-4">
                                                <select
                                                    value={u.role}
                                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                    disabled={isCurrentUser}
                                                    className={`text-xs font-black px-3 py-1.5 rounded-lg border cursor-pointer bg-transparent outline-none transition-all ${roleBadge[u.role]} ${isCurrentUser ? "opacity-50 cursor-not-allowed" : ""}`}
                                                >
                                                    {ROLES.map((r) => (
                                                        <option key={r} value={r}>{r}</option>
                                                    ))}
                                                </select>
                                            </td>

                                            {/* Active toggle */}
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleToggleActive(u.id, u.is_active)}
                                                    disabled={isCurrentUser}
                                                    className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-lg border transition-all ${u.is_active
                                                            ? "bg-green-500/10 text-green-500 border-green-500/20"
                                                            : "bg-red-500/10 text-red-500 border-red-500/20"
                                                        } ${isCurrentUser ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-105"}`}
                                                >
                                                    <span className={`w-2 h-2 rounded-full ${u.is_active ? "bg-green-500" : "bg-red-500"}`} />
                                                    {u.is_active ? "Active" : "Inactive"}
                                                </button>
                                            </td>

                                            {/* Joined date */}
                                            <td className="px-6 py-4 text-xs text-muted-foreground font-bold">
                                                {formatDate(u.created_at)}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    {/* Assign Athletes — only for coaches */}
                                                    {isCoach && (
                                                        <button
                                                            onClick={() => setAssignModal(u)}
                                                            className="p-2 rounded-lg hover:bg-brand-500/10 text-muted-foreground hover:text-brand-500 transition-all"
                                                            title="Assign athletes"
                                                        >
                                                            <UsersIcon className="h-4 w-4" />
                                                        </button>
                                                    )}

                                                    {/* Delete */}
                                                    {isCurrentUser ? (
                                                        <span className="text-[10px] text-muted-foreground px-2">{!isCoach ? "\u2014" : ""}</span>
                                                    ) : confirmDelete === u.id ? (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleDelete(u.id)}
                                                                className="text-[11px] font-black text-red-500 hover:underline"
                                                            >
                                                                Confirm
                                                            </button>
                                                            <button
                                                                onClick={() => setConfirmDelete(null)}
                                                                className="text-[11px] font-black text-muted-foreground hover:underline"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setConfirmDelete(u.id)}
                                                            className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Assign Athletes Modal */}
            {assignModal && (
                <AssignAthletesModal
                    user={assignModal}
                    onClose={() => setAssignModal(null)}
                    onSave={() => flash("Athletes assigned.")}
                />
            )}
        </div>
    );
}


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
        if (selected.size === allAthletes.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(allAthletes.map((a) => a.id)));
        }
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
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
            <div className="relative z-10 w-full max-w-[500px] mx-6 bg-card/95 dark:bg-card/90 backdrop-blur-3xl border border-white/20 dark:border-white/5 rounded-[32px] p-8 shadow-2xl shadow-black/10 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-300">
                <button onClick={onClose} className="absolute top-5 right-5 p-2 rounded-full hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground">
                    <X className="h-5 w-5" />
                </button>

                <h3 className="text-xl font-black text-foreground mb-1">Assign Athletes</h3>
                <p className="text-sm text-muted-foreground font-bold mb-6">
                    Select athletes for <span className="text-brand-500">{user.name}</span>
                </p>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-black tracking-widest text-muted-foreground uppercase">
                                {selected.size} of {allAthletes.length} selected
                            </span>
                            <button
                                onClick={selectAll}
                                className="text-[11px] font-black text-brand-500 hover:underline"
                            >
                                {selected.size === allAthletes.length ? "Deselect all" : "Select all"}
                            </button>
                        </div>

                        <div className="max-h-[320px] overflow-y-auto space-y-1.5 pr-1">
                            {allAthletes.map((a) => (
                                <label
                                    key={a.id}
                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                                        selected.has(a.id)
                                            ? "bg-brand-500/5 border-brand-500/20"
                                            : "bg-transparent border-transparent hover:bg-muted/30"
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selected.has(a.id)}
                                        onChange={() => toggle(a.id)}
                                        className="accent-brand-500 w-4 h-4 rounded"
                                    />
                                    <img
                                        src={a.img || `https://api.dicebear.com/7.x/avataaars/svg?seed=${a.name}`}
                                        alt={a.name}
                                        className="w-8 h-8 rounded-full object-cover bg-muted/50"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-foreground truncate">{a.name}</p>
                                        <p className="text-[11px] text-muted-foreground">{a.sport || "N/A"} &middot; {a.id}</p>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={onClose}
                                className="flex-1 py-3 rounded-xl font-black text-sm border border-border hover:bg-muted/30 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex-1 py-3 rounded-xl font-black text-sm bg-foreground text-background hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70"
                            >
                                {saving ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
