'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Mail, User } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export default function AdminRegister() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setIsLoading(true);

    // Şifre kontrolü
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      setIsLoading(false);
      return;
    }

    // Şifre uzunluk kontrolü
    if (password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        setError(result.error.message || 'Kayıt başarısız. Lütfen bilgilerinizi kontrol edin.');
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin/giris');
        }, 2000);
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      console.error('Register error:', err);
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
            YÖNETİM PANELİ KAYIT
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="bg-white border border-black/10 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200">
              <p className="text-sm text-red-600 font-sans">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200">
              <p className="text-sm text-green-600 font-sans">
                Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...
              </p>
            </div>
          )}

          <div className="space-y-6">
            {/* Name Input */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-2"
              >
                AD SOYAD
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-b border-black/20 bg-transparent text-[#1E3A5F] font-sans focus:outline-none focus:border-[#1E3A5F] transition-none"
                  placeholder="Ad Soyad"
                  required
                />
              </div>
            </div>

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
                  minLength={8}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 font-sans">
                En az 8 karakter olmalıdır
              </p>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-2"
              >
                ŞİFRE TEKRAR
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-b border-black/20 bg-transparent text-[#1E3A5F] font-sans focus:outline-none focus:border-[#1E3A5F] transition-none"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full py-4 bg-[#1E3A5F] text-white text-sm font-bold uppercase tracking-widest font-montserrat hover:bg-[#152A47] transition-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'KAYIT YAPILIYOR...' : success ? 'KAYIT BAŞARILI' : 'KAYIT OL'}
            </button>
          </div>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <Link
            href="/admin/giris"
            className="text-xs uppercase tracking-widest text-white/70 font-montserrat hover:text-white transition-none"
          >
            Zaten hesabınız var mı? Giriş yapın
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
