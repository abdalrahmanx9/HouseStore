import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { CartDrawer } from './CartDrawer'
import SupportWidget from './SupportWidget'

export default function Layout() {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col relative w-full overflow-x-hidden">
      <Navbar />
      <CartDrawer />
      <main className="flex-grow flex flex-col relative z-0">
        <Outlet />
      </main>
      <SupportWidget />
    </div>
  )
}
