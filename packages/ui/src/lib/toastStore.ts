import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration?: number;
}

const createToastStore = () => {
  const { subscribe, update } = writable<Toast[]>([]);

  const push = (message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Math.floor(Math.random() * 1050505);
    update((all) => [{ id, type, message, duration }, ...all]);

    if (duration !== Infinity) {
      setTimeout(() => {
        update((all) => all.filter((t) => t.id !== id));
      }, duration);
    }
  };

  return {
    subscribe,
    push,
    success: (message: string, duration = 3000) => push(message, 'success', duration),
    error: (message: string, duration = 3000) => push(message, 'error', duration),
    info: (message: string, duration = 3000) => push(message, 'info', duration),
    warning: (message: string, duration = 3000) => push(message, 'warning', duration),
    remove: (id: number) => update((all) => all.filter((t) => t.id !== id)),
  };
};

export const toast = createToastStore();
