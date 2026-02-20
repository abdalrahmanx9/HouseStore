import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from './ui/Button'
import { Input } from './ui/Input'

export default function AuthPopup() {
  const { user, isLoading } = useAuth()
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    // Show after 15 seconds if not logged in and not dismissed
    if (!user && !isLoading && !dismissed) {
      const timer = setTimeout(() => setShow(true), 15000)
      return () => clearTimeout(timer)
    }
  }, [user, isLoading, dismissed])

  // Don't show for logged-in users
  if (user || isLoading || !show) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    // Store email for later (could send to backend)
    localStorage.setItem('guest_email', email)
    setSubmitted(true)
    setTimeout(() => {
      setShow(false)
      setDismissed(true)
    }, 2000)
  }

  const handleDismiss = () => {
    setShow(false)
    setDismissed(true)
  }

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-[91] w-full max-w-sm"
          >
            <div className="bg-surface border border-border/50 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
              {/* Accent glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

              {/* Close button */}
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1.5 rounded-full text-foreground/40 hover:text-foreground hover:bg-surface-hover transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-4"
                >
                  <Sparkles className="w-10 h-10 text-primary mx-auto mb-3" />
                  <p className="font-bold text-foreground">Thanks!</p>
                  <p className="text-sm text-gray-400 mt-1">We'll keep you updated.</p>
                </motion.div>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground text-sm">Stay in the Loop</h3>
                  </div>

                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                    Get notified about new products, exclusive deals, and updates. No spam, ever.
                  </p>

                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                      <Input
                        type="email"
                        required
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="pl-9 h-10 text-sm"
                      />
                    </div>
                    <Button type="submit" size="sm" className="h-10 px-4 gap-1 shrink-0">
                      Join <ArrowRight className="w-3 h-3" />
                    </Button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
