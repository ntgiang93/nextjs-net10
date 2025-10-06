import { NavMenuData } from '@/components/ui//navigate/Aside/Sidebar';

export const SIDEBAR_MOCK_DATA: NavMenuData[] = [
  {
    path: '/',
    label: 'Trang chủ',
    icon: 'dashboardSquareRemove',
    children: [],
  },
  {
    path: '/form',
    label: 'Form',
    icon: 'file-edit',
    children: [
      {
        path: '/form/select',
        label: 'Select',
        icon: 'list-view',
        children: [],
      },
      {
        path: '/form/upload',
        label: 'Upload',
        icon: 'list-view',
        children: [],
      },
      {
        path: '/form/auto-complete',
        label: 'Auto complete',
        icon: 'list-view',
        children: [],
      },
    ],
  },
  {
    path: '/tree',
    label: 'Tree view',
    icon: 'edge-style',
    children: [
      {
        path: '/tree/tree-list-box',
        label: 'Tree list box',
        icon: 'hierarchy-files',
        children: [],
      },
      {
        path: '/products/categories',
        label: 'Danh mục sản phẩm',
        icon: 'FolderIcon',
        children: [
          {
            path: '/products/categories/list',
            label: 'Danh sách danh mục',
            icon: 'ListIcon',
            children: [],
          },
          {
            path: '/products/categories/add',
            label: 'Thêm danh mục',
            icon: 'PlusIcon',
            children: [],
          },
        ],
      },
    ],
  },
  {
    path: '/orders',
    label: 'Quản lý đơn hàng',
    icon: 'shopping-bag-check',
    children: [
      {
        path: '/orders/list',
        label: 'Danh sách đơn hàng',
        icon: 'ListIcon',
        children: [],
      },
      {
        path: '/orders/pending',
        label: 'Đơn hàng chờ xử lý',
        icon: 'ClockIcon',
        children: [],
      },
    ],
  },
  {
    path: '/system',
    label: 'Quản trị hệ thống',
    icon: 'configuration-01',
    children: [
      {
        path: '/system/users',
        label: 'Người dùng',
        icon: 'ListIcon',
        children: [],
      },
      {
        path: '/system/roles',
        label: 'Vai trò',
        icon: 'ShieldIcon',
        children: [],
      },
      {
        path: '/system/groups',
        label: 'Nhóm quyền',
        icon: 'Groups',
        children: [],
      },
    ],
  },
];
