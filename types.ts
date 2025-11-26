export enum UserRole {
  DONOR = 'DONOR',
  RECIPIENT = 'RECIPIENT'
}

export interface SupplyItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  expiryDate: string;
  distance?: string;
  imageUrl: string;
  location: string;
  category: string;
  status: 'Available' | 'Pending' | 'Donated' | 'Requested';
}

export interface RequestItem {
  id: string;
  itemName: string;
  quantity: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Delivered' | 'Cancelled';
  icon: string;
  colorClass: string;
}

export interface NavItem {
  label: string;
  icon: string;
  path: string;
}