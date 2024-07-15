export function toBoolean(value: string | boolean) {
    return value !== null && `${value}` !== 'false';
  }