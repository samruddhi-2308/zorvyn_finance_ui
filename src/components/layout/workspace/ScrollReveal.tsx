import { motion, useReducedMotion } from 'framer-motion'
import type { ReactElement, ReactNode } from 'react'

interface ScrollRevealProps {
  readonly children: ReactNode
  readonly className?: string
}

export function ScrollReveal({
  children,
  className,
}: ScrollRevealProps): ReactElement {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className={className}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
