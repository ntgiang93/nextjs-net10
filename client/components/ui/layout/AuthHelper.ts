import { JwtClaim } from '@/types/base/JwtClaim';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import Cookies from 'js-cookie';

export const SUPER_ADMIN_ROLE = 'SUPER_ADMIN';

export async function getDeviceId() {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  return result.visitorId;
}

// Helper functions for session management
export const markSessionActive = (jwt: JwtClaim) => {
  Cookies.set('jti', jwt.jti, { expires: jwt.exp });
};

export const hasActiveSession = (): boolean => {
  const jti = Cookies.get('jti');
  if (!jti) return false;
  else return true;
};

export const clearSessionFlag = () => {
  Cookies.remove('jti');
};
