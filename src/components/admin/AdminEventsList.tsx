'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Eye, Loader2 } from 'lucide-react';
import { useToast } from './useToast';
import type { News } from '@/lib/db/schema';

export default function AdminEventsList() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [events, setEvents] = useState<News[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/news?category=Etkinlik');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      showError('Etkinlikler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu etkinliği silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/news/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      setEvents(events.filter((item) => item.id !== id));
      showSuccess('Etkinlik başarıyla silindi');
    } catch (error) {
      console.error('Error deleting event:', error);
      showError('Etkinlik silinirken bir hata oluştu');
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/etkinlikler/${id}/duzenle`);
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-[#1E3A5F] font-montserrat mb-2">
            ETKİNLİKLER
          </h1>
          <p className="text-sm uppercase tracking-widest text-gray-600 font-montserrat">
            ETKİNLİK YÖNETİMİ
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/etkinlikler/yeni')}
          className="flex items-center gap-2 px-6 py-3 bg-[#1E3A5F] text-white text-xs font-bold uppercase tracking-widest font-montserrat hover:bg-[#152A47] transition-none"
        >
          <Plus className="w-4 h-4" />
          YENİ ETKİNLİK
        </button>
      </div>

      <div className="bg-white border border-black/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1E3A5F] text-white">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest font-montserrat sticky left-0 bg-[#1E3A5F]">
                  BAŞLIK
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
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-[#1E3A5F]" />
                      <p className="text-sm text-gray-600 font-sans">Yükleniyor...</p>
                    </div>
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-sm text-gray-600 font-sans">Henüz etkinlik bulunmuyor.</p>
                  </td>
                </tr>
              ) : (
                events.map((item, index) => {
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
