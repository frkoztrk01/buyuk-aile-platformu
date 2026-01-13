'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from './useToast';
import type { Meeting } from '@/lib/db/schema';

export default function AdminMeetingsPage() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/meetings');
      if (!response.ok) {
        throw new Error('Failed to fetch meetings');
      }
      const data = await response.json();
      setMeetings(data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      showError('Buluşmalar yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu buluşmayı silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/meetings/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete meeting');
      }

      setMeetings(meetings.filter((meeting) => meeting.id !== id));
      showSuccess('Buluşma başarıyla silindi');
    } catch (error) {
      console.error('Error deleting meeting:', error);
      showError('Buluşma silinirken bir hata oluştu');
    }
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
            BULUŞMALAR
          </h1>
          <p className="text-sm uppercase tracking-widest text-gray-600 font-montserrat">
            BULUŞMA YÖNETİMİ
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/bulusmalar/yeni')}
          className="flex items-center gap-2 px-6 py-3 bg-[#1E3A5F] text-white text-xs font-bold uppercase tracking-widest font-montserrat hover:bg-[#152A47] transition-none"
        >
          <Plus className="w-4 h-4" />
          YENİ BULUŞMA
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
                  VİDEO LİNK
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest font-montserrat">
                  AÇIKLAMA ÖNİZLEME
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest font-montserrat">
                  TARİH
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
              ) : meetings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-sm text-gray-600 font-sans">Henüz buluşma bulunmuyor.</p>
                  </td>
                </tr>
              ) : (
                meetings.map((meeting, index) => {
                  const isEven = index % 2 === 0;
                  const descriptionPreview = meeting.description
                    ? meeting.description.substring(0, 100) + '...'
                    : '-';
                  
                  return (
                    <tr
                      key={meeting.id}
                      className={`border-b border-black/10 ${
                        isEven ? 'bg-white' : 'bg-[#F9F9F9]'
                      }`}
                    >
                      <td className="px-6 py-4 sticky left-0 bg-inherit">
                        <p className="text-sm font-bold text-[#1E3A5F] font-montserrat">
                          {meeting.title}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {meeting.videoUrl ? (
                          <a
                            href={meeting.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 font-sans break-all"
                          >
                            {meeting.videoUrl}
                          </a>
                        ) : (
                          <p className="text-sm text-gray-400 font-sans">-</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 font-sans line-clamp-2">
                          {descriptionPreview}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 font-sans">
                          {formatDate(meeting.date)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push(`/admin/bulusmalar/${meeting.id}/duzenle`)}
                            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold uppercase tracking-widest font-montserrat hover:bg-blue-700 transition-none"
                          >
                            DÜZENLE
                          </button>
                          <button
                            onClick={() => handleDelete(meeting.id)}
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
