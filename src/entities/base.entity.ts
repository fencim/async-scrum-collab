export interface IBaseEntity {
  id?: string;
}

export function entityKey(entity: { key: string } | string) {
  return typeof entity == 'object' ? entity.key : entity;
}
