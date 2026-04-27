export const isEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isPassword = (password: string): boolean => password.length >= 6;
