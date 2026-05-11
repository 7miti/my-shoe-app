import React from 'react';
import { ScanLine, List as ListIcon } from 'lucide-react';
import { getShoes } from '../lib/storage';

export default function Home({ onNavigate }: { onNavigate: (view: string) => void }) {
    const recent = getShoes().slice(0, 3);
    
    return (
        <div className="flex flex-col h-full bg-[#0a0a0b] p-6 pt-12">
            <div className="mb-8">
                <h1 className="text-3xl font-light tracking-tight text-white mb-1">Stock<span className="font-bold text-[#6366f1]">discrepancy</span></h1>
                <p className="text-sm text-gray-500 mt-2">Enterprise Inventory Management</p>
            </div>
            
            <div className="flex flex-col gap-4 mb-10">
                <button 
                    onClick={() => onNavigate('scanner')}
                    className="bg-[#161618] border border-white/5 hover:bg-[#1c1c1f] text-white p-6 rounded-3xl flex items-center transition-colors active:scale-[0.98]"
                >
                    <div className="w-16 h-16 bg-[#6366f1] rounded-full flex items-center justify-center mr-4 shadow-lg shadow-indigo-500/20">
                        <ScanLine size={32} className="text-white" />
                    </div>
                    <div className="text-left">
                        <h2 className="text-xl font-semibold">Scan Label</h2>
                        <p className="text-gray-400 text-sm mt-1">Automatic OCR via ML Kit</p>
                    </div>
                </button>
                
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => onNavigate('list')}
                        className="bg-[#161618] hover:bg-[#1f1f22] text-white border-white/5 border p-5 rounded-2xl flex flex-col items-start transition-colors active:scale-[0.98]"
                    >
                        <div className="mb-2 text-gray-400">
                            <ListIcon size={24} />
                        </div>
                        <h2 className="text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-bold">Inventory</h2>
                        <p className="text-2xl font-mono text-white">{getShoes().length}</p>
                    </button>
                    
                    <div className="bg-[#161618] rounded-2xl p-5 border border-white/5 flex flex-col justify-end">
                        <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-1">Storage</p>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-indigo-400">Local</span>
                        </div>
                        <div className="w-full bg-black h-1.5 rounded-full mt-2">
                            <div className="bg-indigo-500 w-[15%] h-full rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center justify-between">
                    Recent Scans
                    <button onClick={() => onNavigate('list')} className="text-xs font-medium text-gray-500 bg-[#161618] border border-white/10 px-3 py-1.5 rounded-lg hover:bg-[#1f1f22]">View All</button>
                </h3>
                {recent.length === 0 ? (
                    <div className="bg-[#161618] border border-white/5 rounded-3xl p-6 flex-1 flex flex-col justify-center text-center text-gray-500 text-sm">
                        No recent scans.<br/>Tap "Scan Label" to begin.
                    </div>
                ) : (
                    <div className="bg-[#161618] border border-white/5 rounded-3xl overflow-hidden flex-1">
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-white/[0.03]">
                                {recent.map(r => (
                                    <tr key={r.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-medium text-white">{r.shoeName || r.brand || 'Unknown'}</p>
                                            <p className="text-xs text-gray-500 font-mono mt-0.5">{r.sku || 'N/A'}</p>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <p className="text-xs font-bold text-[#6366f1]">{r.ukSize ? `UK ${r.ukSize}` : (r.euSize || r.usSize || 'N/A')}</p>
                                            <p className="text-[10px] text-gray-500 mt-0.5">{new Date(r.scannedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
