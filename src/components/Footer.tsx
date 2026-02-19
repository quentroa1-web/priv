import { Shield, Mail, FileText, Scale, CreditCard, Copyright, AlertTriangle } from 'lucide-react';

interface FooterProps {
    onNavigate: (view: any) => void;
}

export function Footer({ onNavigate }: FooterProps) {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-auto border-t border-gray-100 bg-white/50 backdrop-blur-sm py-8 md:py-12">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12 mb-10">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-rose-200">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-black bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                                SafeConnect
                            </span>
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed mb-6">
                            Plataforma líder en conexiones seguras y verificadas. Tu seguridad es nuestra prioridad.
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-gray-600 font-bold text-[10px] uppercase tracking-wider">
                                <Copyright className="w-3.5 h-3.5" />
                                {currentYear}
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg text-red-600 font-bold text-[10px] uppercase tracking-wider">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                RTA
                            </div>
                        </div>
                    </div>

                    {/* Links Sections */}
                    <div>
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4">Soporte</h3>
                        <ul className="space-y-3">
                            <li>
                                <button
                                    onClick={() => onNavigate('support')}
                                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-rose-600 transition-colors"
                                >
                                    <Mail className="w-4 h-4" />
                                    Atención al Cliente
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onNavigate('support')}
                                    className="text-sm text-gray-500 hover:text-rose-600 transition-colors"
                                >
                                    Centro de Ayuda
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4">Legal</h3>
                        <ul className="space-y-3">
                            <li>
                                <button
                                    onClick={() => onNavigate('legal')}
                                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-rose-600 transition-colors"
                                >
                                    <Scale className="w-4 h-4" />
                                    Términos y Condiciones
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onNavigate('privacy')}
                                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-rose-600 transition-colors"
                                >
                                    <FileText className="w-4 h-4" />
                                    Política de Privacidad
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4">Transparencia</h3>
                        <ul className="space-y-3">
                            <li>
                                <button
                                    onClick={() => onNavigate('payments')}
                                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-rose-600 transition-colors"
                                >
                                    <CreditCard className="w-4 h-4" />
                                    Pagos y Tarifas
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => onNavigate('legal')}
                                    className="text-sm text-gray-500 hover:text-rose-600 transition-colors"
                                >
                                    Seguridad y Verificación
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
                        SafeConnect &copy; {currentYear} • Todos los derechos reservados.
                    </p>
                    <div className="flex gap-6">
                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">Bogotá, Colombia</span>
                        <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">Certificación 2A-01</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
