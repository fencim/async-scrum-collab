import { Struct } from 'src/structs';
export type Auth =
  | Struct<'login', {
    username: string, password: string,
    done?: (info: { username: string }) => void;
    error?: ErrorCallback;
  }>
  | Struct<'logout', { username: string }>
  | Struct<'loginWithGoogle', {
    done?: (info: { username: string }) => void;
    error?: ErrorCallback;
  }>;
