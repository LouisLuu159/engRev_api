import * as bcrypt from 'bcrypt';

export const hashString = async (str: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10, 'a');
  const hashedStr = await bcrypt.hash(str, salt);
  return hashedStr;
};

export const compareHash = async (hashedStr: string, notHashedStr: string) => {
  const valid = await bcrypt.compare(hashedStr, notHashedStr);
  return valid;
};
