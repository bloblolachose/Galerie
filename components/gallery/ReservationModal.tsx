import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Check } from 'lucide-react';
import { Artwork } from '@/types';

interface ReservationModalProps {
    artwork: Artwork;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ReservationModal({ artwork, isOpen, onClose, onSuccess }: ReservationModalProps) {
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const res = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    artworkId: artwork.id,
                    visitorName: formData.name,
                    visitorEmail: formData.email,
                    visitorPhone: formData.phone
                })
            });

            if (!res.ok) throw new Error("Failed to reserve");

            setStatus('success');
            setTimeout(() => {
                onSuccess(); // Triggers parent refresh/close
                onClose();
                setStatus('idle');
                setFormData({ name: '', email: '', phone: '' });
            }, 2000);

        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-black/5 flex justify-between items-center bg-neutral-50">
                            <div>
                                <h3 className="font-bold text-lg">Réserver cette œuvre</h3>
                                <p className="text-sm text-neutral-500">{artwork.title} — {artwork.artist}</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full">
                                <X className="w-5 h-5 text-neutral-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {status === 'success' ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-300">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                        <Check className="w-8 h-8" />
                                    </div>
                                    <h4 className="font-bold text-xl mb-2">Demande envoyée !</h4>
                                    <p className="text-neutral-500">L'œuvre est réservée temporairement.<br />Nous vous recontacterons très vite.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 ml-1">Nom complet</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.name}
                                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/5"
                                            placeholder="Votre nom"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 ml-1">Email</label>
                                        <input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/5"
                                            placeholder="votre@email.com"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 ml-1">Téléphone (Optionnel)</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/5"
                                            placeholder="+33 6..."
                                        />
                                    </div>

                                    {status === 'error' && (
                                        <p className="text-red-500 text-sm text-center">Une erreur est survenue. Réessayez.</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={status === 'submitting'}
                                        className="w-full bg-black text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2 hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-50 mt-4"
                                    >
                                        {status === 'submitting' ? (
                                            <span className="animate-pulse">Envoi en cours...</span>
                                        ) : (
                                            <>
                                                <span>Confirmer la réservation</span>
                                                <Send className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                    <p className="text-xs text-center text-neutral-400 mt-4">
                                        Aucun paiement requis maintenant. <br />La réservation est valable 48h.
                                    </p>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
