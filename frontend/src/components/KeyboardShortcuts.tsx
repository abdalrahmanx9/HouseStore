import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Keyboard, X } from 'lucide-react'

const SHORTCUTS = [
  { keys: ['Esc'], description: 'Close modals & drawers' },
  { keys: ['/'], description: 'Focus search bar' },
  { keys: ['?'], description: 'Show this help' },
  { keys: ['G', 'H'], description: 'Go to Home' },
  { keys: ['G', 'D'], description: 'Go to Dashboard' },
]

export default function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't trigger when typing in inputs
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return

    if (e.key === '?') {
      e.preventDefault()
      setIsOpen(prev => !prev)
    }

    if (e.key === 'Escape') {
      setIsOpen(false)
    }

    if (e.key === '/') {
      e.preventDefault()
      // Focus the first search input found on the page
      const searchInput = document.querySelector<HTMLInputElement>('input[placeholder*="earch"]')
      if (searchInput) searchInput.focus()
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] bg-surface border border-border/50 rounded-2xl shadow-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">Keyboard Shortcuts</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-full hover:bg-surface-hover text-foreground/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {SHORTCUTS.map((shortcut, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-foreground/70">{shortcut.description}</span>
                  <div className="flex items-center gap-1">
                    {shortcut.keys.map((key, j) => (
                      <span key={j}>
                        <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 text-xs font-mono font-semibold bg-background border border-border/50 rounded-lg text-foreground/80 shadow-sm">
                          {key}
                        </kbd>
                        {j < shortcut.keys.length - 1 && <span className="text-foreground/30 mx-0.5">+</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-foreground/30 mt-5 text-center">Press <kbd className="px-1 py-0.5 bg-background border border-border/50 rounded text-foreground/50 text-[10px]">?</kbd> to toggle</p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
