export const isEmptyObject = (obj: object): boolean => {
  return  obj === undefined || (typeof obj === 'object' && obj !== null && Object.keys(obj).length === 0);
};
