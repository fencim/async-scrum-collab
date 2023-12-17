import { Struct } from 'src/structs';

export type Guide =
  | Struct<'scrumGuide', {
    keyword?: string
  }>;
