import { create } from 'zustand'
import type { PermissionRequest } from '../types'

interface PermissionState {
  current: PermissionRequest | null
  setRequest: (req: PermissionRequest) => void
  clearRequest: () => void
}

export const usePermissionStore = create<PermissionState>((set) => ({
  current: null,
  setRequest: (req) => set({ current: req }),
  clearRequest: () => set({ current: null }),
}))
