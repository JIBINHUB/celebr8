import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Lock,
  Search, MapPin, Calendar, ChevronLeft, ChevronRight, ChevronDown,
  Heart, Star, Ticket, Music, Laugh, UtensilsCrossed, Dumbbell,
  PartyPopper, Drama, Palette, Sparkles, Home, Compass, User, Bookmark,
  X, Menu, Filter, Clock, Share2, Play, TrendingUp, ArrowRight,
  Cpu, Activity, Hexagon, Command, Globe, Zap, Radio, Disc,
  Info, Headphones, Mail, Phone, CreditCard, Smartphone, CheckCircle, Copy, Building, Camera, Bell
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { Scanner } from '@yudiel/react-qr-scanner';
import { QRCodeCanvas } from 'qrcode.react';
import QRCode from 'qrcode';

// ========================================
// API CONFIG
// ========================================
// Hardcoded primary Hostinger domain bypasses edge-firewall POST dropping on alias domains (like 3.hostingersite.com)
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : 'https://honeydew-wolverine-433113.hostingersite.com';

// ========================================
// MOCK DATA
// ========================================

const CITIES = [
  'London', 'Leicester', 'Manchester', 'Edinburgh', 'Cardiff'
];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'music', label: 'Music', icon: Music },
  { id: 'comedy', label: 'Comedy', icon: Laugh },
  { id: 'food', label: 'Food & Drinks', icon: UtensilsCrossed },
  { id: 'sports', label: 'Sports', icon: Dumbbell },
  { id: 'festival', label: 'Festivals', icon: PartyPopper },
  { id: 'theatre', label: 'Theatre', icon: Drama },
  { id: 'workshop', label: 'Workshops', icon: Palette },
];

const FEATURED_EVENTS = [
  {
    id: 1,
    title: 'The Secret Letter  Mentalist Anandhu',
    subtitle: 'Leicester Show',
    date: 'Fri, 24 Apr 2026, 7:00 PM',
    venue: 'Maher Centre',
    city: 'Leicester',
    price: '£30 onwards',
    image: 'https://i.postimg.cc/K8Y24yBT/Untitled-design1.png',
    category: 'theatre',
    rating: '9.2',
    duration: '1h 30m',
  },
  {
    id: 2,
    title: 'The Secret Letter  Mentalist Anandhu',
    subtitle: 'London Show',
    date: 'Sat, 25 Apr 2026, 7:00 PM',
    venue: 'The Royal Regency',
    city: 'London',
    price: '£30 onwards',
    image: 'https://i.postimg.cc/Y0kc7ctZ/Untitled-design.png',
    category: 'theatre',
    rating: '9.3',
    duration: '1h 30m',
  },
  {
    id: 3,
    title: 'The Secret Letter  Mentalist Anandhu',
    subtitle: 'Manchester Show',
    date: 'Fri, 01 May 2026, 7:00 PM',
    venue: 'Forum Centre',
    city: 'Manchester',
    price: '£30 onwards',
    image: 'https://i.postimg.cc/s2ZbZfXK/Untitled-design3.png',
    category: 'theatre',
    rating: '9.1',
    duration: '1h 30m',
  },
];

const EVENTS = [
  {
    id: 1,
    title: 'The Secret Letter  Mentalist Anandhu',
    date: 'Fri, 24 Apr 2026',
    time: '19:00',
    venue: 'Maher Centre',
    address: '15 Ravensbridge Dr, Leicester LE4 0BZ',
    city: 'Leicester',
    price: '£30 onwards',
    category: 'theatre',
    image: 'https://i.postimg.cc/K8Y24yBT/Untitled-design1.png',
    tag: 'Selling Fast',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2420.5700810221376!2d-1.1441865230983377!3d52.65005881476906!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487760da9384752b%3A0xc348bbd2f4407b71!2sMaher%20Centre!5e0!3m2!1sen!2suk!4v1700000000000!5m2!1sen!2suk',
  },
  {
    id: 2,
    title: 'The Secret Letter  Mentalist Anandhu',
    date: 'Sat, 25 Apr 2026',
    time: '19:00',
    venue: 'The Royal Regency',
    address: '501 High St N, London E12 6TH',
    city: 'London',
    price: '£30 onwards',
    category: 'theatre',
    image: 'https://i.postimg.cc/Y0kc7ctZ/Untitled-design.png',
    tag: 'Trending',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2482.029800762111!2d0.046187776856525!3d51.53102480894087!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d8a64988f61ec1%3A0xf64879b2fa3d7c57!2sThe%20Royal%20Regency!5e0!3m2!1sen!2suk!4v1700000000000!5m2!1sen!2suk',
  },
  {
    id: 3,
    title: 'The Secret Letter  Mentalist Anandhu',
    date: 'Fri, 01 May 2026',
    time: '19:00',
    venue: 'Forum Centre',
    address: 'Poundswick Ln, Wythenshawe, Manchester M22 9PQ',
    city: 'Manchester',
    price: '£30 onwards',
    category: 'theatre',
    image: 'https://i.postimg.cc/s2ZbZfXK/Untitled-design3.png',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2379.2319407338027!2d-2.261947223058827!3d53.39294807490234!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487a53697eb8eb1f%3A0xf51be3e46c9c6123!2sWythenshawe%20Forum!5e0!3m2!1sen!2suk!4v1700000000000!5m2!1sen!2suk',
  },
  {
    id: 4,
    title: 'The Secret Letter  Mentalist Anandhu',
    date: 'Sat, 09 May 2026',
    time: '19:00',
    venue: 'Assembly Rooms',
    address: 'Edinburgh EH2 2LR',
    city: 'Edinburgh',
    price: '£30 onwards',
    category: 'theatre',
    image: 'https://i.postimg.cc/SNDBBt3G/photo-2026-02-07-11-02-45.jpg',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2239.3809228811808!2d-4.2882823232047!3d55.85966467312952!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4888467da5cd7cd3%3A0x8efdb135fd6c1410!2sSEC%20Armadillo!5e0!3m2!1sen!2suk!4v1700000000000!5m2!1sen!2suk',
  },
  {
    id: 5,
    title: 'The Secret Letter  Mentalist Anandhu',
    date: 'Sat, 16 May 2026',
    time: '19:00',
    venue: 'Principality Stadium',
    address: 'Westgate St, Cardiff CF10 1NS',
    city: 'Cardiff',
    price: '£30 onwards',
    category: 'theatre',
    image: 'https://i.postimg.cc/NjKzWG1B/Untitled-design2.png',
    tag: 'Popular',
    mapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2484.2255734341904!2d-3.1852655230983804!3d51.47814741162607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x486e1cb2a5e55e5d%3A0xc3f5c9e4722883f3!2sPrincipality%20Stadium!5e0!3m2!1sen!2suk!4v1700000000000!5m2!1sen!2suk',
  },
];


const NAV_TABS = [
  { id: 'home', label: 'Home' },
  { id: 'events', label: 'Events' },
  { id: 'about', label: 'About' },
  { id: 'support', label: 'Support' },
];

// ========================================
// HOOKS
// ========================================

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

function useIsTablet() {
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  useEffect(() => {
    const handler = () => setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isTablet;
}

function useScrollReveal(threshold = 0.1) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(el); } },
      { threshold, rootMargin: '0px 0px -30px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, isVisible];
}

// --- NOTIFY ME MODAL ---
function NotifyMeModal({ event, onClose, onSuccess }) {
  const isMobile = useIsMobile();
  const [formData, setFormData] = useState({ name: '', whatsapp: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    let tempErrors = {};
    if (!formData.name) tempErrors.name = "Name is required";
    if (!formData.whatsapp) tempErrors.whatsapp = "WhatsApp number is required";
    if (!formData.email) tempErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) tempErrors.email = "Email is invalid";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Placeholder for Web3Forms or similar integration
      /* 
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: 'YOUR_ACCESS_KEY_HERE',
          subject: \`New Notify Me Request for \${event.title}\`,
          ...formData
        })
      });
      const data = await response.json();
      */

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      onSuccess();
    } catch (error) {
      console.error("Submission failed:", error);
      // Handle error visually if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: isMobile ? 16 : 24,
    }}>
      {/* Blurred Background Image of the Event */}
      {event && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: -1,
          backgroundImage: `url(${event.image})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'blur(40px) brightness(0.3)',
          transform: 'scale(1.1)', // Prevent blurred edges from leaking
        }} />
      )}

      {/* Dark Overlay for better readability */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0, zIndex: -1,
          background: 'rgba(0,0,0,0.5)'
        }}
      />

      {/* Modal Container */}
      <div className="animate-scaleIn" style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: 460,
        background: 'rgba(20, 20, 25, 0.7)',
        backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24, overflow: 'hidden',
        boxShadow: '0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}>

        {/* Header */}
        <div style={{
          padding: '24px 24px 16px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Sparkles size={14} color="var(--accent)" />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '2px', color: 'var(--accent)', textTransform: 'uppercase' }}>
                Join Waitlist
              </span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'white', margin: 0, lineHeight: 1.2 }}>
              Notify Me
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 8, lineHeight: 1.5 }}>
              Enter your details below and we'll reach out when tickets for <strong style={{ color: 'white' }}>{event?.title}</strong> are available.
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
            width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', cursor: 'pointer', flexShrink: 0, transition: 'background 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px' }}>
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'rgba(255,255,255,0.8)' }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%', padding: '12px 14px 12px 40px', borderRadius: 12,
                    background: 'rgba(0,0,0,0.3)', border: `1px solid ${errors.name ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
                    color: 'white', fontSize: 14, outline: 'none', transition: 'all 0.2s',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.currentTarget.style.borderColor = errors.name ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}
                />
              </div>
              {errors.name && <span style={{ color: 'var(--accent)', fontSize: 11, marginTop: 4, display: 'block' }}>{errors.name}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'rgba(255,255,255,0.8)' }}>
                WhatsApp Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                <input
                  type="tel"
                  placeholder="+44 7123 456789"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  style={{
                    width: '100%', padding: '12px 14px 12px 40px', borderRadius: 12,
                    background: 'rgba(0,0,0,0.3)', border: `1px solid ${errors.whatsapp ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
                    color: 'white', fontSize: 14, outline: 'none', transition: 'all 0.2s'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.currentTarget.style.borderColor = errors.whatsapp ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}
                />
              </div>
              {errors.whatsapp && <span style={{ color: 'var(--accent)', fontSize: 11, marginTop: 4, display: 'block' }}>{errors.whatsapp}</span>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'rgba(255,255,255,0.8)' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)' }} />
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{
                    width: '100%', padding: '12px 14px 12px 40px', borderRadius: 12,
                    background: 'rgba(0,0,0,0.3)', border: `1px solid ${errors.email ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}`,
                    color: 'white', fontSize: 14, outline: 'none', transition: 'all 0.2s'
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.currentTarget.style.borderColor = errors.email ? 'var(--accent)' : 'rgba(255,255,255,0.1)'}
                />
              </div>
              {errors.email && <span style={{ color: 'var(--accent)', fontSize: 11, marginTop: 4, display: 'block' }}>{errors.email}</span>}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%', marginTop: 24, padding: '14px', borderRadius: 12,
              background: 'linear-gradient(135deg, var(--accent) 0%, #ff4b5c 100%)',
              color: 'white', fontSize: 15, fontWeight: 700,
              border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: '0 8px 20px rgba(226,55,68,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'transform 0.2s, box-shadow 0.2s',
              opacity: isSubmitting ? 0.7 : 1
            }}
            onMouseEnter={e => { if (!isSubmitting) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(226,55,68,0.4)'; } }}
            onMouseLeave={e => { if (!isSubmitting) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(226,55,68,0.3)'; } }}
          >
            {isSubmitting ? 'Submitting...' : 'Notify Me'}
            {!isSubmitting && <ArrowRight size={16} />}
          </button>
        </form>

      </div>
    </div>
  );
}

// ========================================
// COMPONENTS
// ========================================


// --- GLOBAL MINIMAL HEADER (APPLIED EVERYWHERE) ---
function GlobalMinimalHeader({ activePage, setActivePage }) {
  const isMobile = useIsMobile();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 990,
        padding: activePage === 'home'
          ? (isMobile ? '0px 8px 4px' : '0px 16px 8px')
          : (isMobile ? '16px 16px' : '24px 36px'),
        display: 'flex', alignItems: 'center', justifyItems: 'space-between',
        pointerEvents: 'none',
      }}>
        <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo */}
          <div
            onClick={() => setActivePage && setActivePage('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              pointerEvents: 'auto',
              marginTop: activePage === 'home' ? (isMobile ? -15 : -30) : 0
            }}
          >
            <img
              src="https://i.postimg.cc/2yTh0VYn/fhdrhderhxh.png"
              alt="Celebr8 Logo"
              style={{
                height: isMobile ? 90 : 150,
                width: 'auto',
                objectFit: 'contain'
              }}
            />
          </div>

          {/* Desktop Nav Pills */}
          {!isMobile && (
            <nav style={{
              display: 'flex', alignItems: 'center', gap: 2,
              padding: 5, background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(16px)',
              borderRadius: 30, border: '1px solid rgba(255,255,255,0.08)',
              pointerEvents: 'auto',
              marginTop: activePage === 'home' ? (isMobile ? -10 : -20) : 0
            }}>
              {[
                { id: 'home', label: 'Home', icon: Home, action: () => { if (activePage !== 'home') setActivePage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
                { id: 'events', label: 'Events', icon: Ticket, action: () => setActivePage && setActivePage('events') },
                { id: 'about', label: 'About', icon: Info, action: () => setActivePage && setActivePage('about') },
                { id: 'support', label: 'Support', icon: Headphones, action: () => setActivePage && setActivePage('support') },
              ].map((item) => {
                const isActive = activePage === item.id;
                const isHomeView = activePage === 'home';
                return (
                  <button
                    key={item.label}
                    onClick={item.action}
                    style={{
                      padding: isHomeView ? '8px 20px' : '8px 14px', border: 'none', borderRadius: 22, cursor: 'pointer',
                      fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-primary)',
                      background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                      color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                      transition: 'all 0.2s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'transparent'; }
                    }}
                  >
                    {isHomeView ? item.label : <item.icon size={18} />}
                  </button>
                )
              })}
            </nav>
          )}

          {/* Right Side  Search Button (Global for Desktop & Mobile) */}
          <button
            onClick={() => setIsSearchOpen(true)}
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)',
              border: 'none', cursor: 'pointer', pointerEvents: 'auto',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: activePage === 'home' ? (isMobile ? -15 : -20) : 0,
              transition: 'transform 0.2s ease, background 0.2s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          >
            <Search size={18} color="white" />
          </button>
        </div>
      </header>

      {/* Premium Glassmorphic Search Overlay */}
      {isSearchOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: isMobile ? '20px' : '60px 20px',
        }}>
          {/* Blurred Backdrop */}
          <div
            onClick={() => setIsSearchOpen(false)}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              animation: 'fadeIn 0.3s ease forwards'
            }}
          />

          {/* Search Box */}
          <div style={{
            position: 'relative', zIndex: 10,
            width: '100%', maxWidth: 600,
            background: 'rgba(25, 25, 35, 0.7)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            borderRadius: 24, padding: '24px',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
            animation: 'slideDown 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: 0 }}>Discover Events</h2>
              <button onClick={() => setIsSearchOpen(false)} style={{
                background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', cursor: 'pointer'
              }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ position: 'relative' }}>
              <Search size={20} color="rgba(255,255,255,0.5)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                autoFocus
                placeholder="Search artists, venues, or cities..."
                style={{
                  width: '100%', padding: '16px 16px 16px 48px',
                  borderRadius: 16, border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(0,0,0,0.3)', color: 'white', fontSize: 16,
                  outline: 'none', transition: 'all 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.15)'}
              />
            </div>

            {/* Quick Links */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
              {['Comedy', 'London', 'Music', 'Weekend'].map((tag) => (
                <span key={tag} style={{
                  padding: '6px 14px', borderRadius: 20,
                  background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.8)',
                  fontSize: 13, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- MOBILE BOTTOM NAV ---
function MobileBottomNav({ activePage, setActivePage }) {
  const items = [
    { icon: Home, label: 'Home', id: 'home' },
    { icon: Ticket, label: 'Events', id: 'events' },
    { icon: Info, label: 'About', id: 'about' },
    { icon: Headphones, label: 'Support', id: 'support' },
  ];

  return (
    <nav className="bottom-nav">
      {items.map((item) => (
        <button
          key={item.id}
          className={`bottom-nav-item ${activePage === item.id ? 'active' : ''}`}
          onClick={() => setActivePage(item.id)}
        >
          <item.icon />
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}

// --- SEARCH BAR (DARK) ---
function SearchBar() {
  return (
    <div className="page-container animate-fadeInUp" style={{ marginTop: 20, marginBottom: 8 }}>
      <div className="search-bar">
        <Search size={20} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Search for events, artists, venues..."
          readOnly
        />
        <div style={{
          padding: '4px 10px', background: 'var(--accent-light)',
          borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600,
          color: 'var(--accent)', whiteSpace: 'nowrap',
        }}>
          <Filter size={13} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 4 }} />
          Filters
        </div>
      </div>
    </div>
  );
}



// --- ANIMATED BRAND BANNER (HOME PAGE) ---
function AnimatedBrandBanner() {
  const isMobile = useIsMobile();

  const text1 = "CELEBR8 EVENTS  PREMIUM PLANNING  EXCLUSIVE ACCESS  UNFORGETTABLE NIGHTS  ";
  const text2 = "WEDDINGS  CORPORATE  PARTIES  LIVE CONCERTS  FESTIVALS  ";

  return (
    <div style={{
      width: '100%', overflow: 'hidden', padding: isMobile ? '8px 0' : '48px 0',
      background: 'linear-gradient(to bottom, transparent, rgba(10,10,15,0.4), transparent)',
      borderTop: '1px solid rgba(255,255,255,0.03)',
      borderBottom: '1px solid rgba(255,255,255,0.03)',
      marginBottom: isMobile ? 16 : 24, position: 'relative'
    }}>
      {/* Edge Gradients for smooth fade */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '10%', background: 'linear-gradient(to right, var(--bg-primary), transparent)', zIndex: 10 }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '10%', background: 'linear-gradient(to left, var(--bg-primary), transparent)', zIndex: 10 }} />

      {/* Track 1: Scrolling Left */}
      <div className="animate-scroll" style={{ display: 'flex', whiteSpace: 'nowrap', marginBottom: 16 }}>
        <h2 style={{
          fontSize: isMobile ? 10 : 40, fontWeight: 900, textTransform: 'uppercase', letterSpacing: isMobile ? '2px' : '4px',
          color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.15)',
          fontFamily: 'var(--font-primary)', paddingRight: '20px'
        }}>
          {text1.repeat(4)}
        </h2>
      </div>

      {/* Track 2: Scrolling Right (Accent Color) */}
      <div className="animate-scroll-reverse" style={{ display: 'flex', whiteSpace: 'nowrap', transform: 'translateX(-50%)' }}>
        <h2 style={{
          fontSize: isMobile ? 10 : 40, fontWeight: 900, textTransform: 'uppercase', letterSpacing: isMobile ? '2px' : '4px',
          color: 'var(--accent)', opacity: 0.9, textShadow: '0 0 40px rgba(226,55,68,0.4)',
          fontFamily: 'var(--font-primary)', paddingRight: '20px'
        }}>
          {text2.repeat(4)}
        </h2>
      </div>
    </div>
  );
}


// --- STACK CARD (3D SHUFFLE) ---
function StackCard({ event, isActive, style, onClick, isMobile, onBook }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'absolute',
        width: isMobile ? 320 : 420,
        height: isMobile ? 520 : 620,
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        background: 'var(--bg-secondary)',
        border: '1px solid rgba(255,255,255,0.05)',
        boxShadow: isActive ? '0 30px 60px rgba(0,0,0,0.6)' : '0 20px 40px rgba(0,0,0,0.4)',
        display: 'flex', flexDirection: 'column',
        ...style,
      }}
    >
      <div style={{ position: 'relative', height: '60%', overflow: 'hidden' }}>
        <img
          src={event.image}
          alt={event.title}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transition: 'transform 0.5s ease',
            transform: isHovered && isActive ? 'scale(1.05)' : 'scale(1)'
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, var(--bg-secondary) 0%, transparent 100%)'
        }} />

        <div style={{
          position: 'absolute', top: 16, right: 16,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)',
          padding: '6px 12px', borderRadius: 'var(--radius-full)',
          fontSize: 12, fontWeight: 700, color: 'white',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {event.category}
        </div>
      </div>

      <div style={{ padding: isMobile ? 20 : 24, flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)' }}>
        <div style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>
          {event.date}
        </div>
        <h3 style={{ fontSize: isMobile ? 24 : 28, fontWeight: 800, marginBottom: 12, lineHeight: 1.1, color: 'white' }}>
          {event.title}
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 13, marginBottom: 'auto' }}>
          <MapPin size={14} />
          {event.venue}, {event.city}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
          <div style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>{event.price}</div>
          <button
            onClick={(e) => { e.stopPropagation(); onBook(event); }}
            style={{
              padding: '10px 24px', borderRadius: 'var(--radius-full)',
              background: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
              color: 'white', border: 'none', fontWeight: 600, fontSize: 13,
              cursor: isActive ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              opacity: isActive ? 1 : 0.5
            }}
          >
            Buy Tickets
          </button>
        </div>
      </div>
    </div>
  );
}

// --- DISCOVER EVENTS SHUFFLE CARD (HOME PAGE) ---
function DiscoverEvents({ onBook }) {
  const isMobile = useIsMobile();
  const [sectionRef, isVisible] = useScrollReveal(0.1);
  const events = EVENTS;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Handle "Next" - Loop
  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % events.length);
  };

  // Auto-play (pause on hover)
  useEffect(() => {
    if (isHovering) return;
    const interval = setInterval(handleNext, 3500);
    return () => clearInterval(interval);
  }, [isHovering]);


  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe || isRightSwipe) handleNext();
  };

  const currentEvent = events[activeIndex];
  const categoryColor = currentEvent?.category === 'music' ? 'rgba(139, 92, 246, 0.6)' :
    currentEvent?.category === 'comedy' ? 'rgba(245, 158, 11, 0.6)' :
      currentEvent?.category === 'food' ? 'rgba(16, 185, 129, 0.6)' :
        currentEvent?.category === 'sports' ? 'rgba(59, 130, 246, 0.6)' :
          'var(--accent)';

  return (
    <div ref={sectionRef} style={{
      marginBottom: 60,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
      transition: 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)',
      position: 'relative',
      overflow: 'hidden',
      padding: '40px 0 80px',
      userSelect: 'none',
    }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Dynamic Background Glow */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '120%', height: '120%',
        background: `radial-gradient(ellipse at center, ${categoryColor} 0%, transparent 60%)`,
        filter: 'blur(100px)', pointerEvents: 'none',
        opacity: 0.15,
        transition: 'background 1s ease',
      }} />

      <div className="page-container" style={{ position: 'relative', zIndex: 10 }}>
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <h2 style={{ fontSize: isMobile ? 22 : 42, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 12 }}>
            Discover <span style={{ color: 'var(--accent)', textShadow: '0 0 30px rgba(226,55,68,0.4)' }}>Events</span>
          </h2>
          <div style={{
            display: 'inline-flex', padding: '6px 16px', borderRadius: 30,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            fontSize: 13, color: 'var(--text-secondary)', gap: 8, alignItems: 'center'
          }}>
            <span>{activeIndex + 1} / {events.length}</span>
            <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.1)' }} />
            <span>Shuffle to browse</span>
          </div>
        </div>

        {/* 3D Stack Container - "Fan" Layout */}
        <div
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          style={{
            position: 'relative',
            width: '100%',
            height: isMobile ? 440 : 740,
            display: 'flex', justifyContent: 'center',
            perspective: 1000,
          }}
        >
          {events.map((event, index) => {
            let offset = (index - activeIndex + events.length) % events.length;
            const isActive = offset === 0;

            if (offset > 3 && offset !== events.length - 1) return null;

            const hoverSpread = isHovering ? 20 : 0;
            const fanSpread = isMobile ? 15 : 30; // Increased spread for desktop

            let style = {};
            if (isActive) {
              style = {
                zIndex: 20,
                transform: `translate3d(0, 0, 0) rotate(0deg) scale(1)`,
                opacity: 1,
                filter: 'brightness(1)',
                cursor: 'pointer',
              };
            } else if (offset === 1) {
              style = {
                zIndex: 15,
                transform: `translate3d(${fanSpread + hoverSpread}px, -10px, -40px) rotate(4deg) scale(0.96)`,
                opacity: 0.9,
                filter: isHovering ? 'brightness(0.9)' : 'brightness(0.7)',
                transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                pointerEvents: 'none',
              };
            } else if (offset === 2) {
              style = {
                zIndex: 10,
                transform: `translate3d(${(fanSpread * 2) + (hoverSpread * 1.5)}px, -20px, -80px) rotate(8deg) scale(0.92)`,
                opacity: 0.6,
                filter: isHovering ? 'brightness(0.7)' : 'brightness(0.5)',
                transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s',
                pointerEvents: 'none',
              };
            } else if (offset === 3) {
              style = {
                zIndex: 5,
                transform: `translate3d(${(fanSpread * 3) + (hoverSpread * 2)}px, -30px, -120px) rotate(12deg) scale(0.88)`,
                opacity: 0.4,
                filter: isHovering ? 'brightness(0.5)' : 'brightness(0.3)',
                transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s',
                pointerEvents: 'none',
              };
            } else {
              style = {
                zIndex: 0,
                transform: 'translate3d(-200px, 100px, -200px) rotate(-20deg) scale(0.8)',
                opacity: 0,
                pointerEvents: 'none',
              };
            }

            return (
              <StackCard
                key={event.id}
                event={event}
                isActive={isActive}
                style={style}
                onClick={isActive ? handleNext : undefined}
                isMobile={isMobile}
                onBook={() => onBook(event)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}


// --- PROMO BANNER (DARK) ---
function PromoBanner() {
  const isMobile = useIsMobile();
  const [ref, isVisible] = useScrollReveal(0.1);

  return (
    <div ref={ref} className="page-container" style={{
      marginBottom: 32,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(15px)',
      transition: 'all 0.5s ease',
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a0a10 0%, #1a1028 50%, #0a1020 100%)',
        borderRadius: 'var(--radius-xl)', padding: isMobile ? '24px 20px' : '40px 48px',
        display: 'flex', alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 20, position: 'relative', overflow: 'hidden',
        border: '1px solid rgba(226,55,68,0.08)',
      }}>
        {/* Glow orbs */}
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 160, height: 160, borderRadius: '50%',
          background: 'rgba(226, 55, 68, 0.15)', filter: 'blur(50px)',
          animation: 'glowPulse 3s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: -30, left: -30,
          width: 120, height: 120, borderRadius: '50%',
          background: 'rgba(139, 92, 246, 0.1)', filter: 'blur(40px)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h3 style={{
            color: 'white', fontSize: isMobile ? 20 : 26,
            fontWeight: 800, marginBottom: 6,
          }}>
            Download the Celebr8 App
          </h3>
          <p style={{
            color: 'rgba(255,255,255,0.5)', fontSize: isMobile ? 13 : 15,
            maxWidth: 420,
          }}>
            Get exclusive deals, early access to events, and seamless ticket booking on the go.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, position: 'relative', zIndex: 1 }}>
          <button style={{
            padding: '12px 24px', borderRadius: 'var(--radius-full)',
            background: 'var(--accent)', color: 'white', border: 'none',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'var(--font-primary)',
            transition: 'all 0.2s ease',
            boxShadow: 'var(--shadow-accent)',
          }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            App Store
          </button>
          <button style={{
            padding: '12px 24px', borderRadius: 'var(--radius-full)',
            background: 'transparent', color: 'white',
            border: '1.5px solid rgba(255,255,255,0.15)',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'var(--font-primary)',
            transition: 'all 0.2s ease',
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            Google Play
          </button>
        </div>
      </div>
    </div>
  );
}

// --- FOOTER (DARK) ---
function Footer() {
  const isMobile = useIsMobile();
  return (
    <footer style={{
      background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)',
      padding: isMobile ? '24px 0 100px' : '40px 0',
    }}>
      <div className="page-container">
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="https://i.postimg.cc/2yTh0VYn/fhdrhderhxh.png"
              alt="Celebr8 Logo"
              style={{
                height: 110,
                width: 'auto',
                objectFit: 'contain'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {['Terms & Conditions', 'Privacy Policy', 'Contact Us', 'About', 'Careers'].map(link => (
              <a key={link} href="#" style={{
                fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
                onMouseEnter={(e) => e.target.style.color = 'var(--accent)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
              >
                {link}
              </a>
            ))}
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            2026 Celebr8 Events. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// --- SCROLL REVEAL HELPERS ---
function RevealSection({ children, delay = 0, className = "", style = {} }) {
  const [ref, isVisible] = useScrollReveal(0.15);
  return (
    <div ref={ref}
      className={`${className} ${isVisible ? 'about-reveal-visible' : 'about-reveal-hidden'}`}
      style={{ transitionDelay: `${delay}s`, ...style }}>
      {children}
    </div>
  );
}

function ScaleRevealSection({ children, delay = 0, className = "", style = {} }) {
  const [ref, isVisible] = useScrollReveal(0.2);
  return (
    <div ref={ref}
      className={`${className} ${isVisible ? 'about-reveal-scale-visible' : 'about-reveal-scale-hidden'}`}
      style={{ transitionDelay: `${delay}s`, ...style }}>
      {children}
    </div>
  );
}

// --- ANIMATED STAT ---
function AnimatedStat({ value, suffix, label, color, delay = 0 }) {
  const [ref, isVisible] = useScrollReveal(0.3);
  const [count, setCount] = useState(0);
  const numericValue = parseInt(value);

  useEffect(() => {
    if (!isVisible) return;
    let current = 0;
    const totalFrames = 60;
    const step = numericValue / totalFrames;
    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      current += step;
      if (frame >= totalFrames) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, numericValue]);

  return (
    <div ref={ref} className="about-stat-card"
      style={{ transitionDelay: `${delay}s`, opacity: isVisible ? 1 : 0, transition: 'opacity 0.8s ease' }}>
      <div className="about-stat-number" style={{ color }}>{count}{suffix}</div>
      <div className="about-stat-label">{label}</div>
    </div>
  );
}

// --- ABOUT PAGE (LUMINA INSPIRED REDESIGN) ---
function AboutPage() {
  const isMobile = useIsMobile();

  return (
    <div className="about-page" style={{ paddingTop: isMobile ? 120 : 120, paddingBottom: isMobile ? 40 : 80, overflowX: 'hidden' }}>

      {/* Background Orbs (Global Premium Feel) */}
      <div className="about-orb" style={{
        position: 'absolute', top: -100, left: -100, width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(226,55,68,0.05) 0%, transparent 70%)',
        animation: 'orbFloat1 15s ease-in-out infinite',
      }} />
      <div className="about-orb" style={{
        position: 'absolute', top: '20%', right: -150, width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)',
        animation: 'orbFloat2 18s ease-in-out infinite reverse',
      }} />

      {/*  HERO SECTION  */}
      <section className="page-container" style={{ position: 'relative', zIndex: 10, marginBottom: isMobile ? 40 : 120 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? 24 : 80,
          alignItems: 'center',
        }}>
          {/* Text Content */}
          <div style={{ order: isMobile ? 2 : 1 }}>
            <RevealSection delay={0.1}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <div style={{ height: 1, width: 48, background: 'var(--accent)' }} />
                <span style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '4px', color: 'var(--text-muted)' }}>
                  About The Agency
                </span>
              </div>
              <h1 style={{
                fontFamily: 'var(--font-primary)',
                fontSize: isMobile ? 28 : 56,
                fontWeight: 600,
                lineHeight: 1.1,
                marginBottom: isMobile ? 16 : 32,
              }}>
                We Bring <br /><span style={{ color: 'var(--accent)', fontStyle: 'italic', fontWeight: 400 }}>People</span> Together.
              </h1>
            </RevealSection>

            <RevealSection delay={0.2}>
              <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? 14 : 18, fontWeight: 300, lineHeight: 1.8, marginBottom: isMobile ? 16 : 24 }}>
                It all started at a party  not just any party, but one of those unforgettable moments shared among close friends, filled with laughter, music, and memories. As a group who always found joy in planning, celebrating, and making each moment special, we realized something important: bringing people together is what we truly love.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: isMobile ? 13 : 16, fontWeight: 300, lineHeight: 1.8, marginBottom: isMobile ? 16 : 24 }}>
                That when the idea for Celebr8 took shape. What began as a shared passion for celebration turned into a full-fledged event planning company. We wanted to help others enjoy their special occasions just like we did  without the stress, without the hassle, and with every detail taken care of.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: isMobile ? 13 : 16, fontWeight: 300, lineHeight: 1.8, marginBottom: isMobile ? 24 : 40 }}>
                At Celebr8, we handle everything from A to Z  so our clients can simply show up and soak in the moment. Whether it a wedding, corporate event, birthday, or any celebration in between, we here to make it joyful, seamless, and unforgettable.
              </p>

            </RevealSection>
          </div>

          {/* Hero Images */}
          <div style={{ order: isMobile ? 1 : 2, position: 'relative' }}>
            <ScaleRevealSection delay={0.3} style={{ position: 'relative', zIndex: 10 }}>
              <img
                alt="Event planner setup"
                src="https://static.wixstatic.com/media/84c75ccbafc643568ec4f391a0fb4cc6.jpg/v1/fill/w_560,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Event%20Planner.jpg"
                style={{
                  width: '100%', height: 'auto', objectFit: 'cover',
                  borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  filter: 'grayscale(100%)', transition: 'filter 0.7s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => e.currentTarget.style.filter = 'grayscale(0%)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'grayscale(100%)'}
              />
            </ScaleRevealSection>

            {!isMobile && (
              <ScaleRevealSection delay={0.5} style={{
                position: 'absolute', bottom: -40, right: -40, width: '66%', zIndex: 20
              }}>
                <img
                  alt="Wedding table arrangement"
                  src="https://static.wixstatic.com/media/11062b_037e7efcce9c4fc791f2253defaba583~mv2.jpg/v1/fill/w_560,h_400,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/Wedding%20Table%20Arrangement%20.jpg"
                  style={{
                    width: '100%', height: 'auto', objectFit: 'cover',
                    borderRadius: 4, border: '4px solid var(--bg-primary)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                  }}
                />
              </ScaleRevealSection>
            )}

            {/* Decorative Circle */}
            <div style={{
              position: 'absolute', top: -40, left: -40, width: '100%', height: '100%',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%',
              zIndex: 0, opacity: 0.5, transform: 'scale(1.5)', pointerEvents: 'none'
            }} />
          </div>
        </div>
      </section>

      {/*  EXPERTISE SECTION  */}
      <section style={{
        background: 'var(--bg-card)', padding: isMobile ? '40px 0' : '120px 0',
        position: 'relative', borderTop: '1px solid rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.03)'
      }}>
        {/* Subtle Background Overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none',
          backgroundImage: `url('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1600&q=80')`,
          backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(100%)'
        }} />

        <div className="page-container" style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ marginBottom: isMobile ? 32 : 64 }}>
            <RevealSection delay={0.1}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ height: 1, width: 48, background: 'var(--accent)' }} />
                <span style={{ fontSize: isMobile ? 10 : 12, textTransform: 'uppercase', letterSpacing: '4px', color: 'var(--text-muted)' }}>
                  Our Expertise
                </span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: isMobile ? 24 : 48, fontWeight: 500, lineHeight: 1.2 }}>
                We are very talented.<br />Check what we can do!
              </h2>
            </RevealSection>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: isMobile ? 24 : 48
          }}>
            {[
              { icon: Heart, title: 'Weddings', desc: 'Cinematic documentation of your special day, ensuring every tear and smile is preserved.' },
              { icon: Building, title: 'Corporate', desc: 'High-end branding and structural execution that elevates your business identity.' },
              { icon: Music, title: 'Concerts', desc: 'Electrifying live events with world-class audio, lighting, and stage production.' },
              { icon: Camera, title: 'Design', desc: 'Immersive visual setups and aesthetic direction that define your event\'s unique atmosphere.' },
            ].map((item, idx) => (
              <RevealSection key={item.title} delay={0.2 + (idx * 0.1)}>
                <div className="expertise-card" style={{ cursor: 'pointer', padding: isMobile ? '16px' : '0' }}
                  onMouseEnter={e => {
                    e.currentTarget.querySelector('.icon-wrapper').style.transform = 'scale(1.1)';
                    e.currentTarget.querySelector('.icon-wrapper').style.color = 'var(--accent)';
                    e.currentTarget.querySelector('h3').style.color = 'var(--accent)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.querySelector('.icon-wrapper').style.transform = 'scale(1)';
                    e.currentTarget.querySelector('.icon-wrapper').style.color = 'inherit';
                    e.currentTarget.querySelector('h3').style.color = 'inherit';
                  }}
                >
                  <div className="icon-wrapper" style={{
                    fontSize: isMobile ? 32 : 40, color: 'var(--accent)', marginBottom: isMobile ? 16 : 24,
                    transition: 'all 0.3s ease', display: 'inline-block'
                  }}>
                    <item.icon size={isMobile ? 32 : 40} />
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-primary)', fontSize: isMobile ? 20 : 24, fontWeight: 500, marginBottom: isMobile ? 8 : 16, transition: 'color 0.3s ease' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: isMobile ? 12 : 14, color: 'var(--text-muted)', lineHeight: 1.8, fontWeight: 300 }}>
                    {item.desc}
                  </p>
                </div>
              </RevealSection>
            ))}
          </div>

          <div style={{ marginTop: isMobile ? 40 : 80, borderTop: '1px solid rgba(255,255,255,0.05)', width: '50%' }} />
        </div>

        {/* Decorative Floating Images (Desktop Only) */}
        {!isMobile && (
          <div style={{ position: 'absolute', top: 80, right: 0, width: '33%', height: '100%', pointerEvents: 'none' }}>
            <img alt="Behind scenes 1" src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=300&fit=crop" style={{
              absolute: true, top: 40, right: 40, width: 250, height: 190, objectFit: 'cover',
              border: '4px solid var(--bg-card)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', transform: 'rotate(3deg)'
            }} />
            <img alt="Behind scenes 2" src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=400&h=300&fit=crop" style={{
              position: 'absolute', top: 190, right: 160, width: 220, height: 160, objectFit: 'cover',
              border: '4px solid var(--bg-card)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', transform: 'rotate(-6deg)', zIndex: 10
            }} />
          </div>
        )}
      </section>

      {/*  OUR COMMITMENT  */}
      <section style={{ padding: isMobile ? '40px 0' : '120px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="page-container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? 32 : 80,
            alignItems: 'center',
          }}>
            <RevealSection delay={0.1}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: isMobile ? 16 : 24 }}>
                <div style={{ height: 1, width: 48, background: 'var(--accent)' }} />
                <span style={{ fontSize: isMobile ? 10 : 12, textTransform: 'uppercase', letterSpacing: '4px', color: 'var(--text-muted)' }}>
                  Our Commitment
                </span>
              </div>
              <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: isMobile ? 24 : 48, fontWeight: 500, lineHeight: 1.2, marginBottom: isMobile ? 16 : 32 }}>
                Meticulously Planned.<br />Flawlessly Executed.
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: isMobile ? 14 : 18, fontWeight: 300, lineHeight: 1.8 }}>
                We pay attention to the small details, ensuring that every aspect of your event is meticulously planned and executed. Our team is dedicated to creating an experience that exceeds your expectations and leaves a lasting impression on you and your guests.
              </p>
            </RevealSection>

            {/* Visual element for Commitment */}
            <ScaleRevealSection delay={0.3}>
              <div className="liquid-glass" style={{
                borderRadius: isMobile ? 16 : 24, padding: isMobile ? 24 : 48, position: 'relative', overflow: 'hidden',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
              }}>
                <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: 'radial-gradient(circle, rgba(226,55,68,0.1) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(40px)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 20 : 32, position: 'relative', zIndex: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? 16 : 24 }}>
                    <div style={{ width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius: '50%', background: 'rgba(226,55,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                      <CheckCircle size={isMobile ? 20 : 24} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 600, marginBottom: 8, color: 'white' }}>Small Details</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: isMobile ? 12 : 14, lineHeight: 1.6 }}>Every single element is reviewed and perfected.</p>
                    </div>
                  </div>
                  <div style={{ height: 1, width: '100%', background: 'rgba(255,255,255,0.05)' }} />
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: isMobile ? 16 : 24 }}>
                    <div style={{ width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, borderRadius: '50%', background: 'rgba(226,55,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                      <Star size={isMobile ? 20 : 24} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 600, marginBottom: 8, color: 'white' }}>Exceed Expectations</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: isMobile ? 12 : 14, lineHeight: 1.6 }}>We don't just meet standards, we set new ones.</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScaleRevealSection>
          </div>
        </div>
      </section>



      {/*  FEATURED PROJECTS  */}
      <section style={{ padding: isMobile ? '40px 0' : '120px 0' }}>
        <div className="page-container">
          <RevealSection>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: isMobile ? 24 : 40 }}>
              <div style={{ height: 1, width: 48, background: 'var(--accent)' }} />
              <span style={{ fontSize: isMobile ? 10 : 12, textTransform: 'uppercase', letterSpacing: '4px', color: 'var(--text-muted)' }}>
                Featured Projects
              </span>
            </div>
          </RevealSection>
        </div>

        {/* Edge-to-Edge Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? 2 : 4
        }}>
          {[
            { img: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=750&fit=crop', title: 'Innocence', cat: 'Portrait' },
            { img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=750&fit=crop', title: 'Crimson Flow', cat: 'Fashion' },
            { img: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600&h=750&fit=crop', title: 'The Valley', cat: 'Nature' },
            { img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&h=750&fit=crop', title: 'Steel Bones', cat: 'Architecture' },
          ].map((proj, idx) => (
            <RevealSection key={proj.title} delay={idx * 0.1}>
              <div className="lumina-project-card" style={{
                position: 'relative', overflow: 'hidden', aspectRatio: '4/5', cursor: 'pointer', background: '#111'
              }}
                onMouseEnter={e => {
                  e.currentTarget.querySelector('img').style.transform = 'scale(1.1)';
                  e.currentTarget.querySelector('.overlay').style.opacity = 1;
                  e.currentTarget.querySelector('.content').style.transform = 'translateY(16px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.querySelector('img').style.transform = 'scale(1)';
                  e.currentTarget.querySelector('.overlay').style.opacity = 0;
                  e.currentTarget.querySelector('.content').style.transform = 'translateY(0)';
                }}
              >
                <img src={proj.img} alt={proj.title} style={{
                  width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.7s ease'
                }} />
                <div className="overlay" style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                  opacity: 0, transition: 'opacity 0.3s ease',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <div className="content" style={{
                    textAlign: 'center', transform: 'translateY(0)', transition: 'transform 0.3s ease'
                  }}>
                    <h4 style={{ fontFamily: 'var(--font-primary)', color: 'white', fontSize: 24, fontWeight: 500 }}>{proj.title}</h4>
                    <p style={{ color: 'var(--accent)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '2px', marginTop: 8 }}>{proj.cat}</p>
                  </div>
                </div>
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/*  CONTACT CTA  */}
      <section style={{
        padding: isMobile ? '60px 0' : '160px 0', background: 'var(--bg-card)',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* Subtle Background Pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04, pointerEvents: 'none',
          backgroundImage: `url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1600&q=80')`,
          backgroundSize: 'cover', backgroundPosition: 'center', filter: 'grayscale(100%)'
        }} />

        <div className="page-container" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <RevealSection delay={0.1}>
            <p style={{ fontSize: isMobile ? 12 : 14, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: isMobile ? 12 : 16 }}>
              Interested in working together?
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: isMobile ? 24 : 32 }}>
              {!isMobile && <div style={{ height: 1, width: 64, background: 'rgba(255,255,255,0.2)' }} />}
              <h2 style={{ fontFamily: 'var(--font-primary)', fontSize: isMobile ? 28 : 56, fontWeight: 500 }}>Contact Us</h2>
              {!isMobile && <div style={{ height: 1, width: 64, background: 'rgba(255,255,255,0.2)' }} />}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: isMobile ? 14 : 16, maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.8 }}>
              We are always looking for new challenges and interesting partners. Also, we love to celebrate. Let's create something unforgettable.
            </p>

            <button style={{
              display: 'inline-block', border: '1px solid var(--accent)', color: 'var(--accent)', background: 'transparent',
              padding: isMobile ? '12px 32px' : '16px 40px', textTransform: 'uppercase', fontSize: 12, letterSpacing: '3px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.3s ease'
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent)'; }}
            >
              Get In Touch
            </button>
          </RevealSection>
        </div>

        {/* Decorative Circles */}
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-5%', width: 256, height: 256,
          border: '1px solid rgba(226,55,68,0.2)', borderRadius: '50%', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', right: '-10%', width: 384, height: 384,
          border: '1px solid rgba(226,55,68,0.1)', borderRadius: '50%', pointerEvents: 'none'
        }} />
      </section>

    </div>
  );
}






// --- SUPPORT PAGE ---
function SupportPage() {
  const isMobile = useIsMobile();
  return (
    <div className="about-page" style={{ paddingTop: isMobile ? 60 : 100, paddingBottom: 80 }}>
      {/* Background Orbs */}
      <div className="about-orb about-orb-1" />
      <div className="about-orb about-orb-2" />
      <div className="about-orb about-orb-3" />

      {/* Hero Section */}
      <RevealSection className="about-hero" style={{ minHeight: '40vh' }}>
        <div className="about-hero-label">Contact & Help</div>
        <h1 className="about-hero-title">
          We're here <span className="about-hero-accent">to help</span>
        </h1>
        <p className="about-hero-subtitle">
          Have a question about an event or need assistance with your booking?
          Our dedicated support team is available to assist you.
        </p>
      </RevealSection>

      {/* Support Content */}
      <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
        <RevealSection>
          <div className="support-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 10
          }}>
            {[
              { icon: Mail, title: 'Email Us', desc: 'info@celebr8events.co.uk', color: '#e23744' },
              { icon: Phone, title: 'Call Us', desc: '+44 7423 022355', color: '#1DB954' },
              { icon: MapPin, title: 'Our Office', desc: 'Office 11867, 182-184 High Street North, London, E6 2JA', color: '#4da6ff' },
              { icon: Info, title: 'FAQs', desc: 'A-to-Z Event Planning Specialists', color: '#f59e0b' },
            ].map((item, idx) => (
              <ScaleRevealSection key={item.title} delay={idx * 0.1}>
                <div className="about-service-card" style={{ height: '100%', cursor: 'pointer' }}>
                  <div className="service-icon-wrap" style={{
                    background: `${item.color}15`,
                    width: isMobile ? 36 : 44, height: isMobile ? 36 : 44, borderRadius: isMobile ? 10 : 14,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: isMobile ? 10 : 16
                  }}>
                    <item.icon size={isMobile ? 18 : 22} color={item.color} />
                  </div>
                  <h4 style={{ fontSize: isMobile ? 13 : 16, marginBottom: 4 }}>{item.title}</h4>
                  <p style={{ fontSize: isMobile ? 10 : 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              </ScaleRevealSection>
            ))}
          </div>
        </RevealSection>

        {/* Message Form (Optional visual addition for completeness) */}
        <RevealSection delay={0.4} style={{ marginTop: 32 }}>
          <div className="about-testimonial-card" style={{ textAlign: 'left', padding: isMobile ? '24px 16px' : '40px 36px' }}>
            <h3 className="about-commitment-title" style={{ fontSize: isMobile ? 18 : 22, marginBottom: 8 }}>Drop us a message</h3>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 20, fontSize: isMobile ? 12 : 14 }}>We'll get back to you within 24 hours.</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
              <input type="text" placeholder="Your Name" style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10, padding: '10px 14px', color: 'white', outline: 'none', fontSize: isMobile ? 12 : 14
              }} />
              <input type="email" placeholder="Email Address" style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10, padding: '10px 14px', color: 'white', outline: 'none', fontSize: isMobile ? 12 : 14
              }} />
              <textarea placeholder="How can we help?" rows={3} style={{
                gridColumn: isMobile ? 'auto' : 'span 2',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10, padding: '10px 14px', color: 'white', outline: 'none', resize: 'none', fontSize: isMobile ? 12 : 14
              }} />
              <button style={{
                gridColumn: isMobile ? 'auto' : 'span 2',
                background: 'var(--accent)', color: 'white', border: 'none',
                borderRadius: 10, padding: '12px', fontWeight: 700, cursor: 'pointer', fontSize: isMobile ? 13 : 14
              }}>Send Message</button>
            </div>
          </div>
        </RevealSection>
      </div>
    </div>
  );
}

// Obsolete BookingPage and ContactDetailsModal removed for performance
// --- NEW EVENTS PAGE (PREMIUM 3D COVERFLOW & MOBILE SNAP) ---
function EventsPage({ onBook, onNotifyMe }) {
  const isMobile = useIsMobile();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  const totalSlides = EVENTS.length;

  // Handle Wheel Scroll for Desktop
  const handleWheel = (e) => {
    if (isMobile) return;
    e.preventDefault();
    if (e.deltaY > 0) {
      setActiveIndex(prev => Math.min(prev + 1, totalSlides - 1));
    } else if (e.deltaY < 0) {
      setActiveIndex(prev => Math.max(prev - 1, 0));
    }
  };

  // Attach wheel listener manually to prevent default scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (container && !isMobile) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [isMobile, totalSlides]);

  // Handle Swipe for Mobile
  const [touchStart, setTouchStart] = useState(null);
  const handleTouchStart = (e) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (!touchStart) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) setActiveIndex(prev => Math.min(prev + 1, totalSlides - 1)); // Swipe left
    if (diff < -50) setActiveIndex(prev => Math.max(prev - 1, 0)); // Swipe right
    setTouchStart(null);
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
      style={{
        height: '100vh',
        width: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        // Transparent to allow the global Liquid Glass mesh to bleed through
        background: 'transparent'
      }}
    >
      {/* Slide Counter  Fixed Premium Typography */}
      <div style={{
        position: 'fixed', top: isMobile ? 80 : 40, right: isMobile ? 24 : 48, zIndex: 999,
        display: 'flex', alignItems: 'baseline', gap: 4,
        fontFamily: 'var(--font-primary)', fontWeight: 200, color: 'rgba(255,255,255,0.4)',
        fontSize: isMobile ? 14 : 18, letterSpacing: '2px',
        pointerEvents: 'none',
      }}>
        <span style={{ fontSize: isMobile ? 32 : 56, fontWeight: 800, color: 'white', letterSpacing: '-2px', lineHeight: 1 }}>
          {String(activeIndex + 1).padStart(2, '0')}
        </span>
        <span style={{ margin: '0 4px', opacity: 0.3 }}>/</span>
        <span>{String(totalSlides).padStart(2, '0')}</span>
      </div>

      {/* 3D Carousel Track */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: isMobile ? 'none' : '1500px',
        transformStyle: 'preserve-3d',
      }}>
        {EVENTS.map((event, index) => {
          // Calculate relative position based on active index
          const offset = index - activeIndex;
          const absOffset = Math.abs(offset);
          const isActive = offset === 0;

          // Desktop 3D Coverflow Logic
          let transformDesk = `translateX(${offset * 120}%) scale(${isActive ? 1 : 0.75}) rotateY(${offset * -15}deg) translateZ(${isActive ? 0 : -200}px)`;
          let opacityDesk = isActive ? 1 : Math.max(0, 1 - (absOffset * 0.4));
          let zIndexDesk = 100 - absOffset;
          let filterDesk = isActive ? 'blur(0px) brightness(1)' : `blur(${absOffset * 3}px) brightness(0.4)`;

          // Mobile Horizontal Peek Logic
          let transformMob = `translateX(${offset * 105}%) scale(${isActive ? 1 : 0.9})`;
          let filterMob = isActive ? 'blur(0px) brightness(1)' : `blur(2px) brightness(0.6)`;

          return (
            <div
              key={event.id}
              onClick={() => setActiveIndex(index)}
              style={{
                position: 'absolute',
                width: isMobile ? '85%' : '45%',
                maxWidth: isMobile ? 400 : 700,
                height: isMobile ? '70%' : '75%',
                maxHeight: 800,
                transition: 'all 0.8s cubic-bezier(0.25, 0.8, 0.25, 1)',
                transform: isMobile ? transformMob : transformDesk,
                opacity: isMobile ? (isActive ? 1 : 0.8) : opacityDesk,
                zIndex: zIndexDesk,
                filter: isMobile ? filterMob : filterDesk,
                cursor: isActive ? 'default' : 'pointer',
                // Premium Glassmorphic Card Container
                background: 'rgba(20, 20, 30, 0.2)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: isActive ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.05)',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: isActive ? '0 30px 60px rgba(0,0,0,0.6), inset 0 0 40px rgba(255,255,255,0.05)' : 'none',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Event Poster Area */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: isMobile ? '55%' : '60%',
                overflow: 'hidden',
              }}>
                <img
                  src={event.image}
                  alt={event.title}
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    transition: 'transform 6s ease-out',
                    transform: isActive ? 'scale(1.05)' : 'scale(1)',
                  }}
                />
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(16,16,24,1) 0%, transparent 100%)',
                }} />

                {/* Floating Category Pill */}
                <div style={{
                  position: 'absolute', top: 20, left: 24,
                  background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)',
                  padding: '6px 14px', borderRadius: 100,
                  fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.9)',
                  letterSpacing: '1px', textTransform: 'uppercase',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}>
                  {event.category} {event.tag && ` -  ${event.tag}`}
                </div>
              </div>

              {/* Content Area - Deep Dark UI */}
              <div style={{
                flex: 1,
                padding: isMobile ? '20px 24px' : '32px 40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                background: 'rgba(16, 16, 24, 0.7)',
              }}>
                {/* Date Highlight */}
                <div style={{
                  color: 'var(--accent)', fontSize: isMobile ? 12 : 14,
                  fontWeight: 800, textTransform: 'uppercase', letterSpacing: '4px',
                  marginBottom: isMobile ? 8 : 12,
                }}>
                  {event.date}
                </div>

                {/* Title */}
                <h2 style={{
                  fontSize: isMobile ? 28 : 42,
                  fontWeight: 800, color: 'white',
                  letterSpacing: '-1px', lineHeight: 1.1,
                  margin: 0, marginBottom: 16,
                  textShadow: '0 4px 12px rgba(0,0,0,0.4)'
                }}>
                  {event.title}
                </h2>

                {/* Location */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  color: 'rgba(255,255,255,0.5)', fontSize: isMobile ? 13 : 15,
                  fontWeight: 500, marginBottom: 'auto'
                }}>
                  <MapPin size={16} color="var(--accent)" />
                  {event.venue}, {event.city}
                </div>

                {/* Bottom Actions Row */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginTop: 20,
                  pointerEvents: isActive ? 'auto' : 'none'
                }}>
                  <div style={{
                    fontSize: isMobile ? 22 : 28, fontWeight: 800, color: 'white',
                  }}>
                    {event.price}
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); onNotifyMe(event); }}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)', borderRadius: 100,
                        padding: isMobile ? '10px' : '12px',
                        color: 'white', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      title="Notify Me"
                    >
                      <Bell size={18} />
                    </button>

                    <button
                      onClick={(e) => { e.stopPropagation(); onBook(event); }}
                      style={{
                        background: 'linear-gradient(135deg, var(--accent) 0%, #f04050 100%)',
                        border: 'none', borderRadius: 100,
                        padding: isMobile ? '10px 24px' : '12px 32px',
                        color: 'white', fontSize: isMobile ? 14 : 15, fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                        boxShadow: '0 8px 24px var(--accent-glow)',
                        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 12px 32px var(--accent-glow)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 8px 24px var(--accent-glow)';
                      }}
                    >
                      Book <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}



// --- TICKET CONFIRMATION PAGE (PREMIUM 3D ANIMATION + SEAT DETAILS) ---
function TicketConfirmationPage({ event, bookingDetails, userDetails, onHome }) {
  const isMobile = useIsMobile();
  const downloadTicketRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showContent, setShowContent] = useState(false);

  const [orderId] = useState(() => 'TRX-' + Math.random().toString(36).substring(2, 8).toUpperCase());
  const platformFee = 99;
  const grandTotal = bookingDetails.totalPrice + platformFee;
  const seatIds = bookingDetails.seatIdentifiers || [];

  const qrData = JSON.stringify({
    order: orderId, event: event.title, date: event.date, time: '19:00',
    venue: event.venue, zone: bookingDetails.zoneName, seats: seatIds.join(', '),
    ticketCount: bookingDetails.ticketCount, guest: userDetails.name,
    email: userDetails.email, total: '\u00a3' + grandTotal,
  });

  // QR code is generated instantly via QRCodeCanvas
  const [showScreenshotReminder, setShowScreenshotReminder] = useState(false);

  useEffect(() => { const t = setTimeout(() => setShowContent(true), 1800); return () => clearTimeout(t); }, []);

  // Show screenshot reminder on scroll
  const reminderShown = useRef(false);
  useEffect(() => {
    if (showContent) {
      const handleScroll = () => {
        if (!reminderShown.current) {
          reminderShown.current = true;
          setShowScreenshotReminder(true);
          setTimeout(() => setShowScreenshotReminder(false), 5000);
          window.removeEventListener('scroll', handleScroll);
        }
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [showContent]);

  // Detect platform for appropriate download strategy
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);

  // Pre-generate QR code as data URL for download template
  const [qrDataUrl, setQrDataUrl] = useState('');
  useEffect(() => {
    QRCode.toDataURL(qrData, { width: 200, margin: 2, errorCorrectionLevel: 'H' })
      .then(url => setQrDataUrl(url))
      .catch(() => { });
  }, [qrData]);

  const handleDownloadTicket = async () => {
    if (!downloadTicketRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      // Ensure QR data URL is ready
      let finalQrUrl = qrDataUrl;
      if (!finalQrUrl) {
        finalQrUrl = await QRCode.toDataURL(qrData, { width: 200, margin: 2, errorCorrectionLevel: 'H' });
      }
      // Inject QR image into the download template
      const qrImg = downloadTicketRef.current.querySelector('#confirm-download-qr-img');
      if (qrImg) qrImg.src = finalQrUrl;
      // Small delay to let the image render
      await new Promise(r => setTimeout(r, 100));
      const canvas = await html2canvas(downloadTicketRef.current, {
        backgroundColor: '#0a0a14', scale: 3, useCORS: true, logging: false,
        allowTaint: true, imageTimeout: 15000
      });
      const fileName = `Celebr8-Ticket-${event.title.replace(/\s+/g, '-')}-${orderId}.png`;

      canvas.toBlob(async (blob) => {
        if (!blob) { setIsDownloading(false); return; }

        // iOS & Android: use Web Share API to save to Photos/Gallery
        if ((isIOS || isAndroid) && navigator.share) {
          try {
            const file = new File([blob], fileName, { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({ files: [file], title: 'Celebr8 Event Ticket' });
              setDownloadSuccess(true);
              setShowScreenshotReminder(true);
              setTimeout(() => setDownloadSuccess(false), 3000);
              setTimeout(() => setShowScreenshotReminder(false), 6000);
              setIsDownloading(false);
              return;
            }
          } catch (e) {
            if (e.name === 'AbortError') { setIsDownloading(false); return; }
            // Fall through to direct download
          }
        }

        // Desktop & fallback: direct file download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
        setDownloadSuccess(true);
        setShowScreenshotReminder(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
        setTimeout(() => setShowScreenshotReminder(false), 6000);
        setIsDownloading(false);
      }, 'image/png', 1.0);
    } catch (err) {
      console.error('Download failed:', err);
      setIsDownloading(false);
    }
  };

  const tickCSS = `
    @keyframes tick3dIn{0%{transform:perspective(600px) rotateY(-180deg) scale(.3);opacity:0}50%{transform:perspective(600px) rotateY(-20deg) scale(1.15);opacity:1}70%{transform:perspective(600px) rotateY(10deg) scale(.95)}100%{transform:perspective(600px) rotateY(0) scale(1)}}
    @keyframes circDraw{0%{stroke-dashoffset:166}100%{stroke-dashoffset:0}}
    @keyframes chkDraw{0%{stroke-dashoffset:48}100%{stroke-dashoffset:0}}
    @keyframes tickGlow{0%,100%{filter:drop-shadow(0 0 8px rgba(34,197,94,.3))}50%{filter:drop-shadow(0 0 25px rgba(34,197,94,.6))}}
    @keyframes slideUp{0%{transform:translateY(40px);opacity:0}100%{transform:translateY(0);opacity:1}}
    @keyframes confetti{0%{transform:translateY(0) rotate(0);opacity:1}100%{transform:translateY(-120px) rotate(720deg);opacity:0}}
  `;

  return (
    <div className="animate-fadeIn" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'radial-gradient(ellipse at 50% 30%,rgba(34,197,94,.06) 0%,#0a0a14 50%,#000 100%)', padding: isMobile ? '40px 16px' : '60px 20px', overflow: 'hidden', position: 'relative' }}>
      <style>{tickCSS}</style>

      {/* Confetti */}
      {[...Array(12)].map((_, i) => (<div key={i} style={{ position: 'absolute', top: '15%', left: `${15 + Math.random() * 70}%`, width: 6 + Math.random() * 6, height: 6 + Math.random() * 6, borderRadius: Math.random() > .5 ? '50%' : 2, background: ['#22c55e', '#e23744', '#fbbf24', '#60a5fa', '#a78bfa'][i % 5], animation: `confetti ${1.5 + Math.random() * 2}s ease-out ${Math.random() * .8}s forwards`, opacity: .8 }} />))}

      {/* 3D Animated Tick */}
      <div style={{ textAlign: 'center', marginBottom: 32, zIndex: 10, animation: 'tick3dIn 1.2s cubic-bezier(.68,-.55,.27,1.55) forwards', transformStyle: 'preserve-3d' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" style={{ width: isMobile ? 80 : 100, height: isMobile ? 80 : 100, margin: '0 auto', animation: 'tickGlow 2s ease-in-out infinite 1.2s' }}>
          <circle cx="26" cy="26" r="25" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeDasharray="166" strokeDashoffset="166" style={{ animation: 'circDraw .8s ease-out .3s forwards' }} />
          <path fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" d="M14.1 27.2l7.1 7.2 16.7-16.8" strokeDasharray="48" strokeDashoffset="48" style={{ animation: 'chkDraw .5s ease-out 1s forwards' }} />
        </svg>
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: 40, zIndex: 10, animation: showContent ? 'slideUp .6s ease-out forwards' : 'none', opacity: showContent ? 1 : 0 }}>
        <h1 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 800, color: 'white', marginBottom: 8, letterSpacing: '-.5px' }}>Booking Confirmed!</h1>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 15, margin: 0 }}>Ticket sent to <span style={{ color: '#22c55e', fontWeight: 600 }}>{userDetails.email}</span></p>
      </div>

      {/* Ticket Card */}
      <div style={{ width: isMobile ? '100%' : 400, maxWidth: 400, zIndex: 10, animation: showContent ? 'slideUp .6s ease-out .15s forwards' : 'none', opacity: showContent ? 1 : 0 }}>
        <div className="ticket-container" style={{ width: '100%', height: isMobile ? 540 : 600, marginBottom: 24 }}>
          <div className="ticket-inner">
            {/* FRONT */}
            <div className="ticket-front" style={{ background: `linear-gradient(170deg,rgba(15,15,25,.85),rgba(5,5,12,.95)),url(${event.image})`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,.12)' }}>
              <div style={{ padding: isMobile ? 22 : 28, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
                  <span style={{ padding: '6px 14px', background: 'rgba(255,255,255,.08)', backdropFilter: 'blur(10px)', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,.7)', border: '1px solid rgba(255,255,255,.05)' }}>{event.category}</span>
                  <span style={{ padding: '6px 12px', background: 'rgba(34,197,94,.15)', borderRadius: 20, fontSize: 11, fontWeight: 700, color: '#22c55e', border: '1px solid rgba(34,197,94,.2)' }}>CONFIRMED</span>
                </div>
                <h2 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 800, lineHeight: 1.15, marginBottom: 20, letterSpacing: '-.3px' }}>{event.title}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <div><div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '.5px' }}>Date</div><div style={{ fontSize: 14, fontWeight: 600 }}>{event.date}</div></div>
                  <div><div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '.5px' }}>Time</div><div style={{ fontSize: 14, fontWeight: 600 }}>19:00</div></div>
                  <div style={{ gridColumn: 'span 2' }}><div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '.5px' }}>Venue</div><div style={{ fontSize: 14, fontWeight: 600 }}>{event.venue}</div></div>
                </div>

                {/* Seat + Payment Block */}
                <div style={{ background: 'rgba(226,55,68,.08)', borderRadius: 12, padding: 14, border: '1px solid rgba(226,55,68,.15)', marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: seatIds.length > 0 ? 8 : 0 }}>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.5px' }}>{bookingDetails.ticketCount} {bookingDetails.ticketCount > 1 ? 'Seats' : 'Seat'}  {bookingDetails.zoneName}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>£{grandTotal}</div>
                  </div>
                  {seatIds.length > 0 && (<div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{seatIds.map((s, i) => (<span key={i} style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(226,55,68,.15)', border: '1px solid rgba(226,55,68,.25)', fontSize: 11, fontWeight: 700, color: 'white', letterSpacing: .3 }}>{s}</span>))}</div>)}
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', marginBottom: 4, letterSpacing: '.5px' }}>Guest</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{userDetails.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>{userDetails.email}</div>
                </div>
              </div>
              <div style={{ height: 20, background: 'radial-gradient(circle,transparent 8px,rgba(10,10,20,.95) 9px) -10px', backgroundSize: '20px 20px', transform: 'rotate(180deg)', opacity: .6 }} />
              <div style={{ padding: 16, background: 'rgba(5,5,12,.8)', backdropFilter: 'blur(20px)', borderTop: '1px dashed rgba(255,255,255,.15)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'rgba(255,255,255,.4)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.5px' }}>Tap to flip for QR <ArrowRight size={12} /></div>
              </div>
            </div>

            {/* BACK */}
            <div className="ticket-back" style={{ background: 'linear-gradient(135deg,#0f0f1e 0%,#1a1a30 100%)', border: '1px solid rgba(226,55,68,.4)' }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24, color: 'white', textTransform: 'uppercase', letterSpacing: '1px' }}>Scan for Entry</h3>
              <div style={{ padding: 16, background: 'white', borderRadius: 16, marginBottom: 20, position: 'relative', overflow: 'hidden', boxShadow: '0 0 30px rgba(255,255,255,.08)' }}>
                <div style={{ background: 'white', display: 'inline-block', padding: 8, borderRadius: 12 }}>
                  <QRCodeCanvas value={qrData} size={180} level="H" includeMargin={true} />
                </div>
                <div className="qr-scan-line" />
              </div>
              <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 12, maxWidth: '80%', lineHeight: 1.5, textAlign: 'center' }}>Present this QR at the venue entrance.<br />Contains full booking & payment details.</div>
              <div style={{ marginTop: 24, padding: '6px 16px', background: 'rgba(255,255,255,.06)', borderRadius: 20, fontSize: 11, fontWeight: 600, border: '1px solid rgba(255,255,255,.08)' }}>{orderId}</div>
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 16, padding: 20, marginBottom: 24, animation: showContent ? 'slideUp .6s ease-out .3s forwards' : 'none', opacity: showContent ? 1 : 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>Payment Summary</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, color: 'rgba(255,255,255,.6)' }}><span>{bookingDetails.ticketCount}x {bookingDetails.zoneName}</span><span>£{bookingDetails.totalPrice}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14, color: 'rgba(255,255,255,.6)' }}><span>Platform Fee</span><span>£{platformFee}</span></div>
          <div style={{ height: 1, background: 'rgba(255,255,255,.08)', marginBottom: 12 }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>Total Paid</span><span style={{ fontSize: 22, fontWeight: 800, color: '#22c55e' }}>£{grandTotal}</span></div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, zIndex: 10, width: isMobile ? '100%' : 400, maxWidth: 400, animation: showContent ? 'slideUp .6s ease-out .45s forwards' : 'none', opacity: showContent ? 1 : 0 }}>
        <button onClick={handleDownloadTicket} disabled={isDownloading} style={{
          width: '100%', padding: '16px 24px', borderRadius: 16, border: 'none',
          background: downloadSuccess ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
          color: 'white', fontSize: 15, fontWeight: 800,
          cursor: isDownloading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: downloadSuccess ? '0 8px 24px rgba(22,163,74,0.4)' : '0 8px 24px rgba(99,102,241,0.4)',
          transition: 'all .3s ease', opacity: isDownloading ? .7 : 1
        }}>
          {isDownloading ? (
            <><div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />Downloading...</>
          ) : downloadSuccess ? (
            <><CheckCircle size={18} />Ticket Saved!</>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
              Save Ticket to Gallery
            </>
          )}
        </button>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>You can also take a screenshot of this page as a backup. Present the QR code at the venue entrance for entry.</span>
        </div>
        <button onClick={onHome} style={{ width: '100%', padding: '14px', borderRadius: 16, background: 'rgba(255,255,255,0.07)', color: 'white', fontSize: 14, fontWeight: 700, border: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer', transition: 'all .2s' }}>Explore More Events</button>
      </div>

      {/* HIDDEN DOWNLOADABLE TICKET */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
        <div ref={downloadTicketRef} style={{ width: 420, padding: 0, background: '#0a0a14', fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif', color: 'white', overflow: 'hidden', borderRadius: 0 }}>
          <div style={{ padding: '28px 24px 20px', background: 'linear-gradient(135deg,#1a1a2e 0%,#0f0f1e 100%)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,.5)' }}>Event Ticket</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#e23744', padding: '4px 10px', background: 'rgba(226,55,68,.15)', borderRadius: 6 }}>{orderId}</span>
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.1, margin: 0, letterSpacing: '-.5px' }}>{event.title}</h2>
          </div>
          <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Date</div><div style={{ fontSize: 14, fontWeight: 600 }}>{event.date}</div></div>
            <div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Time</div><div style={{ fontSize: 14, fontWeight: 600 }}>19:00</div></div>
            <div style={{ gridColumn: 'span 2' }}><div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Venue</div><div style={{ fontSize: 14, fontWeight: 600 }}>{event.venue}</div></div>
          </div>
          <div style={{ padding: '0 24px' }}><div style={{ borderTop: '2px dashed rgba(255,255,255,.1)', margin: '4px 0' }} /></div>
          <div style={{ padding: '16px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Guest Name</div><div style={{ fontSize: 16, fontWeight: 700 }}>{userDetails.name}</div></div>
            <div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Email</div><div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,.7)' }}>{userDetails.email}</div></div>
            <div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Seat Zone</div><div style={{ fontSize: 16, fontWeight: 700, color: '#e23744' }}>{bookingDetails.zoneName}</div></div>
            <div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Tickets</div><div style={{ fontSize: 16, fontWeight: 700 }}>{bookingDetails.ticketCount}</div></div>
            {seatIds.length > 0 && (<div style={{ gridColumn: 'span 2' }}><div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 6 }}>Seats</div><div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.8)' }}>{seatIds.join('  ')}</div></div>)}
            <div style={{ gridColumn: 'span 2' }}><div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Amount Paid</div><div style={{ fontSize: 20, fontWeight: 800, color: '#e23744' }}>{'\u00a3'}{grandTotal}</div></div>
          </div>
          <div style={{ padding: '0 24px' }}><div style={{ borderTop: '2px dashed rgba(255,255,255,.1)', margin: '4px 0' }} /></div>
          <div style={{ padding: '20px 24px 28px', textAlign: 'center' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Scan QR for Entry</div>
            <div style={{ display: 'inline-block', padding: 12, background: 'white', borderRadius: 12 }}>
              <img id="confirm-download-qr-img" src={qrDataUrl} alt="QR Code" style={{ width: 180, height: 180, display: 'block' }} />
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 12 }}>Do not share. Present at venue entrance.</div>
          </div>
        </div>
      </div>

      {/* Screenshot Reminder Popup */}
      {showScreenshotReminder && (
        <div style={{
          position: 'fixed', top: 24, left: 16, right: 16, zIndex: 9999,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.95), rgba(79,70,229,0.95))',
          backdropFilter: 'blur(20px)', borderRadius: 16,
          padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: '0 12px 40px rgba(99,102,241,0.4), 0 0 0 1px rgba(255,255,255,0.1)',
          animation: 'fadeInDown 0.4s ease'
        }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 2 }}>Tip: Take a Screenshot!</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Save a screenshot of this page as a backup for entry.</div>
          </div>
          <button onClick={() => setShowScreenshotReminder(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}





// ========================================
// EMBEDDED STRIPE CHECKOUT
// ========================================
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51T6YMkFGopUpbidB2dqRh1uUfhZJ3bcCFAYLB6PIFMXjEw06QmDch9DLlViEcRYGrLbXKQ70MfW9dRzmBEtBLHhY00WD9xtsC4');

function CheckoutPage({ event, bookingDetails, userDetails, onBack, onSuccess }) {
  const isMobile = useIsMobile();
  const [payError, setPayError] = useState(null);
  const [paying, setPaying] = useState(false);

  const seatIds = bookingDetails?.seatIdentifiers || [];
  const seats = bookingDetails?.seats || [];
  const platformFee = Math.round((bookingDetails?.totalPrice || 0) * 0.05 * 100) / 100;
  const grandTotal = ((bookingDetails?.totalPrice || 0) + platformFee).toFixed(2);

  const [timeLeft, setTimeLeft] = useState(() => {
    if (bookingDetails?.lockExpiresAt) return Math.max(0, Math.floor((new Date(bookingDetails.lockExpiresAt).getTime() - Date.now()) / 1000));
    return 180;
  });

  useEffect(() => {
    if (timeLeft <= 0) { onBack(); return; }
    const t = setInterval(() => setTimeLeft(p => { if (p <= 1) { clearInterval(t); onBack(); return 0; } return p - 1; }), 1000);
    return () => clearInterval(t);
  }, [timeLeft <= 0]);

  const timerMins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const timerSecs = String(timeLeft % 60).padStart(2, '0');
  const timerUrgent = timeLeft < 60;

  const handlePayWithStripe = async () => {
    setPaying(true);
    setPayError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/payments/create-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          seatIds: bookingDetails?.seatDbIds || [],
          seatIdentifiers: bookingDetails?.seatIdentifiers || [],
          customerName: userDetails?.name,
          customerEmail: userDetails?.email,
          customerWhatsapp: userDetails?.whatsapp || ''
        })
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setPayError(data.message || 'Could not initialize payment. Please try again.');
        setPaying(false);
      }
    } catch (err) {
      setPayError('Connection error. Please check your internet and try again.');
      setPaying(false);
    }
  };

  return (
    <div className="animate-fadeIn" style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: 60 }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, rgba(226,55,68,0.12), rgba(10,10,20,0.97))', borderBottom: '1px solid rgba(226,55,68,0.15)', padding: isMobile ? '20px 16px' : '24px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
          <ChevronLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 900, color: 'white', margin: 0 }}>Review & Pay</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', margin: '2px 0 0' }}>Confirm your booking before payment</p>
        </div>
        {/* TEST MODE badge */}
        <div style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.4)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: '#FBBF24', letterSpacing: '0.5px' }}>
          TEST MODE
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: isMobile ? '20px 16px' : '32px 20px' }}>

        {/* Seat Hold Countdown Timer */}
        <div style={{ background: timerUrgent ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.08)', border: `1px solid ${timerUrgent ? 'rgba(239,68,68,0.35)' : 'rgba(16,185,129,0.25)'}`, borderRadius: 16, padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: timerUrgent ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animation: timerUrgent ? 'pulse 1s infinite' : 'none' }}>
            <Clock size={20} color={timerUrgent ? '#EF4444' : '#10B981'} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, marginBottom: 2 }}>
              {timerUrgent ? '  Seats expiring soon!' : ' Seats reserved for'}
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, fontVariantNumeric: 'tabular-nums', color: timerUrgent ? '#EF4444' : '#10B981', letterSpacing: 2 }}>
              {timerMins}:{timerSecs}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 11, color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>
            Complete payment<br />before timer expires
          </div>
        </div>

        {/* Event Details Card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '20px', marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <img src={event.image} alt={event.title} style={{ width: isMobile ? 70 : 90, height: isMobile ? 70 : 90, borderRadius: 14, objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(255,255,255,0.08)' }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 4 }}>Selected Programme</div>
              <h2 style={{ fontSize: isMobile ? 16 : 18, fontWeight: 800, color: 'white', margin: '0 0 6px', lineHeight: 1.3 }}>{event.title}</h2>
              {event.subtitle && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>{event.subtitle}</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
                  <Calendar size={13} color="rgba(255,255,255,0.4)" />
                  <span>{event.date}{event.time ? `, ${event.time}` : ''}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'rgba(255,255,255,0.65)' }}>
                  <MapPin size={13} color="rgba(255,255,255,0.4)" />
                  <span>{event.venue}, {event.city}</span>
                </div>
                {event.address && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    <MapPin size={12} color="rgba(255,255,255,0.3)" style={{ marginTop: 1, flexShrink: 0 }} />
                    <span>{event.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Seats Card */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '20px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(226,55,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ticket size={16} color="var(--accent)" />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>Selected Seats</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{bookingDetails?.ticketCount || seatIds.length} seat{(bookingDetails?.ticketCount || seatIds.length) !== 1 ? 's' : ''}  -  {bookingDetails?.zoneName || 'Various zones'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {seatIds.length > 0 ? seatIds.map((sid, i) => (
              <div key={i} style={{ background: 'rgba(226,55,68,0.12)', border: '1px solid rgba(226,55,68,0.25)', borderRadius: 10, padding: '6px 14px', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>
                {sid}
              </div>
            )) : (
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Seat details will be confirmed after payment</div>
            )}
          </div>
        </div>

        {/* Customer Info */}
        {userDetails && (
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '16px 20px', marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>Booking For</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
                <User size={14} color="rgba(255,255,255,0.4)" />
                <span style={{ fontWeight: 700 }}>{userDetails.name}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
                <Mail size={13} color="rgba(255,255,255,0.3)" />
                <span>{userDetails.email}</span>
              </div>
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '20px', marginBottom: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 16 }}>Price Breakdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>
              <span>Ticket price ({bookingDetails?.ticketCount || 1} seat{(bookingDetails?.ticketCount || 1) !== 1 ? 's' : ''})</span>
              <span style={{ fontWeight: 700 }}>£{(bookingDetails?.totalPrice || 0).toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>
              <span>Platform fee (5%)</span>
              <span>£{platformFee.toFixed(2)}</span>
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 900, color: 'white' }}>
              <span>Total</span>
              <span style={{ color: 'var(--accent)' }}>£{grandTotal}</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'right' }}>Prices shown in GBP (£)  UK currency</div>
          </div>
        </div>

        {/* Error */}
        {payError && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 14, padding: '14px 18px', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <X size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ margin: 0, fontSize: 13, color: '#EF4444', lineHeight: 1.5 }}>{payError}</p>
          </div>
        )}

        {/* Pay via Stripe Button */}
        <button
          onClick={handlePayWithStripe}
          disabled={paying}
          style={{
            width: '100%', padding: '18px 24px', borderRadius: 18, border: 'none', cursor: paying ? 'not-allowed' : 'pointer',
            background: paying ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: 'white', fontSize: 17, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            boxShadow: paying ? 'none' : '0 8px 30px rgba(99,102,241,0.4)',
            transition: 'all 0.3s', letterSpacing: '-0.2px'
          }}
        >
          {paying ? (
            <>
              <div style={{ width: 20, height: 20, border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              Redirecting to Stripe...
            </>
          ) : (
            <>
              <Lock size={18} />
              Pay £{grandTotal} via Stripe
            </>
          )}
        </button>

        <div style={{ textAlign: 'center', marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
          <Lock size={12} />
          <span>Secured by Stripe  -  256-bit SSL encryption  -  TEST MODE</span>
        </div>
      </div>
    </div>
  );
}


// ========================================
// PAYMENT FAILED PAGE
// ========================================
function PaymentFailedPage({ onHome }) {
  const isMobile = useIsMobile();

  useEffect(() => {
    const timer = setTimeout(onHome, 5000);
    return () => clearTimeout(timer);
  }, [onHome]);

  return (
    <div className="animate-fadeIn" style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ textAlign: 'center', maxWidth: 400, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(239,68,68,0.2)', padding: '40px 30px', borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        <div style={{ width: 80, height: 80, background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(153,27,27,0.4))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '2px solid rgba(239,68,68,0.5)', animation: 'pulse 2s infinite' }}>
          <X size={40} color="#EF4444" />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: 'white', letterSpacing: '-0.5px', marginBottom: 12 }}>Payment Failed</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.5, marginBottom: 32 }}>
          We couldn't process your payment. Your seats have been released. Please try again or use a different payment method.
        </p>
        <button onClick={onHome} style={{ width: '100%', padding: '16px 20px', background: 'var(--accent)', color: 'white', fontSize: 15, fontWeight: 700, border: 'none', borderRadius: 14, cursor: 'pointer', boxShadow: '0 4px 15px rgba(226,55,68,0.4)', transition: 'all 0.2s' }}>
          Return to Home Now
        </button>
      </div>
    </div>
  );
}

// ========================================
// PAYMENT SUCCESS + QR TICKET PAGE
// ========================================
function PaymentSuccessPage({ event, booking, eventInfo, tickets, userDetails, bookingDetails, onHome }) {
  const isMobile = useIsMobile();
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const downloadRef = useRef(null);

  // Combined ticket data — all seats in one ticket
  const allSeats = tickets?.map(t => t.seatIdentifier || t.seat).filter(Boolean) || [];
  const allZones = [...new Set(tickets?.map(t => t.zone).filter(Boolean) || [])];
  const firstTicket = tickets?.[0];

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);

  // Show screenshot reminder on scroll
  const [showScreenshotReminder, setShowScreenshotReminder] = useState(false);
  const reminderShown = useRef(false);
  useEffect(() => {
    // Also trigger immediately on page load to ensure they see it
    const t = setTimeout(() => {
      setShowScreenshotReminder(true);
      setTimeout(() => setShowScreenshotReminder(false), 5000); // 5 sec duration
    }, 1000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!reminderShown.current) {
        reminderShown.current = true;
        setShowScreenshotReminder(true);
        setTimeout(() => setShowScreenshotReminder(false), 5000); // 5 sec duration
        window.removeEventListener('scroll', handleScroll);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Combined QR data with all seats
  const qrData = JSON.stringify({
    bookingId: booking?.id,
    ticketId: firstTicket?.ticketId || 'TXN',
    event: eventInfo?.title || event?.title,
    venue: eventInfo?.venue,
    city: eventInfo?.city,
    date: eventInfo?.date?.split('T')?.[0] || event?.date,
    seats: allSeats.join(', '),
    zones: allZones.join(', '),
    ticketCount: tickets?.length || 1,
    customer: booking?.customerName
  });

  // Pre-generate QR code as data URL for download template
  const [qrDataUrl, setQrDataUrl] = useState('');
  useEffect(() => {
    QRCode.toDataURL(qrData, { width: 200, margin: 2, errorCorrectionLevel: 'H' })
      .then(url => setQrDataUrl(url))
      .catch(() => { });
  }, [qrData]);

  const copyTicketId = () => {
    if (firstTicket?.ticketId) {
      navigator.clipboard.writeText(firstTicket.ticketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadTicket = async () => {
    if (!downloadRef.current || isDownloading) return;
    setIsDownloading(true);
    try {
      // Ensure QR data URL is ready
      let finalQrUrl = qrDataUrl;
      if (!finalQrUrl) {
        finalQrUrl = await QRCode.toDataURL(qrData, { width: 200, margin: 2, errorCorrectionLevel: 'H' });
      }
      // Inject QR image into the download template
      const qrImg = downloadRef.current.querySelector('#download-qr-img');
      if (qrImg) qrImg.src = finalQrUrl;
      // Small delay to let the image load
      await new Promise(r => setTimeout(r, 100));
      const canvas = await html2canvas(downloadRef.current, {
        backgroundColor: '#0a0a14', scale: 3, useCORS: true, logging: false,
        allowTaint: true, imageTimeout: 15000
      });
      const fileName = `Celebr8-Ticket-${(eventInfo?.title || event?.title || 'Event').replace(/\s+/g, '-')}-Booking-${booking?.id || 'ticket'}.png`;

      canvas.toBlob(async (blob) => {
        if (!blob) { setIsDownloading(false); return; }

        // iOS & Android: use Web Share API to save to Photos/Gallery
        if ((isIOS || isAndroid) && navigator.share) {
          try {
            const file = new File([blob], fileName, { type: 'image/png' });
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({ files: [file], title: 'Celebr8 Event Ticket' });
              setDownloadSuccess(true);
              setTimeout(() => setDownloadSuccess(false), 3000);
              setIsDownloading(false);
              return;
            }
          } catch (e) {
            if (e.name === 'AbortError') { setIsDownloading(false); return; }
            // Fall through to direct download
          }
        }

        // Desktop & fallback: direct file download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 3000);
        setIsDownloading(false);
      }, 'image/png', 1.0);
    } catch (err) {
      console.error('Download failed:', err);
      setIsDownloading(false);
    }
  };

  return (
    <div className="animate-fadeIn" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 50% -10%, rgba(16,185,129,0.15) 0%, var(--bg-primary) 60%)', padding: isMobile ? '20px' : '40px' }}>

      {/* Dynamic Celebration Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #10B981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 0 60px rgba(16,185,129,0.4)', animation: 'pulse-glow 2s infinite' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 style={{ fontSize: isMobile ? 26 : 34, fontWeight: 900, color: 'white', marginBottom: 8, letterSpacing: '-1px' }}>Payment Successful!</h1>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', maxWidth: 400, margin: '0 auto' }}>Your premium tickets are locked and confirmed. Present the digital pass below at the venue.</p>
      </div>

      <div className="page-container" style={{ width: '100%', maxWidth: 500, margin: '0 auto' }}>

        {/* Massive Liquid Glass Standalone Ticket */}
        {firstTicket && (
          <div style={{
            background: 'rgba(20, 20, 30, 0.4)', backdropFilter: 'blur(40px) saturate(150%)', WebkitBackdropFilter: 'blur(40px) saturate(150%)',
            border: '1px solid rgba(255,255,255,0.15)', borderRadius: 32, overflow: 'hidden', marginBottom: 30,
            boxShadow: '0 30px 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.2)'
          }}>
            {/* Holographic Ticket Header */}
            <div style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))', padding: '28px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 3, marginBottom: 8 }}>Digital Pass</div>
                  <h2 style={{ fontSize: isMobile ? 24 : 28, fontWeight: 900, lineHeight: 1.15, letterSpacing: '-0.5px', marginBottom: 8, color: 'white' }}>{eventInfo?.title || event?.title}</h2>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{eventInfo?.venue} - {eventInfo?.city}</div>
                </div>
              </div>
            </div>

            {/* Ticket Body / Meta */}
            <div style={{ padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 24 }}>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 24px' }}>
                {[
                  { label: 'Date', value: eventInfo?.date?.split('T')?.[0] || event?.date || '' },
                  { label: 'Time', value: event?.time || '19:00' },
                  { label: 'Zone', value: allZones.join(', '), color: 'var(--accent)' },
                  { label: 'Total Seats', value: `${tickets?.length || 1} seat${(tickets?.length || 1) > 1 ? 's' : ''}`, color: 'var(--accent)' },
                  { label: 'Guest', value: booking?.customerName },
                  { label: 'Amount Paid', value: `\u00a3${parseFloat(booking?.totalAmount).toFixed(2)}`, color: '#10B981' },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4, fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: color || 'white' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Glowing Seats List */}
              {allSeats.length > 0 && (
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 16, padding: '16px 20px' }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, fontWeight: 600 }}>Allocated Seats</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {allSeats.map((seat, i) => (
                      <span key={i} style={{ padding: '6px 14px', borderRadius: 10, background: 'rgba(226,55,68,0.15)', border: '1px solid rgba(226,55,68,0.3)', color: '#FF6B6B', fontSize: 14, fontWeight: 800, letterSpacing: 1 }}>{seat}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Massive Standalone QR Code */}
              <div style={{ textAlign: 'center', marginTop: 10, padding: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ background: 'white', borderRadius: 20, padding: 16, display: 'inline-block', boxShadow: '0 12px 40px rgba(0,0,0,0.5)' }}>
                  <QRCodeCanvas value={qrData} size={200} level="H" includeMargin={true} />
                </div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 16, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}>Scan at Entry</div>
                <div style={{ fontSize: 13, fontWeight: 800, fontFamily: 'monospace', color: 'rgba(255,255,255,0.8)', marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  TXN: {firstTicket.ticketId}
                </div>
              </div>

            </div>

            {/* Ticket Footer Tear-off */}
            <div style={{ padding: '0 32px', position: 'relative' }}>
              <div style={{ borderTop: '2px dashed rgba(255,255,255,0.15)' }} />
              <div style={{ position: 'absolute', left: -16, top: -16, width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-primary)', boxShadow: 'inset -5px 0 10px rgba(0,0,0,0.2)' }} />
              <div style={{ position: 'absolute', right: -16, top: -16, width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-primary)', boxShadow: 'inset 5px 0 10px rgba(0,0,0,0.2)' }} />
            </div>

            <div style={{ padding: '24px 32px', fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center', fontWeight: 500 }}>
              Do not share this QR code. Present at venue entrance for entry.
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <button onClick={handleDownloadTicket} disabled={isDownloading} style={{
            width: '100%', padding: '16px 24px', borderRadius: 16, border: 'none',
            background: downloadSuccess ? 'linear-gradient(135deg, #16a34a, #15803d)' : 'linear-gradient(135deg, #6366f1, #4f46e5)',
            color: 'white', fontSize: 15, fontWeight: 800,
            cursor: isDownloading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: downloadSuccess ? '0 8px 24px rgba(22,163,74,0.4)' : '0 8px 24px rgba(99,102,241,0.4)',
            transition: 'all .3s ease', opacity: isDownloading ? .7 : 1
          }}>
            {isDownloading ? (
              <><div style={{ width: 18, height: 18, border: '2.5px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />Downloading...</>
            ) : downloadSuccess ? (
              <><CheckCircle size={18} />Ticket Saved!</>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                Save Ticket to Gallery
              </>
            )}
          </button>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 16px', display: 'flex', gap: 10, alignItems: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>You can also take a screenshot of this page as a backup. Present the QR code at the venue entrance for entry.</span>
          </div>
          <button onClick={onHome} style={{ width: '100%', padding: '14px 20px', borderRadius: 14, background: 'var(--accent)', color: 'white', fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(226,55,68,0.3)' }}>
            Explore More Events
          </button>
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          A confirmation has been sent to {booking?.customerEmail}
        </div>

        {/* HIDDEN DOWNLOADABLE COMBINED TICKET for html2canvas */}
        <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
          <div ref={downloadRef} style={{ width: 420, padding: 0, background: '#0a0a14', fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif', color: 'white', overflow: 'hidden' }}>
            <div style={{ padding: '28px 24px 20px', background: 'linear-gradient(135deg,#1a1a2e 0%,#0f0f1e 100%)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,.5)' }}>Event Ticket</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#10B981', padding: '4px 10px', background: 'rgba(16,185,129,.15)', borderRadius: 6 }}>CONFIRMED</span>
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.1, margin: 0, letterSpacing: '-.5px' }}>{eventInfo?.title || event?.title}</h2>
            </div>
            <div style={{ padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Date</div><div style={{ fontSize: 14, fontWeight: 600 }}>{eventInfo?.date?.split('T')?.[0] || event?.date}</div></div>
              <div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Time</div><div style={{ fontSize: 14, fontWeight: 600 }}>{event?.time || '19:00'}</div></div>
              <div style={{ gridColumn: 'span 2' }}><div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Venue</div><div style={{ fontSize: 14, fontWeight: 600 }}>{eventInfo?.venue} - {eventInfo?.city}</div></div>
            </div>
            <div style={{ padding: '0 24px' }}><div style={{ borderTop: '2px dashed rgba(255,255,255,.1)', margin: '4px 0' }} /></div>
            <div style={{ padding: '16px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Guest Name</div><div style={{ fontSize: 16, fontWeight: 700 }}>{booking?.customerName}</div></div>
              <div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Email</div><div style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,.7)' }}>{booking?.customerEmail}</div></div>
              <div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Zone</div><div style={{ fontSize: 16, fontWeight: 700, color: '#e23744' }}>{allZones.join(', ')}</div></div>
              <div><div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Total Seats</div><div style={{ fontSize: 16, fontWeight: 700 }}>{tickets?.length || 1}</div></div>
              <div style={{ gridColumn: 'span 2' }}><div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Seats</div><div style={{ fontSize: 14, fontWeight: 700, color: '#FF6B6B' }}>{allSeats.join('  ·  ')}</div></div>
              <div style={{ gridColumn: 'span 2' }}><div style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Amount Paid</div><div style={{ fontSize: 20, fontWeight: 800, color: '#10B981' }}>{'\u00a3'}{parseFloat(booking?.totalAmount || 0).toFixed(2)}</div></div>
            </div>
            <div style={{ padding: '0 24px' }}><div style={{ borderTop: '2px dashed rgba(255,255,255,.1)', margin: '4px 0' }} /></div>
            <div style={{ padding: '20px 24px 28px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>Scan QR for Entry</div>
              <div style={{ display: 'inline-block', padding: 12, background: 'white', borderRadius: 12 }}>
                <img id="download-qr-img" src={qrDataUrl} alt="QR Code" style={{ width: 180, height: 180, display: 'block' }} />
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginTop: 12 }}>Do not share. Present at venue entrance.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Screenshot Reminder Popup */}
      {showScreenshotReminder && (
        <div style={{
          position: 'fixed', top: 24, left: 16, right: 16, zIndex: 9999,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.97), rgba(79,70,229,0.97))',
          backdropFilter: 'blur(20px)', borderRadius: 16,
          padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
          boxShadow: '0 12px 40px rgba(99,102,241,0.5), 0 0 0 1px rgba(255,255,255,0.1)',
          animation: 'fadeInDown 0.4s ease'
        }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 3 }}>📸 Take a Screenshot!</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>Save a screenshot of this page as a backup for venue entry.</div>
          </div>
          <button onClick={() => setShowScreenshotReminder(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: 8, display: 'flex' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      )}
    </div>
  );
}

// --- SEAT SELECTION PAGE (PREMIUM REDESIGN) ---
function SeatSelectionPage({ event, onBack, onProceed }) {
  const isMobile = useIsMobile();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [activeZoneFilter, setActiveZoneFilter] = useState(null);
  const [zoom, setZoom] = useState(isMobile ? 0.55 : 0.85);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [showSheet, setShowSheet] = useState(false);
  const [lockingSeats, setLockingSeats] = useState(false);
  const [seatError, setSeatError] = useState(null);
  const mapRef = useRef(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef(null);
  const [seatsLoading, setSeatsLoading] = useState(true);

  const MAX_SEATS = 10;
  const SEAT_SIZE = isMobile ? 20 : 14;
  const SEAT_GAP_X = isMobile ? 22 : 18;
  const SEAT_GAP_Y = isMobile ? 24 : 20;

  const VENUE_LAYOUTS = {
    London: {
      width: 900, height: 700, zones: [
        {
          id: 'vvip', name: 'VVIP', price: 70, color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444, #DC2626)', desc: 'Front row, premium lounge access', icon: '', blocks: [
            { rStart: 0, rCount: 3, cStart: 0, cCount: 12, xOffset: -256, yOffset: 150, rowLabels: ['A', 'B', 'C'] },
            { rStart: 0, rCount: 3, cStart: 12, cCount: 12, xOffset: 40, yOffset: 150, rowLabels: ['A', 'B', 'C'] }
          ]
        },
        {
          id: 'vip', name: 'VIP', price: 50, color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #059669)', desc: 'Excellent elevated view', icon: '', blocks: [
            { rStart: 3, rCount: 6, cStart: 0, cCount: 16, xOffset: -328, yOffset: 260, rowLabels: ['D', 'E', 'F', 'G', 'H', 'I'] },
            { rStart: 3, rCount: 6, cStart: 16, cCount: 16, xOffset: 40, yOffset: 260, rowLabels: ['D', 'E', 'F', 'G', 'H', 'I'] }
          ]
        },
        {
          id: 'diamond', name: 'Diamond', price: 40, color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)', desc: 'Great central viewing', icon: '', blocks: [
            { rStart: 9, rCount: 7, cStart: 0, cCount: 20, xOffset: -400, yOffset: 420, rowLabels: ['J', 'K', 'L', 'M', 'N', 'O', 'P'] },
            { rStart: 9, rCount: 7, cStart: 20, cCount: 20, xOffset: 40, yOffset: 420, rowLabels: ['J', 'K', 'L', 'M', 'N', 'O', 'P'] }
          ]
        },
        {
          id: 'platinum', name: 'Platinum', price: 30, color: '#F97316', gradient: 'linear-gradient(135deg, #F97316, #EA580C)', desc: 'Amazing value seating', icon: '', blocks: [
            { rStart: 16, rCount: 4, cStart: 0, cCount: 20, xOffset: -400, yOffset: 600, rowLabels: ['Q', 'R', 'S', 'T'] },
            { rStart: 16, rCount: 4, cStart: 20, cCount: 20, xOffset: 40, yOffset: 600, rowLabels: ['Q', 'R', 'S', 'T'] }
          ]
        }
      ]
    },
    Leicester: {
      width: 900, height: 750, zones: [
        {
          id: 'vvip', name: 'VVIP', price: 70, color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444, #DC2626)', desc: 'Front row, premium lounge access', icon: '', blocks: [
            { rStart: 0, rCount: 2, cStart: 0, cCount: 12, xOffset: -256, yOffset: 150, rowLabels: ['A', 'B'] },
            { rStart: 0, rCount: 2, cStart: 12, cCount: 12, xOffset: 40, yOffset: 150, rowLabels: ['A', 'B'] }
          ]
        },
        {
          id: 'vip', name: 'VIP', price: 50, color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #059669)', desc: 'Excellent elevated view', icon: '', blocks: [
            { rStart: 2, rCount: 6, cStart: 0, cCount: 16, xOffset: -328, yOffset: 230, rowLabels: ['C', 'D', 'E', 'F', 'G', 'H'] },
            { rStart: 2, rCount: 6, cStart: 16, cCount: 16, xOffset: 40, yOffset: 230, rowLabels: ['C', 'D', 'E', 'F', 'G', 'H'] }
          ]
        },
        {
          id: 'diamond', name: 'Diamond', price: 40, color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)', desc: 'Great central viewing', icon: '', blocks: [
            { rStart: 8, rCount: 10, cStart: 0, cCount: 20, xOffset: -400, yOffset: 390, rowLabels: ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'] },
            { rStart: 8, rCount: 10, cStart: 20, cCount: 20, xOffset: 40, yOffset: 390, rowLabels: ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'] }
          ]
        },
        {
          id: 'platinum', name: 'Platinum', price: 30, color: '#F97316', gradient: 'linear-gradient(135deg, #F97316, #EA580C)', desc: 'Amazing value seating', icon: '', blocks: [
            { rStart: 18, rCount: 4, cStart: 0, cCount: 20, xOffset: -400, yOffset: 630, rowLabels: ['S', 'T', 'U', 'V'] },
            { rStart: 18, rCount: 4, cStart: 20, cCount: 20, xOffset: 40, yOffset: 630, rowLabels: ['S', 'T', 'U', 'V'] }
          ]
        }
      ]
    },
    Manchester: {
      width: 900, height: 700, zones: [
        {
          id: 'vvip', name: 'VVIP', price: 70, color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444, #DC2626)', desc: 'Front row, premium lounge access', icon: '', blocks: [
            { rStart: 0, rCount: 3, cStart: 0, cCount: 12, xOffset: -256, yOffset: 150, rowLabels: ['A', 'B', 'C'] },
            { rStart: 0, rCount: 3, cStart: 12, cCount: 12, xOffset: 40, yOffset: 150, rowLabels: ['A', 'B', 'C'] }
          ]
        },
        {
          id: 'vip', name: 'VIP', price: 50, color: '#10B981', gradient: 'linear-gradient(135deg, #10B981, #059669)', desc: 'Excellent elevated view', icon: '', blocks: [
            { rStart: 3, rCount: 6, cStart: 0, cCount: 16, xOffset: -328, yOffset: 250, rowLabels: ['D', 'E', 'F', 'G', 'H', 'I'] },
            { rStart: 3, rCount: 6, cStart: 16, cCount: 16, xOffset: 40, yOffset: 250, rowLabels: ['D', 'E', 'F', 'G', 'H', 'I'] }
          ]
        },
        {
          id: 'diamond', name: 'Diamond', price: 40, color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)', desc: 'Great central viewing', icon: '', blocks: [
            { rStart: 9, rCount: 7, cStart: 0, cCount: 20, xOffset: -400, yOffset: 410, rowLabels: ['J', 'K', 'L', 'M', 'N', 'O', 'P'] },
            { rStart: 9, rCount: 7, cStart: 20, cCount: 20, xOffset: 40, yOffset: 410, rowLabels: ['J', 'K', 'L', 'M', 'N', 'O', 'P'] }
          ]
        },
        {
          id: 'platinum', name: 'Platinum', price: 30, color: '#F97316', gradient: 'linear-gradient(135deg, #F97316, #EA580C)', desc: 'Amazing value seating', icon: '', blocks: [
            { rStart: 16, rCount: 4, cStart: 0, cCount: 20, xOffset: -400, yOffset: 590, rowLabels: ['Q', 'R', 'S', 'T'] },
            { rStart: 16, rCount: 4, cStart: 20, cCount: 20, xOffset: 40, yOffset: 590, rowLabels: ['Q', 'R', 'S', 'T'] }
          ]
        }
      ]
    },
    default: {
      width: 900, height: 500, zones: [
        {
          id: 'standard', name: 'Standard', price: parseInt(event.price.replace(/[^0-9]/g, '')) || 50, color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6, #2563EB)', desc: 'General Admission', icon: '', blocks: [
            { rStart: 0, rCount: 10, cStart: 0, cCount: 20, xOffset: -180, yOffset: 200, rowLabels: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'] }
          ]
        }
      ]
    }
  };

  const layout = VENUE_LAYOUTS[event.city] || VENUE_LAYOUTS.default;
  const zones = layout.zones;

  const generateSeats = useCallback((apiSeats) => {
    const seats = [];
    // Build a lookup from identifier  API seat data
    const apiLookup = {};
    if (apiSeats) {
      apiSeats.forEach(s => { apiLookup[s.identifier] = s; });
    }
    zones.forEach(zone => {
      zone.blocks.forEach(block => {
        for (let r = 0; r < block.rCount; r++) {
          for (let c = 0; c < block.cCount; c++) {
            const id = `${zone.id}-${block.rStart + r}-${block.cStart + c}`;
            const x = block.xOffset + c * SEAT_GAP_X;
            const y = block.yOffset + r * SEAT_GAP_Y;
            let label = null;
            if (c === 0 && block.xOffset < 0) label = { text: block.rowLabels[r], isLeft: true };
            else if (c === block.cCount - 1 && block.xOffset > 0) label = { text: block.rowLabels[r], isLeft: false };
            const prefix = zone.id.toUpperCase();
            const rowL = block.rowLabels[r] || String.fromCharCode(65 + r);
            const colIdx = block.cStart + c + 1;
            const identifier = `${prefix} - ${rowL}${colIdx}`;
            const apiSeat = apiLookup[identifier];
            // Ensure both 'booked' and 'holding' mark the seat as unavailable.
            const isBooked = apiSeat ? (apiSeat.status === 'booked' || apiSeat.status === 'holding') : false;
            const dbId = apiSeat ? apiSeat.id : null;
            seats.push({ id, identifier, zone, row: block.rStart + r, col: block.cStart + c, x, y, label, isBooked, dbId, displayNum: colIdx });
          }
        }
      });
    });
    return seats;
  }, [event.city, zones]);

  const [seats, setSeats] = useState([]);

  useEffect(() => {
    setSeatsLoading(true);
    fetch(`${API_BASE_URL}/api/events/${event.id}/seats?_t=${Date.now()}`)
      .then(r => r.json())
      .then(apiSeats => {
        setSeats(generateSeats(Array.isArray(apiSeats) ? apiSeats : []));
        setSeatsLoading(false);
      })
      .catch(() => {
        // Fallback: generate seats without API data (all available)
        setSeats(generateSeats(null));
        setSeatsLoading(false);
      });
  }, [event.id, generateSeats]);

  const toggleSeat = useCallback((seat) => {
    if (seat.isBooked) return;
    setSelectedSeats(prev => {
      if (prev.find(s => s.id === seat.id)) return prev.filter(s => s.id !== seat.id);
      if (prev.length >= MAX_SEATS) return prev;
      return [...prev, seat];
    });
    setShowSheet(true);
  }, []);

  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.zone.price, 0);

  // Touch: pinch-to-zoom
  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (lastPinchDist.current !== null) {
        const delta = dist - lastPinchDist.current;
        setZoom(z => Math.min(Math.max(0.4, z + delta * 0.003), 2.5));
      }
      lastPinchDist.current = dist;
    } else if (isDragging.current && e.touches.length === 1) {
      setPan({ x: e.touches[0].clientX - dragStart.current.x, y: e.touches[0].clientY - dragStart.current.y });
    }
  }, [pan]);

  const handleTouchEnd = useCallback(() => {
    lastPinchDist.current = null;
    isDragging.current = false;
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      isDragging.current = true;
      dragStart.current = { x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y };
    }
  }, [pan]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setZoom(z => Math.min(Math.max(0.4, z - e.deltaY * 0.001), 2.5));
  }, []);

  const handlePointerDown = useCallback((e) => {
    if (e.pointerType === 'touch') return;
    isDragging.current = true;
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  }, [pan]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging.current || e.pointerType === 'touch') return;
    setPan({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  }, []);

  const handlePointerUp = useCallback(() => { isDragging.current = false; }, []);

  const resetView = useCallback(() => {
    setZoom(isMobile ? 0.55 : 0.85);
    setPan({ x: 0, y: 0 });
  }, [isMobile]);

  const handleProceed = () => {
    if (selectedSeats.length === 0) return;
    onProceed({
      ticketCount: selectedSeats.length,
      zoneId: selectedSeats[0].zone.id,
      zoneName: [...new Set(selectedSeats.map(s => s.zone.name))].join(', '),
      seatIdentifiers: selectedSeats.map(s => s.identifier),
      seatDbIds: selectedSeats.map(s => s.dbId).filter(Boolean),
      totalPrice
    });
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') setSelectedSeats([]);
      if (e.key === '+' || e.key === '=') setZoom(z => Math.min(z + 0.15, 2.5));
      if (e.key === '-') setZoom(z => Math.max(z - 0.15, 0.4));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const filteredSeats = activeZoneFilter ? seats.filter(s => s.zone.id === activeZoneFilter) : seats;
  const dimmedSeats = activeZoneFilter ? seats.filter(s => s.zone.id !== activeZoneFilter) : [];

  return (
    <div className="seat-selection-page animate-fadeIn" style={{ minHeight: '100vh', paddingBottom: 160, background: '#07070c', position: 'relative' }}>

      {/* Ambient background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, backgroundImage: `url(${event.image})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(80px) brightness(0.12) saturate(1.4)', transform: 'scale(1.2)', pointerEvents: 'none' }} />

      {/* Header (Same as BookingPage) */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(20,20,24,0.8)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <button onClick={onBack} style={{
          background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
          width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', cursor: 'pointer', flexShrink: 0
        }}>
          <ChevronLeft size={20} />
        </button>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, color: 'white', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{event.title}</h3>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: 13, gap: 6, display: 'flex', alignItems: 'center' }}>
            <Calendar size={12} /> {event.date}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {selectedSeats.length > 0 && (
            <div style={{ padding: '5px 12px', borderRadius: 20, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.25)', fontSize: 12, fontWeight: 700, color: '#22c55e' }}>
              {selectedSeats.length} selected
            </div>
          )}
        </div>
      </div>

      {/* Zone Quick Filters */}
      <div style={{
        display: 'flex', gap: 6, padding: '12px 20px', zIndex: 40,
        overflowX: 'auto', position: 'relative', background: 'transparent'
      }}>
        <button onClick={() => setActiveZoneFilter(null)} style={{
          padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
          background: !activeZoneFilter ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${!activeZoneFilter ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
          color: !activeZoneFilter ? 'white' : 'rgba(255,255,255,0.5)', transition: 'all 0.2s'
        }}>All Zones</button>
        {zones.map(z => (
          <button key={z.id} onClick={() => setActiveZoneFilter(activeZoneFilter === z.id ? null : z.id)} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
            background: activeZoneFilter === z.id ? `${z.color}20` : 'rgba(255,255,255,0.04)',
            border: `1px solid ${activeZoneFilter === z.id ? z.color : 'rgba(255,255,255,0.08)'}`,
            color: activeZoneFilter === z.id ? z.color : 'rgba(255,255,255,0.5)', transition: 'all 0.2s',
            display: 'flex', alignItems: 'center', gap: 5
          }}>
            <span>{z.icon}</span> {z.name} <span style={{ opacity: 0.6 }}>£{z.price}</span>
          </button>
        ))}
      </div>

      {/* Main content area (Constrained height for scrollable page) */}
      <div style={{ height: isMobile ? '65vh' : '75vh', minHeight: 450, margin: isMobile ? '12px 16px' : '20px 40px', borderRadius: 24, display: 'flex', overflow: 'hidden', position: 'relative', zIndex: 10, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>

        {/* Desktop Sidebar */}
        {!isMobile && (
          <div style={{
            width: 280, background: 'rgba(10,10,18,0.6)', backdropFilter: 'blur(16px)',
            borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', zIndex: 10,
            overflowY: 'auto'
          }}>
            <div style={{ padding: '16px 18px 8px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>Seating Zones</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {zones.map(zone => {
                  const zoneSeats = seats.filter(s => s.zone.id === zone.id);
                  const available = zoneSeats.filter(s => !s.isBooked).length;
                  const selected = selectedSeats.filter(s => s.zone.id === zone.id).length;
                  return (
                    <div key={zone.id} onClick={() => setActiveZoneFilter(activeZoneFilter === zone.id ? null : zone.id)} style={{
                      padding: '12px 14px', borderRadius: 14, cursor: 'pointer', transition: 'all 0.25s',
                      background: activeZoneFilter === zone.id ? `${zone.color}15` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${activeZoneFilter === zone.id ? `${zone.color}40` : 'rgba(255,255,255,0.05)'}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: zone.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>{zone.icon}</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{zone.name}</div>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{zone.desc}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: zone.color }}>£{zone.price}</div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{available} available</div>
                        {selected > 0 && <div style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '2px 8px', borderRadius: 10 }}>{selected} selected</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div style={{ padding: '12px 18px', marginTop: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Legend</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[{ label: 'Available', bg: 'rgba(59,130,246,0.4)', border: '#3B82F6' }, { label: 'Selected', bg: '#3B82F6', border: '#3B82F6' }, { label: 'Sold', bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.05)' }].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: l.bg, border: `1px solid ${l.border}` }} />
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{l.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 8 }}>
                Press +/- to zoom  -  Esc to deselect
              </div>
            </div>
          </div>
        )}

        {/* Interactive Map */}
        <div ref={mapRef}
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: isDragging.current ? 'grabbing' : 'grab', touchAction: 'none' }}
        >
          {/* Zoom Controls */}
          <div style={{ position: 'absolute', right: isMobile ? 12 : 20, top: isMobile ? 8 : 16, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 20 }}>
            <button onClick={() => setZoom(z => Math.min(z + 0.15, 2.5))} style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(15,15,22,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 18, fontWeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>+</button>
            <button onClick={() => setZoom(z => Math.max(z - 0.15, 0.4))} style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(15,15,22,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: 18, fontWeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}></button>
            <button onClick={resetView} style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(15,15,22,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>FIT</button>
          </div>

          {/* Map Canvas */}
          <div style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '50% 30%',
            transition: isDragging.current ? 'none' : 'transform 0.15s ease-out',
            width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{ position: 'relative', width: 900, height: 900 }}>

              {/* Stage with glow */}
              <div style={{
                position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)', width: 360, height: 55,
                borderRadius: '50% 50% 0 0', background: 'linear-gradient(to top, rgba(226,55,68,0.08), rgba(226,55,68,0.02))',
                border: '1.5px solid rgba(226,55,68,0.25)', borderBottom: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 -15px 50px rgba(226,55,68,0.08), inset 0 -10px 30px rgba(226,55,68,0.05)'
              }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 5, color: 'rgba(226,55,68,0.5)', marginTop: 16, textTransform: 'uppercase' }}>Stage</span>
              </div>
              {/* Stage scan line */}
              <div style={{ position: 'absolute', top: 135, left: '50%', transform: 'translateX(-50%)', width: 300, height: 1, background: 'linear-gradient(90deg, transparent, rgba(226,55,68,0.3), transparent)', animation: 'shimmer 3s infinite' }} />

              {/* Seat grid */}
              <div style={{ position: 'absolute', top: 180, left: '50%', transform: 'translateX(-50%)', width: layout.width, height: layout.height }}>
                {/* Dimmed seats (when zone filter active) */}
                {dimmedSeats.map(seat => (
                  <div key={seat.id} style={{
                    position: 'absolute', left: layout.width / 2 + seat.x, top: seat.y,
                    width: SEAT_SIZE, height: SEAT_SIZE, borderRadius: '3px 3px 2px 2px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.03)',
                    transition: 'all 0.3s', opacity: 0.3
                  }} />
                ))}

                {/* Active seats */}
                {filteredSeats.map(seat => {
                  const isSelected = selectedSeats.find(s => s.id === seat.id);
                  const isHovered = hoveredSeat === seat.id;
                  return (
                    <React.Fragment key={seat.id}>
                      {seat.label && (
                        <div style={{
                          position: 'absolute', left: layout.width / 2 + seat.x + (seat.label.isLeft ? -22 : SEAT_SIZE + 6), top: seat.y + 1,
                          fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace',
                          display: 'flex', alignItems: 'center', height: SEAT_SIZE
                        }}>{seat.label.text}</div>
                      )}
                      <div
                        onMouseEnter={() => !isMobile && !seat.isBooked && setHoveredSeat(seat.id)}
                        onMouseLeave={() => !isMobile && setHoveredSeat(null)}
                        onClick={(e) => { e.stopPropagation(); toggleSeat(seat); }}
                        style={{
                          position: 'absolute', left: layout.width / 2 + seat.x, top: seat.y,
                          width: SEAT_SIZE, height: SEAT_SIZE, borderRadius: '3px 3px 2px 2px',
                          background: seat.isBooked ? 'rgba(255,255,255,0.06)' : isSelected ? seat.zone.color : isHovered ? `${seat.zone.color}99` : `${seat.zone.color}35`,
                          border: seat.isBooked ? '1px solid rgba(255,255,255,0.04)' : `1px solid ${isSelected ? seat.zone.color : `${seat.zone.color}60`}`,
                          cursor: seat.isBooked ? 'not-allowed' : 'pointer',
                          transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          transform: isSelected ? 'scale(1.25) translateY(-2px)' : isHovered ? 'scale(1.15)' : 'scale(1)',
                          boxShadow: isSelected ? `0 3px 12px ${seat.zone.color}70, 0 0 0 2px ${seat.zone.color}30` : 'none',
                          zIndex: isSelected || isHovered ? 10 : 1,
                          animation: isSelected ? 'pulse-glow 2s infinite' : 'none'
                        }}
                      >
                        {/* Tooltip */}
                        {isHovered && !seat.isBooked && (
                          <div style={{
                            position: 'absolute', bottom: SEAT_SIZE + 10, left: '50%', transform: 'translateX(-50%)',
                            background: 'rgba(8,8,14,0.95)', backdropFilter: 'blur(12px)',
                            border: `1px solid ${seat.zone.color}60`, padding: '5px 10px', borderRadius: 8,
                            color: 'white', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap', pointerEvents: 'none',
                            boxShadow: `0 6px 16px rgba(0,0,0,0.5)`, zIndex: 100, letterSpacing: 0.3
                          }}>
                            {seat.identifier}  -  £{seat.zone.price}
                            <div style={{ position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 7, height: 7, background: 'rgba(8,8,14,0.95)', borderRight: `1px solid ${seat.zone.color}60`, borderBottom: `1px solid ${seat.zone.color}60` }} />
                          </div>
                        )}
                        {/* Chair legs */}
                        <div style={{ position: 'absolute', bottom: -2, left: 0, width: 2, height: 5, background: seat.isBooked ? 'rgba(255,255,255,0.05)' : `${seat.zone.color}80`, borderRadius: 1 }} />
                        <div style={{ position: 'absolute', bottom: -2, right: 0, width: 2, height: 5, background: seat.isBooked ? 'rgba(255,255,255,0.05)' : `${seat.zone.color}80`, borderRadius: 1 }} />
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Legend (compact) */}
      {isMobile && (
        <div style={{
          margin: '0 16px 20px', padding: '12px 16px', borderRadius: 16,
          background: 'rgba(8,8,14,0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Legend</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {zones.map(z => (
              <div key={z.id} onClick={() => setActiveZoneFilter(activeZoneFilter === z.id ? null : z.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', opacity: activeZoneFilter && activeZoneFilter !== z.id ? 0.4 : 1, transition: 'opacity 0.2s' }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: z.color }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: 'white' }}>{z.name}</span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)' }}>£{z.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Toast */}
      {seatError && (
        <div style={{
          position: 'absolute', bottom: selectedSeats.length > 0 ? 180 : 20, left: 16, right: 16, zIndex: 200,
          background: 'rgba(239,68,68,0.12)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(239,68,68,0.4)', borderRadius: 14,
          padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          animation: 'fadeInUp 0.3s ease',
          boxShadow: '0 8px 32px rgba(239,68,68,0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'white', lineHeight: 1.4 }}>{seatError}</span>
          </div>
          <button onClick={() => setSeatError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* Bottom Selection Sheet (Fixed at bottom) */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        transform: selectedSeats.length > 0 ? 'translateY(0)' : 'translateY(110%)',
        transition: 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
        padding: isMobile ? '0 12px 16px' : '0 24px 24px'
      }}>
        <div style={{
          maxWidth: 720, margin: '0 auto',
          background: 'rgba(12, 12, 20, 0.88)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
          border: `1px solid ${selectedSeats.length > 0 ? selectedSeats[0].zone.color + '40' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 20, padding: isMobile ? '16px 16px 18px' : '20px 24px',
          boxShadow: `0 -8px 40px rgba(0,0,0,0.5)`,
          display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'space-between', gap: isMobile ? 14 : 20
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{selectedSeats.length} {selectedSeats.length === 1 ? 'Seat' : 'Seats'}</span>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}> - </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: selectedSeats[0]?.zone.color }}>{[...new Set(selectedSeats.map(s => s.zone.name))].join(', ')}</span>
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
              {selectedSeats.slice(0, 6).map(s => (
                <span key={s.id} onClick={() => toggleSeat(s)} style={{
                  padding: '3px 7px', borderRadius: 6, background: `${s.zone.color}15`, border: `1px solid ${s.zone.color}30`,
                  fontSize: 9, fontWeight: 700, color: 'white', cursor: 'pointer', transition: 'all 0.15s', letterSpacing: 0.2
                }}>{s.identifier}</span>
              ))}
              {selectedSeats.length > 6 && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', alignSelf: 'center' }}>+{selectedSeats.length - 6} more</span>}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Inclusive of all taxes</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>Total</div>
              <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 800, color: 'white', letterSpacing: -1 }}>£{totalPrice}</div>
            </div>
            <button onClick={handleProceed} disabled={lockingSeats} style={{
              padding: isMobile ? '14px 24px' : '12px 28px', borderRadius: 14, fontSize: 14, fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: 6,
              cursor: lockingSeats ? 'not-allowed' : 'pointer',
              background: lockingSeats ? 'rgba(255,255,255,0.1)' : (selectedSeats.length > 0 ? selectedSeats[0].zone.gradient : 'var(--accent)'),
              color: 'white', border: 'none', whiteSpace: 'nowrap',
              boxShadow: lockingSeats ? 'none' : `0 6px 20px ${selectedSeats[0]?.zone.color || 'var(--accent)'}50`,
              transition: 'all 0.2s', flex: isMobile ? 1 : 'none', opacity: lockingSeats ? 0.7 : 1
            }}>
              {lockingSeats ? (
                <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>Securing Seats...</>
              ) : (
                <>Proceed <ArrowRight size={16} /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


// --- HOME HERO (COMBINED HEADER + ADS BANNER  PREMIUM FULL-BLEED) ---
function HomeHero({ onBookingsClick, setActivePage }) {
  const isMobile = useIsMobile();
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef(null);

  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070',
      tag: 'Now Booking in London',
      headline: <>Find your next{!isMobile && <br />} unforgettable event</>,
      subtitle: 'Discover handpicked concerts, festivals, and premium experiences tailored for the modern urban explorer.',
    },
    {
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1400&h=700&fit=crop',
      tag: 'Trending This Week',
      headline: <>Live music{!isMobile && <br />} like never before</>,
      subtitle: 'From intimate gigs to stadium anthems  experience the pulse of live entertainment at its finest.',
    },
    {
      image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1400&h=700&fit=crop',
      tag: 'Festival Season 2026',
      headline: <>Celebrate every{!isMobile && <br />} moment together</>,
      subtitle: 'Escape the ordinary. Join thousands at the world\'s most vibrant festivals and cultural gatherings.',
    },
  ];

  const startAutoplay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
  }, [heroSlides.length]);

  useEffect(() => {
    startAutoplay();
    return () => clearInterval(intervalRef.current);
  }, [startAutoplay]);

  const goToSlide = (i) => { setCurrentSlide(i); startAutoplay(); };

  return (
    <div className="animate-fadeIn" style={{
      width: '100%', padding: isMobile ? '8px' : '16px 24px 24px',
      marginTop: isMobile ? 0 : 8,
    }}>
      <div style={{
        position: 'relative',
        width: '100%', maxWidth: 1600, margin: '0 auto',
        height: isMobile ? 340 : 600,
        borderRadius: isMobile ? 16 : 28,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        transform: 'translateZ(0)', // Force hardware acceleration to prevent clip bleed on scroll
        WebkitMaskImage: '-webkit-radial-gradient(white, black)', // Safari fix for border-radius overflow
      }}>
        <GlobalMinimalHeader activePage="home" setActivePage={setActivePage} />

        {/* Auto-rotating Background Images */}
        {heroSlides.map((slide, index) => (
          <img
            key={index}
            alt="Hero background"
            src={slide.image}
            loading={index === 0 ? 'eager' : 'lazy'}
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%', objectFit: 'cover',
              transition: 'opacity 1s ease, transform 8s ease',
              opacity: index === currentSlide ? 1 : 0,
              transform: index === currentSlide ? 'scale(1.05)' : 'scale(1)',
            }}
          />
        ))}

        {/* Gradient Overlay  left-biased for left-aligned text */}
        <div style={{
          position: 'absolute', inset: 0,
          background: isMobile
            ? 'linear-gradient(160deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.3) 100%)'
            : 'linear-gradient(to right, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
        }} />

        {/* ===== LEFT-ALIGNED HERO CONTENT ===== */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          display: 'flex', flexDirection: 'column',
          justifyContent: isMobile ? 'flex-end' : 'center',
          alignItems: 'flex-start',
          padding: isMobile ? '0 16px 40px' : '0 60px',
        }}>
          {/* Animated Status Pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: isMobile ? '4px 10px' : '5px 14px', borderRadius: 30,
            background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'white', fontSize: isMobile ? 9 : 10, fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '1.2px',
            marginBottom: isMobile ? 10 : 16,
            animation: 'fadeInUp 0.6s ease 0.2s both',
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: '#34d399',
              boxShadow: '0 0 6px rgba(52,211,153,0.5)',
              animation: 'pulse 2s infinite',
            }} />
            {heroSlides[currentSlide].tag}
          </div>

          {/* Main Headline */}
          <h1 style={{
            fontSize: isMobile ? 20 : 48,
            fontWeight: 800, color: 'white',
            lineHeight: 1.15, marginBottom: isMobile ? 6 : 18,
            maxWidth: isMobile ? '85%' : 580,
            textShadow: '0 2px 16px rgba(0,0,0,0.3)',
            letterSpacing: '-0.3px',
            animation: 'fadeInUp 0.6s ease 0.3s both',
          }}>
            {heroSlides[currentSlide].headline}
          </h1>

          {/* Subtitle */}
          <p style={{
            fontSize: isMobile ? 11 : 14,
            color: 'rgba(255,255,255,0.6)',
            maxWidth: isMobile ? '80%' : 440,
            lineHeight: 1.5, fontWeight: 400,
            marginBottom: isMobile ? 14 : 28,
            animation: 'fadeInUp 0.6s ease 0.4s both',
          }}>
            {heroSlides[currentSlide].subtitle}
          </p>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex', gap: isMobile ? 8 : 12,
            flexDirection: 'row',
            animation: 'fadeInUp 0.6s ease 0.5s both',
          }}>
            <button
              onClick={() => setActivePage && setActivePage('events')}
              style={{
                padding: isMobile ? '8px 18px' : '11px 26px',
                background: 'white', color: '#18181b',
                borderRadius: 30, border: 'none',
                fontSize: isMobile ? 11 : 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                transition: 'all 0.25s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)'; }}
            >
              Start Exploring
              <ArrowRight size={isMobile ? 12 : 14} />
            </button>
            <button
              onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
              style={{
                padding: isMobile ? '8px 18px' : '11px 26px',
                background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)',
                color: 'white', borderRadius: 30,
                border: '1px solid rgba(255,255,255,0.12)',
                fontSize: isMobile ? 11 : 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font-primary)',
                transition: 'all 0.25s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            >
              View Offers
            </button>
          </div>
        </div>

        {/* ===== BOTTOM BAR ===== */}
        {!isMobile && (
          <div style={{
            position: 'absolute', bottom: 24, left: 24, right: 24,
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
            zIndex: 20, pointerEvents: 'none',
          }}>
            {/* Dot Indicators */}
            <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>
              {heroSlides.map((_, i) => (
                <button key={i} onClick={() => goToSlide(i)} style={{
                  width: i === currentSlide ? 24 : 8, height: 8,
                  borderRadius: 10, border: 'none', cursor: 'pointer',
                  background: i === currentSlide ? 'white' : 'rgba(255,255,255,0.4)',
                  transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
                  boxShadow: i === currentSlide ? '0 0 10px rgba(255,255,255,0.5)' : 'none',
                }} />
              ))}
            </div>

            {/* Premium Badge */}
            <div style={{
              background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)',
              padding: '8px 16px', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 6,
              pointerEvents: 'auto',
            }}>
              <Sparkles size={14} color="var(--accent)" />
              Premium Ads
            </div>
          </div>
        )}

        {/* Mobile Dots */}
        {isMobile && (
          <div style={{
            position: 'absolute', bottom: 16, left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex', gap: 6, zIndex: 20,
          }}>
            {heroSlides.map((_, i) => (
              <button key={i} onClick={() => goToSlide(i)} style={{
                width: i === currentSlide ? 20 : 6, height: 6,
                borderRadius: 10, border: 'none', cursor: 'pointer',
                background: i === currentSlide ? 'white' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.3s ease',
              }} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

// ========================================
// LOADING SCREEN (PREMIUM 3D ANIMATION)
// ========================================
function LoadingScreen({ onLoaded }) {
  const [isFading, setIsFading] = useState(false);
  // 'events' -> 'events-flip' -> 'scanning' -> 'scanning-flip' -> 'outline'
  const [phase, setPhase] = useState('events');

  // Preload crucial app images
  useEffect(() => {
    const heroSlides = [
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070',
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1400&h=700&fit=crop',
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1400&h=700&fit=crop',
      '/celebr8-logo.png' // PRELOAD LOGO PNG
    ];

    const imagesToLoad = [...heroSlides, ...EVENTS.map(evt => evt.image)];

    const preloadImage = (src) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = resolve;
        img.onerror = resolve; // Resolve even on error to not block app load permanently
      });
    };

    Promise.all(imagesToLoad.map(preloadImage)).then(() => {
      // Done downloading critical assets.
    });
  }, []);

  // Sequence Orchestration
  useEffect(() => {
    // 1. Show Events Icon for 1.2s, then begin flip out
    const eventFlipTimer = setTimeout(() => setPhase('events-flip'), 1200);

    // 2. Wait 0.3s for flip out, then switch to scanning ticket flip in
    const scanTimer = setTimeout(() => setPhase('scanning'), 1500);

    // 3. Scan ticket for 1.5s, then begin flip out
    const scanFlipTimer = setTimeout(() => setPhase('scanning-flip'), 3000);

    // 4. Wait 0.3s for ticket flip out, then switch to Logo Outline flip in
    const outlineTimer = setTimeout(() => setPhase('outline'), 3300);

    // 5. Keep Logo Outline for 1.5s then push the global fade out and handoff
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
      setTimeout(onLoaded, 800); // Wait for the fade keyframes
    }, 4800);

    return () => {
      clearTimeout(eventFlipTimer);
      clearTimeout(scanTimer);
      clearTimeout(scanFlipTimer);
      clearTimeout(outlineTimer);
      clearTimeout(fadeTimer);
    };
  }, [onLoaded]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      // Liquid Glass Effect Over Cinematic Background
      background: 'rgba(5, 5, 8, 0.4)',
      backdropFilter: 'blur(40px) saturate(150%)',
      WebkitBackdropFilter: 'blur(40px) saturate(150%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity: isFading ? 0 : 1,
      transform: isFading ? 'scale(1.1)' : 'scale(1)',
      transition: 'all 0.8s cubic-bezier(0.85, 0, 0.15, 1)',
      pointerEvents: 'none'
    }}>

      {/* SVG Filters for Logo Outline Generation */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="outline-extract">
            <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="DILATED" />
            <feMorphology in="SourceAlpha" operator="erode" radius="1" result="ERODED" />
            <feComposite in="DILATED" in2="ERODED" operator="out" result="OUTLINE" />
            <feFlood floodColor="#fff" result="COLOR" />
            <feComposite in="COLOR" in2="OUTLINE" operator="in" />
          </filter>
        </defs>
      </svg>

      <div style={{ position: 'relative', width: 140, height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

        {/* PHASE 1: Events Icon */}
        {(phase === 'events' || phase === 'events-flip') && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: phase === 'events'
              ? 'eventGlow 2s infinite ease-in-out'
              : 'flipOut 0.3s ease-in forwards',
            transformStyle: 'preserve-3d',
            perspective: 1000
          }}>
            <Calendar size={64} color="rgba(255,255,255,0.9)" strokeWidth={1} style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.4))' }} />
          </div>
        )}

        {/* PHASE 2: Ticket Scanning with Heartbeat */}
        {(phase === 'scanning' || phase === 'scanning-flip') && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            // Flip in then switch to floating heartbeat, or flip out
            animation: phase === 'scanning'
              ? 'flipIn 0.4s ease-out forwards, ticketFloat 2.5s infinite ease-in-out'
              : 'flipOut 0.3s ease-in forwards',
            transformStyle: 'preserve-3d',
            perspective: 1000
          }}>
            <div style={{
              position: 'relative',
              width: 80, height: 110,
              border: '2px dashed rgba(255,255,255,0.4)', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <Ticket size={48} color="rgba(255,255,255,0.7)" strokeWidth={1.5} />

              {/* Scanning Laser */}
              <div style={{
                position: 'absolute', top: -5, left: -20, right: -20, height: 2,
                animation: 'laserScan 1.5s infinite linear'
              }} />
            </div>
          </div>
        )}

        {/* PHASE 3: Morph Outline with Trace Glow */}
        {phase === 'outline' && (
          <div style={{
            position: 'absolute', inset: 0,
            // Flip in and Outline soft heartbeat via drawOutline
            animation: 'flipIn 0.5s ease-out forwards, drawOutline 1.5s ease-out forwards',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transformStyle: 'preserve-3d',
            perspective: 1000
          }}>
            <img
              src="/celebr8-logo.png"
              alt="Celebr8 Trace"
              style={{
                width: 120, height: 'auto',
                filter: 'url(#outline-extract)'
              }}
            />
          </div>
        )}
      </div>

      <div style={{
        marginTop: 60, color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: 6,
        animation: 'pulseText 2s infinite ease-in-out',
        opacity: (phase.includes('flip')) ? 0 : (phase === 'events' ? 0.7 : phase === 'scanning' ? 0.9 : 1),
        transition: 'opacity 0.3s ease'
      }}>
        {phase.includes('events') ? 'Finding Events' : phase.includes('scanning') ? 'Verifying Ticket' : 'Generating Experience'}
      </div>
    </div>
  );
}

// ========================================
// OWNER DASHBOARD + QR SCANNER
// ========================================
function OwnerDashboard() {
  const isMobile = useIsMobile();
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('ownerToken'));
  const [loginError, setLoginError] = useState(null);
  const [activeTab, setActiveTab] = useState('scanner');
  const [scanResult, setScanResult] = useState(null);
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [adminAccess, setAdminAccess] = useState(false);
  const [adminError, setAdminError] = useState(null);
  const [resetResult, setResetResult] = useState(null);
  const [resetting, setResetting] = useState(false);

  const FRONTEND_EVENTS = [
    { id: 1, title: 'The Secret Letter', subtitle: 'Leicester', venue: 'Maher Centre', city: 'Leicester', date: 'Fri, 24 Apr 2026' },
    { id: 2, title: 'The Secret Letter', subtitle: 'London', venue: 'The Royal Regency', city: 'London', date: 'Sat, 25 Apr 2026' },
    { id: 3, title: 'The Secret Letter', subtitle: 'Manchester', venue: 'Forum Centre', city: 'Manchester', date: 'Fri, 01 May 2026' },
    { id: 4, title: 'The Secret Letter', subtitle: 'Edinburgh', venue: 'Assembly Rooms', city: 'Edinburgh', date: 'Sat, 02 May 2026' },
    { id: 5, title: 'The Secret Letter', subtitle: 'Cardiff', venue: 'Principality Stadium', city: 'Cardiff', date: 'Sun, 03 May 2026' },
  ];

  useEffect(() => { if (token) { fetchStats(); fetchAll(); } }, [token]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/owner/stats?_t=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setStats(await res.json());
      else if (res.status === 401) { setToken(null); localStorage.removeItem('ownerToken'); }
    } catch (e) { }
  };

  const fetchAll = async () => {
    setLoadingBookings(true);
    try {
      const [bRes, eRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/owner/bookings?status=confirmed&limit=500&_t=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/owner/events?_t=${Date.now()}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (bRes.ok) setBookings(await bRes.json());
      if (eRes.ok) setEvents(await eRes.json());
    } catch (e) { }
    setLoadingBookings(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/owner/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok) { setToken(data.token); localStorage.setItem('ownerToken', data.token); setLoginError(null); }
      else setLoginError(data.message);
    } catch { setLoginError('Connection error'); }
  };

  const handleScan = async (devices) => {
    if (!devices?.length) return;
    const rawQrValue = devices[0].rawValue;
    let scanPayload = rawQrValue;
    let decodedData = null;

    try {
      if (rawQrValue.startsWith('http://') || rawQrValue.startsWith('https://')) {
        const urlObj = new URL(rawQrValue);
        // Strategy 1: /verify/xyz
        if (urlObj.pathname.includes('/verify/')) {
          const parts = urlObj.pathname.split('/');
          scanPayload = parts[parts.length - 1];
        }
        // Strategy 2: ?code=xyz (v2 fallback)
        else {
          const code = urlObj.searchParams.get('code');
          if (code) scanPayload = code;
        }
      } else {
        const parsed = JSON.parse(rawQrValue);
        if (parsed && parsed.code) {
          scanPayload = parsed.code;
          decodedData = parsed;
        }
      }
    } catch (err) {
      // It's neither a valid URL nor JSON, assume it's a raw string token
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/owner/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ qrData: scanPayload })
      });
      const data = await res.json();

      // Normalize backend data field names for the frontend display
      if (data.ticket) {
        data.ticket.customer = data.ticket.guest || data.ticket.customer;
      }

      // MERGE decoded JSON QR data with backend data for rich display (legacy ticket support)
      if (decodedData && data.ticket) {
        data.ticket = {
          ...data.ticket,
          customer: data.ticket.customer || decodedData.holder,
          email: data.ticket.email || decodedData.email,
          whatsapp: data.ticket.whatsapp || decodedData.whatsapp,
          paymentStatus: data.ticket.paymentStatus || decodedData.paymentStatus || 'Paid',
          venue: data.ticket.venue || decodedData.venue,
        };
      }

      setScanResult({ data, status: res.status });
      if (res.ok) { fetchStats(); fetchAll(); }
    } catch { setScanResult({ data: { message: 'Network error' }, status: 500 }); }
  };

  const handleAdminPinCheck = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/owner/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ pin: adminPin })
      });
      if (res.ok) { setAdminAccess(true); setShowAdminModal(false); setAdminError(null); setActiveTab('admin'); }
      else { const d = await res.json(); setAdminError(d.message); }
    } catch { setAdminError('Connection error'); }
  };

  const handleResetDb = async () => {
    if (!window.confirm('Are you sure? This will unlock ALL locked seats and cancel ALL pending bookings.')) return;
    setResetting(true); setResetResult(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/owner/reset-db`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ pin: '3699' })
      });
      const data = await res.json();
      setResetResult(data);
      if (res.ok) { fetchStats(); fetchAll(); }
    } catch { setResetResult({ message: 'Connection error' }); }
    setResetting(false);
  };

  const logout = () => { setToken(null); localStorage.removeItem('ownerToken'); setAdminAccess(false); };

  // ====== PREMIUM LOGIN SCREEN ======
  if (!token) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(ellipse at 20% 50%, rgba(226,55,68,0.08) 0%, #06060f 50%, #000 100%)',
        padding: 20, position: 'relative', overflow: 'hidden'
      }}>
        {/* Ambient blobs */}
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(226,55,68,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}>
          {/* Brand title */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'white', letterSpacing: '1px' }}>Celebr8</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600, marginTop: 4 }}>Owner Management Portal</div>
          </div>

          {/* Login Card */}
          <form onSubmit={handleLogin} style={{
            background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: isMobile ? '32px 24px' : '40px 36px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, rgba(226,55,68,0.3), rgba(180,40,55,0.5))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(226,55,68,0.3)', flexShrink: 0 }}>
                <Lock size={20} color="var(--accent)" />
              </div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: 0 }}>Owner Login</h2>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0, marginTop: 2 }}>Secure access to event management</p>
              </div>
            </div>

            {loginError && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', padding: '12px 16px', borderRadius: 12, marginBottom: 20, fontSize: 13, display: 'flex', gap: 8, alignItems: 'center' }}>
                <span> </span> {loginError}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Password</label>
              <input type="password" placeholder="Enter your owner password" value={password} onChange={e => setPassword(e.target.value)}
                style={{ width: '100%', padding: '15px 18px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.35)', color: 'white', fontSize: 15, outline: 'none', boxSizing: 'border-box', letterSpacing: password ? '4px' : '0' }}
                onFocus={e => e.target.style.borderColor = 'rgba(226,55,68,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <button type="submit" style={{ width: '100%', padding: '16px', borderRadius: 14, background: 'linear-gradient(135deg, #e23744 0%, #b22230 100%)', color: 'white', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: 15, boxShadow: '0 8px 32px rgba(226,55,68,0.4)', letterSpacing: '0.3px', transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
              onMouseEnter={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 12px 40px rgba(226,55,68,0.55)'; }}
              onMouseLeave={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 8px 32px rgba(226,55,68,0.4)'; }}
            >
              Login to Dashboard
            </button>
            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'rgba(255,255,255,0.2)' }}> Protected by server-side token authentication</div>
          </form>
        </div>
      </div>
    );
  }

  // ====== ADMIN PIN MODAL ======
  const AdminPinModal = () => (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
      <div style={{ background: 'linear-gradient(135deg, #0f0f1e, #1a1a2e)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 24, padding: 40, textAlign: 'center', maxWidth: 360, width: '90%', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.3))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', border: '2px solid rgba(251,191,36,0.3)' }}>
          <Lock size={26} color="#FBBF24" />
        </div>
        <h3 style={{ fontSize: 22, fontWeight: 900, color: 'white', marginBottom: 6 }}>Admin Access</h3>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>Enter 4-digit admin PIN to unlock</p>
        {adminError && <div style={{ color: '#EF4444', fontSize: 13, marginBottom: 14, background: 'rgba(239,68,68,0.1)', padding: '10px 14px', borderRadius: 10 }}>{adminError}</div>}
        <input type="password" maxLength={4} placeholder="   " value={adminPin} onChange={e => setAdminPin(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdminPinCheck(); }}
          style={{ width: '100%', padding: '16px', borderRadius: 14, border: '2px solid rgba(251,191,36,0.25)', background: 'rgba(0,0,0,0.4)', color: '#FBBF24', fontSize: 28, textAlign: 'center', letterSpacing: 12, marginBottom: 20, outline: 'none', boxSizing: 'border-box', fontWeight: 800 }} />
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => { setShowAdminModal(false); setAdminPin(''); setAdminError(null); }}
            style={{ flex: 1, padding: '14px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
          <button onClick={handleAdminPinCheck}
            style={{ flex: 1, padding: '14px', borderRadius: 12, background: 'linear-gradient(135deg, #FBBF24, #F59E0B)', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 900, fontSize: 15 }}>Unlock</button>
        </div>
      </div>
    </div>
  );

  // ====== PREMIUM DASHBOARD ======
  const statCards = stats ? [
    { label: 'Total Bookings', value: stats.totalBookings, icon: '', color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
    { label: 'Tickets Issued', value: stats.totalTickets, icon: '', color: '#6366F1', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)' },
    { label: 'Checked In', value: `${stats.checkedIn}/${stats.totalTickets}`, icon: '', color: '#22C55E', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
    { label: 'Revenue', value: `£${(parseFloat(stats.revenue) || 0).toFixed(0)}`, icon: '', color: '#FBBF24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)' },
  ] : [];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #06060f 0%, #0a0a14 100%)' }}>
      {showAdminModal && <AdminPinModal />}

      {/* PREMIUM HEADER */}
      <div style={{
        background: 'rgba(10,10,20,0.95)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: isMobile ? '14px 16px' : '14px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)'
      }}>
        {/* Left: Title only */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: 'white', lineHeight: 1 }}>Owner Dashboard</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Celebr8 Events</div>
          </div>
        </div>

        {/* Right: Admin badge + Logout */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {!adminAccess ? (
            <button onClick={() => setShowAdminModal(true)} style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#FBBF24', padding: isMobile ? '7px 10px' : '8px 14px', borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: 'pointer', letterSpacing: '0.5px' }}>
              {isMobile ? '' : 'Admin'}
            </button>
          ) : (
            <div style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.35)', color: '#FBBF24', padding: '7px 12px', borderRadius: 10, fontSize: 11, fontWeight: 800 }}>
              Admin
            </div>
          )}
          <button onClick={logout} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', padding: isMobile ? '7px 10px' : '8px 14px', borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
            {isMobile ? '' : 'Logout'}
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      {stats && (
        <div style={{ padding: isMobile ? '16px 12px 0' : '20px 24px 0', display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 12 }}>
          {statCards.map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 16, padding: isMobile ? '14px' : '18px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: isMobile ? 22 : 26, lineHeight: 1 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TABS */}
      <div style={{ padding: isMobile ? '0 12px' : '0 24px', marginTop: 20, marginBottom: 0 }}>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 4, gap: 4 }}>
          {[
            { id: 'scanner', label: ' Scanner' },
            { id: 'bookings', label: ` Bookings${bookings.length > 0 ? ` (${bookings.length})` : ''}` },
            ...(adminAccess ? [{ id: 'admin', label: ' Admin' }] : [])
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: isMobile ? '10px 8px' : '11px 16px', fontSize: isMobile ? 12 : 13, fontWeight: 700,
              border: 'none', borderRadius: 10, cursor: 'pointer',
              background: activeTab === tab.id ? 'rgba(255,255,255,0.09)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.4)',
              boxShadow: activeTab === tab.id ? '0 2px 8px rgba(0,0,0,0.3)' : 'none',
              transition: 'all 0.2s'
            }}>{tab.label}</button>
          ))}
        </div>
      </div>



      {/*  SCANNER TAB  */}
      {activeTab === 'scanner' && (
        <div>
          {scanResult ? (
            <div style={{ textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
              {scanResult.status === 200 ? (
                <div style={{ padding: '40px 20px', background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 24 }}>
                  {/* Big animated green tick */}
                  <div style={{ position: 'relative', width: 100, height: 100, margin: '0 auto 24px' }}>
                    <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(5,150,105,0.5))', border: '3px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 1.5s ease-in-out 3' }}>
                      <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'scale 0.4s ease-out' }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>
                  <h2 style={{ fontSize: 26, fontWeight: 900, color: '#10B981', marginBottom: 6 }}>ADMITTED</h2>
                  <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>Customer has entered the hall</p>
                  <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '20px', textAlign: 'left', marginBottom: 20 }}>
                    {[
                      ['Customer', scanResult.data.ticket?.customer || scanResult.data.ticket?.booking?.customerName],
                      ['Email', scanResult.data.ticket?.email || scanResult.data.ticket?.booking?.customerEmail],
                      ['WhatsApp', scanResult.data.ticket?.whatsapp],
                      ['Event', scanResult.data.ticket?.event || scanResult.data.ticket?.programme],
                      ['Venue', scanResult.data.ticket?.venue],
                      ['Seat', `${scanResult.data.ticket?.seat || scanResult.data.ticket?.seatIdentifier}  -  ${scanResult.data.ticket?.zone}`],
                      ['Payment', scanResult.data.ticket?.paymentStatus],
                      ['Checked In At', scanResult.data.ticket?.checkedInAt ? new Date(scanResult.data.ticket.checkedInAt).toLocaleTimeString('en-GB') : 'Now'],
                    ].map(([label, val]) => val && (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, gap: 12 }}>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{label}</span>
                        <span style={{ fontSize: 13, color: 'white', fontWeight: 700, textAlign: 'right' }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setScanResult(null)} style={{ width: '100%', padding: '16px', background: '#10B981', color: 'white', border: 'none', borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
                    Scan Next Ticket
                  </button>
                </div>
              ) : (
                <div style={{ padding: '40px 20px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 24 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', border: '2px solid rgba(239,68,68,0.4)' }}>
                    <X size={40} color="#EF4444" />
                  </div>
                  <h2 style={{ fontSize: 24, fontWeight: 900, color: '#EF4444', marginBottom: 8 }}>INVALID / USED</h2>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 16 }}>{scanResult.data.message}</p>
                  {scanResult.data.checkedInAt && (
                    <p style={{ color: '#F59E0B', fontSize: 13 }}>Already checked in at: {new Date(scanResult.data.checkedInAt).toLocaleString('en-GB')}</p>
                  )}
                  <button onClick={() => setScanResult(null)} style={{ marginTop: 24, width: '100%', padding: '16px', background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
                    Try Again
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ maxWidth: 480, margin: '0 auto' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Camera size={20} color="var(--accent)" />
                  <span style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>QR Check-in Scanner</span>
                </div>
                <div style={{ position: 'relative', aspectRatio: '1/1' }}>
                  <Scanner onScan={handleScan} />
                  <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center' }}>
                    <span style={{ background: 'rgba(0,0,0,0.7)', color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 600, padding: '6px 16px', borderRadius: 20 }}>Point camera at customer QR code</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/*  BOOKINGS TAB (by event)  */}
      {activeTab === 'bookings' && (
        <div>
          {loadingBookings ? (
            <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.4)' }}>Loading bookings...</div>
          ) : (
            FRONTEND_EVENTS.map(fe => {
              const eventBookings = bookings.filter(b => b.eventId === fe.id);
              const dbEvent = events.find(e => e.id === fe.id);
              return (
                <div key={fe.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, marginBottom: 20, overflow: 'hidden' }}>
                  {/* Event header */}
                  <div style={{ background: 'linear-gradient(135deg, rgba(226,55,68,0.12), rgba(0,0,0,0))', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>{fe.title} - {fe.subtitle}</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2, display: 'flex', gap: 12 }}>
                        <span>{fe.venue}, {fe.city}</span>
                        <span>{fe.date}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                      {dbEvent && (
                        <>
                          <div style={{ textAlign: 'center', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, padding: '6px 12px' }}>
                            <div style={{ fontSize: 16, fontWeight: 900, color: '#10B981' }}>{dbEvent.bookedSeats || 0}</div>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Sold</div>
                          </div>
                          <div style={{ textAlign: 'center', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 10, padding: '6px 12px' }}>
                            <div style={{ fontSize: 16, fontWeight: 900, color: '#3B82F6' }}>{dbEvent.availableSeats || 0}</div>
                            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Free</div>
                          </div>
                        </>
                      )}
                      <div style={{ textAlign: 'center', background: 'rgba(226,55,68,0.12)', border: '1px solid rgba(226,55,68,0.25)', borderRadius: 10, padding: '6px 12px' }}>
                        <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--accent)' }}>{eventBookings.length}</div>
                        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Bookings</div>
                      </div>
                    </div>
                  </div>

                  {/* Booking rows */}
                  {eventBookings.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>No confirmed bookings yet</div>
                  ) : (
                    <div>
                      {/* Table header */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 12, padding: '10px 20px', background: 'rgba(255,255,255,0.02)', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                        <span>Name</span><span>Seats</span><span>Amount</span><span>Status</span>
                      </div>
                      {eventBookings.map((b, i) => {
                        const allCheckedIn = b.tickets?.every(t => t.checkedIn);
                        const someCheckedIn = b.tickets?.some(t => t.checkedIn);
                        return (
                          <div key={b.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 12, padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.04)', alignItems: 'center', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{b.customerName}</div>
                              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{b.customerEmail}</div>
                            </div>
                            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                              {b.tickets?.map(t => (
                                <span key={t.ticketId} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginRight: 6 }}>
                                  <span style={{ color: t.checkedIn ? '#10B981' : 'rgba(255,255,255,0.3)', fontWeight: 700, fontSize: 10 }}>{t.checkedIn ? '[IN]' : ''}</span> {t.seatIdentifier}
                                </span>
                              ))}
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>£{parseFloat(b.totalAmount).toFixed(2)}</div>
                            <div style={{
                              fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, textAlign: 'center',
                              background: allCheckedIn ? 'rgba(16,185,129,0.15)' : someCheckedIn ? 'rgba(251,191,36,0.15)' : 'rgba(59,130,246,0.12)',
                              color: allCheckedIn ? '#10B981' : someCheckedIn ? '#FBBF24' : '#60A5FA'
                            }}>
                              {allCheckedIn ? 'In' : someCheckedIn ? 'Partial' : 'Not In'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <button onClick={fetchAll} style={{ display: 'block', margin: '0 auto', padding: '12px 28px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
            Refresh Bookings
          </button>
        </div>
      )}

      {/*  ADMIN TAB  */}
      {activeTab === 'admin' && adminAccess && (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 16, padding: '14px 20px', marginBottom: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#FBBF24' }}>(!)</span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>Admin panel. Actions here affect the live database. Use with caution.</span>
          </div>

          {/* Stats summary */}
          {stats && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '20px', marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 16 }}>Database Overview</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  { label: 'Total Bookings (confirmed)', value: stats.totalBookings, color: '#10B981' },
                  { label: 'Total Revenue', value: `£${(parseFloat(stats.revenue) || 0).toFixed(2)}`, color: 'white' },
                  { label: 'Tickets Issued', value: stats.totalTickets, color: '#3B82F6' },
                  { label: 'Checked In', value: `${stats.checkedIn} / ${stats.totalTickets}`, color: '#10B981' },
                ].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '12px 16px' }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Database Reset */}
          <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 20, padding: '20px', marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 6 }}>Full Database Reset</div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16, lineHeight: 1.6 }}>
              Deletes <b style={{ color: 'white' }}>ALL bookings</b>, <b style={{ color: 'white' }}>ALL tickets</b>, and resets <b style={{ color: 'white' }}>ALL seats</b> to available. Use this to start completely fresh.
            </p>
            {resetResult && (
              <div style={{ background: resetResult.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${resetResult.success ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 12, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: resetResult.success ? '#10B981' : '#EF4444' }}>
                {resetResult.success ? `Done! Deleted ${resetResult.ticketsDeleted || 0} tickets, ${resetResult.bookingsDeleted || 0} bookings, reset ${resetResult.seatsReset || 0} seats.` : `${resetResult.message}`}
              </div>
            )}
            <button onClick={handleResetDb} disabled={resetting}
              style={{ width: '100%', padding: '14px', background: resetting ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.8)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 14, cursor: resetting ? 'not-allowed' : 'pointer' }}>
              {resetting ? 'Resetting...' : 'Reset All Data Now'}
            </button>
          </div>

          {/* Events overview */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '20px', marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'white', marginBottom: 14 }}>Events Fill Rate</div>
            {events.map(e => (
              <div key={e.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{e.title} - {e.city}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{e.bookedSeats}/{e.totalSeats} ({e.fillRate}%)</span>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${e.fillRate}%`, background: 'linear-gradient(to right, var(--accent), #ff6b6b)', borderRadius: 4, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Logout admin */}
          <button onClick={() => { setAdminAccess(false); setActiveTab('scanner'); }}
            style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
            Exit Admin Panel
          </button>
        </div>
      )}
    </div>
  );
}
// --- Contact Details Modal ---
function ContactDetailsModal({ event, bookingDetails, onBack, onProceed }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !whatsapp.trim()) {
      setError('Please fill in all details to proceed.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/bookings/lock-seats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          seatIdentifiers: bookingDetails.seatIdentifiers
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Could not lock these seats. They might be taken.');
        setLoading(false);
        return;
      }

      onProceed({
        name, email, whatsapp,
        seatDbIds: data.seatIds,
        lockExpiresAt: data.expiresAt
      });
    } catch (err) {
      setError('Connection error locking seats. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fadeIn" style={{ background: 'rgba(8, 8, 14, 0.85)', backdropFilter: 'blur(20px)' }}>
      <div style={{
        width: '100%', maxWidth: 440,
        background: 'rgba(12, 12, 20, 0.95)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 24, padding: isMobile ? 24 : 32,
        margin: isMobile ? 16 : 0,
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        position: 'relative'
      }}>
        {/* Close Button */}
        <button onClick={onBack} disabled={loading} style={{
          position: 'absolute', top: 20, right: 20,
          width: 32, height: 32, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.5)', border: 'none', cursor: 'pointer',
          transition: 'all 0.2s',
          opacity: loading ? 0.5 : 1
        }}>
          <X size={16} />
        </button>

        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', fontSize: 11, fontWeight: 700, borderRadius: 12, marginBottom: 12, letterSpacing: 0.5 }}>STEP 2 OF 3</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'white', marginBottom: 6 }}>Your Details</h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>Where should we send your e-tickets for {event?.title}?</p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '3px solid #ef4444', borderRadius: 8, color: '#ef4444', fontSize: 12, fontWeight: 600, marginBottom: 20 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" required style={{
                width: '100%', height: 48, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', padding: '0 16px 0 44px', fontSize: 14, outline: 'none', transition: 'border-color 0.2s'
              }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required style={{
                width: '100%', height: 48, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', padding: '0 16px 0 44px', fontSize: 14, outline: 'none', transition: 'border-color 0.2s'
              }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>WhatsApp Number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} color="rgba(255,255,255,0.4)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="e.g. +44 7123 456789" required style={{
                width: '100%', height: 48, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', padding: '0 16px 0 44px', fontSize: 14, outline: 'none', transition: 'border-color 0.2s'
              }} />
            </div>
          </div>

          <div style={{ background: 'rgba(59,130,246,0.06)', borderRadius: 12, padding: 16, marginTop: 8, border: '1px solid rgba(59,130,246,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Ticket Quantity</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{bookingDetails?.ticketCount || 1} x {bookingDetails?.zoneName || 'General'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Total Amount</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: '#3b82f6' }}>£{bookingDetails?.totalPrice?.toFixed(2) || '0.00'}</span>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{
            width: '100%', height: 48, borderRadius: 12, marginTop: 8,
            background: 'linear-gradient(135deg, var(--accent), #ff6b6b)',
            color: 'white', fontSize: 14, fontWeight: 700, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 10px 25px rgba(226,55,68,0.3)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? 'Securing Seats...' : <>Continue to Payment <ArrowRight size={16} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- BOOKING PAGE ---
function BookingPage({ event, onBack, onProceed }) {
  const isMobile = useIsMobile();
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="booking-page animate-fadeIn" style={{
      minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: 100, position: 'relative', overflow: 'hidden'
    }}>
      {/* Background gradients for liquid glass effect */}
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(226,55,68,0.06) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '-10%', left: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none' }} />

      <div className="page-container" style={{ paddingTop: isMobile ? 24 : 40, position: 'relative', zIndex: 10 }}>
        {/* Navigation */}
        <button onClick={onBack} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: 'var(--radius-full)',
          color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          marginBottom: 24, transition: 'all 0.2s', backdropFilter: 'blur(12px)', boxShadow: 'var(--shadow-sm)'
        }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
          <ChevronLeft size={16} /> Back
        </button>

        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 32 }}>
          {/* Left Column - Image */}
          <div style={{ flex: isMobile ? 'none' : '1 1 50%' }}>
            <div style={{
              position: 'relative', borderRadius: 24, overflow: 'hidden',
              boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-light)',
              aspectRatio: '1', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {!imageLoaded && (
                <div style={{ position: 'absolute', inset: 0, animation: 'pulse 1.5s infinite', background: 'rgba(0,0,0,0.05)' }} />
              )}
              <img
                src={event?.image}
                alt={event?.title}
                onLoad={() => setImageLoaded(true)}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  opacity: imageLoaded ? 1 : 0, transition: 'opacity 0.5s ease',
                  transform: 'scale(1.05)'
                }}
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)',
                pointerEvents: 'none'
              }} />

              {/* Tag Overlay */}
              {event?.tag && (
                <div style={{
                  position: 'absolute', top: 16, left: 16,
                  padding: '6px 14px', borderRadius: 'var(--radius-full)', background: 'rgba(255,255,255,0.95)',
                  color: '#111', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5,
                  boxShadow: 'var(--shadow-md)'
                }}>
                  {event.tag}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Details */}
          <div style={{ flex: isMobile ? 'none' : '1 1 50%', display: 'flex', flexDirection: 'column' }}>
            {/* Date & Title */}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8, background: 'var(--accent-light)',
                color: 'var(--accent)', fontSize: 12, fontWeight: 700, marginBottom: 12
              }}>
                <Calendar size={14} /> {event?.date}
              </div>
              <h1 style={{ fontSize: isMobile ? 32 : 48, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1, letterSpacing: '-1px', marginBottom: 16 }}>
                {event?.title}
              </h1>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Experience an unforgettable night featuring incredible performances, amazing crowd energy, and the best music around. Secure your tickets now before they sell out!
              </p>
            </div>

            {/* Event Info Grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 32,
              padding: 24, background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div>
                <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Venue</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)', fontWeight: 700, fontSize: 14 }}>
                  <MapPin size={16} color="var(--accent)" /> {event?.venue}
                </div>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>City</span>
                <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 14 }}>{event?.city}</div>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Time</span>
                <div style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: 14 }}>{event?.time || '20:00 - 03:00'}</div>
              </div>
              <div>
                <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Price</span>
                <div style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: 16 }}>£{event?.price?.replace(/[^0-9]/g, '') || 50} <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>onwards</span></div>
              </div>
            </div>

            {/* Action Bar */}
            <div style={{
              marginTop: 'auto', background: 'var(--bg-card)', padding: 24, borderRadius: 24, border: '1px solid var(--accent-light)', boxShadow: '0 12px 40px rgba(226,55,68,0.08)'
            }}>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>Ready to book?</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>You will be able to select your exact seats dynamically on the next screen.</p>
              </div>

              {(event?.city === 'Edinburgh' || event?.city === 'Cardiff') ? (
                <button disabled style={{
                  width: '100%', padding: '16px', borderRadius: 'var(--radius-full)',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: 700, cursor: 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  Coming Soon <Lock size={18} />
                </button>
              ) : (
                <button onClick={onProceed} style={{
                  width: '100%', padding: '16px', borderRadius: 'var(--radius-full)',
                  background: 'linear-gradient(135deg, var(--accent), #ff6b6b)',
                  color: 'white', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 10px 25px rgba(226,55,68,0.25)', transition: 'all 0.2s transform'
                }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                  Choose Seats <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ========================================
// TICKET VERIFICATION PAGE (Public Route)
// ========================================
function TicketVerificationPage({ ticketCode, onHome }) {
  const [ticketDetails, setTicketDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/tickets/verify/${ticketCode}?_t=${Date.now()}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || 'Invalid ticket code.');
        } else {
          setTicketDetails(data);
        }
      } catch (err) {
        setError('Network error verifying ticket.');
      }
      setLoading(false);
    };

    if (ticketCode) fetchTicket();
    else { setLoading(false); setError('No ticket code provided.'); }
  }, [ticketCode]);

  return (
    <div style={{ minHeight: '100vh', padding: '60px 20px', background: '#07070c', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
          <div style={{ width: 40, height: 40, border: '3px solid rgba(226,55,68,0.3)', borderTopColor: '#e23744', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
          Verifying Ticket...
        </div>
      ) : error ? (
        <div style={{ maxWidth: 400, width: '100%', padding: '40px 24px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 24, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <X size={40} color="#EF4444" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#EF4444', marginBottom: 12 }}>Invalid Ticket</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{error}</p>
          <button onClick={onHome} style={{ marginTop: 30, padding: '12px 24px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700 }}>Return Home</button>
        </div>
      ) : (
        <div style={{ maxWidth: 440, width: '100%', padding: '32px 24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>

          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            {ticketDetails?.status === 'used' ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 20, background: 'rgba(239,68,68,0.15)', color: '#EF4444', fontWeight: 800, fontSize: 14, marginBottom: 20 }}>
                <CheckCircle size={18} /> USED TICKET
              </div>
            ) : (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 20, background: 'rgba(16,185,129,0.15)', color: '#10B981', fontWeight: 800, fontSize: 14, marginBottom: 20 }}>
                <CheckCircle size={18} /> VALID TICKET
              </div>
            )}
            <h1 style={{ fontSize: 24, fontWeight: 900, color: 'white', marginBottom: 4, lineHeight: 1.2 }}>{ticketDetails?.event}</h1>
            <p style={{ color: 'var(--accent)', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{ticketDetails?.venue}</p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
            {[
              ['Guest', ticketDetails?.customer],
              ['Email', ticketDetails?.email],
              ['WhatsApp', ticketDetails?.whatsapp],
              ['Seat', `${ticketDetails?.seat} - ${ticketDetails?.zone}`],
              ['Payment', ticketDetails?.paymentStatus],
              ['Date', ticketDetails?.date ? new Date(ticketDetails.date).toLocaleDateString('en-GB') : '—']
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{label}</span>
                <span style={{ fontSize: 13, color: 'white', fontWeight: 700, textAlign: 'right' }}>{val || '—'}</span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 20, lineHeight: 1.5 }}>
              This is a verifiable secure digital ticket. For staff use only for official entry scanning.
            </p>
            <button onClick={onHome} style={{ width: '100%', padding: '14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>
              Explore More Events
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================
// MAIN APP
// ========================================
export default function App() {
  const isMobile = useIsMobile();
  const [selectedCity, setSelectedCity] = useState('London');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null); // For booking flow
  const [bookingDetails, setBookingDetails] = useState(null); // {ticketCount, zoneId, zoneName, totalPrice}
  const [bookingData, setBookingData] = useState(null); // Refactor target for checkout data wrapper
  const [userDetails, setUserDetails] = useState(null); // {name, email, whatsapp}
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [appLoaded, setAppLoaded] = useState(false);

  // Initialize state based on URL
  const [activePage, setActivePage] = useState(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    // Add verification public routing
    if (path === '/verify' && params.get('code')) return 'verify';

    // Handle Stripe's direct /payment-success?session_id= redirect
    if (path === '/payment-success' && params.get('session_id')) return 'payment-verifying';
    if (path === '/payment-failed') return 'payment-failed';
    // Legacy support
    if (params.get('payment') === 'success') return 'payment-verifying';
    if (params.get('payment') === 'failed' || params.get('payment') === 'cancelled') return 'payment-failed';
    if (path === '/owner') return 'owner';
    if (path === '/about') return 'about';
    if (path === '/support') return 'support';
    if (path === '/events') return 'events';
    return 'home';
  });

  // Handle Stripe payment return — handles both /payment-success?session_id= and ?payment=success legacy
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const path = window.location.pathname;
    const sessionId = params.get('session_id');
    const paymentStatus = params.get('payment');

    // New URL: /payment-success?session_id=...
    const isNewSuccessUrl = path === '/payment-success' && sessionId;
    // Legacy URL: ?payment=success&session_id=...
    const isLegacySuccessUrl = paymentStatus === 'success' && sessionId;

    if (isNewSuccessUrl || isLegacySuccessUrl) {
      fetch(`${API_BASE_URL}/api/payments/verify/${sessionId}?_t=${Date.now()}`)
        .then(r => r.json())
        .then(data => {
          if (data.success || data.status === 'confirmed') {
            setSelectedEvent(data.event || { title: 'The Secret Letter', date: '', venue: '', city: '', image: '' });
            setBookingData({
              booking: data,
              eventInfo: data.event,
              tickets: data.tickets || [],
              summary: {
                ticketCount: data.tickets?.length || 1,
                zoneName: data.tickets?.[0]?.zone || 'General',
                totalPrice: parseFloat(data.totalAmount) || 0,
                seatIdentifiers: data.tickets?.map(t => t.seatIdentifier) || []
              },
              // Map from data.user (returned by our backend)
              user: {
                name: data.user?.name || data.customerName || '',
                email: data.user?.email || data.customerEmail || '',
                whatsapp: data.user?.whatsapp || ''
              }
            });
            setActivePage('confirmation');
            window.history.replaceState({}, '', '/');
          } else {
            setActivePage('payment-failed');
            window.history.replaceState({}, '', '/');
          }
        })
        .catch(() => {
          setActivePage('payment-failed');
          window.history.replaceState({}, '', '/');
        });
    } else if (path === '/payment-failed' || paymentStatus === 'cancelled') {
      window.history.replaceState({}, '', '/');
      setActivePage('payment-failed');
    }
  }, []);

  // Sync URL with activePage
  useEffect(() => {
    const path = window.location.pathname;
    let targetPath = '/';
    if (activePage === 'about') targetPath = '/about';
    else if (activePage === 'support') targetPath = '/support';
    else if (activePage === 'events') targetPath = '/events';

    // Maintain nice URL structure
    if (!['booking', 'checkout', 'seats', 'add-details', 'confirmation'].includes(activePage) && path !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
  }, [activePage]);

  // GLOBAL: Always scroll to top on every page transition
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activePage]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/about') setActivePage('about');
      else if (path === '/support') setActivePage('support');
      else if (path === '/events') setActivePage('events');
      else setActivePage('home');
      setSelectedEvent(null);
      setBookingDetails(null);
      setShowDetailsModal(false);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Map "booking" page string back to the state workflow
  useEffect(() => {
    if (activePage === 'home' || activePage === 'about' || activePage === 'support') {
      setSelectedEvent(null);
      setBookingData(null);
    }
  }, [activePage]);

  const handleBookTicket = (event) => {
    setSelectedEvent(event);
    setActivePage('booking');
    window.scrollTo(0, 0);
  };


  const handleProceedToSeats = () => {
    setActivePage('seats');
    window.scrollTo(0, 0);
  };

  const handleProceedToDetails = (details) => {
    setBookingDetails(details);
    setShowDetailsModal(true);
  };

  const handleProceedToCheckout = (user) => {
    setUserDetails(user);
    // Combine the collected details into bookingData for the checkout page
    setBookingData({
      summary: { ...bookingDetails, seatDbIds: user.seatDbIds, lockExpiresAt: user.lockExpiresAt },
      user: user
    });
    setShowDetailsModal(false);
    setActivePage('checkout');
    window.scrollTo(0, 0);
  };

  const handlePaymentSuccess = () => {
    setActivePage('confirmation');
    window.scrollTo(0, 0);
  };

  const filteredEvents = activeCategory === 'all'
    ? EVENTS
    : EVENTS.filter(e => e.category === activeCategory);

  // Cleanup locked seats when user closes the browser/tab
  useEffect(() => {
    const handleBeforeUnload = () => {
      const seatIds = bookingData?.summary?.seatDbIds;
      if (seatIds?.length && selectedEvent?.id && ['checkout', 'seats'].includes(activePage)) {
        navigator.sendBeacon(
          `${API_BASE_URL}/api/bookings/unlock-seats`,
          new Blob([JSON.stringify({ eventId: selectedEvent.id, seatIds })], { type: 'application/json' })
        );
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [bookingData, selectedEvent, activePage]);

  // Handle global routing
  const renderContent = () => {
    // If selecting seats for a specific event
    if (activePage === 'seats' && selectedEvent) {
      return (
        <SeatSelectionPage
          event={selectedEvent}
          onBack={() => setActivePage('booking')}
          onProceed={handleProceedToDetails}
        />
      );
    }

    if (activePage === 'checkout' && selectedEvent && bookingData) {
      // NOTE: Passing bookingData in as bookingDetails to satisfy the prop contract of CheckoutPage
      return (
        <CheckoutPage
          event={selectedEvent}
          bookingDetails={bookingData.summary}
          userDetails={bookingData.user}
          onBack={() => {
            // Unlock seats when user goes back from checkout
            const seatIds = bookingData?.summary?.seatDbIds;
            if (seatIds?.length && selectedEvent?.id) {
              navigator.sendBeacon(
                `${API_BASE_URL}/api/bookings/unlock-seats`,
                new Blob([JSON.stringify({ eventId: selectedEvent.id, seatIds })], { type: 'application/json' })
              );
            }
            setActivePage('seats');
          }}
          onSuccess={handlePaymentSuccess}
        />
      );
    }

    if (activePage === 'confirmation' && selectedEvent && bookingData) {
      return (
        <PaymentSuccessPage
          event={selectedEvent}
          booking={bookingData.booking}
          eventInfo={bookingData.eventInfo}
          tickets={bookingData.tickets}
          userDetails={bookingData.user}
          bookingDetails={bookingData.summary}
          onHome={() => {
            setActivePage('home');
            setSelectedEvent(null);
            setBookingData(null);
          }}
        />
      );
    }

    if (activePage === 'booking' && selectedEvent) {
      return (
        <BookingPage
          event={selectedEvent}
          onBack={() => setActivePage('home')}
          onProceed={handleProceedToSeats}
        />
      );
    }

    if (activePage === 'verify') {
      const code = new URLSearchParams(window.location.search).get('code');
      return (
        <TicketVerificationPage
          ticketCode={code}
          onHome={() => {
            setActivePage('home');
            window.history.replaceState({}, '', '/');
          }}
        />
      );
    }

    if (activePage === 'payment-failed') {
      return (
        <PaymentFailedPage
          onHome={() => {
            setActivePage('home');
            window.history.replaceState({}, '', '/');
          }}
        />
      );
    }

    switch (activePage) {
      case 'owner':
        return <OwnerDashboard />;
      case 'about':
        return <AboutPage />;
      case 'support':
        return <SupportPage />;
      case 'events':
        return <EventsPage onBook={handleBookTicket} />;
      case 'home':
      default:
        return (
          <>
            <HomeHero setActivePage={setActivePage} />
            <AnimatedBrandBanner />
            <DiscoverEvents onBook={handleBookTicket} />
            <EventsGrid events={filteredEvents} onBook={handleBookTicket} />
            <PromoBanner />
          </>
        );
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {!appLoaded && <LoadingScreen onLoaded={() => setAppLoaded(true)} />}

      {/* Global Minimalist Header (Same as home page, applied everywhere) */}
      {!['home', 'booking', 'seats', 'owner', 'checkout', 'confirmation', 'payment-failed'].includes(activePage) && (
        <GlobalMinimalHeader activePage={activePage} setActivePage={setActivePage} />
      )}

      <main className="main-content">
        {renderContent()}
        {!['booking', 'seats', 'owner', 'checkout', 'confirmation', 'payment-failed'].includes(activePage) && <Footer />}
      </main>


      {/* Modal Overlay */}
      {showDetailsModal && bookingDetails && (
        <ContactDetailsModal
          event={selectedEvent}
          bookingDetails={bookingDetails}
          onBack={() => {
            // Unlock seats when user closes the details modal
            const seatIds = bookingDetails?.seatDbIds;
            if (seatIds?.length && selectedEvent?.id) {
              fetch(`${API_BASE_URL}/api/bookings/unlock-seats`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId: selectedEvent.id, seatIds })
              }).catch(() => { });
            }
            setShowDetailsModal(false);
          }}
          onProceed={handleProceedToCheckout}
        />
      )}

      {/* Mobile Bottom Nav (Hide on booking) */}
      {isMobile && !['booking', 'seats'].includes(activePage) && <MobileBottomNav activePage={activePage} setActivePage={setActivePage} />}
    </div>
  );
}

// Modify child components to accept onBook prop
// We need to update TrendingSection and EventsGrid, and their children StackCard and EventCard



function EventsGrid({ events, onBook }) {
  const isMobile = useIsMobile();
  const [sectionRef, isVisible] = useScrollReveal(0.05);

  return (
    <div ref={sectionRef} className="page-container" style={{
      marginBottom: 32,
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(15px)',
      transition: 'all 0.5s ease',
    }}>
      {/* Section Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 4, height: 24, borderRadius: 4,
            background: 'linear-gradient(to bottom, var(--accent), #ff6b6b)',
          }} />
          <h2 style={{ fontSize: isMobile ? 20 : 26, fontWeight: 800, letterSpacing: '-0.3px' }}>
            Upcoming Events
          </h2>
          <span style={{
            padding: '2px 8px', borderRadius: 'var(--radius-full)',
            background: 'var(--accent-light)', color: 'var(--accent)',
            fontSize: 11, fontWeight: 700, border: '1px solid rgba(226,55,68,0.15)',
          }}>
            {events.length}
          </span>
        </div>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 4,
          padding: '6px 14px', borderRadius: 'var(--radius-full)',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500,
          cursor: 'pointer', fontFamily: 'var(--font-primary)',
          transition: 'all 0.2s ease',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          View all
          <ChevronRight size={13} />
        </button>
      </div>

      <div className="events-grid">
        {events.map((event, i) => (
          <EventCard key={event.id} event={event} index={i} onBook={() => onBook(event)} />
        ))}
      </div>
    </div>
  );
}

function EventCard({ event, index = 0, onBook }) {
  const [liked, setLiked] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [cardRef, isVisible] = useScrollReveal(0.08);

  return (
    <div
      ref={cardRef}
      className="event-card liquid-glass"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onBook} // Click card to open booking too, or just the button? prefer just button or allow both.
      // Let's make entire card clickable but button takes precedence or just visual.
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: `${index * 0.06}s`,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Image */}
      <div className="event-card-image">
        <img src={event.image} alt={event.title} loading="lazy" />

        {/* Shimmer effect */}
        <div className="card-shimmer" />

        {/* Dark gradient overlay */}
        <div className="card-gradient" />

        {/* Tag */}
        {event.tag && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            padding: '4px 10px', borderRadius: 'var(--radius-full)',
            background: event.tag === 'Selling Fast' ? 'rgba(239,68,68,0.85)' :
              event.tag === 'Trending' ? 'rgba(139,92,246,0.85)' :
                event.tag === 'Premium' ? 'rgba(245,158,11,0.85)' :
                  event.tag === 'Hot' ? 'rgba(249,115,22,0.85)' :
                    event.tag === 'New' ? 'rgba(16,185,129,0.85)' :
                      event.tag === 'Popular' ? 'rgba(59,130,246,0.85)' :
                        event.tag === 'Almost Full' ? 'rgba(236,72,153,0.85)' :
                          event.tag === 'Healthy' ? 'rgba(20,184,166,0.85)' : 'rgba(107,114,128,0.85)',
            backdropFilter: 'blur(4px)',
            color: 'white', fontSize: 10, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.5px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            {event.tag}
          </div>
        )}

        {/* Like btn */}
        <button onClick={(e) => { e.stopPropagation(); setLiked(!liked); }}
          style={{
            position: 'absolute', top: 10, right: 10,
            width: 32, height: 32, borderRadius: '50%',
            background: liked ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: liked ? 'scale(1.15)' : 'scale(1)',
          }}
        >
          <Heart size={14} fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : 'rgba(255,255,255,0.6)'} />
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontSize: 13, fontWeight: 700, color: 'var(--text-primary)',
          marginBottom: 6, lineHeight: 1.3,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          transition: 'color 0.2s ease',
          ...(hovered ? { color: 'var(--accent)' } : {}),
        }}>
          {event.title}
        </h3>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4,
        }}>
          <Calendar size={11} style={{ flexShrink: 0 }} />
          <span>{event.date}</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontSize: 11, color: 'var(--text-muted)',
        }}>
          <MapPin size={11} style={{ flexShrink: 0 }} />
          <span style={{
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {event.venue}, {event.city}
          </span>
        </div>

        {(event.city === 'Edinburgh' || event.city === 'Cardiff') ? (
          <button disabled className="book-btn" onClick={(e) => e.stopPropagation()} style={{
            width: '100%', marginTop: 10, fontSize: 11,
            padding: '8px 12px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)',
            cursor: 'not-allowed', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
          }}>
            <Lock size={13} />
            Coming Soon
          </button>
        ) : (
          <button className="book-btn" onClick={(e) => { e.stopPropagation(); onBook(); }} style={{
            width: '100%', marginTop: 10, fontSize: 11,
            padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
          }}>
            <Ticket size={13} />
            Book tickets
          </button>
        )}
      </div>
    </div>
  );
}

