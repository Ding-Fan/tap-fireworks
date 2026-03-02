export function isIPhone(): boolean {
  if (typeof navigator === 'undefined') return false
  return navigator.userAgent.includes('iPhone')
}
