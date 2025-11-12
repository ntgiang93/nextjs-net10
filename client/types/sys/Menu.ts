export type MenuItem = {
  id: number;
  name: string;
  engName?: string;
  url: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  parentId?: number;
  sysmodule?: string;
  children?: MenuItem[];
};

export const defaultMenuItem: MenuItem = {
  id: 0,
  name: '',
  engName: '',
  url: '',
  icon: '',
  displayOrder: 0,
  isActive: true,
  parentId: undefined,
  sysmodule: undefined,
  children: [],
};

export type SaveMenuDto = {
  id: number;
  name: string;
  engName?: string;
  url: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  parentId?: number;
  sysmodule: string;
};

export const defaultSaveMenuDto: SaveMenuDto = {
  id: 0,
  name: '',
  engName: '',
  url: '',
  icon: '',
  displayOrder: 0,
  isActive: true,
  parentId: undefined,
  sysmodule: '',
};
