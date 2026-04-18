export function isLocalHost(): boolean {
  return typeof window !== 'undefined' && window.location.hostname === 'localhost';
}

export function capitalize(str: string): string {
  return str.trim().charAt(0).toUpperCase() + str.trim().slice(1);
}