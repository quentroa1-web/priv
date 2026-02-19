import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, LogOut, CheckCircle2 } from 'lucide-react';

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
        localStorage.setItem('age_verified', 'true');
        setIsVisible(false);
        document.body.style.overflow = 'auto';
    };

    const handleExit = () => {
        window.location.href = 'https://www.google.com';
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 overflow-hidden">
            {/* Heavy Backdrop */}
            <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-xl animate-in fade-in duration-700" />

            {/* Modal Container */}
            <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
                {/* Top Gradient Banner */}
                <div className="h-40 bg-gradient-to-br from-rose-500 via-pink-600 to-rose-700 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white rounded-full blur-3xl" />
                        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white rounded-full blur-3xl" />
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-3">
                            <Shield className="w-10 h-10" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] opacity-80">Aviso Legal Obligatorio</span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8 md:p-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-100 rounded-full text-red-600 font-bold text-[10px] uppercase tracking-widest mb-6">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        SafeConnect Security Protocol
                    </div>

                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
                        Declaración Jurada y Consentimiento
                    </h2>

                    <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left border border-gray-100 max-h-[250px] overflow-y-auto custom-scrollbar">
                        <div className="space-y-4">
                            <p className="text-gray-900 font-black text-xs uppercase tracking-tight">Términos de Blindaje Legal:</p>

                            <div className="flex gap-3">
                                <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-gray-600 leading-relaxed italic">
                                    "Bajo la gravedad de juramento, declaro ser mayor de edad (+18) y tener la capacidad legal para acceder a este sitio web."
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-gray-600 leading-relaxed">
                                    Acepto los Términos y Condiciones, la Política de Privacidad y reconozco que SafeConnect es un directorio publicitario independiente.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-gray-600 leading-relaxed">
                                    <strong>Exención de Responsabilidad:</strong> SafeConnect no interviene, garantiza ni se responsabiliza por los acuerdos, servicios o interacciones entre terceros usuarios.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <CheckCircle2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-gray-600 leading-relaxed">
                                    Este sitio contiene material explícito solo para adultos (RTA). Me comprometo a restringir el acceso a menores desde mi conexión.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Mandatory Checkbox */}
                    <div
                        className="flex items-center justify-center mb-8 bg-rose-50/50 p-4 rounded-xl border border-rose-100/50 hover:bg-rose-50 transition-colors cursor-pointer"
                        onClick={() => setIsAccepted(!isAccepted)}
                    >
                        <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-all ${isAccepted ? 'bg-rose-600 border-rose-600' : 'bg-white border-gray-300'}`}>
                            {isAccepted && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-[11px] font-black text-gray-700 uppercase tracking-tight text-left">
                            ACEPTO TODOS LOS TÉRMINOS Y DECLARO MI MAYORÍA DE EDAD
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={handleExit}
                            className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-black text-xs uppercase tracking-widest transition-all group"
                        >
                            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            SALIR
                        </button>
                        <button
                            onClick={handleVerify}
                            disabled={!isAccepted}
                            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-gray-200 ${isAccepted
                                ? 'bg-gray-900 hover:bg-black text-white hover:scale-[1.02] active:scale-95'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                                }`}
                        >
                            INGRESAR AL SITIO
                        </button>
                    </div>
                </div>

                {/* Legal Footer */}
                <div className="p-4 bg-gray-900 text-gray-400 text-[9px] font-bold text-center uppercase tracking-widest leading-relaxed">
                    Usted está accediendo a un entorno restringido. El incumplimiento de estas normas puede derivar en acciones legales.
                </div>
            </div>
        </div>
    );
}
