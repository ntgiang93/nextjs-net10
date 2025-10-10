export enum EPermission {
  None = 0,
  View = 1 << 0,
  Create = 1 << 1,
  Edit = 1 << 2,
  Delete = 1 << 3,
  Approve = 1 << 4,
  All = View | Create | Edit | Delete | Approve 
}