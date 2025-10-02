import { ArrowLeft, Wrench } from 'lucide-react';

interface ComingSoonPageProps {
  onBack: () => void;
}

export default function ComingSoonPage({ onBack }: ComingSoonPageProps) {
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

        <div className="max-w-2xl mx-auto">
          <div className="relative bg-white rounded-3xl p-12 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/5 backdrop-blur-3xl"></div>

            <div className="relative z-10 text-center">
              <div className="inline-block p-6 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mb-6">
                <Wrench className="w-16 h-16 text-blue-600" />
              </div>

              <h1 className="text-5xl font-bold text-gray-800 mb-4">
                Coming Soon
              </h1>

              <p className="text-xl text-gray-600 mb-8">
                Fitur ini sedang dalam pengembangan
              </p>

              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6 border-2 border-blue-200">
                <p className="text-gray-700">
                  Kami sedang bekerja keras untuk menghadirkan pengalaman terbaik untuk Anda.
                  Nantikan pembaruan selanjutnya!
                </p>
              </div>

              <div className="mt-8 flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-blue-700 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>

            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400/10 rounded-full blur-xl"></div>
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
              <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-blue-300/10 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
