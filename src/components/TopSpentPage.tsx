import { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LeaderboardUser {
  user_id: string;
  name: string;
  email: string;
  total_deposits: number;
  total_transactions: number;
  rank: number;
}

interface TopSpentPageProps {
  onBack: () => void;
}

export default function TopSpentPage({ onBack }: TopSpentPageProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const { data: depositsData } = await supabase
        .from('deposits')
        .select('user_id, amount')
        .eq('status', 'completed');

      const { data: ordersData } = await supabase
        .from('orders')
        .select('user_id, amount')
        .eq('status', 'completed');

      const userStats = new Map<string, { deposits: number; transactions: number }>();

      depositsData?.forEach((deposit) => {
        const stats = userStats.get(deposit.user_id) || { deposits: 0, transactions: 0 };
        stats.deposits += deposit.amount;
        userStats.set(deposit.user_id, stats);
      });

      ordersData?.forEach((order) => {
        const stats = userStats.get(order.user_id) || { deposits: 0, transactions: 0 };
        stats.transactions += order.amount;
        userStats.set(order.user_id, stats);
      });

      const userIds = Array.from(userStats.keys());

      if (userIds.length === 0) {
        setLeaderboard([]);
        setLoading(false);
        return;
      }

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name, email')
        .in('id', userIds);

      const leaderboardData: LeaderboardUser[] = [];

      profilesData?.forEach((profile) => {
        const stats = userStats.get(profile.id);
        if (stats) {
          leaderboardData.push({
            user_id: profile.id,
            name: profile.name || 'User',
            email: profile.email,
            total_deposits: stats.deposits,
            total_transactions: stats.transactions,
            rank: 0,
          });
        }
      });

      leaderboardData.sort((a, b) => {
        const totalA = a.total_deposits + a.total_transactions;
        const totalB = b.total_deposits + b.total_transactions;
        return totalB - totalA;
      });

      leaderboardData.forEach((user, index) => {
        user.rank = index + 1;
      });

      setLeaderboard(leaderboardData.slice(0, 10));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCrownIcon = (rank: number) => {
    if (rank === 1) {
      return <Crown className="w-8 h-8 text-yellow-500 fill-yellow-500" />;
    } else if (rank === 2) {
      return <Crown className="w-7 h-7 text-gray-400 fill-gray-400" />;
    } else if (rank === 3) {
      return <Crown className="w-6 h-6 text-amber-700 fill-amber-700" />;
    }
    return null;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) {
      return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-xl scale-105';
    } else if (rank === 2) {
      return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 shadow-lg';
    } else if (rank === 3) {
      return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg';
    }
    return 'bg-white text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pb-8">
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-6 h-6" />
          <span className="font-medium">Kembali</span>
        </button>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Top Spent</h1>
                <p className="text-sm text-gray-500">Pengguna dengan total tertinggi</p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                <p className="text-gray-600 mt-4">Memuat data...</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada data leaderboard</p>
              </div>
            ) : (
              <div className="space-y-4">
                {leaderboard.map((user) => (
                  <div
                    key={user.user_id}
                    className={`rounded-2xl p-6 transition-all duration-300 hover:scale-102 ${getRankStyle(
                      user.rank
                    )}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getCrownIcon(user.rank) || (
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {user.rank}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-bold text-lg truncate">
                            {user.name}
                          </p>
                          {user.rank <= 3 && (
                            <span className="px-2 py-1 bg-white/30 rounded-full text-xs font-semibold">
                              #{user.rank}
                            </span>
                          )}
                        </div>
                        <p className={`text-sm truncate ${user.rank <= 3 ? 'opacity-90' : 'text-gray-500'}`}>
                          {user.email}
                        </p>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        <div className="space-y-1">
                          <div>
                            <p className={`text-xs ${user.rank <= 3 ? 'opacity-80' : 'text-gray-500'}`}>
                              Total Deposit
                            </p>
                            <p className="font-bold text-sm">
                              Rp {user.total_deposits.toLocaleString('id-ID')}
                            </p>
                          </div>
                          <div>
                            <p className={`text-xs ${user.rank <= 3 ? 'opacity-80' : 'text-gray-500'}`}>
                              Total Transaksi
                            </p>
                            <p className="font-bold text-sm">
                              Rp {user.total_transactions.toLocaleString('id-ID')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
