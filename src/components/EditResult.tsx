import React, { useState } from 'react';
import { ShoeItem } from '../types';
import { Save, ArrowLeft, RotateCcw } from 'lucide-react';

interface EditResultProps {
    initialData: Partial<ShoeItem>;
    imageUrl: string;
    onSave: (shoe: ShoeItem) => void;
    onDiscard: () => void;
}

export default function EditResult({ initialData, imageUrl, onSave, onDiscard }: EditResultProps) {
    const [formData, setFormData] = useState<Partial<ShoeItem>>({
        shoeName: initialData.shoeName || '',
        brand: initialData.brand || '',
        euSize: initialData.euSize || '',
        usSize: initialData.usSize || '',
        ukSize: initialData.ukSize || '',
        color: initialData.color || '',
        sku: initialData.sku || '',
        quantity: initialData.quantity || '1',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = () => {
        const finalShoe: ShoeItem = {
            id: initialData.id || crypto.randomUUID(),
            scannedAt: initialData.scannedAt || new Date().toISOString(),
            imageUrl,
            shoeName: formData.shoeName || '',
            brand: formData.brand || '',
            euSize: formData.euSize || '',
            usSize: formData.usSize || '',
            ukSize: formData.ukSize || '',
            color: formData.color || '',
            sku: formData.sku || '',
            quantity: formData.quantity || '1',
        };
        onSave(finalShoe);
    };

    return (
        <div className="flex flex-col h-full bg-[#0a0a0b] relative">
            {/* Header */}
            <div className="bg-[#0a0a0b] px-4 py-4 border-b border-white/5 flex items-center justify-between sticky top-0 z-10">
                <button onClick={onDiscard} className="p-2 text-gray-400 rounded-lg hover:bg-white/5 flex items-center transition-colors">
                    <ArrowLeft size={20} className="mr-1" /> Back
                </button>
                <span className="font-semibold text-white">Verify Extract</span>
                <button onClick={handleSave} className="px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-lg flex items-center text-sm font-bold transition-colors">
                    <Save size={16} className="mr-1.5" /> Save
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 pb-24">
                {imageUrl && (
                    <div className="mb-6 rounded-3xl overflow-hidden shadow-sm border border-white/5 bg-black aspect-video relative flex items-center justify-center">
                        <img src={imageUrl} alt="Captured label" className="max-h-full object-contain" />
                    </div>
                )}

                <div className="bg-[#161618] rounded-3xl border border-white/5 p-6 space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                        <div className="col-span-2">
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Brand</label>
                            <input type="text" name="brand" value={formData.brand} onChange={handleChange} className="w-full border-b border-white/10 bg-transparent text-white py-1.5 focus:border-[#6366f1] focus:outline-none transition-colors" placeholder="e.g. Nike" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Product Name</label>
                            <input type="text" name="shoeName" value={formData.shoeName} onChange={handleChange} className="w-full border-b border-white/10 bg-transparent text-white py-1.5 focus:border-[#6366f1] focus:outline-none transition-colors" placeholder="e.g. Air Force 1" />
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-5 pt-2">
                        <div className="border border-[#6366f1]/30 rounded-xl p-2 bg-[#6366f1]/5">
                            <label className="block text-[10px] uppercase tracking-widest text-[#6366f1] mb-1.5 font-bold">UK Size</label>
                            <input type="text" name="ukSize" value={formData.ukSize} onChange={handleChange} className="w-full border-b border-[#6366f1]/30 bg-transparent text-white py-1 focus:border-[#6366f1] focus:outline-none placeholder:text-gray-600 transition-colors" placeholder="8" />
                        </div>
                        <div className="p-2">
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">US Size</label>
                            <input type="text" name="usSize" value={formData.usSize} onChange={handleChange} className="w-full border-b border-white/10 bg-transparent text-white py-1 focus:border-[#6366f1] focus:outline-none placeholder:text-gray-600 transition-colors" placeholder="9" />
                        </div>
                        <div className="p-2">
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">EU Size</label>
                            <input type="text" name="euSize" value={formData.euSize} onChange={handleChange} className="w-full border-b border-white/10 bg-transparent text-white py-1 focus:border-[#6366f1] focus:outline-none placeholder:text-gray-600 transition-colors" placeholder="42" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5 pt-2">
                        <div className="col-span-2">
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">SKU / Article No</label>
                            <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="w-full border-b border-white/10 bg-transparent text-[#6366f1] font-mono py-1.5 focus:border-[#6366f1] focus:outline-none transition-colors" placeholder="e.g. CW2288-111" />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Color</label>
                            <input type="text" name="color" value={formData.color} onChange={handleChange} className="w-full border-b border-white/10 bg-transparent text-white py-1.5 focus:border-[#6366f1] focus:outline-none transition-colors" placeholder="White" />
                        </div>
                        <div>
                            <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1.5">Quantity</label>
                            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full border-b border-white/10 bg-transparent text-white py-1.5 focus:border-[#6366f1] focus:outline-none transition-colors" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-6 left-0 right-0 px-4">
                <button 
                    onClick={onDiscard} 
                    className="w-full py-4 bg-[#161618] hover:bg-[#1c1c1f] border border-white/5 text-white rounded-xl font-medium flex items-center justify-center transition-colors"
                >
                    <RotateCcw size={18} className="mr-2" /> Rescan Label
                </button>
            </div>
        </div>
    );
}
