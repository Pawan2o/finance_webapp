import { useCallback } from 'react';

export function useDebounce(fn: (value: string) => void, delay = 300) {
  return useCallback((() => {
    let timer: number;
    return (value: string) => {
      clearTimeout(timer);
      timer = window.setTimeout(() => fn(value), delay);
    };
  })(), []);
}
