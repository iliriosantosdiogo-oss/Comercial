export interface Store {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  whatsapp: string;
  currency: string;
  description?: string;
  color?: string;
  logoUrl?: string;
  inviteCode?: string;
  createdAt: any;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  active: boolean;
  createdAt: any;
}
