type LogContext = Record<string, unknown>

const isDevelopment = import.meta.env.DEV

/**
 * Lightweight logging utility used to avoid raw console calls in app code.
 */
export const logger = {
  info(message: string, context?: LogContext): void {
    if (!isDevelopment) {
      return
    }

    console.info(`[INFO] ${message}`, context ?? {})
  },

  warn(message: string, context?: LogContext): void {
    if (!isDevelopment) {
      return
    }

    console.warn(`[WARN] ${message}`, context ?? {})
  },

  error(message: string, context?: LogContext): void {
    if (!isDevelopment) {
      return
    }

    console.error(`[ERROR] ${message}`, context ?? {})
  },
}
