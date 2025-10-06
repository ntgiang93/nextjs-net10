export enum EPermission {
  Development = 'Development',
  Deletion = 'Deletion',
  Edition = 'Edition',
  Approved = 'Approved',
  Creation = 'Creation',
  View = 'View',
}

export const hasPermission = (permissions: string[], permission: EPermission): boolean => {
  return permissions.includes(permission);
};
