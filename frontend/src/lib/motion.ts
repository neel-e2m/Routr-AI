export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06 } },
}

export const cardVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export const CHART_COLORS = ['#f97316', '#71717a', '#a1a1aa', '#d4d4d8', '#52525b', '#3f3f46', '#27272a']
