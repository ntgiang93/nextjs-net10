import { LoadingSkeleton } from '@/components/ui//layout/LoadingSkeleton';

export default function UsersLoading() {
  // Hiển thị skeleton dành riêng cho trang Users với nhiều card hơn
  return <LoadingSkeleton cardCount={6} />;
}
