import { Shield, Copyright, AlertTriangle } from 'lucide-react';

interface FooterProps {
    onNavigate: (view: any) => void;
}

export function Footer({ onNavigate }: FooterProps) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-8 border-t border-gray-100 bg-white/50 backdrop-blur-sm py-6 md:py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between gap-8 mb-6">
                    {/* Brand Section */}
                    <div className="max-w-xs">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-rose-200">
                                <Shield className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-black bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                                SafeConnect
                            </span>
                        </div>
                        <p className="text-gray-500 text-xs leading-relaxed mb-4">
                            Conexiones seguras y verificadas. Tu seguridad es nuestra prioridad.
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 border border-gray-100 rounded text-gray-500 font-bold text-[9px] uppercase tracking-wider">
                                <Copyright className="w-3 h-3" /> {currentYear}
                            </div>
                            <div className="flex items-center gap-1 px-2 py-1 bg-red-50 border border-red-100 rounded text-red-600 font-bold text-[9px] uppercase tracking-wider">
                                <AlertTriangle className="w-3 h-3" /> RTA
                            </div>
                        </div>
                    </div>

                    {/* Links Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-12">
                        <div>
                            <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-3">Soporte</h3>
                            <ul className="space-y-2">
                                <li>
                                    <button onClick={() => onNavigate('support')} className="text-xs text-gray-500 hover:text-rose-600 transition-colors">Centro de Ayuda</button>
                                </li>
                                <li>
                                    <button onClick={() => onNavigate('support')} className="text-xs text-gray-500 hover:text-rose-600 transition-colors">Contacto 24/7</button>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-3">Legal</h3>
                            <ul className="space-y-2">
                                <li>
                                    <button onClick={() => onNavigate('legal')} className="text-xs text-gray-500 hover:text-rose-600 transition-colors">Términos</button>
                                </li>
                                <li>
                                    <button onClick={() => onNavigate('privacy')} className="text-xs text-gray-500 hover:text-rose-600 transition-colors">Privacidad</button>
                                </li>
                            </ul>
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                            <h3 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-3">Servicios</h3>
                            <ul className="space-y-2">
                                <li>
                                    <button onClick={() => onNavigate('payments')} className="text-xs text-gray-500 hover:text-rose-600 transition-colors">Pagos y Tarifas</button>
                                </li>
                                <li>
                                    <button onClick={() => onNavigate('legal')} className="text-xs text-gray-500 hover:text-rose-600 transition-colors">Verificación</button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="pt-5 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-3">
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        SafeConnect &copy; {currentYear} • Todos los derechos reservados.
                    </p>
                    <div className="flex gap-4">
                        <span className="text-[8px] font-bold text-gray-300 uppercase tracking-[0.2em]">Colombia</span>
                        <span className="text-[8px] font-bold text-gray-300 uppercase tracking-[0.2em]">V.2.1-A</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
