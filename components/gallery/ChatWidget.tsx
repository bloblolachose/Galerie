"use client";

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const chat = (useChat() as any) || {};
    const {
        messages = [],
        input = "",
        handleInputChange = () => { },
        handleSubmit = (e: any) => { e?.preventDefault(); },
        isLoading = false,
        error = null
    } = chat;
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="pointer-events-auto bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl w-[350px] md:w-[400px] h-[500px] flex flex-col overflow-hidden mb-4"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-black/5 flex items-center justify-between bg-white/50">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Gallery Guide</h3>
                                    <p className="text-[10px] text-neutral-500">Powered by Mistral AI</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-black/5 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-neutral-500" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 && (
                                <div className="text-center text-neutral-400 text-sm mt-10 p-4">
                                    <p>Welcome! Ask me anything about the current exhibition or artworks.</p>
                                </div>
                            )}
                            {messages.map((m: any) => (
                                <div
                                    key={m.id}
                                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.role === 'user'
                                            ? 'bg-black text-white rounded-br-none'
                                            : 'bg-neutral-100 text-black rounded-bl-none'
                                            }`}
                                    >
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-neutral-100 p-3 rounded-2xl rounded-bl-none flex gap-1">
                                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce delay-0" />
                                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce delay-150" />
                                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce delay-300" />
                                    </div>
                                </div>
                            )}
                            {error && (
                                <div className="text-center p-4 bg-red-50 text-red-600 text-xs rounded-lg">
                                    <p>Connection Error: {error.message || "Unknown error"}</p>
                                    <p>Check API Key configuration.</p>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} className="p-3 bg-white/50 border-t border-black/5 flex gap-2">
                            <input
                                value={input}
                                onChange={handleInputChange}
                                placeholder="Ask a question..."
                                style={{ userSelect: 'text', WebkitUserSelect: 'text', touchAction: 'manipulation' }}
                                className="flex-1 bg-neutral-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black/10"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="w-9 h-9 flex items-center justify-center bg-black text-white rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                            >
                                <Send className="w-4 h-4 ml-0.5" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="pointer-events-auto h-14 w-14 rounded-full bg-black text-white shadow-lg flex items-center justify-center hover:bg-neutral-900 transition-colors"
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </motion.button>
        </div>
    );
}
