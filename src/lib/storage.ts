import { ShoeItem } from '../types';

const STORAGE_KEY = 'shoe_labels';

export const getShoes = (): ShoeItem[] => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Local storage error:", e);
        return [];
    }
};

export const saveShoe = (shoe: ShoeItem) => {
    const current = getShoes();
    const existingIndex = current.findIndex(s => s.id === shoe.id);
    if (existingIndex >= 0) {
        current[existingIndex] = shoe;
    } else {
        current.unshift(shoe);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
};

export const deleteShoe = (id: string) => {
    const current = getShoes();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current.filter(s => s.id !== id)));
};
