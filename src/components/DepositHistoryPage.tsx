import { useState, useEffect } from 'react';
import { ArrowLeft, Wallet, CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase, Deposit, QRISPayment } from '../lib/supabase';

interface DepositWithQRIS extends Deposit {
  qris?: QRISPayment;
}

interface DepositHistoryPageProps {
  userId: string;
  onBack: () => void;
}

export default function DepositHistoryPage({ userId, onBack }: DepositHistoryPageProps) {
  const [deposits, setDeposits] = useState<DepositWithQRIS[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeposits();
  }, [userId]);

  const fetchDeposits = async () => {
    try {
      const { data: depositsData } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!depositsData) {
        setDeposits([]);
        setLoading(false);
        return;
      }

      const depositsWithQRIS = await Promise.all(
        depositsData.map(async (deposit) => {
          if (deposit.qris_payment_id) {
            const { data: qris } = await supabase
              .from('qris_payments')
              .select('*')
              .eq('id', deposit.qris_payment_id)
              .maybeSingle();

            return { ...deposit, qris };
          }
          return deposit;
        })
      );

      setDeposits(depositsWithQRIS);
    } catch (error) {
      console.error('Error fetching deposits:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return { text: 'Berhasil', color: 'text-green-600' };
      case 'pending':
        return { text: 'Menunggu', color: 'text-yellow-600' };
      case 'failed':
        return { text: 'Gagal', color: 'text-red-600' };
      case 'expired':
        return { text: 'Kadaluarsa', color: 'text-red-600' };
      default:
        return { text: status, color: 'text-gray-600' };
    }
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
              <div className="p-3 bg-green-100 rounded-xl">
                <Wallet className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">History Deposit</h1>
                <p className="text-sm text-gray-500">Riwayat pengisian saldo</p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent"></div>
                <p className="text-gray-600 mt-4">Memuat riwayat...</p>
              </div>
            ) : deposits.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada deposit</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deposits.map((deposit) => {
                  const status = getStatusText(deposit.status);
                  return (
                    <div
                      key={deposit.id}
                      className="border-2 border-gray-200 rounded-2xl p-6 hover:border-green-300 transition-all"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">Deposit Saldo</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(deposit.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 mb-1">Nominal</p>
                          <p className="text-xl font-bold text-green-600">
                            Rp {deposit.amount.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mb-3">
                        {getStatusIcon(deposit.status)}
                        <span className={`text-sm font-medium ${status.color}`}>
                          {status.text}
                        </span>
                      </div>

                      {deposit.qris && (
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-gray-500 mb-1">Metode</p>
                              <p className="font-semibold text-gray-800">QRIS</p>
                            </div>
                            <div>
                              <p className="text-gray-500 mb-1">Kode QRIS</p>
                              <p className="font-mono text-xs font-semibold text-gray-800">
                                {deposit.qris.qris_code}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {deposit.status === 'completed' && (
                        <div className="mt-3 bg-green-50 rounded-lg p-3 border border-green-200">
                          <p className="text-sm text-green-700">
                            Saldo telah ditambahkan ke akun Anda
                          </p>
                        </div>
                      )}

                      {deposit.status === 'pending' && (
                        <div className="mt-3 bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                          <p className="text-sm text-yellow-700">
                            Menunggu pembayaran. Silakan selesaikan pembayaran QRIS.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
