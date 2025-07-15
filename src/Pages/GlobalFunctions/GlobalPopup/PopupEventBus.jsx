const listeners = [];

export const PopupEventBus = {
  on(listener) {
    listeners.push(listener);
  },
  off(listener) {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  },
  emit(message, type) {
    listeners.forEach((listener) => listener(message, type));
  },
};
