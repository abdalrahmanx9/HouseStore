import { cn } from "./Button"
import { motion, type HTMLMotionProps } from "framer-motion"

function Skeleton({ className, ...props }: HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{
        repeat: Infinity,
        repeatType: "reverse",
        duration: 1,
        ease: "easeInOut"
      }}
      className={cn("animate-pulse rounded-md bg-border-subtle/50", className)}
      {...props}
    />
  )
}

export { Skeleton }
