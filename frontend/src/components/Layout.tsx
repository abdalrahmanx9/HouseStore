import { Outlet, useLocation } from 'react-router-dom'
import { Navbar } from './Navbar'
import { CartDrawer } from './CartDrawer'
import SupportWidget from './SupportWidget'
import Footer from './Footer'
import BackToTop from './BackToTop'
import KeyboardShortcuts from './KeyboardShortcuts'
import LoadingBar from './LoadingBar'
import AuthPopup from './AuthPopup'
import SearchCommand from './SearchCommand'
import MobileNav from './MobileNav'
import OfflineIndicator from './OfflineIndicator'
import { motion, AnimatePresence } from 'framer-motion'

import ProductComparisonModal from './ProductComparisonModal'

export default function Layout() {
  const location = useLocation()
  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col relative w-full overflow-x-hidden">
      {/* Skip to content (a11y) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:font-semibold focus:shadow-lg"
      >
        Skip to content
      </a>
      <LoadingBar />
      <OfflineIndicator />
      <Navbar />
      <CartDrawer />
      <main id="main-content" className="flex-grow flex flex-col relative z-0 pb-16 lg:pb-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex-grow flex flex-col"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <MobileNav />
      <SupportWidget />
      <BackToTop />
      <KeyboardShortcuts />
      <AuthPopup />
      <ProductComparisonModal />
      <SearchCommand />
    </div>
  )
}
