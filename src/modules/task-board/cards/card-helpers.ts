import { IProfile } from 'src/entities';

export function getProfiles(profiles?: (string | IProfile)[]) {
  if (Array.isArray(profiles)) {
    return profiles.filter((p) => typeof p == 'object') as IProfile[];
  }
  return [];
}
