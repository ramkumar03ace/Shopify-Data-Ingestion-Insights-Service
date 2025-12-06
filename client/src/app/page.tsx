"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface Tenant {
  id: string;
  name: string;
  shopifyUrl: string;
}

export default function Home() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTenant, setNewTenant] = useState({ name: '', shopifyUrl: '', accessToken: '', email: '' });
  const router = useRouter();

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const res = await api.get('/tenants');
      setTenants(res.data);
    } catch (error) {
      console.error('Failed to fetch tenants', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/tenants', newTenant);
      setNewTenant({ name: '', shopifyUrl: '', accessToken: '', email: '' });
      fetchTenants();
      alert('Tenant created successfully!');
    } catch (error) {
      alert('Failed to create tenant');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 pb-32 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
              Shopify Insights Platform
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-indigo-100">
              Unified analytics and data ingestion for enterprise retailers.
            </p>
          </div>
        </div>
      </div>

      <main className="-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Tenant Selection Card */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-100">
            <div className="px-6 py-5 bg-slate-50 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Select a Workspace</h3>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : tenants.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No workspaces found. Create one to get started.</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {tenants.map((tenant) => (
                    <li key={tenant.id} className="py-4 flex items-center justify-between hover:bg-slate-50 -mx-6 px-6 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{tenant.name}</p>
                        <p className="text-sm text-slate-500 truncate">{tenant.shopifyUrl}</p>
                      </div>
                      <button
                        onClick={() => router.push(`/dashboard/${tenant.id}`)}
                        className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                      >
                        Launch
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Onboarding Card */}
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-100">
            <div className="px-6 py-5 bg-slate-50 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Onboard New Store</h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleCreateTenant} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Store Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Corp"
                    className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                    value={newTenant.name}
                    onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Shopify URL</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm">
                      https://
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="shop.myshopify.com"
                      className="flex-1 block w-full rounded-none rounded-r-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                      value={newTenant.shopifyUrl}
                      onChange={(e) => setNewTenant({ ...newTenant, shopifyUrl: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Access Token</label>
                  <input
                    type="password"
                    required
                    placeholder="shpat_..."
                    className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                    value={newTenant.accessToken}
                    onChange={(e) => setNewTenant({ ...newTenant, accessToken: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="admin@example.com"
                    className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-2 border"
                    value={newTenant.email}
                    onChange={(e) => setNewTenant({ ...newTenant, email: e.target.value })}
                  />
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Onboard Tenant
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
