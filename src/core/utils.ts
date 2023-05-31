type DebounceCallback = (...args: any[]) => void;

export const debounce = (
  callback: DebounceCallback,
  delay: number
): DebounceCallback => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function debounced(...args: any[]) {
    clearTimeout(timeoutId);

    timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);
  };
};
