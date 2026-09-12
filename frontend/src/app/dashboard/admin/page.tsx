'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/services/api';
import type { AdminDashboard, User, NgoProfile } from '@/types';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';
import { AlertCircle, CheckCircle, XCircle, Eye, ShieldAlert, Users, TreePine, FileText, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pendingNgos, setPendingNgos] = useState<NgoProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'users' | 'verification'>('overview');
  const [selectedNgo, setSelectedNgo] = useState<NgoProfile | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminApi.getDashboard().then(r => setDashboard(r.data.data)),
      adminApi.getUsers().then(r => setUsers(r.data.data)),
      adminApi.getNgos({ status: 'pending' }).then(r => setPendingNgos(r.data.data)),
    ]).finally(() => setLoading(false));
  }, []);

  const handleToggleBan = async (userId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        await adminApi.unbanUser(userId);
        toast.success('User unbanned successfully');
      } else {
        await adminApi.banUser(userId);
        toast.success('User banned successfully');
      }
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_banned: !currentStatus } : u));
    } catch {
      toast.error(currentStatus ? 'Failed to unban user' : 'Failed to ban user');
    }
  };

  const handleApprove = async (ngoId: string) => {
    setActionLoading(ngoId);
    try {
      await adminApi.approveNgo(ngoId);
      setPendingNgos(prev => prev.filter(n => n.id !== ngoId));
      setSelectedNgo(null);
      toast.success('NGO approved successfully');
    } catch (err) {
      toast.error('Failed to approve NGO');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (ngoId: string) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;
    
    setActionLoading(ngoId);
    try {
      await adminApi.rejectNgo(ngoId, reason);
      setPendingNgos(prev => prev.filter(n => n.id !== ngoId));
      setSelectedNgo(null);
      toast.success('NGO application rejected');
    } catch (err) {
      toast.error('Failed to reject NGO');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="page-container p-8">
        <Skeleton height={40} width="300px" className="mb-4" />
        <Skeleton height={20} width="500px" className="mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height={120} className="rounded-3xl" />
          ))}
        </div>
        <Skeleton height={400} className="rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="page-container max-w-7xl mx-auto p-4 md:p-8 relative">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/20 rounded-full blur-[120px]" />
      </div>

      <header className="mb-10 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3 text-emerald-600 mb-2"
        >
          <ShieldAlert size={24} />
          <span className="font-bold tracking-wider uppercase text-sm">Administrator Portal</span>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl font-black text-gray-900 mb-2"
        >
          Platform Management
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-500 text-lg"
        >
          Monitor growth, verify organizations, and maintain community safety.
        </motion.p>
      </header>

      {/* Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex p-1 bg-white/50 backdrop-blur-md border border-white rounded-2xl w-fit mb-10 relative z-10 shadow-xl shadow-emerald-900/5"
      >
        {[
          { id: 'overview', label: 'Overview', icon: LayoutDashboard },
          { id: 'users', label: 'User Directory', icon: Users },
          { id: 'verification', label: 'NGO Verification', icon: CheckCircle, count: pendingNgos.length },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
              tab === t.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <t.icon size={18} />
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${tab === t.id ? 'bg-white text-emerald-600' : 'bg-red-500 text-white'} animate-bounce`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        {tab === 'overview' && dashboard && (
          <motion.div 
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-10 relative z-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { icon: Users, label: "Total Users", value: dashboard.total_users, color: "blue", delay: 0 },
                { icon: TreePine, label: "Total Plants", value: dashboard.total_plants, color: "emerald", delay: 0.1 },
                { icon: CheckCircle, label: "Adoptions", value: dashboard.total_adoptions, color: "purple", delay: 0.2 },
                { icon: FileText, label: "Total Posts", value: dashboard.total_posts, color: "orange", delay: 0.3 },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: s.delay }}
                >
                  <StatCard icon={s.icon} label={s.label} value={s.value} color={s.color} />
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.4 }}
                 className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] border border-white shadow-xl shadow-emerald-900/5"
               >
                  <h3 className="text-xl font-bold mb-6 text-gray-900 border-b border-gray-100 pb-4">User Breakdown</h3>
                  <div className="space-y-6">
                    <BreakdownRow label="Adopters" value={dashboard.total_adopters} total={dashboard.total_users} color="bg-blue-500" />
                    <BreakdownRow label="Approved NGOs" value={dashboard.total_ngos} total={dashboard.total_users} color="bg-emerald-500" />
                    <BreakdownRow label="Growth Reports" value={dashboard.total_reports} total={dashboard.total_plants} color="bg-orange-500" />
                  </div>
               </motion.div>
               <motion.div 
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.5 }}
                 className="md:col-span-2 bg-emerald-600 rounded-[2.5rem] p-10 text-white flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-emerald-200"
               >
                  <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
                    <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-white rounded-full blur-[100px]" />
                  </div>
                  <TreePine size={180} className="absolute -bottom-16 -right-16 text-emerald-400/30" />
                  <div className="relative z-10">
                    <h3 className="text-3xl font-black mb-4">Welcome Back, Admin</h3>
                    <p className="text-emerald-50 text-lg max-w-md leading-relaxed">
                      There are currently <span className="font-black text-white">{pendingNgos.length}</span> NGO applications awaiting your review. Quick verification helps onboard new contributors faster.
                    </p>
                  </div>
                  <button 
                    onClick={() => setTab('verification')} 
                    className="mt-8 px-8 py-4 bg-white text-emerald-600 font-bold rounded-2xl w-fit hover:bg-emerald-50 transition-all hover:scale-105 shadow-xl"
                  >
                    Go to Verification
                  </button>
               </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        {tab === 'users' && (
          <motion.div 
            key="users"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-white shadow-xl shadow-emerald-900/5 overflow-hidden relative z-10"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-emerald-50/50 border-b border-white">
                    <th className="px-8 py-5 text-sm font-bold text-emerald-900 uppercase tracking-wider">User Profile</th>
                    <th className="px-8 py-5 text-sm font-bold text-emerald-900 uppercase tracking-wider">Role</th>
                    <th className="px-8 py-5 text-sm font-bold text-emerald-900 uppercase tracking-wider">Status</th>
                    <th className="px-8 py-5 text-sm font-bold text-emerald-900 uppercase tracking-wider">Joined</th>
                    <th className="px-8 py-5 text-sm font-bold text-emerald-900 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50/50">
                  {users.map((u, i) => (
                    <motion.tr 
                      key={u.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/50 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center font-black text-emerald-700 text-lg border border-white shadow-inner">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt="" className="w-full h-full object-cover rounded-2xl" />
                            ) : (u.display_name || u.username)[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{u.display_name || u.username}</p>
                            <p className="text-sm text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <Badge status={u.role as any} />
                      </td>
                      <td className="px-8 py-6">
                        {u.is_banned ? (
                          <span className="flex items-center gap-2 text-red-600 font-bold text-sm">
                            <XCircle size={16} /> Banned
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                            <CheckCircle size={16} /> Active
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-500 font-medium whitespace-nowrap">
                        {new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm ${
                            u.is_banned ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'
                          }`}
                          onClick={() => handleToggleBan(u.id, !!u.is_banned)}
                        >
                          {u.is_banned ? 'Unban User' : 'Ban User'}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {tab === 'verification' && (
          <motion.div 
            key="verification"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10"
          >
            {pendingNgos.length === 0 ? (
              <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border-2 border-dashed border-emerald-100 p-20 text-center shadow-xl shadow-emerald-900/5">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Queue is Empty</h3>
                <p className="text-gray-500 text-lg">All NGO applications have been processed. Great job!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingNgos.map((ngo, i) => (
                  <motion.div 
                    key={ngo.id} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-white shadow-xl shadow-emerald-900/5 p-8 hover:shadow-2xl hover:shadow-emerald-200 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                       <AlertCircle size={80} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-1">{ngo.org_name}</h3>
                    <p className="text-emerald-600 font-bold text-sm mb-6 flex items-center gap-1">
                      <FileText size={14} /> Darpan ID: {ngo.darpan_id || 'N/A'}
                    </p>
                    
                    <div className="space-y-4 mb-8">
                      <div className="bg-emerald-50/50 p-4 rounded-2xl border border-white">
                         <p className="text-xs font-bold text-emerald-800/40 uppercase mb-1">Mission Preview</p>
                         <p className="text-sm text-emerald-900 font-medium line-clamp-2 italic">"{ngo.mission || 'No mission statement provided'}"</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                           <p className="text-xs font-bold text-gray-400 uppercase">Registration</p>
                           <p className="text-sm font-bold text-gray-700">{ngo.registration_number || 'N/A'}</p>
                        </div>
                        <div className="flex-1">
                           <p className="text-xs font-bold text-gray-400 uppercase">Location</p>
                           <p className="text-sm font-bold text-gray-700">{ngo.address || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <button 
                        onClick={() => setSelectedNgo(ngo)}
                        className="flex-1 py-3 bg-white border border-gray-100 hover:bg-emerald-50 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm"
                      >
                        <Eye size={18} /> Review
                      </button>
                      <button 
                        onClick={() => handleApprove(ngo.id as string)}
                        disabled={actionLoading === ngo.id}
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200"
                      >
                        {actionLoading === ngo.id ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Approve'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {/* Verification Modal */}
      {selectedNgo && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <header className="bg-gray-50 p-8 flex items-center justify-between border-b border-gray-100">
               <div>
                  <h2 className="text-2xl font-black text-gray-900">{selectedNgo.org_name}</h2>
                  <p className="text-emerald-600 font-bold">Verification Dossier</p>
               </div>
               <button onClick={() => setSelectedNgo(null)} className="w-10 h-10 rounded-full hover:bg-white flex items-center justify-center transition-colors">
                  <XCircle size={24} className="text-gray-400" />
               </button>
            </header>
            
            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-6 mb-8">
                 <DetailItem label="Darpan ID" value={selectedNgo.darpan_id} />
                 <DetailItem label="Registration #" value={selectedNgo.registration_number} />
                 <DetailItem label="Website" value={selectedNgo.website} link />
                 <DetailItem label="Base Address" value={selectedNgo.address} />
              </div>

              <div className="mb-8 p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
                 <h4 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-2">
                    <CheckCircle size={14} /> Questionnaire Responses
                 </h4>
                 <div className="space-y-6">
                    {Object.entries(selectedNgo.onboarding_answers || {}).map(([key, val]) => (
                      <div key={key}>
                         <p className="text-sm font-bold text-gray-900 mb-1 capitalize">{key.replace(/_/g, ' ')}</p>
                         <p className="text-sm text-gray-600 leading-relaxed bg-white p-4 rounded-xl border border-gray-100">
                           {val}
                         </p>
                      </div>
                    ))}
                    {!selectedNgo.onboarding_answers && (
                      <p className="text-sm text-gray-500 italic">No questionnaire data available.</p>
                    )}
                 </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4">
              <button 
                onClick={() => handleReject(selectedNgo.id as string)}
                className="flex-1 py-4 bg-white border-2 border-red-100 text-red-600 font-bold rounded-2xl hover:bg-red-50 transition-all flex items-center justify-center gap-2"
              >
                <XCircle size={20} /> Reject Application
              </button>
              <button 
                onClick={() => handleApprove(selectedNgo.id as string)}
                className="flex-[2] py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} /> Approve NGO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: string }) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-50',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-50',
    purple: 'bg-purple-50 text-purple-600 border-purple-100 shadow-purple-50',
    orange: 'bg-orange-50 text-orange-600 border-orange-100 shadow-orange-50',
  };

  return (
    <div className={`p-8 rounded-[2rem] border shadow-sm ${colors[color]} transition-transform hover:scale-[1.02] duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <Icon size={24} />
      </div>
      <p className="text-sm font-bold opacity-80 mb-1 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-black tracking-tight">{value || 0}</p>
    </div>
  );
}

function BreakdownRow({ label, value, total, color }: { label: string, value: number, total: number, color: string }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-bold">
        <span className="text-gray-500">{label}</span>
        <span className="text-gray-900">{value}</span>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all duration-1000`} 
          style={{ width: `${percentage}%` }} 
        />
      </div>
    </div>
  );
}

function DetailItem({ label, value, link }: { label: string, value: any, link?: boolean }) {
  return (
    <div>
       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
       {link && value ? (
         <a href={value} target="_blank" className="text-sm font-bold text-emerald-600 hover:underline break-all">{value}</a>
       ) : (
         <p className="text-sm font-bold text-gray-900">{value || 'N/A'}</p>
       )}
    </div>
  );
}
