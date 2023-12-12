export type Struct<E extends string, A, P = []> = {
  type: E,
  arg: A,
  permissions: P
};
export type EmitStruct<T extends { type: string; arg: A }, A = T['arg']> = {
  type: T['type'];
  cb: (e: A) => void;
};

export type ToEmit<T extends { type: string; arg: any }, U> = T extends U
  ? EmitStruct<T>
  : never;
export type ToType<T extends { type: string; arg: any }, U> = T extends U
  ? T['type']
  : never;
