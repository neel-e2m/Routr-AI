import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { AnimatedCounter } from './AnimatedCounter'
import { cardVariants } from '@/lib/motion'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: number
  suffix?: string
  decimals?: number
  icon: LucideIcon
  trend?: string
  className?: string
}

export function StatCard({ title, value, suffix, decimals, icon: Icon, trend, className }: StatCardProps) {
  return (
    <motion.div variants={cardVariants}>
      <Card className={cn('hover:shadow-md transition-shadow duration-300', className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">{title}</p>
              <p className="text-3xl font-semibold tracking-tight">
                <AnimatedCounter value={value} suffix={suffix} decimals={decimals} />
              </p>
              {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
            </div>
            <div className="rounded-lg bg-primary/10 p-2.5">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
