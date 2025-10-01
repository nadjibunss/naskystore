import { Plus, TrendingUp } from 'lucide-react';
import { Profile, Order } from '../lib/supabase';

interface BalanceCardProps {
  profile: Profile | null;
  orders: Order[];
  onDeposit: () => void;
}

export default function BalanceCard({ profile, orders, onDeposit }: BalanceCardProps) {
  const totalTransactions = orders.length;

  const last7Days = orders.slice(0, 7).reverse();
  const maxAmount = Math.max(...last7Days.map(o => o.amount), 1);

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white shadow-xl">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <p className="text-blue-100 text-sm mb-2">Saldo Anda</p>
          <div className="flex items-center space-x-3">
            <h2 className="text-4xl font-bold">
              Rp {profile ? profile.balance.toLocaleString('id-ID') : '0'}
            </h2>
            <button
              onClick={onDeposit}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all duration-200 hover:scale-110"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-blue-100">Grafik Transaksi (7 Hari)</span>
          <TrendingUp className="w-4 h-4 text-blue-200" />
        </div>
        <div className="flex items-end justify-between h-20 space-x-1">
          {last7Days.length > 0 ? (
            last7Days.map((order, index) => {
              const heightPercentage = (order.amount / maxAmount) * 100;
              return (
                <div
                  key={order.id || index}
                  className="flex-1 bg-white/40 hover:bg-white/60 rounded-t-lg transition-all duration-300 cursor-pointer"
                  style={{ height: `${Math.max(heightPercentage, 10)}%` }}
                  title={`Rp ${order.amount.toLocaleString('id-ID')}`}
                />
              );
            })
          ) : (
            <div className="flex-1 flex items-center justify-center h-full">
              <p className="text-xs text-blue-200">Belum ada transaksi</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-blue-100">Total Transaksi</span>
        <span className="text-xl font-bold">{totalTransactions}</span>
      </div>
    </div>
  );
}
