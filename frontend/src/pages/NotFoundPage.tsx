import { Link } from 'react-router-dom'
import { Store, ArrowLeft, Ghost } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { motion } from 'framer-motion'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-20%] left-[30%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.08)_0%,transparent_60%)] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="p-6 bg-primary/10 rounded-full mb-8"
        >
          <Ghost className="w-20 h-20 text-primary/60" />
        </motion.div>

        <h1 className="text-8xl font-black text-foreground mb-4 font-display tracking-tighter">
          4<span className="text-primary">0</span>4
        </h1>

        <p className="text-xl font-semibold text-foreground mb-2">
          Page not found
        </p>
        <p className="text-gray-400 max-w-sm mb-8">
          The page you're looking for doesn't exist or has been moved. Let's get you back to shopping.
        </p>

        <div className="flex items-center gap-4">
          <Link to="/">
            <Button className="gap-2 rounded-full px-8 shadow-lg shadow-primary/20">
              <Store className="w-4 h-4" /> Back to Store
            </Button>
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
        </div>
      </motion.div>
    </div>
  )
}
