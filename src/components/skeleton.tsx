import { cn } from "@/lib/utils"

export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-on-surface/10 dark:bg-white/5", className)}
      {...props}
    />
  )
}
