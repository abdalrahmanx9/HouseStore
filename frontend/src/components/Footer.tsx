import { Store, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="w-full bg-surface border-t border-border/50 mt-auto">
      <div className="w-full max-w-[1920px] mx-auto px-4 md:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
          {/* Branding */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-foreground hover:opacity-80 transition-opacity w-fit">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Store className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display tracking-tight">House</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Your gateway to premium digital assets. Curated software, tools, and licenses — delivered instantly.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-widest">Navigation</h4>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-gray-400 hover:text-primary transition-colors w-fit">Home</Link>
              <Link to="/#trending" className="text-sm text-gray-400 hover:text-primary transition-colors w-fit">Trending</Link>
              <Link to="/dashboard" className="text-sm text-gray-400 hover:text-primary transition-colors w-fit">My Orders</Link>
              <Link to="/profile" className="text-sm text-gray-400 hover:text-primary transition-colors w-fit">Profile</Link>
            </nav>
          </div>

          {/* Social & Support */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-widest">Connect</h4>
            <nav className="flex flex-col gap-2">
              <a href="https://discord.gg/7ynMbDb9m7" target="_blank" rel="noreferrer" className="text-sm text-gray-400 hover:text-indigo-400 transition-colors w-fit flex items-center gap-2">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                </svg>
                Discord Community
              </a>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500 font-medium">
            © {new Date().getFullYear()} House. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            Made with <Heart className="w-3 h-3 text-red-500 fill-current" /> by D7M
          </p>
        </div>
      </div>
    </footer>
  )
}
