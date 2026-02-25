import { Scale, FileText, UserCheck, ShieldOff } from 'lucide-react';

export function LegalContent() {
    return (
        <div className="space-y-12">
            {/* Terms of Service */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-700">
                        <Scale className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Términos de Uso</h2>
                </div>
                <div className="space-y-4">
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 mb-4">
                        <ShieldOff className="w-5 h-5 text-red-500 shrink-0" />
                        <p className="text-xs font-black text-red-700 uppercase tracking-wide">Prohibido para menores de 18 años (Restricción RTA)</p>
                    </div>
                    <p className="text-gray-600 font-bold mb-4">Al acceder a SafeConnect, aceptas las siguientes normas:</p>
                    <ul className="space-y-4">
                        {[
                            { t: 'Veracidad de Perfiles', d: 'Toda la información proporcionada en los anuncios debe ser real. El uso de fotos de terceros sin consentimiento resultará en baneo permanente.' },
                            { t: 'Uso de la Plataforma', d: 'SafeConnect es un directorio publicitario. No intervenimos en los acuerdos privados entre usuarios.' },
                            { t: 'Conducta en el Chat', d: 'El acoso, las amenazas o cualquier forma de lenguaje ofensivo en nuestro sistema de mensajería no será tolerado.' },
                            { t: 'Política de Reembolsos', d: 'Las SafeCoins y membresías no son reembolsables una vez activadas, excepto en casos de fallos técnicos demostrables.' }
                        ].map((item, i) => (
                            <li key={i} className="pl-4 border-l-2 border-rose-200">
                                <h4 className="text-sm font-black text-gray-900 mb-1">{item.t}</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">{item.d}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Privacy Policy */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-700">
                        <FileText className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Privacidad de Datos</h2>
                </div>
                <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                    <p className="text-sm text-gray-600 leading-relaxed mb-6">
                        Tu privacidad es nuestro pilar fundamental. En SafeConnect aplicamos las siguientes políticas de protección:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex gap-3">
                            <UserCheck className="w-5 h-5 text-rose-500 shrink-0" />
                            <div>
                                <h4 className="text-xs font-black text-gray-900 transition-all uppercase tracking-tight mb-1">Cifrado de Mensajes</h4>
                                <p className="text-[10px] text-gray-500 leading-tight">Tus conversaciones son privadas y no son almacenadas en texto plano en nuestros servidores.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <UserCheck className="w-5 h-5 text-rose-500 shrink-0" />
                            <div>
                                <h4 className="text-xs font-black text-gray-900 transition-all uppercase tracking-tight mb-1">Borrado Seguro</h4>
                                <p className="text-[10px] text-gray-500 leading-tight">Cuando eliminas una foto u anuncio, este se borra permanentemente de nuestro sistema en un máximo de 24 horas.</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <UserCheck className="w-5 h-5 text-rose-500 shrink-0" />
                            <div>
                                <h4 className="text-xs font-black text-gray-900 transition-all uppercase tracking-tight mb-1">No Venta de Datos</h4>
                                <p className="text-[10px] text-gray-500 leading-tight">Nunca compartiremos ni venderemos tu información personal a terceros con fines publicitarios.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
