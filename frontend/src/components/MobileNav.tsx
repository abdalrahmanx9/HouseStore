import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Search, ShoppingCart, User, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  action?: () => void;
}

const MobileNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = useCart();

  const cartItemCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const triggerSearch = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
    });
    document.dispatchEvent(event);
  };

  const navItems: NavItem[] = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Search', icon: Search, path: '', action: triggerSearch },
    { label: 'Cart', icon: ShoppingCart, path: '/cart' },
    { label: 'Account', icon: User, path: '/dashboard' },
    { label: 'Wishlist', icon: Heart, path: '/wishlist' },
  ];

  const isActive = (path: string): boolean => {
    if (!path) return false;
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleNavClick = (item: NavItem) => {
    if (item.action) {
      item.action();
      return;
    }
    navigate(item.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      <div className="bg-surface/80 backdrop-blur-lg border-t border-border">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;

            return (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className="relative flex flex-col items-center justify-center w-full h-full gap-0.5 group"
                aria-label={item.label}
              >
                {/* Active indicator */}
                <span
                  className={`absolute -top-0.5 left-1/2 -translate-x-1/2 h-0.5 rounded-full bg-primary transition-all duration-300 ${
                    active ? 'w-6 opacity-100' : 'w-0 opacity-0'
                  }`}
                />

                <span className="relative">
                  <Icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      active
                        ? 'text-primary'
                        : 'text-gray-400 group-hover:text-foreground'
                    }`}
                  />

                  {/* Cart badge */}
                  {item.label === 'Cart' && cartItemCount > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full leading-none">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </span>

                <span
                  className={`text-[10px] font-medium transition-colors duration-200 ${
                    active
                      ? 'text-primary'
                      : 'text-gray-400 group-hover:text-foreground'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Safe area spacer for devices with home indicator */}
      <div className="bg-surface/80 backdrop-blur-lg h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
};

export default MobileNav;
