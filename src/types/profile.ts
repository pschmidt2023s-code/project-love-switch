export interface Address {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  street: string;
  street2?: string;
  postalCode: string;
  city: string;
  state?: string;
  country: string;
  isDefault: boolean;
  type: 'shipping' | 'billing';
  createdAt: string;
}

export interface Profile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalSpent: number;
  paybackBalance: number;
  createdAt: string;
  updatedAt: string;
}
