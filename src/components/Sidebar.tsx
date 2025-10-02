import { Home, Wallet, History, MessageCircle, BookOpen, TrendingUp, X, Receipt } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
}

export default function Sidebar({ isOpen, onClose, onNavigate }: SidebarProps) {
  const menuItems = [
    { icon: Home, label: 'HOME', section: 'home' },
    { icon: Wallet, label: 'DEPOSIT', section: 'deposit' },
    { icon: Receipt, label: 'HISTORY DEPOSIT', section: 'deposit-history' },
    { icon: History, label: 'RIWAYAT PESANAN', section: 'orders' },
    { icon: MessageCircle, label: 'SUPPORT', section: 'support' },
    { icon: BookOpen, label: 'CARA PENGGUNAAN', section: 'guide' },
    { icon: TrendingUp, label: 'TOP SPENT', section: 'topspent' },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.section}
                onClick={() => {
                  onNavigate(item.section);
                  onClose();
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-all duration-200"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
