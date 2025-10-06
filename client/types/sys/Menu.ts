export interface MenuItem {
  id: number;
  name: string;
  url: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  parentId?: number;
  sysmodule?: string;
  children?: MenuItem[];
}

export const defaultMenuItem: MenuItem = {
  id: 0,
  name: '',
  url: '',
  icon: '',
  displayOrder: 0,
  isActive: true,
  parentId: undefined,
  sysmodule: undefined,
  children: [],
};

export interface SaveMenuDto {
  id: number;
  name: string;
  url: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  parentId?: number;
  sysmodule: string;
}

export const defaultSaveMenuDto: SaveMenuDto = {
  id: 0,
  name: '',
  url: '',
  icon: '',
  displayOrder: 0,
  isActive: true,
  parentId: undefined,
  sysmodule: '',
};
