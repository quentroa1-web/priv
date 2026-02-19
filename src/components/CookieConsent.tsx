import { useState, useEffect } from 'react';
import { X, Cookie, ShieldCheck } from 'lucide-react';

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie_consent');
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie_consent', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-[100] animate-in fade-in slide-in-from-bottom-8 duration-500">
            <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-xl border border-gray-100 shadow-2xl rounded-2xl p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-8 ring-1 ring-black/5">
                <div className="hidden md:flex w-12 h-12 bg-indigo-50 rounded-full items-center justify-center shrink-0">
                    <Cookie className="w-6 h-6 text-indigo-500" />
                </div>

                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-tight">Privacidad y Cookies</h4>
                    </div>
                    <p className="text-gray-500 text-xs md:text-sm leading-relaxed">
                        Utilizamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico y personalizar el contenido. Al continuar navegando, aceptas nuestro uso de cookies.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                    <button
                        onClick={() => {/* Link to privacy policy */ }}
                        className="flex-1 md:flex-none px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        Saber más
                    </button>
                    <button
                        onClick={handleAccept}
                        className="flex-1 md:flex-none px-6 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-black hover:bg-black transition-all shadow-lg shadow-gray-200"
                    >
                        ACEPTAR
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
