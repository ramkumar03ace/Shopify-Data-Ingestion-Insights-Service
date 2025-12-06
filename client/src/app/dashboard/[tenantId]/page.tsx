"use client";

import { useState, useEffect, use } from 'react';
import api from '@/lib/api';
import { StatsCard } from '@/components/StatsCard';
import { SalesChart } from '@/components/SalesChart';
import { OrdersChart } from '@/components/OrdersChart';
import { CustomerGrowthChart } from '@/components/CustomerGrowthChart';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Dashboard({ params }: { params: Promise<{ tenantId: string }> }) {
    const resolvedParams = use(params);
    const { tenantId } = resolvedParams;
    const [stats, setStats] = useState<any>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [topCustomers, setTopCustomers] = useState<any[]>([]);
    const [customerGrowth, setCustomerGrowth] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, [tenantId]);

    const fetchData = async () => {
        try {
            const [statsRes, chartRes, customersRes, growthRes] = await Promise.all([
                api.get(`/analytics/stats?tenantId=${tenantId}`),
                api.get(`/analytics/orders-by-date?tenantId=${tenantId}`),
                api.get(`/analytics/top-customers?tenantId=${tenantId}`),
                api.get(`/analytics/customers-over-time?tenantId=${tenantId}`),
            ]);
            setStats(statsRes.data);
            setChartData(chartRes.data);
            setTopCustomers(customersRes.data);
            setCustomerGrowth(growthRes.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            await api.post('/ingestion/sync', { tenantId });
            alert('Sync started! Refreshing data...');
            await fetchData();
        } catch (error: any) {
            const msg = error.response?.data?.error || 'Sync failed';
            alert(`Sync Failed: ${msg}`);
        } finally {
            setSyncing(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center space-x-2 text-indigo-600">
                                <span className="text-xl font-extrabold tracking-tight text-slate-900">Xeno<span className="text-indigo-600">Insights</span></span>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-6">
                            <span className="text-sm text-slate-500 hidden sm:block">Tenant: <span className="font-medium text-slate-900">{tenantId.split('-')[0]}...</span></span>
                            <button
                                onClick={handleSync}
                                disabled={syncing}
                                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white ${syncing ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                            >
                                {syncing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Syncing...
                                    </>
                                ) : 'Sync Data'}
                            </button>
                            <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                                Switch Workspace
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 pb-20">
                <div className="space-y-8">
                    {/* Header */}
                    <div>
                        <h2 className="text-2xl font-bold leading-7 text-slate-900 sm:text-3xl sm:truncate">
                            Dashboard Overview
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">Performance metrics for your Shopify store.</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <StatsCard
                            title="Total Revenue"
                            value={`$${Number(stats?.totalRevenue || 0).toLocaleString()}`}
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        />
                        <StatsCard
                            title="Total Orders"
                            value={Number(stats?.totalOrders || 0).toLocaleString()}
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
                        />
                        <StatsCard
                            title="Total Customers"
                            value={Number(stats?.totalCustomers || 0).toLocaleString()}
                            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                        />
                    </div>

                    {/* Charts and Tables */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Sales Chart */}
                        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
                                Revenue Trend
                            </h3>
                            <div className="bg-slate-50 rounded-lg p-2 h-[300px]">
                                <SalesChart data={chartData} />
                            </div>
                        </div>

                        {/* Orders Chart */}
                        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                Orders Volume
                            </h3>
                            <div className="bg-slate-50 rounded-lg p-2 h-[300px]">
                                <OrdersChart data={chartData} />
                            </div>
                        </div>

                        {/* Customer Growth Chart */}
                        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                Customer Growth
                            </h3>
                            <div className="bg-slate-50 rounded-lg p-2 h-[300px]">
                                <CustomerGrowthChart data={customerGrowth} />
                            </div>
                        </div>

                        {/* Top Customers */}
                        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                Top Customers
                            </h3>
                            {topCustomers.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">No customer data available yet.</p>
                            ) : (
                                <div className="overflow-hidden">
                                    <ul className="divide-y divide-slate-100">
                                        {topCustomers.map((customer) => (
                                            <li key={customer.id} className="py-4 flex items-center justify-between hover:bg-slate-50 -mx-4 px-4 rounded-lg transition-colors">
                                                <div className="flex items-center min-w-0">
                                                    <div className="h-10 w-10 flex-shrink-0 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 text-sm font-bold">
                                                        {customer.firstName?.[0] || '?'}{customer.lastName?.[0] || ''}
                                                    </div>
                                                    <div className="ml-4 min-w-0">
                                                        <p className="text-sm font-medium text-slate-900 truncate">
                                                            {customer.firstName} {customer.lastName}
                                                        </p>
                                                        <p className="text-xs text-slate-500 truncate">{customer.email}</p>
                                                    </div>
                                                </div>
                                                <div className="text-sm font-semibold text-slate-900">
                                                    ${Number(customer.totalSpent).toLocaleString()}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
