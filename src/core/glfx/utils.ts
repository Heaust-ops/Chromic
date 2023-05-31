export const clamp = (lo: number, value: number, hi: number) => {
  return Math.max(lo, Math.min(value, hi));
};
