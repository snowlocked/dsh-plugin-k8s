/** 插件统一的带机器码/HTTP 状态错误。 */
export class K8sConsoleError extends Error {
  readonly code: string
  readonly status: number
  readonly details?: unknown

  constructor(message: string, code = 'ERR_K8S', status = 400, details?: unknown) {
    super(message)
    this.name = 'K8sConsoleError'
    this.code = code
    this.status = status
    if (details !== undefined) this.details = details
  }
}

export function asError(reason: unknown): Error {
  if (reason instanceof Error) return reason
  return new Error(typeof reason === 'string' ? reason : JSON.stringify(reason))
}

/** 把任意底层错误包装为带可读消息的 K8sConsoleError。 */
export function wrapError(reason: unknown, fallback: string, code = 'ERR_INTERNAL', status = 502): K8sConsoleError {
  const error = asError(reason)
  const message = error.message && !/^Error\b/u.test(error.message) ? error.message : fallback
  return new K8sConsoleError(message || fallback, code, status, { cause: String(error.message || error) })
}
