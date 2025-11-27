'use client';

import { useState } from 'react';
import { Users, Shield, AlertTriangle, CheckCircle, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function VendorDashboard() {
    const [vendors, setVendors] = useState([
        { id: 1, name: 'ABC Plumbing', category: 'Plumbing', status: 'ACTIVE', insuranceExpiry: '2025-12-31', email: 'contact@abcplumbing.com' },
        { id: 2, name: 'Sparky Electric', category: 'Electrical', status: 'NON_COMPLIANT', insuranceExpiry: '2024-11-01', email: 'sparky@electric.com' },
        { id: 3, name: 'SafeGuard Security', category: 'Security', status: 'ACTIVE', insuranceExpiry: '2025-06-15', email: 'admin@safeguard.com' }
    ]);

    const handleRunCompliance = async () => {
        toast.promise(
            new Promise(resolve => setTimeout(resolve, 2000)),
            {
                loading: 'Running compliance checks...',
                success: 'Compliance check complete! 1 vendor flagged.',
                error: 'Failed to run check'
            }
        );
    };

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Users className="w-8 h-8 text-emerald-600" />
                        Vendor Compliance
                    </h1>
                    <p className="text-slate-500">Manage vendor insurance and WSIB status.</p>
                </div>
                <button 
                    onClick={handleRunCompliance}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center gap-2 shadow-sm"
                >
                    <Shield className="w-4 h-4" />
                    Run Compliance Check
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 text-sm font-medium">Total Vendors</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{vendors.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 text-sm font-medium">Compliant</h3>
                    <p className="text-3xl font-bold text-emerald-600 mt-2">
                        {vendors.filter(v => v.status === 'ACTIVE').length}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-slate-500 text-sm font-medium">Non-Compliant</h3>
                    <p className="text-3xl font-bold text-red-600 mt-2">
                        {vendors.filter(v => v.status === 'NON_COMPLIANT').length}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3 text-slate-500 font-medium text-sm">Vendor Name</th>
                            <th className="px-6 py-3 text-slate-500 font-medium text-sm">Category</th>
                            <th className="px-6 py-3 text-slate-500 font-medium text-sm">Status</th>
                            <th className="px-6 py-3 text-slate-500 font-medium text-sm">Insurance Expiry</th>
                            <th className="px-6 py-3 text-slate-500 font-medium text-sm">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {vendors.map(vendor => (
                            <tr key={vendor.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 font-medium text-slate-900">{vendor.name}</td>
                                <td className="px-6 py-4 text-slate-600">{vendor.category}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        vendor.status === 'ACTIVE' 
                                            ? 'bg-emerald-100 text-emerald-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {vendor.status === 'ACTIVE' ? (
                                            <><CheckCircle className="w-3 h-3 mr-1" /> Compliant</>
                                        ) : (
                                            <><AlertTriangle className="w-3 h-3 mr-1" /> Expired</>
                                        )}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{vendor.insuranceExpiry}</td>
                                <td className="px-6 py-4">
                                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1">
                                        <Mail className="w-3 h-3" /> Email
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
