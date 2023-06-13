export const parseError = (error: unknown) => {
  if (error instanceof Error) {
    return `${error.message}\n${error.stack}`;
  }

  return String(error);
};
