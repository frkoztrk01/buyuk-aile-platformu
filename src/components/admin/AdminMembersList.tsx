'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useToast } from './useToast';
import type { Member } from '@/lib/db/schema';

export default function AdminMembersList() {
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/members');
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
      showError('Üyeler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu üyeyi silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/members/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete member');
      }

      setMembers(members.filter((member) => member.id !== id));
      showSuccess('Üye başarıyla silindi');
    } catch (error) {
      console.error('Error deleting member:', error);
      showError('Üye silinirken bir hata oluştu');
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/admin/uyeler/${id}/duzenle`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-[#1E3A5F] font-montserrat mb-2">
            ÜYELER
          </h1>
          <p className="text-sm uppercase tracking-widest text-gray-600 font-montserrat">
            ÜYE YÖNETİMİ
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/uyeler/yeni')}
          className="flex items-center gap-2 px-6 py-3 bg-[#1E3A5F] text-white text-xs font-bold uppercase tracking-widest font-montserrat hover:bg-[#152A47] transition-none"
        >
          <Plus className="w-4 h-4" />
          YENİ ÜYE
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-black/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#1E3A5F] text-white">
                <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest font-montserrat sticky left-0 bg-[#1E3A5F]">
                  ÜYE ADI (MARKDOWN)
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
              ) : members.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center">
                    <p className="text-sm text-gray-600 font-sans">Henüz üye bulunmuyor.</p>
                  </td>
                </tr>
              ) : (
                members.map((member, index) => {
                  const isEven = index % 2 === 0;
                  
                  return (
                    <tr
                      key={member.id}
                      className={`border-b border-black/10 ${
                        isEven ? 'bg-white' : 'bg-[#F9F9F9]'
                      }`}
                    >
                      <td className="px-6 py-4 sticky left-0 bg-inherit">
                        <div 
                          className="text-sm text-[#1E3A5F] font-sans"
                          dangerouslySetInnerHTML={{ 
                            __html: member.name.replace(/\n/g, '<br />') 
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(member.id)}
                            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold uppercase tracking-widest font-montserrat hover:bg-blue-700 transition-none"
                          >
                            DÜZENLE
                          </button>
                          <button
                            onClick={() => handleDelete(member.id)}
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
