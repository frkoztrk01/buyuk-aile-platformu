'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from './useToast';
import type { Founder } from '@/lib/db/schema';

export default function AdminFoundersPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [founders, setFounders] = useState<Founder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFounders();
  }, []);

  const fetchFounders = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/founders');
      if (!response.ok) {
        throw new Error('Failed to fetch founders');
      }
      const data = await response.json();
      setFounders(data);
    } catch (error) {
      console.error('Error fetching founders:', error);
      showError('Kurucu kuruluşlar yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kurucu kuruluşu silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/founders/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete founder');
      }

      setFounders(founders.filter((founder) => founder.id !== id));
      showSuccess('Kurucu kuruluş başarıyla silindi');
    } catch (error) {
      console.error('Error deleting founder:', error);
      showError('Kurucu kuruluş silinirken bir hata oluştu');
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/kurucu-kuruluslar/${id}/duzenle`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-[#1E3A5F] font-montserrat mb-2">
            KURUCU KURULUŞLAR
          </h1>
          <p className="text-sm uppercase tracking-widest text-gray-600 font-montserrat">
            KURUCU KURULUŞ YÖNETİMİ
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/kurucu-kuruluslar/yeni')}
          className="flex items-center gap-2 px-6 py-3 bg-[#1E3A5F] text-white text-xs font-bold uppercase tracking-widest font-montserrat hover:bg-[#152A47] transition-none"
        >
          <Plus className="w-4 h-4" />
          YENİ KURUCU KURULUŞ
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-black/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1E3A5F] text-white">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest font-montserrat">
                  LOGO
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest font-montserrat">
                  İŞLEMLER
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-[#1E3A5F]" />
                      <p className="text-sm text-gray-600 font-sans">Yükleniyor...</p>
                    </div>
                  </td>
                </tr>
              ) : founders.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center">
                    <p className="text-sm text-gray-600 font-sans">Henüz kurucu kuruluş bulunmuyor.</p>
                  </td>
                </tr>
              ) : (
                founders.map((founder, index) => {
                  const isEven = index % 2 === 0;
                  return (
                    <tr
                      key={founder.id}
                      className={`border-b border-black/10 ${
                        isEven ? 'bg-white' : 'bg-[#F9F9F9]'
                      }`}
                    >
                      <td className="px-6 py-4">
                        {founder.logoUrl ? (
                          <img
                            src={founder.logoUrl}
                            alt="Logo"
                            className="max-w-32 h-auto max-h-16 object-contain"
                          />
                        ) : (
                          <p className="text-sm text-gray-400 font-sans">-</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(founder.id)}
                            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold uppercase tracking-widest font-montserrat hover:bg-blue-700 transition-none"
                          >
                            DÜZENLE
                          </button>
                          <button
                            onClick={() => handleDelete(founder.id)}
                            className="px-4 py-2 bg-[#1E3A5F] text-white text-xs font-bold uppercase tracking-widest font-montserrat hover:bg-[#152A47] transition-none"
                          >
                            SİL
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
