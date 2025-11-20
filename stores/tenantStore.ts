import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TenantInfo {
  tenantId: string | number;
  tenantName: string;
  logo?: string;
  [key: string]: any;
}

interface TenantState {
  tenantInfo: TenantInfo | null;
  setTenantInfo: (info: TenantInfo) => void;
  clearTenantInfo: () => void;
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      tenantInfo: null,
      setTenantInfo: (info) => set({ tenantInfo: info }),
      clearTenantInfo: () => set({ tenantInfo: null }),
    }),
    {
      name: 'tenant-storage',
    }
  )
);

