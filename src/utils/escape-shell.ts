/** Makes the given string safe to be used in a shell command. */
export const escapeShell = (arg: string) => {
  return '"' + arg.replace(/(["])/g, "\\$1") + '"';
};
