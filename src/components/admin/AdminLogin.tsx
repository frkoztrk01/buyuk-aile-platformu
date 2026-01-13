'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E3A5F] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white font-montserrat mb-2">
            KONTROL MERKEZİ
          </h1>
          <p className="text-xs uppercase tracking-widest text-white/70 font-montserrat">
            YÖNETİM PANELİ GİRİŞİ
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-black/10 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200">
              <p className="text-sm text-red-600 font-sans">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-2"
              >
                E-POSTA
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-b border-black/20 bg-transparent text-[#1E3A5F] font-sans focus:outline-none focus:border-[#1E3A5F] transition-none"
                  placeholder="admin@buyuk-aile-vakfi.org"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-2"
              >
                ŞİFRE
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-b border-black/20 bg-transparent text-[#1E3A5F] font-sans focus:outline-none focus:border-[#1E3A5F] transition-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#1E3A5F] text-white text-sm font-bold uppercase tracking-widest font-montserrat hover:bg-[#152A47] transition-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ'}
            </button>
          </div>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <Link
            href="/admin/kayit"
            className="text-xs uppercase tracking-widest text-white/70 font-montserrat hover:text-white transition-none"
          >
            Hesabınız yok mu? Kayıt olun
          </Link>
        </div>

        {/* Footer Note */}
        <p className="mt-6 text-center text-xs uppercase tracking-widest text-white/50 font-montserrat">
          Sadece Yetkili Personel
        </p>
      </div>
    </div>
  );
}
