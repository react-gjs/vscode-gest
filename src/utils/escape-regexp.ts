/**
 * Creates a stringified regexp that matches exactly the given
 * string.
 */
export const escapeRegexp = (str: string) => {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
};
