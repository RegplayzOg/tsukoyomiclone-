"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Search, 
  Edit2, 
  Shield, 
  Tag as TagIcon, 
  Key, 
  Loader2,
  ExternalLink,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllUsersAction, adminUpdateUserAction, getCurrentUserAction, getReportsAction } from "@/app/actions";
import Link from "next/link";
import { AdminReportList } from "./reports/AdminReportList";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  tag?: string;
  tag_color?: string;
  xp: number;
  rank: string;
  created_at: string;
}

export default function AdminContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'reports'>('users');
  const [reportType, setReportType] = useState<'anime' | 'user'>('anime');

  const fetchData = async () => {
    setLoading(true);
    const usersData = await getAllUsersAction();
    const reportsData = await getReportsAction(reportType);
    if (Array.isArray(usersData)) setUsers(usersData as User[]);
    if (Array.isArray(reportsData)) setReports(reportsData);
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const user = await getCurrentUserAction();
      setCurrentUser(user as User);
      fetchData();
    };
    init();
  }, [reportType]);

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/5 pb-4">
        <button 
          onClick={() => setActiveTab('users')}
          className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'users' ? "bg-[#e2a84b]/10 border border-[#e2a84b]/20 text-[#e2a84b]" : "text-white/40")}
        >
          <Users size={16} />
          Users
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all", activeTab === 'reports' ? "bg-[#e2a84b]/10 border border-[#e2a84b]/20 text-[#e2a84b]" : "text-white/40")}
        >
          <AlertTriangle size={16} />
          Reports
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-2.5 text-white/20" size={18} />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0e0c0c] border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#e2a84b]/50"
              />
            </div>
            <div className="text-xs text-white/40 font-mono">
              {filteredUsers.length} total users
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] text-[10px] font-black uppercase tracking-widest text-white/40">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role / Tag</th>
                  <th className="px-6 py-4">XP / Rank</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <Loader2 className="animate-spin mx-auto text-[#e2a84b]" size={32} />
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-white/20 text-sm">
                      No users found
                    </td>
                  </tr>
                ) : filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.01] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0e0c0c] border border-white/5 flex items-center justify-center font-bold text-[#e2a84b]">
                          {user.username[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{user.username}</span>
                          <span className="text-[11px] text-white/30">{user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter",
                          user.role === 'admin' ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        )}>
                          {user.role}
                        </span>
                        {user.tag && (
                          <span className="px-2 py-0.5 rounded bg-[#e2a84b]/10 text-[#e2a84b] border border-[#e2a84b]/20 text-[9px] font-black uppercase tracking-tighter">
                            {user.tag}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-[#e2a84b]">{user.xp} XP</span>
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">{user.rank}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-white/30 font-mono">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={async () => {
                            const newRole = user.role === 'admin' ? 'user' : 'admin';
                            if (currentUser?.id === user.id && newRole === 'user') {
                              if (!confirm("Are you sure you want to remove your own admin privileges? You will lose access to this dashboard.")) return;
                            }
                            await adminUpdateUserAction(user.id, { role: newRole, tag: user.tag });
                            fetchData();
                          }}
                          title={user.role === 'admin' ? "Demote to User" : "Promote to Admin"}
                          className={cn(
                            "p-2 rounded-lg transition-all border",
                            user.role === 'admin' 
                              ? "bg-purple-500/10 border-purple-500/20 text-purple-400 hover:bg-purple-500/20" 
                              : "bg-white/5 border-white/5 text-white/20 hover:text-white hover:border-white/10"
                          )}
                        >
                          <Shield size={16} />
                        </button>
                        <Link href={`/user/${user.id}`} className="p-2 hover:bg-white/5 border border-transparent rounded-lg text-white/20 hover:text-[#e2a84b] transition-all">
                          <ExternalLink size={16} />
                        </Link>
                        <button 
                          onClick={() => setEditingUser(user)}
                          className="p-2 hover:bg-white/5 border border-transparent rounded-lg text-white/20 hover:text-white transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex gap-4">
            <button onClick={() => setReportType('anime')} className={cn("px-4 py-2 rounded text-sm font-bold", reportType === 'anime' ? "bg-[#e2a84b] text-black" : "bg-white/5")}>Anime Reports</button>
            <button onClick={() => setReportType('user')} className={cn("px-4 py-2 rounded text-sm font-bold", reportType === 'user' ? "bg-[#e2a84b] text-black" : "bg-white/5")}>User Reports</button>
          </div>
          <AdminReportList reports={reports} type={reportType} page={1} />
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
          onSave={fetchData}
        />
      )}
    </div>
  );
}

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSave: () => void;
}

function EditUserModal({ user, onClose, onSave }: EditUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      tag: formData.get("tag"),
      tag_color: formData.get("tag_color"),
      role: formData.get("role"),
      password: formData.get("password")
    };

    const result = await adminUpdateUserAction(user.id, data);
    if (result.success) {
      onSave();
      onClose();
    } else {
      setError(result.error || "Update failed");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-lg font-bold">Edit User: <span className="text-[#e2a84b]">{user.username}</span></h3>
          <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && <div className="text-xs text-red-400 bg-red-400/10 p-2 rounded">{error}</div>}
          
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Custom Tag</label>
            <div className="relative">
              <TagIcon className="absolute left-3 top-3 text-white/20" size={16} />
              <input name="tag" defaultValue={user.tag || ''} placeholder="e.g. OWNER" className="w-full bg-[#0e0c0c] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#e2a84b]" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Tag Color</label>
            <div className="grid grid-cols-4 gap-2">
              {['red', 'yellow', 'green', 'blue'].map((color) => (
                <label key={color} className="relative cursor-pointer">
                  <input 
                    type="radio" 
                    name="tag_color" 
                    value={color} 
                    defaultChecked={user.tag_color === color}
                    className="peer sr-only"
                  />
                  <div className={cn(
                    "h-10 rounded-xl border border-white/5 flex items-center justify-center transition-all peer-checked:border-white peer-checked:scale-105",
                    color === 'red' ? "bg-red-500/20 text-red-400" :
                    color === 'yellow' ? "bg-yellow-500/20 text-yellow-400" :
                    color === 'green' ? "bg-green-500/20 text-green-400" :
                    "bg-blue-500/20 text-blue-400"
                  )}>
                    <div className={cn("w-3 h-3 rounded-full", 
                      color === 'red' ? "bg-red-500" :
                      color === 'yellow' ? "bg-yellow-500" :
                      color === 'green' ? "bg-green-500" :
                      "bg-blue-500"
                    )} />
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Role</label>
            <div className="relative">
              <Shield className="absolute left-3 top-3 text-white/20" size={16} />
              <select name="role" defaultValue={user.role} className="w-full bg-[#0e0c0c] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none appearance-none focus:border-[#e2a84b]">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-white/40 tracking-widest">Force Password Change</label>
            <div className="relative">
              <Key className="absolute left-3 top-3 text-white/20" size={16} />
              <input name="password" type="password" placeholder="Leave blank to keep current" className="w-full bg-[#0e0c0c] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#e2a84b]" />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-sm font-bold hover:bg-white/10 transition-colors">
              Cancel
            </button>
            <button disabled={loading} className="flex-1 px-4 py-3 rounded-xl bg-[#e2a84b] text-[#07060d] text-sm font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2">
              {loading && <Loader2 className="animate-spin" size={16} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
