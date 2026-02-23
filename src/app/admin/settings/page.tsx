"use client";

import { useSession } from "next-auth/react";
import { Shield, Database, HardDrive, Globe } from "lucide-react";

export default function AdminSettingsPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Platform configuration and admin account info</p>
      </div>

      {/* Admin Account */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-900">Admin Account</h2>
            <p className="text-xs text-slate-500">Your administrator details</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase">Name</label>
            <p className="text-sm font-medium text-slate-900 mt-0.5">{session?.user?.name || "—"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase">Email</label>
            <p className="text-sm font-medium text-slate-900 mt-0.5">{session?.user?.email || "—"}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase">Role</label>
            <p className="text-sm font-medium text-slate-900 mt-0.5 capitalize">{session?.user?.role || "—"}</p>
          </div>
        </div>
      </div>

      {/* Environment Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Globe className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-900">Environment</h2>
            <p className="text-xs text-slate-500">Application configuration status</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-600">Database</span>
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Connected</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-50">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-600">R2 Storage</span>
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Configured</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-600">Auth Provider</span>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full">Credentials + Google</span>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-bold text-sm text-slate-900 mb-4">Quick References</h2>
        <div className="space-y-2 text-sm">
          <p className="text-slate-500">
            To change admin password, see <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">PASSWORD_GUIDE.md</code> in the project root.
          </p>
          <p className="text-slate-500">
            To seed a new admin, use <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">npx tsx scripts/seed-admin.ts</code>
          </p>
          <p className="text-slate-500">
            System health details are available on the <a href="/admin" className="text-primary font-medium hover:underline">Overview</a> page.
          </p>
        </div>
      </div>
    </div>
  );
}
