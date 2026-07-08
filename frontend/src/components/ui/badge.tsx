import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva('inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium transition-colors', {
  variants: {
    variant: {
      default: 'border-transparent bg-primary text-primary-foreground',
      secondary: 'border-transparent bg-secondary text-secondary-foreground',
      outline: 'text-foreground',
      critical: 'border-transparent bg-red-500/15 text-red-600 dark:text-red-400',
      high: 'border-transparent bg-orange-500/15 text-orange-600 dark:text-orange-400',
      medium: 'border-transparent bg-yellow-500/15 text-yellow-700 dark:text-yellow-400',
      low: 'border-transparent bg-zinc-500/15 text-zinc-600 dark:text-zinc-400',
    },
  },
  defaultVariants: { variant: 'default' },
})

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}
export { Badge, badgeVariants }
