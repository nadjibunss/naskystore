import { X, ShoppingCart, Package } from 'lucide-react';
import { Product } from '../lib/supabase';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onPurchase: (product: Product) => Promise<void>;
}

export default function ProductModal({ isOpen, onClose, product, onPurchase }: ProductModalProps) {
  if (!isOpen || !product) return null;

  const handlePurchase = async () => {
    await onPurchase(product);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="relative h-64 bg-gradient-to-br from-gray-100 to-gray-200">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
          {product.is_best_seller && (
            <div className="absolute top-4 left-4 bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              Best Seller
            </div>
          )}
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{product.name}</h2>
          <p className="text-gray-600 mb-4">{product.description}</p>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600 font-medium">Kategori</span>
              <span className="text-gray-800 font-semibold">{product.category}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <span className="text-gray-600 font-medium">Stok</span>
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-gray-500" />
                <span className="text-gray-800 font-semibold">{product.stock}</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
              <span className="text-gray-700 font-medium">Harga</span>
              <span className="text-2xl font-bold text-blue-600">
                Rp {product.price.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={product.stock === 0}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center space-x-2"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>{product.stock === 0 ? 'Stok Habis' : 'Beli Sekarang'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
