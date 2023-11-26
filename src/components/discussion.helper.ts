export function formatKey(key: string) {
  const keyParts = /(?<projectKey>\w{4})(?<type>[^\d]*)(?<num>\d*)/.exec(key);
  const { projectKey, type, num } = keyParts?.groups as {
    projectKey: string;
    type: string;
    num: string;
  };
  return `${projectKey[0]}${type[0]}-${num}`.toUpperCase();
}
