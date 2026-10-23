import { useApp } from '@/lib/store';

/** Active profile: CV-confirmed (via store) or synthetic demo fallback. */
export function useActiveProfile() {
  return useApp().activeProfile;
}
