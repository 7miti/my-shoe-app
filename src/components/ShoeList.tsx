import React, { useState } from 'react';
import { ShoeItem } from '../types';
import { getShoes, deleteShoe } from '../lib/storage';
import { ArrowLeft, Download, Trash2, Search } from 'lucide-react';

export default function ShoeList({ onBack }: { onBack: () => void }) {
    const [shoes, setShoes] = useState<ShoeItem[]>(getShoes());
    const [searchQuery, setSearchQuery] = useState('');

    const handleDelete = (id: string) => {
        if (confirm("Delete this entry?")) {
            deleteShoe(id);
            setShoes(getShoes());
        }
    };

    const handleExportCSV = () => {
        if (shoes.length === 0) return;
        
        const headers = ['Date', 'Brand', 'Product Name', 'EU Size', 'US Size', 'UK Size', 'Color', 'SKU', 'Quantity'];
        const escapeCsv = (val: string) => `"${(val || '').toString().replace(/"/g, '""')}"`;
        
        const rows = shoes.map(s => [
            new Date(s.scannedAt).toLocaleDateString(),
            s.brand,
            s.shoeName,
            s.euSize,
            s.usSize,
            s.ukSize,
            s.color,
            s.sku,
            s.quantity
        ].map(escapeCsv).join(','));

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `shoe_inventory_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filtered = shoes.filter(s => 
        (s.shoeName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (s.brand?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (s.sku?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-[#0a0a0b]">
            <div className="bg-[#0a0a0b] px-4 py-4 border-b border-white/5 flex items-center justify-between z-10">
                <button onClick={onBack} className="p-2 text-gray-400 rounded-lg hover:bg-white/5 flex items-center transition-colors">
                    <ArrowLeft size={20} className="mr-1" /> Home
                </button>
                <span className="font-semibold text-white">Inventory</span>
                <button onClick={handleExportCSV} className="px-4 py-2 bg-white hover:bg-gray-200 text-black rounded-lg flex items-center text-xs font-bold transition-colors">
                    <Download size={16} className="mr-1.5" /> Export CSV
                </button>
            </div>

            <div className="p-4 pb-2">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by brand, name or SKU..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-[#161618] border border-white/5 text-white rounded-xl focus:border-[#6366f1] focus:outline-none shadow-sm transition-colors placeholder:text-gray-500"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4 pt-2">
                {filtered.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 text-sm">
                        {shoes.length === 0 ? "No shoes scanned yet." : "No matches found."}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map(shoe => (
                            <div key={shoe.id} className="bg-[#161618] border border-white/5 rounded-2xl overflow-hidden shadow-sm">
                                <div className="p-4 border-b border-white/5 flex justify-between items-start">
                                    <div>
                                        <div className="font-medium text-white text-base">{shoe.brand} {shoe.shoeName}</div>
                                        <div className="text-indigo-300 font-mono text-xs mt-1">{shoe.sku || 'N/A'}</div>
                                    </div>
                                    <button onClick={() => handleDelete(shoe.id)} className="text-red-400 p-2 hover:bg-red-400/10 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 divide-x divide-white/[0.03] bg-black/20 text-center py-3">
                                    <div className="bg-[#6366f1]/5">
                                        <div className="text-[10px] text-[#6366f1] font-medium uppercase tracking-widest mb-1.5">UK Size</div>
                                        <div className="font-bold text-white text-sm">{shoe.ukSize || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mb-1.5">US Size</div>
                                        <div className="font-medium text-white text-sm">{shoe.usSize || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-gray-500 font-medium uppercase tracking-widest mb-1.5">EU Size</div>
                                        <div className="font-medium text-white text-sm">{shoe.euSize || '-'}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
