'use client';

import { useState, useEffect } from 'react';
import { Mail, Trash2, Loader2, Eye } from 'lucide-react';
import { useToast } from './useToast';
import type { Message } from '@/lib/db/schema';

export default function AdminMessagesPage() {
  const { showSuccess, showError } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/messages');
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      showError('Mesajlar yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      setMessages(messages.filter((message) => message.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
      showSuccess('Mesaj başarıyla silindi');
    } catch (error) {
      console.error('Error deleting message:', error);
      showError('Mesaj silinirken bir hata oluştu');
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-[#1E3A5F] font-montserrat mb-2">
          İLETİŞİM MESAJLARI
        </h1>
        <p className="text-sm uppercase tracking-widest text-gray-600 font-montserrat">
          MESAJ YÖNETİMİ
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages List */}
        <div className="bg-white border border-black/10">
          <div className="p-6 border-b border-black/10">
            <h2 className="text-lg font-black uppercase tracking-tight text-[#1E3A5F] font-montserrat">
              MESAJ LİSTESİ
            </h2>
          </div>
          
          <div className="overflow-y-auto max-h-[600px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-[#1E3A5F]" />
                  <p className="text-sm text-gray-600 font-sans">Yükleniyor...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-gray-600 font-sans">Henüz mesaj bulunmuyor.</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`p-4 border-b border-black/10 cursor-pointer transition-none ${
                    selectedMessage?.id === message.id
                      ? 'bg-[#1E3A5F] text-white'
                      : 'bg-white hover:bg-[#F9F9F9]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-bold font-montserrat mb-1 ${
                        selectedMessage?.id === message.id ? 'text-white' : 'text-[#1E3A5F]'
                      }`}>
                        {message.fullName}
                      </p>
                      <p className={`text-xs font-sans mb-1 ${
                        selectedMessage?.id === message.id ? 'text-white/80' : 'text-gray-600'
                      }`}>
                        {message.email}
                      </p>
                      <p className={`text-xs font-sans truncate ${
                        selectedMessage?.id === message.id ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        {message.subject}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <p className={`text-xs font-sans ${
                        selectedMessage?.id === message.id ? 'text-white/70' : 'text-gray-400'
                      }`}>
                        {formatDate(message.createdAt).split(',')[0]}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        <div className="bg-white border border-black/10">
          <div className="p-6 border-b border-black/10">
            <h2 className="text-lg font-black uppercase tracking-tight text-[#1E3A5F] font-montserrat">
              MESAJ DETAYI
            </h2>
          </div>
          
          {selectedMessage ? (
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-2">
                  GÖNDEREN
                </label>
                <p className="text-sm text-[#1E3A5F] font-sans">{selectedMessage.fullName}</p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-2">
                  E-POSTA
                </label>
                <p className="text-sm text-[#1E3A5F] font-sans">{selectedMessage.email}</p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-2">
                  KONU
                </label>
                <p className="text-sm text-[#1E3A5F] font-sans">{selectedMessage.subject}</p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-2">
                  MESAJ
                </label>
                <p className="text-sm text-[#1E3A5F] font-sans leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-[#1E3A5F] font-montserrat font-bold mb-2">
                  TARİH
                </label>
                <p className="text-sm text-[#1E3A5F] font-sans">{formatDate(selectedMessage.createdAt)}</p>
              </div>

              <div className="pt-4 border-t border-black/10">
                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white text-xs font-bold uppercase tracking-widest font-montserrat hover:bg-[#152A47] transition-none"
                >
                  <Trash2 className="w-4 h-4" />
                  SİL
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-sm text-gray-500 font-sans">
                Detayları görmek için bir mesaj seçin
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
