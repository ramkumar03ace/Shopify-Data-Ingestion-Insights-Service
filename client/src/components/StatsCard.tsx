import React from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
}

export function StatsCard({ title, value, icon }: StatsCardProps) {
    return (
        <div className="bg-white overflow-hidden shadow-lg rounded-xl border border-slate-100 hover:shadow-xl transition-shadow duration-300">
            <div className="p-6">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        {icon ? (
                            <div className="h-12 w-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                {icon}
                            </div>
                        ) : (
                            <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        )}
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-slate-500 truncate">{title}</dt>
                            <dd>
                                <div className="text-2xl font-bold text-slate-900 mt-1">{value}</div>
                            </dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    );
}
