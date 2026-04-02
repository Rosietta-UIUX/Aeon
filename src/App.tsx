/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Calendar, 
  Lock, 
  Sparkles, 
  ChevronRight, 
  Clock, 
  Shield, 
  Mail, 
  MessageSquare,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle,
  Camera,
  Video,
  Mic,
  Trash2,
  X,
  Play,
  Square,
  FileUp,
  Maximize2,
  Minimize2,
  Quote,
  HelpCircle,
  History,
  Check,
  ChevronDown,
  ExternalLink,
  Zap
} from 'lucide-react';
import { format, addYears, addMonths, addDays } from 'date-fns';
import { GoogleGenAI } from "@google/genai";
import { cn } from './lib/utils';

// --- Types ---
type Step = 'write' | 'settings' | 'confirm' | 'success';

interface Attachment {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  name: string;
}

interface Letter {
  content: string;
  deliveryDate: Date;
  email: string;
  secondaryEmail?: string;
  isPublic: boolean;
  subject: string;
  attachments: Attachment[];
}

const PredictionBoard = () => {
  const predictions = [
    { text: "AI will be writing 90% of all code by 2028.", date: "2024-05-12", unlock: "2028-05-12" },
    { text: "I'll finally be living in a house with a garden.", date: "2023-11-20", unlock: "2026-11-20" },
    { text: "Bitcoin will hit $500k or $0. No in-between.", date: "2024-01-01", unlock: "2030-01-01" },
  ];

  return (
    <section className="mt-40 space-y-12" id="predictions">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-[10px] font-bold text-brand-300 uppercase tracking-widest mb-2">
          <Zap size={12} className="animate-pulse" />
          Live Feed
        </div>
        <h2 className="font-serif text-3xl text-white font-bold">Public Prediction Board</h2>
        <p className="text-brand-400 max-w-lg mx-auto">Anonymous glimpses into the collective future. Locked until their time comes.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {predictions.map((p, i) => (
          <div key={i} className="group relative glass p-8 rounded-[2.5rem] shadow-sm hover:shadow-brand-500/20 transition-all duration-500 border-white/5">
            <div className="absolute top-6 right-6 text-brand-500 group-hover:text-brand-300 transition-colors">
              <Lock size={18} />
            </div>
            <div className="space-y-6">
              <div className="w-12 h-1 bg-gradient-to-r from-brand-500 to-transparent rounded-full" />
              <p className="text-brand-100 font-serif text-lg leading-relaxed italic opacity-80 group-hover:opacity-100 transition-opacity">"{p.text}"</p>
              <div className="pt-6 border-t border-white/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-brand-500">
                <div className="flex flex-col gap-1">
                  <span className="opacity-50">Sealed</span>
                  <span className="text-brand-300">{p.date}</span>
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span className="opacity-50">Unlocks</span>
                  <span className="text-white">{p.unlock}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-center">
        <button className="text-sm font-bold text-white border-b border-white/20 pb-1 hover:text-brand-300 hover:border-brand-300 transition-all">
          View all predictions
        </button>
      </div>
    </section>
  );
};

const VoiceRecorder = ({ onClose, onSave }: { onClose: () => void, onSave: (url: string) => void }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-6"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="glass-dark rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-8 text-center"
      >
        <div className="flex justify-between items-center">
          <h3 className="font-serif text-2xl text-white">Record Voice Note</h3>
          <button onClick={onClose} className="text-brand-400 hover:text-white"><X size={24} /></button>
        </div>

        <div className="flex flex-col items-center justify-center space-y-6 py-8">
          <div className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500",
            isRecording ? "bg-red-500 animate-pulse scale-110 shadow-[0_0_30px_rgba(239,68,68,0.4)]" : "bg-white/5"
          )}>
            <Mic size={40} className={isRecording ? "text-white" : "text-brand-300"} />
          </div>
          
          {audioUrl ? (
            <audio src={audioUrl} controls className="w-full brightness-90 contrast-125" />
          ) : (
            <p className="text-brand-300 font-medium">
              {isRecording ? "Recording your message..." : "Ready to record?"}
            </p>
          )}
        </div>

        <div className="flex gap-4">
          {!audioUrl ? (
            <button 
              onClick={isRecording ? stopRecording : startRecording}
              className={cn(
                "flex-grow py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2",
                isRecording ? "bg-red-500 text-white" : "bg-white text-brand-950"
              )}
            >
              {isRecording ? <Square size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
              {isRecording ? "Stop Recording" : "Start Recording"}
            </button>
          ) : (
            <>
              <button 
                onClick={() => setAudioUrl(null)}
                className="flex-grow py-4 rounded-2xl font-bold text-brand-300 bg-white/5 hover:bg-white/10 transition-all"
              >
                Discard
              </button>
              <button 
                onClick={() => onSave(audioUrl)}
                className="flex-grow py-4 rounded-2xl font-bold text-brand-950 bg-white hover:bg-brand-100 transition-all"
              >
                Save Note
              </button>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const MediaPreviewModal = ({ attachment, onClose }: { attachment: Attachment, onClose: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-12"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[110]"
      >
        <X size={32} />
      </button>
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative max-w-5xl w-full max-h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {attachment.type === 'image' && (
          <img 
            src={attachment.url} 
            alt={attachment.name} 
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-white/10" 
          />
        )}
        {attachment.type === 'video' && (
          <video 
            src={attachment.url} 
            controls 
            autoPlay
            className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border border-white/10" 
          />
        )}
        {attachment.type === 'audio' && (
          <div className="glass-dark p-12 rounded-[2.5rem] shadow-2xl w-full max-w-md text-center space-y-8">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto">
              <Mic size={40} className="text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-2xl text-white">{attachment.name}</h3>
              <p className="text-brand-400 text-sm">Voice Recording</p>
            </div>
            <audio src={attachment.url} controls autoPlay className="w-full brightness-90 contrast-125" />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// --- Components ---

const Background = () => (
  <div className="fixed inset-0 -z-10 overflow-hidden nebula-bg">
    <div className="absolute inset-0 star-field" />
    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-[120px] animate-float" />
    <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[150px] animate-float-delayed" />
  </div>
);

const SecurityBadge = () => (
  <div className="flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-300">
    <Shield size={14} className="text-white" />
    End-to-End Encrypted Vault
  </div>
);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = [
    { q: "How do I know Aeon will still be here in 10 years?", a: "Aeon is built on a distributed trust model with a long-term endowment. We prioritize emotional utility over profit, ensuring your letters are delivered no matter what." },
    { q: "Can I edit my letter after locking it?", a: "No. The 'Lock Forever' promise is absolute. Once sealed, the vault is inaccessible until the delivery date." },
    { q: "Is my data private?", a: "Completely. We use AES-256 encryption. Even our developers cannot read your letters. Your thoughts are yours alone." },
    { q: "What if my email address changes?", a: "This is why we recommend adding a secondary contact. You can also update your primary email via your unique vault key (sent upon locking)." }
  ];

  return (
    <section className="mt-40 space-y-12">
      <div className="text-center space-y-4">
        <h2 className="font-serif text-3xl text-white font-bold">Common Questions</h2>
        <div className="w-12 h-1 bg-brand-500 mx-auto rounded-full" />
      </div>
      <div className="max-w-2xl mx-auto space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="glass rounded-2xl border-white/5 overflow-hidden">
            <button 
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
            >
              <span className="font-bold text-white text-sm uppercase tracking-wider">{faq.q}</span>
              <ChevronDown size={18} className={cn("text-brand-400 transition-transform duration-300", openIndex === i && "rotate-180")} />
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-6 pb-6"
                >
                  <p className="text-brand-400 text-sm leading-relaxed">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
};

const Testimonials = () => (
  <section className="mt-40 space-y-12">
    <div className="text-center space-y-4">
      <h2 className="font-serif text-3xl text-white font-bold">Voices from the Future</h2>
      <div className="w-12 h-1 bg-brand-500 mx-auto rounded-full" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {[
        { text: "I received a letter from my 20-year-old self today. It reminded me of the dreams I'd forgotten. Aeon is a gift to the soul.", author: "Sarah K., 2031" },
        { text: "Sealing my wedding vows to be read on our 10th anniversary. The 'Lock Forever' feature makes it feel so sacred.", author: "James L., 2026" }
      ].map((t, i) => (
        <div key={i} className="glass p-10 rounded-[2.5rem] border-white/5 space-y-6 relative group">
          <Quote className="absolute top-8 right-8 text-white/5 group-hover:text-white/10 transition-colors" size={64} />
          <p className="text-xl text-brand-100 font-serif italic leading-relaxed relative z-10">"{t.text}"</p>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-brand-400">{t.author}</span>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const MiniVaultDemo = () => {
  const [demoText, setDemoText] = useState('');
  const [isVaulting, setIsVaulting] = useState(false);
  const [isVaulted, setIsVaulted] = useState(false);

  const handleVault = () => {
    if (!demoText) return;
    setIsVaulting(true);
    setTimeout(() => {
      setIsVaulting(false);
      setIsVaulted(true);
      setDemoText('');
      setTimeout(() => setIsVaulted(false), 3000);
    }, 2000);
  };

  return (
    <section className="mt-40 glass p-12 rounded-[3rem] border-white/10 text-center space-y-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent pointer-events-none" />
      <div className="space-y-4 relative z-10">
        <h2 className="font-serif text-3xl text-white font-bold">Experience the Vault</h2>
        <p className="text-brand-400 max-w-md mx-auto">Type a single word you want to remember forever and see it vanish into time.</p>
      </div>
      
      <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-4 relative z-10">
        <input 
          type="text" 
          placeholder="Hope, Love, Growth..."
          value={demoText}
          onChange={(e) => setDemoText(e.target.value)}
          className="flex-grow p-5 rounded-2xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-white/20 transition-all text-center"
        />
        <button 
          onClick={handleVault}
          disabled={isVaulting || !demoText}
          className="px-8 py-5 rounded-2xl bg-white text-brand-950 font-bold hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
        >
          {isVaulting ? 'Vaulting...' : 'Seal Word'}
        </button>
      </div>

      <AnimatePresence>
        {isVaulted && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5, y: -50 }}
            className="absolute inset-0 flex items-center justify-center bg-brand-950/90 backdrop-blur-sm z-20"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.3)]">
                <Lock size={40} className="text-brand-950" />
              </div>
              <span className="text-white font-bold uppercase tracking-[0.3em]">Word Vaulted</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
);
};

const Navbar = () => (
  <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/20 backdrop-blur-xl border-b border-white/5">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
        <span className="text-brand-950 font-serif font-bold text-xl">A</span>
      </div>
      <span className="font-serif text-xl font-bold tracking-tight text-white uppercase">Aeon</span>
    </div>
    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-300">
      <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
      <a href="#predictions" className="hover:text-white transition-colors">Predictions</a>
      <button className="px-5 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-white">Sign In</button>
    </div>
  </nav>
);

const Footer = () => (
  <footer className="py-16 px-6 border-t border-white/5 bg-black/40">
    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-2">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
            <span className="text-brand-950 font-serif font-bold text-sm">A</span>
          </div>
          <span className="font-serif text-lg font-bold text-white uppercase">Aeon</span>
        </div>
        <p className="text-brand-400 text-sm max-w-xs leading-relaxed">
          The next generation of memory preservation. Secure, minimal, and built for your future self.
        </p>
      </div>
      <div>
        <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-widest">Product</h4>
        <ul className="space-y-3 text-sm text-brand-400">
          <li><a href="#" className="hover:text-white transition-colors">Write a Letter</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Public Vault</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Legacy Plan</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-white mb-6 text-sm uppercase tracking-widest">Legal</h4>
        <ul className="space-y-3 text-sm text-brand-400">
          <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
          <li><a href="#" className="hover:text-white transition-colors">Trust Guarantee</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-brand-500">
      <p>© 2026 Aeon by Okikelabs. All rights reserved.</p>
      <div className="flex gap-6">
        <span>Built with trust.</span>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [step, setStep] = useState<Step>('write');
  const [letter, setLetter] = useState<Letter>({
    content: '',
    deliveryDate: addYears(new Date(), 1),
    email: '',
    isPublic: false,
    subject: 'A letter to my future self',
    attachments: []
  });
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [secondaryEmailError, setSecondaryEmailError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const templates = [
    { id: 'future-self', label: 'Future Self', prompt: 'Dear Future Me, I hope you remember...' },
    { id: 'career', label: 'Career Goals', prompt: 'By the time I read this, I want to have achieved...' },
    { id: 'gratitude', label: 'Gratitude', prompt: 'Right now, I am most grateful for...' },
    { id: 'secret', label: 'A Secret', prompt: 'Here is something I haven\'t told anyone yet...' }
  ];

  const applyTemplate = (prompt: string) => {
    setLetter(prev => ({ ...prev, content: prompt }));
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const validateEmail = (email: string) => {
    if (!email) return true;
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newAtt: Attachment = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        url,
        name: file.name
      };
      setLetter(prev => ({ ...prev, attachments: [...prev.attachments, newAtt] }));
    }
  };

  const removeAttachment = (id: string) => {
    setLetter(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== id)
    }));
  };

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  const generatePrompt = async () => {
    setIsGeneratingPrompt(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Give me a short, thought-provoking prompt for someone writing a letter to their future self (1-5 years from now). Focus on growth, secrets, or simple joys. Keep it under 20 words.",
      });
      setAiPrompt(response.text || "What's a secret you're keeping from yourself right now?");
    } catch (error) {
      console.error("AI Error:", error);
      setAiPrompt("What do you hope has changed by the time you read this?");
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleNext = () => {
    if (step === 'write' && letter.content.length > 10) {
      setStep('settings');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (step === 'settings' && letter.email) {
      setStep('confirm');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (step === 'settings') setStep('write');
    if (step === 'confirm') setStep('settings');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-200">
      <Background />
      <Navbar />

      <main className="flex-grow pt-24 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          
          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-4 mb-16">
            {[
              { id: 'write', label: 'Write', icon: MessageSquare },
              { id: 'settings', label: 'Seal', icon: Lock },
              { id: 'confirm', label: 'Vault', icon: Shield }
            ].map((s, idx) => (
              <React.Fragment key={s.id}>
                <div className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-500",
                  step === s.id ? "bg-white text-brand-950 shadow-[0_0_20px_rgba(255,255,255,0.2)]" : "text-brand-500"
                )}>
                  <s.icon size={14} />
                  <span className="text-xs font-bold uppercase tracking-[0.15em]">{s.label}</span>
                </div>
                {idx < 2 && <div className="w-8 h-px bg-white/10" />}
              </React.Fragment>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 'write' && (
              <motion.div
                key="write-step"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <div className="flex justify-center mb-4">
                    <SecurityBadge />
                  </div>
                  <h1 className="text-gradient">Dear Future Me,</h1>
                  <p className="text-brand-400">Your future self is waiting. What do you want to say?</p>
                </div>

                {/* Template Selector */}
                <div className="flex flex-wrap justify-center gap-3">
                  {templates.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedTemplate(t.id);
                        applyTemplate(t.prompt);
                      }}
                      className={cn(
                        "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all",
                        selectedTemplate === t.id 
                          ? "bg-white text-brand-950 border-white" 
                          : "bg-white/5 text-brand-400 border-white/10 hover:border-white/30"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className={cn(
                  "relative group transition-all duration-700",
                  isFullscreen ? "fixed inset-0 z-[60] bg-brand-950 p-6 md:p-12" : "relative"
                )}>
                  {!isFullscreen && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  )}
                  <div className={cn(
                    "relative glass rounded-[2.5rem] overflow-hidden letter-paper flex flex-col transition-all duration-700",
                    isFullscreen ? "h-full w-full max-w-5xl mx-auto shadow-2xl border-white/10" : "h-auto"
                  )}>
                    <div className={cn(
                      "p-8 md:p-16 flex-grow overflow-y-auto",
                      isFullscreen ? "max-h-[calc(100vh-200px)]" : ""
                    )}>
                      <input 
                        type="text"
                        value={letter.subject}
                        onChange={(e) => setLetter({ ...letter, subject: e.target.value })}
                        className="w-full mb-8 font-serif text-3xl text-white bg-transparent border-none focus:ring-0 placeholder:text-white/20"
                        placeholder="Subject..."
                      />
                      <textarea
                        ref={textareaRef}
                        value={letter.content}
                        onChange={(e) => setLetter({ ...letter, content: e.target.value })}
                        className={cn(
                          "w-full font-sans text-xl text-brand-100 bg-transparent border-none focus:ring-0 resize-none leading-relaxed placeholder:text-white/10",
                          isFullscreen ? "min-h-[500px]" : "min-h-[450px]"
                        )}
                        placeholder="Start writing your story..."
                      />
                    </div>
                    
                    <div className="px-10 py-6 bg-white/5 border-t border-white/5 flex flex-col md:flex-row gap-6 items-center justify-between shrink-0">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              const start = textareaRef.current?.selectionStart || 0;
                              const end = textareaRef.current?.selectionEnd || 0;
                              const text = letter.content;
                              const newText = text.substring(0, start) + "**" + text.substring(start, end) + "**" + text.substring(end);
                              setLetter({ ...letter, content: newText });
                            }}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white text-xs font-bold transition-all"
                            title="Bold"
                          >
                            B
                          </button>
                          <button 
                            onClick={() => {
                              const start = textareaRef.current?.selectionStart || 0;
                              const end = textareaRef.current?.selectionEnd || 0;
                              const text = letter.content;
                              const newText = text.substring(0, start) + "_" + text.substring(start, end) + "_" + text.substring(end);
                              setLetter({ ...letter, content: newText });
                            }}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white text-xs italic transition-all font-serif"
                            title="Italic"
                          >
                            I
                          </button>
                          <button 
                            onClick={() => {
                              const start = textareaRef.current?.selectionStart || 0;
                              const end = textareaRef.current?.selectionEnd || 0;
                              const text = letter.content;
                              const newText = text.substring(0, start) + "> " + text.substring(start, end) + text.substring(end);
                              setLetter({ ...letter, content: newText });
                            }}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all"
                            title="Quote"
                          >
                            <Quote size={12} />
                          </button>
                        </div>

                        <div className="hidden md:block h-4 w-px bg-white/10" />

                        <button 
                          onClick={generatePrompt}
                          disabled={isGeneratingPrompt}
                          className="flex items-center gap-2 text-[10px] font-bold text-brand-400 hover:text-white transition-colors uppercase tracking-[0.2em]"
                        >
                          <Sparkles size={14} className={cn("text-brand-300", isGeneratingPrompt && "animate-spin")} />
                          {isGeneratingPrompt ? "Thinking..." : "Need a prompt?"}
                        </button>
                        
                        <div className="hidden md:block h-4 w-px bg-white/10" />
                        
                        <div className="flex items-center gap-4">
                          <label className="cursor-pointer text-brand-500 hover:text-white transition-colors" title="Add Photo">
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => handleFileUpload(e, 'image')}
                            />
                            <Camera size={20} />
                          </label>
                          <label className="cursor-pointer text-brand-500 hover:text-white transition-colors" title="Add Video">
                            <input 
                              type="file" 
                              accept="video/*" 
                              className="hidden" 
                              onChange={(e) => handleFileUpload(e, 'video')}
                            />
                            <Video size={20} />
                          </label>
                          <button 
                            onClick={() => setIsRecording(true)}
                            className="text-brand-500 hover:text-white transition-colors" 
                            title="Record Voice Note"
                          >
                            <Mic size={20} />
                          </button>
                          
                          <div className="h-4 w-px bg-white/10" />
                          
                          <button 
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="text-brand-500 hover:text-white transition-colors" 
                            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                          >
                            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-[10px] text-brand-500 font-mono uppercase tracking-widest">
                        {letter.content.length} characters
                      </div>
                    </div>

                    {/* Attachments Preview */}
                    {letter.attachments.length > 0 && (
                      <div className="px-10 py-8 bg-black/20 border-t border-white/5">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-500">Attachments ({letter.attachments.length})</h4>
                        </div>
                        <div className="flex flex-wrap gap-5">
                          {letter.attachments.map((att) => (
                            <motion.div 
                              layout
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              key={att.id} 
                              onClick={() => setSelectedAttachment(att)}
                              className="relative group/att w-32 h-32 rounded-3xl overflow-hidden border border-white/10 bg-white/5 shadow-sm hover:shadow-brand-500/20 transition-all cursor-pointer"
                            >
                              {att.type === 'image' && (
                                <img src={att.url} alt={att.name} className="w-full h-full object-cover transition-transform duration-700 group-hover/att:scale-110" />
                              )}
                              {att.type === 'video' && (
                                <div className="relative w-full h-full bg-white/5">
                                  <video src={att.url} className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover/att:bg-black/60 transition-colors">
                                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg transform group-hover/att:scale-110 transition-transform">
                                      <Play size={24} className="text-white ml-1" fill="currentColor" />
                                    </div>
                                  </div>
                                </div>
                              )}
                              {att.type === 'audio' && (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-white/5 p-4 text-center">
                                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
                                    <Mic size={24} className="text-white" />
                                  </div>
                                  <span className="text-[9px] font-bold text-brand-400 uppercase truncate w-full px-1">{att.name}</span>
                                  <div className="mt-3 flex gap-1 items-end h-4">
                                    {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.4].map((h, i) => (
                                      <div key={i} className="w-1 bg-brand-500/40 rounded-full" style={{ height: `${h * 100}%` }} />
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {/* Remove Button */}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeAttachment(att.id);
                                }}
                                className="absolute top-3 right-3 bg-white text-brand-950 p-2 rounded-full opacity-0 group-hover/att:opacity-100 transition-all shadow-xl hover:bg-red-500 hover:text-white transform translate-y-[-8px] group-hover/att:translate-y-0"
                                title="Remove attachment"
                              >
                                <X size={12} strokeWidth={3} />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Media Preview Modal */}
                <AnimatePresence>
                  {selectedAttachment && (
                    <MediaPreviewModal 
                      attachment={selectedAttachment} 
                      onClose={() => setSelectedAttachment(null)} 
                    />
                  )}
                </AnimatePresence>

                {/* Voice Recorder Modal */}
                <AnimatePresence>
                  {isRecording && (
                    <VoiceRecorder 
                      onClose={() => setIsRecording(false)} 
                      onSave={(audioUrl) => {
                        const newAtt: Attachment = {
                          id: Math.random().toString(36).substr(2, 9),
                          type: 'audio',
                          url: audioUrl,
                          name: `Voice Note ${new Date().toLocaleTimeString()}`
                        };
                        setLetter(prev => ({ ...prev, attachments: [...prev.attachments, newAtt] }));
                        setIsRecording(false);
                      }}
                    />
                  )}
                </AnimatePresence>

                {aiPrompt && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-brand-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden"
                  >
                    <div className="relative z-10 flex items-start gap-4">
                      <Sparkles className="text-brand-300 shrink-0 mt-1" size={20} />
                      <p className="text-lg font-serif italic leading-snug">{aiPrompt}</p>
                    </div>
                    <div className="absolute top-0 right-0 p-2">
                      <button onClick={() => setAiPrompt(null)} className="text-brand-400 hover:text-white transition-colors">
                        <AlertCircle size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleNext}
                    disabled={letter.content.length < 10}
                    className={cn(
                      "group flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg",
                      letter.content.length >= 10 
                        ? "bg-brand-900 text-white hover:scale-105 hover:shadow-brand-200" 
                        : "bg-brand-200 text-brand-400 cursor-not-allowed"
                    )}
                  >
                    Seal this letter
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'settings' && (
              <motion.div
                key="settings-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <h1 className="text-gradient">Seal the Vault</h1>
                  <p className="text-brand-400">When should this letter be delivered?</p>
                </div>

                <div className="glass rounded-[2.5rem] p-8 md:p-12 shadow-sm space-y-10">
                  {/* Date Selection */}
                  <div className="space-y-6">
                    <label className="flex items-center gap-3 text-sm font-bold text-white uppercase tracking-[0.2em]">
                      <Calendar size={18} className="text-brand-300" />
                      Delivery Date
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: '6 Months', date: addMonths(new Date(), 6) },
                        { label: '1 Year', date: addYears(new Date(), 1) },
                        { label: '3 Years', date: addYears(new Date(), 3) },
                        { label: '5 Years', date: addYears(new Date(), 5) },
                      ].map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => setLetter({ ...letter, deliveryDate: opt.date })}
                          className={cn(
                            "px-4 py-4 rounded-2xl border text-sm font-bold transition-all",
                            format(letter.deliveryDate, 'yyyy-MM-dd') === format(opt.date, 'yyyy-MM-dd')
                              ? "bg-white text-brand-950 border-white shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                              : "bg-white/5 text-brand-300 border-white/10 hover:border-white/30 hover:bg-white/10"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-6 py-2">
                      <div className="flex-grow h-px bg-white/5" />
                      <span className="text-[10px] text-brand-500 uppercase tracking-[0.3em] font-bold">Or pick a date</span>
                      <div className="flex-grow h-px bg-white/5" />
                    </div>
                    <input 
                      type="date"
                      min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                      value={format(letter.deliveryDate, 'yyyy-MM-dd')}
                      onChange={(e) => setLetter({ ...letter, deliveryDate: new Date(e.target.value) })}
                      className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all font-medium"
                    />
                  </div>

                  {/* Email Input */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 text-sm font-bold text-white uppercase tracking-[0.2em]">
                        <Mail size={18} className="text-brand-300" />
                        Primary Email
                      </label>
                      <div className="relative">
                        <input 
                          type="email"
                          required
                          placeholder="your@email.com"
                          value={letter.email}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLetter({ ...letter, email: val });
                            if (val && !validateEmail(val)) {
                              setEmailError("Please enter a valid email address");
                            } else {
                              setEmailError(null);
                            }
                          }}
                          className={cn(
                            "w-full p-5 rounded-2xl bg-white/5 border transition-all",
                            emailError ? "border-red-500/50 focus:ring-red-500/20" : "border-white/10 focus:ring-white/20",
                            "text-white focus:ring-2 focus:border-white/20"
                          )}
                        />
                        {emailError && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -bottom-6 left-2 text-[10px] text-red-400 font-bold uppercase tracking-wider"
                          >
                            {emailError}
                          </motion.p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="flex items-center gap-3 text-sm font-bold text-white uppercase tracking-[0.2em]">
                        <Shield size={18} className="text-brand-300" />
                        Secondary Contact
                      </label>
                      <div className="relative">
                        <input 
                          type="email"
                          placeholder="trusted@friend.com"
                          value={letter.secondaryEmail || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLetter({ ...letter, secondaryEmail: val });
                            if (val && !validateEmail(val)) {
                              setSecondaryEmailError("Invalid email format");
                            } else {
                              setSecondaryEmailError(null);
                            }
                          }}
                          className={cn(
                            "w-full p-5 rounded-2xl bg-white/5 border transition-all",
                            secondaryEmailError ? "border-red-500/50 focus:ring-red-500/20" : "border-white/10 focus:ring-white/20",
                            "text-white focus:ring-2 focus:border-white/20"
                          )}
                        />
                        {secondaryEmailError && (
                          <motion.p 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -bottom-6 left-2 text-[10px] text-red-400 font-bold uppercase tracking-wider"
                          >
                            {secondaryEmailError}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-brand-500 flex items-center gap-2 italic">
                    <Info size={14} />
                    A secondary contact helps ensure delivery if your primary email changes.
                  </p>

                  {/* Public Toggle */}
                  <div className="flex items-center justify-between p-8 rounded-3xl bg-white/5 border border-white/5">
                    <div className="space-y-1">
                      <h4 className="font-bold text-white text-sm uppercase tracking-[0.15em]">Public Vault</h4>
                      <p className="text-xs text-brand-500">Allow others to read this anonymously in the public vault?</p>
                    </div>
                    <button 
                      onClick={() => setLetter({ ...letter, isPublic: !letter.isPublic })}
                      className={cn(
                        "w-14 h-8 rounded-full transition-all relative p-1",
                        letter.isPublic ? "bg-white" : "bg-white/10"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full transition-all shadow-sm",
                        letter.isPublic ? "translate-x-6 bg-brand-950" : "translate-x-0 bg-brand-500"
                      )} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6">
                  <button
                    onClick={handleBack}
                    className="px-10 py-5 rounded-2xl font-bold text-brand-400 hover:text-white transition-all uppercase tracking-widest text-sm"
                  >
                    Back to writing
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!letter.email || !!emailError || !!secondaryEmailError}
                    className={cn(
                      "group flex items-center gap-3 px-12 py-5 rounded-2xl font-bold text-lg transition-all duration-500 shadow-xl",
                      (letter.email && !emailError && !secondaryEmailError)
                        ? "bg-white text-brand-950 hover:scale-105 hover:shadow-white/10" 
                        : "bg-white/5 text-brand-600 cursor-not-allowed"
                    )}
                  >
                    Review & Lock
                    <Lock size={20} className="group-hover:rotate-12 transition-transform" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'confirm' && (
              <motion.div
                key="confirm-step"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                className="space-y-8"
              >
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/5 text-white mb-6 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                    <CheckCircle2 size={48} />
                  </div>
                  <h1 className="text-gradient">Ready to Vault</h1>
                  <p className="text-brand-400">Please review your letter one last time.</p>
                </div>

                <div className="glass rounded-[2.5rem] overflow-hidden shadow-2xl border-white/5">
                  <div className="p-8 md:p-16 space-y-10">
                    <div className="flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-[0.2em]">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-brand-300 border border-white/5">
                        <Calendar size={14} />
                        Delivering: {format(letter.deliveryDate, 'MMMM do, yyyy')}
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-brand-300 border border-white/5">
                        <Mail size={14} />
                        To: {letter.email}
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-brand-300 border border-white/5">
                        <Shield size={14} />
                        {letter.isPublic ? 'Public' : 'Private'}
                      </div>
                    </div>

                    <div className="pt-10 border-t border-white/5">
                      <h3 className="font-serif text-3xl text-white mb-6">{letter.subject}</h3>
                      <div className="text-brand-100 font-sans text-xl leading-relaxed whitespace-pre-wrap italic opacity-80 mb-12">
                        {letter.content}
                      </div>

                      {letter.attachments.length > 0 && (
                        <div className="space-y-6">
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-500">Attachments</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                            {letter.attachments.map((att) => (
                              <div 
                                key={att.id} 
                                onClick={() => setSelectedAttachment(att)}
                                className="aspect-square rounded-3xl overflow-hidden border border-white/10 bg-white/5 relative group cursor-pointer hover:shadow-brand-500/20 transition-all"
                              >
                                {att.type === 'image' && (
                                  <img src={att.url} alt={att.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                )}
                                {att.type === 'video' && (
                                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-white/5">
                                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                      <Play size={24} className="text-white ml-1" fill="currentColor" />
                                    </div>
                                    <span className="text-[9px] font-bold text-brand-400 uppercase px-2 text-center truncate w-full">{att.name}</span>
                                  </div>
                                )}
                                {att.type === 'audio' && (
                                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-white/5">
                                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                                      <Mic size={24} className="text-white" />
                                    </div>
                                    <span className="text-[9px] font-bold text-brand-400 uppercase px-2 text-center truncate w-full">{att.name}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white/5 p-10 md:p-16 border-t border-white/5">
                    <div className="flex items-start gap-6 mb-10">
                      <Lock className="text-brand-300 shrink-0 mt-1" size={28} />
                      <div className="space-y-2">
                        <h4 className="font-bold text-xl text-white">The Aeon Promise</h4>
                        <p className="text-sm text-brand-400 leading-relaxed">
                          Once you lock this letter, it cannot be read, edited, or deleted until the delivery date. 
                          We use end-to-end encryption to ensure your thoughts remain yours alone.
                        </p>
                      </div>
                    </div>
                    <button
                      className="w-full py-6 rounded-2xl bg-white text-brand-950 font-bold text-xl hover:scale-[1.02] transition-all shadow-[0_0_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3"
                      onClick={() => {
                        setStep('success');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Lock Forever
                      <Send size={20} />
                    </button>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <button
                    onClick={handleBack}
                    className="px-8 py-4 rounded-full font-bold text-brand-500 hover:text-white transition-colors uppercase tracking-widest text-xs"
                  >
                    Wait, I need to change something
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success-step"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-12 text-center py-20"
              >
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 animate-pulse" />
                  <div className="relative w-32 h-32 rounded-full bg-white flex items-center justify-center shadow-2xl">
                    <Shield size={64} className="text-brand-950" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-gradient text-5xl">Letter Vaulted</h1>
                  <p className="text-brand-300 text-xl max-w-md mx-auto">
                    Your capsule has been sealed and sent into the future. See you on {format(letter.deliveryDate, 'MMMM do, yyyy')}.
                  </p>
                </div>

                <div className="flex flex-col items-center gap-6 pt-8">
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-10 py-5 rounded-2xl bg-white text-brand-950 font-bold text-lg shadow-xl hover:scale-105 transition-all"
                  >
                    Write another letter
                  </button>
                  <p className="text-brand-500 text-sm">A confirmation email has been sent to {letter.email}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Homepage Sections (Only visible on write step) */}
          {step === 'write' && (
            <>
              <motion.section 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-20 glass p-8 rounded-[2rem] border-white/5 flex flex-col md:flex-row items-center justify-between gap-8"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center shadow-inner">
                    <History size={32} className="text-white animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white uppercase tracking-widest text-xs">Next Delivery</h4>
                    <p className="text-2xl font-serif text-brand-200">14d : 08h : 22m</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-brand-400 text-sm italic">
                  <Check size={16} className="text-green-400" />
                  <span>3,421 capsules currently in flight</span>
                </div>
                <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-all flex items-center gap-2">
                  View Public Vault
                  <ExternalLink size={14} />
                </button>
              </motion.section>

              <motion.section 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="mt-40 space-y-20"
              >
                <div className="text-center space-y-4">
                  <h2 className="font-serif text-4xl text-white font-bold">The Journey of a Letter</h2>
                  <p className="text-brand-400 max-w-lg mx-auto">Aeon preserves your emotional state across the boundaries of time.</p>
                </div>

                <div className="relative">
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent hidden md:block" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
                    {[
                      { step: "01", title: "Write", desc: "Pour your heart out. Attach photos, videos, or voice notes.", icon: MessageSquare },
                      { step: "02", title: "Seal", desc: "Choose a delivery date and a trusted secondary contact.", icon: Lock },
                      { step: "03", title: "Vault", desc: "We encrypt and lock your capsule. No peeking allowed.", icon: Shield }
                    ].map((s, i) => (
                      <div key={i} className="text-center space-y-6 group">
                        <div className="w-20 h-20 glass border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm group-hover:shadow-brand-500/20 transition-all duration-500 relative">
                          <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white text-brand-950 text-[10px] font-black flex items-center justify-center shadow-lg">
                            {s.step}
                          </div>
                          <s.icon className="text-white" size={32} />
                        </div>
                        <h3 className="font-bold text-white uppercase tracking-[0.2em] text-sm">{s.title}</h3>
                        <p className="text-brand-400 text-sm leading-relaxed px-4">{s.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.section>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <MiniVaultDemo />
                <Testimonials />
                <FAQ />
              </motion.div>

              <motion.section 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="mt-40 space-y-16"
                id="how-it-works"
              >
                <div className="text-center space-y-4">
                  <h2 className="font-serif text-3xl text-white font-bold">Why Aeon?</h2>
                  <div className="w-12 h-1 bg-brand-500 mx-auto rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                  {[
                    {
                      title: "Trust First",
                      desc: "Built on a social contract of emotional utility. No aggressive paywalls, just pure connection.",
                      icon: Shield
                    },
                    {
                      title: "Multimedia Memories",
                      desc: "Attach photos, videos, and voice notes to your letters for a richer experience.",
                      icon: Sparkles
                    },
                    {
                      title: "Locked Vault",
                      desc: "Strict 'Peeking' protection ensures the magic of the surprise is preserved.",
                      icon: Lock
                    }
                  ].map((feature, i) => (
                    <div key={i} className="space-y-6 text-center group">
                      <div className="w-20 h-20 glass border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm group-hover:shadow-brand-500/20 transition-all duration-500">
                        <feature.icon className="text-white" size={32} />
                      </div>
                      <h3 className="font-bold text-white uppercase tracking-[0.2em] text-xs">{feature.title}</h3>
                      <p className="text-brand-400 text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.section>
            </>
          )}

          {step === 'write' && <PredictionBoard />}
        </div>
      </main>

      <Footer />
    </div>
  );
}
