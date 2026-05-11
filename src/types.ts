export interface ShoeItem {
  id: string;
  scannedAt: string;
  imageUrl?: string;
  shoeName: string;
  brand: string;
  euSize: string;
  usSize: string;
  ukSize: string;
  color: string;
  sku: string;
  quantity: string;
}

export type AppView = 'home' | 'scanner' | 'edit' | 'list';
