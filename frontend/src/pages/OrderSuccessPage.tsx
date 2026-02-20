import { Link } from 'react-router-dom'
import { CheckCircle, ArrowRight, Package, Store, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function OrderSuccessPage() {
  const [confetti, setConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setConfetti(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Confetti burst */}
      {confetti && (
        <div className="absolute inset-0 pointer-events-none z-0">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: '50vw',
                y: '50vh',
                scale: 0,
                opacity: 1,
              }}
              animate={{
                x: `${Math.random() * 100}vw`,
                y: `${Math.random() * 100}vh`,
                scale: [0, 1, 0.5],
                opacity: [1, 1, 0],
                rotate: Math.random() * 720,
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                ease: 'easeOut',
              }}
              className="absolute w-3 h-3 rounded-sm"
              style={{
                backgroundColor: ['#3b82f6', '#10b981', '#eab308', '#ef4444', '#8b5cf6', '#f97316'][i % 6],
              }}
            />
          ))}
        </div>
      )}

      {/* Background glow */}
      <div className="absolute top-[-20%] left-[30%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.08)_0%,transparent_60%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center text-center max-w-lg"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
          className="p-6 bg-success/10 rounded-full mb-8"
        >
          <CheckCircle className="w-20 h-20 text-success" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h1 className="text-4xl font-black text-foreground mb-3 tracking-tight">
            Order Placed! <Sparkles className="inline w-8 h-8 text-yellow-500" />
          </h1>
          <p className="text-gray-400 text-lg mb-2">
            Your order has been successfully submitted.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            We'll verify your payment and get back to you shortly. You can track your order status from your dashboard.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full"
        >
          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button className="gap-2 rounded-full px-8 w-full shadow-lg shadow-primary/20">
              <Package className="w-4 h-4" /> View My Orders <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/" className="w-full sm:w-auto">
            <Button variant="outline" className="gap-2 rounded-full px-8 w-full">
              <Store className="w-4 h-4" /> Continue Shopping
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
