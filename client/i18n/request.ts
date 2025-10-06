//import { useAuthStore } from '@/store/auth-store';
import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async () => {
  //const userClaim = useAuthStore.getState().user;
  let locale = 'vi';
  // if (userClaim) {
  //   locale = userClaim.language || 'vi';
  // }
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
