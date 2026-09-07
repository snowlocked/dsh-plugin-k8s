/// <reference path="./client.d.ts" />
import cssText from './styles.css'

const STYLE_ID = 'dsh-k8s-console-style'

/** 主题样式单例：一个 <style> tag，重复进入幂等。 */
export function ensureThemeStyle(): () => void {
  if (typeof document === 'undefined') return () => {}
  const existing = document.getElementById(STYLE_ID)
  if (existing !== null && existing.isConnected) return () => { /* 已在文档中 */ }
  const tag = document.createElement('style')
  tag.id = STYLE_ID
  tag.setAttribute('data-plugin', 'dsh-plugin-k8s')
  tag.textContent = cssText
  document.head.appendChild(tag)
  return () => {
    if (tag.isConnected) tag.remove()
  }
}
