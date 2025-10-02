import { useState, useEffect } from 'react';
import { ArrowLeft, Package, CheckCircle, Clock, Copy } from 'lucide-react';
import { supabase, Order, Product, ProductInventory } from '../lib/supabase';

interface OrderWithDetails extends Order {
  product?: Product;
  inventory?: ProductInventory;
}

interface OrderHistoryPageProps {
  userId: string;
  onBack: () => void;
}

export default function OrderHistoryPage({ userId, onBack }: OrderHistoryPageProps) {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  const fetchOrders = async () => {
    try {
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!ordersData) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const ordersWithDetails = await Promise.all(
        ordersData.map(async (order) => {
          const { data: product } = await supabase
            .from('products')
            .select('*')
            .eq('id', order.product_id)
            .single();

          const { data: inventory } = await supabase
            .from('product_inventory')
            .select('*')
            .eq('order_id', order.id)
            .maybeSingle();

          return {
            ...order,
            product,
            inventory,
          };
        })
      );

      setOrders(ordersWithDetails);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Disalin ke clipboard!');
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
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Riwayat Pesanan</h1>
                <p className="text-sm text-gray-500">Daftar pesanan dan detail akun</p>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                <p className="text-gray-600 mt-4">Memuat riwayat...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Belum ada pesanan</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        {order.product?.image_url && (
                          <img
                            src={order.product.image_url}
                            alt={order.product.name}
                            className="w-16 h-16 rounded-xl object-cover"
                          />
                        )}
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">
                            {order.product?.name || 'Produk'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">Total</p>
                        <p className="text-xl font-bold text-blue-600">
                          Rp {order.amount.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-4">
                      {order.status === 'completed' ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                          <span className="text-sm font-medium text-green-600">Selesai</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-5 h-5 text-yellow-500" />
                          <span className="text-sm font-medium text-yellow-600">Diproses</span>
                        </>
                      )}
                    </div>

                    {order.inventory && order.status === 'completed' && (
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
                        <div className="flex items-center space-x-2 mb-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <p className="font-bold text-green-800">Pesanan Kamu Sudah Dikirim!</p>
                        </div>
                        <div className="space-y-2">
                          <div className="bg-white rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Email</p>
                                <p className="font-mono font-semibold text-gray-800">
                                  {order.inventory.email}
                                </p>
                              </div>
                              <button
                                onClick={() => copyToClipboard(order.inventory!.email)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Copy className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Password</p>
                                <p className="font-mono font-semibold text-gray-800">
                                  {order.inventory.password}
                                </p>
                              </div>
                              <button
                                onClick={() => copyToClipboard(order.inventory!.password)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Copy className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-green-700 mt-3">
                          Simpan kredensial ini dengan aman. Gunakan untuk login ke akun {order.product?.name}.
                        </p>
                      </div>
                    )}

                    {!order.inventory && order.status === 'completed' && (
                      <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
                        <p className="text-sm text-yellow-800">
                          Pesanan sedang diproses. Detail akun akan dikirim segera.
                        </p>
                      </div>
                    )}
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
