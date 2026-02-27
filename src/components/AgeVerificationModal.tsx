import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, LogOut, CheckCircle2 } from 'lucide-react';
import { hapticFeedback } from '../utils/haptics';

export function AgeVerificationModal() {
    const [isVisible, setIsVisible] = useState(false);
    const [isAccepted, setIsAccepted] = useState(false);

    useEffect(() => {
        const verified = localStorage.getItem('age_verified');
        if (!verified) {
            setIsVisible(true);
            // Prevent scrolling of the background
            document.body.style.overflow = 'hidden';
        }
    }, []);

    const handleVerify = () => {
        if (!isAccepted) return;
        hapticFeedback('medium');
        localStorage.setItem('age_verified', 'true');
        setIsVisible(false);
        document.body.style.overflow = 'auto';
    };

    const handleExit = () => {
        hapticFeedback('medium');
        window.location.href = 'https://www.google.com';
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
            {/* Heavy Backdrop */}
            <div className="fixed inset-0 bg-gray-900/90 backdrop-blur-xl transition-opacity animate-in fade-in duration-500" />

            {/* Modal Container */}
            <div className="relative w-full max-w-xl max-h-[100dvh] sm:max-h-[90dvh] flex flex-col bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-500">
                
                {/* Top Gradient Banner (Fixed) */}
                <div className="h-24 sm:h-32 flex-none bg-gradient-to-br from-rose-500 via-pink-600 to-rose-700 relative overflow-hidden flex flex-col items-center justify-center text-white">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white rounded-full blur-3xl" />
                        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white rounded-full blur-3xl" />
                    </div>
                    <div className="relative z-10 flex flex-col items-center justify-center">
                        <div className="p-2 sm:p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-2">
                            <Shield className="w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                        <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] opacity-90">
                            Aviso Legal Obligatorio
                        </span>
                    </div>
                </div>

                {/* Content Section (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-8 custom-scrollbar">
                    <div className="text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-100 rounded-full text-red-600 font-bold text-[10px] uppercase tracking-widest mb-4 sm:mb-6">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            SafeConnect Security Protocol
                        </div>

                        <h2 className="text-xl sm:text-3xl font-black text-gray-900 mb-4 sm:mb-6 tracking-tight leading-tight">
                            Declaración Jurada y Consentimiento
                        </h2>

                        <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 mb-6 text-left border border-gray-100">
                            <div className="space-y-4">
                                <p className="text-gray-900 font-black text-xs uppercase tracking-tight">Términos de Blindaje Legal:</p>

                                <div className="flex gap-3">
                                    <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                    <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed italic">
                                        "Bajo la gravedad de juramento, declaro ser mayor de edad (+18) y tener la capacidad legal para acceder a este sitio web."
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                    <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
                                        Acepto los Términos y Condiciones, la Política de Privacidad y reconozco que SafeConnect es un directorio publicitario independiente.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
                                        <strong>Exención de Responsabilidad:</strong> SafeConnect no interviene, garantiza ni se responsabiliza por los acuerdos, servicios o interacciones entre terceros usuarios.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                    <p className="text-[11px] sm:text-xs text-gray-600 leading-relaxed">
                                        Este sitio contiene material explícito solo para adultos (RTA). Me comprometo a restringir el acceso a menores desde mi conexión.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Mandatory Checkbox */}
                        <button
                            type="button"
                            role="checkbox"
                            aria-checked={isAccepted}
                            aria-label="Aceptar todos los términos y declarar mayoría de edad"
                            className="w-full flex items-center justify-center bg-rose-50/50 p-4 rounded-xl border border-rose-100/50 hover:bg-rose-50 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 outline-none"
                            onClick={() => {
                                hapticFeedback('light');
                                setIsAccepted(!isAccepted);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === ' ' || e.key === 'Enter') {
                                    e.preventDefault();
                                    hapticFeedback('light');
                                    setIsAccepted(!isAccepted);
                                }
                            }}
                        >
                            <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-all flex-shrink-0 ${isAccepted ? 'bg-rose-600 border-rose-600' : 'bg-white border-gray-300'}`}>
                                {isAccepted && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <span className="text-[10px] sm:text-[11px] font-black text-gray-700 uppercase tracking-tight text-left">
                                ACEPTO TODOS LOS TÉRMINOS Y DECLARO MI MAYORÍA DE EDAD
                            </span>
                        </button>
                    </div>
                </div>

                {/* Footer and Action Buttons (Fixed) */}
                <div className="flex-none bg-white border-t border-gray-100 p-4 sm:p-6 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <button
                            onClick={handleExit}
                            className="flex items-center justify-center gap-2 px-6 py-3 sm:py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl sm:rounded-2xl font-black text-[11px] sm:text-xs uppercase tracking-widest transition-all group focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 outline-none"
                        >
                            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            SALIR
                        </button>
                        <button
                            onClick={handleVerify}
                            disabled={!isAccepted}
                            className={`flex items-center justify-center gap-2 px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-[11px] sm:text-xs uppercase tracking-widest transition-all shadow-xl shadow-gray-200 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 outline-none ${isAccepted
                                ? 'bg-gray-900 hover:bg-black text-white hover:scale-[1.02] active:scale-95'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                                }`}
                        >
                            INGRESAR AL SITIO
                        </button>
                    </div>
                
                    {/* Legal Footer */}
                    <div className="text-gray-400 text-[8px] sm:text-[9px] font-bold text-center uppercase tracking-widest leading-relaxed">
                        Usted está accediendo a un entorno restringido. El incumplimiento de estas normas puede derivar en acciones legales.
                    </div>
                </div>
            </div>
        </div>
    );
}

