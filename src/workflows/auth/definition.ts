import { Struct } from 'src/structs';
export type Auth =
  | Struct<'login', { username: string }>
  | Struct<'logout', { username: string }>
  | Struct<'loginWithGoogle', {
    done?: VoidCallback;
    error?: ErrorCallback;
  }>;
