import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

export function AnimatedCounter({ value, suffix = '', decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return
    const duration = 1200
    const start = performance.now()
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(value * eased)
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [isInView, value])

  return (
    <motion.span ref={ref} className="tabular-nums">
      {decimals > 0 ? display.toFixed(decimals) : Math.round(display)}{suffix}
    </motion.span>
  )
}
