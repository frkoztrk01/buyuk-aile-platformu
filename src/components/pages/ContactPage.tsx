'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { MapPin, Phone, Mail, X, Instagram, Facebook, Youtube } from 'lucide-react';

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    const durationMultiplier = isMobile ? 0.8 : 1;
    
    const ctx = gsap.context(() => {
      // Animate form fields - simplified on mobile
      if (formRef.current) {
        const formFields = formRef.current.querySelectorAll('input, textarea, button');
        gsap.fromTo(
          formFields,
          { opacity: 0, x: isMobile ? 0 : -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6 * durationMultiplier,
            stagger: isMobile ? 0.05 : 0.1,
            delay: 0.2 * durationMultiplier,
            ease: 'power2.out',
          }
        );
      }

      // Animate info boxes - simplified on mobile
      if (infoRef.current) {
        const infoBoxes = infoRef.current.querySelectorAll('.info-box');
        gsap.fromTo(
          infoBoxes,
          { opacity: 0, x: isMobile ? 0 : 30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6 * durationMultiplier,
            stagger: isMobile ? 0.1 : 0.15,
            delay: 0.4 * durationMultiplier,
            ease: 'power2.out',
          }
        );
      }

      // Animate map - simplified on mobile
      if (mapRef.current) {
        gsap.fromTo(
          mapRef.current,
          { opacity: 0, y: isMobile ? 15 : 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8 * durationMultiplier,
            delay: 0.8 * durationMultiplier,
            ease: 'power2.out',
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });

      // Reset status after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      
      // Reset error status after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="relative w-full min-h-screen bg-white pt-24 lg:pt-40 pb-12 lg:pb-20">
      <div className="relative max-w-7xl mx-auto px-5 lg:px-12">
        {/* Page Header */}
        <div className="mb-8 lg:mb-16 border-b border-black/[0.05] lg:border-b-0 pb-6 lg:pb-0">
          <h1 className="text-3xl lg:text-4xl xl:text-6xl 2xl:text-7xl font-black uppercase tracking-tighter text-[#1E3A5F] font-montserrat leading-none mb-4 lg:mb-6">
            İLETİŞİM
          </h1>
          <p className="text-base lg:text-lg xl:text-xl text-[#1E3A5F] font-sans leading-relaxed">
            Sorularınız, önerileriniz ve katkılarınız için bizimle iletişime geçebilirsiniz.
          </p>
        </div>

        {/* Main Grid: Form on top, Info/Map below on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 border-t border-black/10">
          {/* Contact Form - Full width on mobile, 60% on desktop */}
          <div className="col-span-1 lg:col-span-3 pr-0 lg:pr-12 py-8 lg:py-12 xl:py-16 border-b lg:border-b-0 lg:border-r border-black/10">
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
              <h2 className="text-2xl lg:text-3xl xl:text-4xl font-black uppercase tracking-tighter text-[#1E3A5F] font-montserrat leading-tight mb-6 lg:mb-8">
                BİZE ULAŞIN
              </h2>

              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-bold uppercase tracking-widest text-[#1E3A5F] font-montserrat mb-2"
                >
                  AD SOYAD
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-black/20 bg-white text-[#1E3A5F] font-sans focus:outline-none focus:border-[#336699] transition-none"
                />
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-bold uppercase tracking-widest text-[#1E3A5F] font-montserrat mb-2"
                >
                  E-POSTA
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-black/20 bg-white text-[#1E3A5F] font-sans focus:outline-none focus:border-[#336699] transition-none"
                />
              </div>

              {/* Subject Field */}
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-bold uppercase tracking-widest text-[#1E3A5F] font-montserrat mb-2"
                >
                  KONU
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-black/20 bg-white text-[#1E3A5F] font-sans focus:outline-none focus:border-[#336699] transition-none"
                />
              </div>

              {/* Message Field */}
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-bold uppercase tracking-widest text-[#1E3A5F] font-montserrat mb-2"
                >
                  MESAJ
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-black/20 bg-white text-[#1E3A5F] font-sans focus:outline-none focus:border-[#336699] transition-none resize-none"
                />
              </div>

              {/* Submit Button - Full width, min height 52px */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-transparent border-2 border-[#1E3A5F] text-[#1E3A5F] uppercase text-sm font-bold tracking-widest hover:bg-[#1E3A5F] hover:text-white transition-none font-montserrat disabled:opacity-50 disabled:cursor-not-allowed min-h-[52px]"
              >
                {isSubmitting ? 'GÖNDERİLİYOR...' : 'GÖNDER'}
              </button>

              {/* Success/Error Messages */}
              {submitStatus === 'success' && (
                <div className="p-4 bg-green-50 border border-green-200">
                  <p className="text-sm text-green-700 font-sans">
                    Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.
                  </p>
                </div>
              )}
              {submitStatus === 'error' && (
                <div className="p-4 bg-red-50 border border-red-200">
                  <p className="text-sm text-[#1E3A5F] font-sans">
                    Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.
                  </p>
                </div>
              )}
            </form>
          </div>

          {/* Info Station - Below form on mobile, right side on desktop */}
          <div ref={infoRef} className="col-span-1 lg:col-span-2 pl-0 lg:pl-12 py-8 lg:py-12 xl:py-16">
            <div className="space-y-4 lg:space-y-6">
              {/* Address Box */}
              <div className="info-box border border-black/20 p-6 bg-white">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 border border-[#1E3A5F] flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-[#1E3A5F]" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-widest font-bold text-[#1E3A5F] font-montserrat mb-2">
                      ADRES
                    </h3>
                    <p className="text-base text-[#1E3A5F] font-sans leading-relaxed">
                      Üsküdar / İstanbul
                    </p>
                  </div>
                </div>
              </div>

              {/* Phone Box */}
              <div className="info-box border border-black/20 p-6 bg-white">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 border border-[#1E3A5F] flex items-center justify-center">
                    <Phone className="w-6 h-6 text-[#1E3A5F]" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-widest font-bold text-[#1E3A5F] font-montserrat mb-2">
                      TELEFON
                    </h3>
                    <a
                      href="tel:+908503083193"
                      className="text-base text-[#1E3A5F] font-sans hover:text-[#336699] transition-none"
                    >
                      +90 850 308 3193
                    </a>
                  </div>
                </div>
              </div>

              {/* Email Box */}
              <div className="info-box border border-black/20 p-6 bg-white">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 border border-[#1E3A5F] flex items-center justify-center">
                    <Mail className="w-6 h-6 text-[#1E3A5F]" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-widest font-bold text-[#1E3A5F] font-montserrat mb-2">
                      E-POSTA
                    </h3>
                    <a
                      href="mailto:info@buyukaileplatformu.org"
                      className="text-base text-[#1E3A5F] font-sans hover:text-[#336699] transition-none"
                    >
                      info@buyukaileplatformu.org
                    </a>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="info-box border border-black/20 p-6 bg-white">
                <h3 className="text-xs uppercase tracking-widest font-bold text-[#1E3A5F] font-montserrat mb-4">
                  SOSYAL MEDYA
                </h3>
                <div className="flex items-center gap-3">
                  <a
                    href="https://x.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 border border-[#1E3A5F] flex items-center justify-center hover:bg-[#1E3A5F] group transition-none"
                  >
                    <X className="w-5 h-5 text-[#1E3A5F] group-hover:text-white transition-none" />
                  </a>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 border border-[#1E3A5F] flex items-center justify-center hover:bg-[#1E3A5F] group transition-none"
                  >
                    <Instagram className="w-5 h-5 text-[#1E3A5F] group-hover:text-white transition-none" />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 border border-[#1E3A5F] flex items-center justify-center hover:bg-[#1E3A5F] group transition-none"
                  >
                    <Facebook className="w-5 h-5 text-[#1E3A5F] group-hover:text-white transition-none" />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 border border-[#1E3A5F] flex items-center justify-center hover:bg-[#1E3A5F] group transition-none"
                  >
                    <Youtube className="w-5 h-5 text-[#1E3A5F] group-hover:text-white transition-none" />
                  </a>
                </div>
              </div>
            </div>

            {/* Map - Full width, 300px height on mobile */}
            <div ref={mapRef} className="mt-6 lg:mt-8 border border-black/20 overflow-hidden w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3009.1234567890123!2d29.0123456!3d41.0123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDAwJzQ0LjQiTiAyOcKwMDAnNDQuNCJF!5e0!3m2!1str!2str!4v1234567890123!5m2!1str!2str"
                width="100%"
                height="300"
                className="lg:h-[400px]"
                style={{ border: 0, filter: 'grayscale(100%) contrast(1.2)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Büyük Aile Platformu Lokasyon"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
