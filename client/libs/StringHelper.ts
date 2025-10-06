const IsNullOrEmpty = (value: string) => {
  return !value || false || value === '';
};

const GenerateGUID = (prefix: string) => {
  const guid = crypto.randomUUID();
  return prefix + guid;
};

const hashString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
};

const objectToUrlParams = (obj: Record<string, any>): string => {
  return Object.entries(obj)
    .map(([key, value]) => {
      if (value === null || value === undefined || value.length === 0) {
        return undefined;
      } else return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .filter((param) => param !== undefined && param !== '')
    .join('&');
};

export const StringHelper = {
  IsNullOrEmpty,
  GenerateGUID,
  hashString,
  objectToUrlParams,
};
