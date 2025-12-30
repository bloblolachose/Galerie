"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Loader2, Trash2, Mail, Phone, Calendar, Archive } from "lucide-react";
import { toast } from "sonner";
import { Reservation } from "@/types";

// Extended type for join
interface ReservationWithArtwork extends Reservation {
    artworks: {
        title: string;
        image_url: string;
    }
}

export default function ReservationsPage() {
    const [reservations, setReservations] = useState<ReservationWithArtwork[]>([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const fetchReservations = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('reservations')
            .select('*, artworks(title, image_url)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error(error);
            toast.error("Failed to load reservations");
        } else {
            setReservations(data as any || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this request?")) return;

        const { error } = await supabase
            .from('reservations')
            .delete()
            .eq('id', id);

        if (error) {
            toast.error("Failed to delete");
        } else {
            toast.success("Reservation removed");
            fetchReservations();
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Reservations Inbox</h1>
                    <p className="text-neutral-400 mt-1">Manage purchase requests from visitors</p>
                </div>
                <button
                    onClick={fetchReservations}
                    className="p-2 bg-neutral-100 rounded-full hover:bg-neutral-200"
                >
                    <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {loading && reservations.length === 0 ? (
                <div className="py-20 flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                </div>
            ) : reservations.length === 0 ? (
                <div className="py-20 text-center border-2 border-dashed border-neutral-200 rounded-xl">
                    <p className="text-neutral-400">No pending reservations found.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {reservations.map((res) => (
                        <div key={res.id} className="bg-white border border-neutral-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center">
                            {/* Artwork Thumb */}
                            <div className="w-16 h-16 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-100">
                                {res.artworks?.image_url && (
                                    <img src={res.artworks.image_url} alt="" className="w-full h-full object-cover" />
                                )}
                            </div>

                            {/* Visitor Info */}
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold">{res.visitorName || (res as any).visitor_name}</h3>
                                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] uppercase font-bold rounded-full">
                                        Pending
                                    </span>
                                </div>
                                <p className="text-sm text-neutral-500">
                                    Interested in <span className="font-medium text-black">{(res.artworks as any)?.title}</span>
                                </p>
                                <div className="flex flex-wrap gap-4 text-xs text-neutral-400 pt-1">
                                    <div className="flex items-center gap-1">
                                        <Mail className="w-3 h-3" />
                                        {res.visitorEmail || (res as any).visitor_email}
                                    </div>
                                    {res.visitorPhone || (res as any).visitor_phone ? (
                                        <div className="flex items-center gap-1">
                                            <Phone className="w-3 h-3" />
                                            {res.visitorPhone || (res as any).visitor_phone}
                                        </div>
                                    ) : null}
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(res.createdAt || (res as any).created_at).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <a
                                    href={`mailto:${res.visitorEmail || (res as any).visitor_email}?subject=Concerning your interest in ${(res.artworks as any)?.title}`}
                                    className="p-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors"
                                    title="Contact via Email"
                                >
                                    <Mail className="w-4 h-4" />
                                </a>
                                <button
                                    onClick={() => handleDelete(res.id)}
                                    className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                    title="Delete Request"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
