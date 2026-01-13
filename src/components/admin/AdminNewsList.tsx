'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { useToast } from './useToast';
import type { News } from '@/lib/db/schema';

export default function AdminNewsList() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [newsItems, setNewsItems] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/news');
      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }
      const data = await response.json();
      setNewsItems(data);
    } catch (error) {
      console.error('Error fetching news:', error);
      showError('Haberler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu haberi silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/news/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete news');
      }

      setNewsItems(newsItems.filter((item) => item.id !== id));
      showSuccess('Haber başarıyla silindi');
    } catch (error) {
      console.error('Error deleting news:', error);
      showError('Haber silinirken bir hata oluştu');
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/haberler/${id}/duzenle`);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-[#1E3A5F] font-montserrat mb-2">
            HABERLER
          </h1>
          <p className="text-sm uppercase tracking-widest text-gray-600 font-montserrat">
            HABER YÖNETİMİ
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/haberler/yeni')}
          className="flex items-center gap-2 px-6 py-3 bg-[#1E3A5F] text-white text-xs font-bold uppercase tracking-widest font-montserrat hover:bg-[#152A47] transition-none"
        >
          <Plus className="w-4 h-4" />
          YENİ HABER
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-black/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1E3A5F] text-white">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest font-montserrat sticky left-0 bg-[#1E3A5F]">
                  BAŞLIK
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest font-montserrat">
                  KATEGORİ
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest font-montserrat">
                  TARİH
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest font-montserrat">
                  DURUM
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest font-montserrat">
                  GÖRÜNTÜLENME
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest font-montserrat">
                  İŞLEMLER
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-[#1E3A5F]" />
                      <p className="text-sm text-gray-600 font-sans">Yükleniyor...</p>
                    </div>
                  </td>
                </tr>
              ) : newsItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-sm text-gray-600 font-sans">Henüz haber bulunmuyor.</p>
                  </td>
                </tr>
              ) : (
                newsItems.map((item, index) => {
                  const isEven = index % 2 === 0;
                  return (
                    <tr
                      key={item.id}
                      className={`border-b border-black/10 ${
                        isEven ? 'bg-white' : 'bg-[#F9F9F9]'
                      }`}
                    >
                      <td className="px-6 py-4 sticky left-0 bg-inherit">
                        <p className="text-sm font-bold text-[#1E3A5F] font-montserrat">
                          {item.title}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 border border-gray-300 text-xs uppercase tracking-widest text-gray-600 font-montserrat">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 font-sans">
                          {formatDate(item.date)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 border text-xs uppercase tracking-widest font-montserrat ${
                            item.isPublished
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                          }`}
                        >
                          {item.isPublished ? 'Yayında' : 'Taslak'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-gray-400" />
                          <p className="text-sm text-gray-600 font-sans">-</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item.id)}
                            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold uppercase tracking-widest font-montserrat hover:bg-blue-700 transition-none"
                          >
                            DÜZENLE
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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
