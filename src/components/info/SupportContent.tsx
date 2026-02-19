import { Mail, MessageCircle, ShieldCheck, AlertCircle } from 'lucide-react';

export function SupportContent() {
    const faqs = [
        {
            q: "¿Cómo verifico mi perfil?",
            a: "Para obtener el distintivo de verificación, debes subir fotos claras sosteniendo un papel con tu nombre de usuario y la fecha actual desde tu panel principal."
        },
        {
            q: "¿Cuánto tardan en aprobar mi pago?",
            a: "Las validaciones manuales de comprobantes (Nequi/Daviplata) suelen tardar entre 15 y 60 minutos en horario laboral."
        },
        {
            q: "¿Es SafeConnect una plataforma segura?",
            a: "Sí. Implementamos cifrado de extremo a extremo en chats y un riguroso sistema de reporte de usuarios para mantener la comunidad libre de fraudes."
        },
        {
            q: "¿Cómo puedo destacar mi anuncio?",
            a: "Puedes usar SafeCoins para hacer 'bumps' (subir tu anuncio al inicio) o adquirir una membresía Gold/Diamond para visibilidad permanente."
        }
    ];

    return (
        <div className="space-y-12">
            {/* Search/Contact Intro */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-3xl bg-rose-50 border border-rose-100 flex items-start gap-4">
                    <div className="p-3 bg-white rounded-2xl text-rose-500 shadow-sm">
                        <Mail className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 mb-1">Escríbenos</h3>
                        <p className="text-sm text-gray-600 mb-3">Soporte técnico y dudas legales.</p>
                        <a href="mailto:support@safeconnect.com" className="text-sm font-black text-rose-600 hover:underline">support@safeconnect.com</a>
                    </div>
                </div>
                <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-start gap-4">
                    <div className="p-3 bg-white rounded-2xl text-indigo-500 shadow-sm">
                        <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-black text-gray-900 mb-1">Chat en Vivo</h3>
                        <p className="text-sm text-gray-600 mb-3">Disponible de Lunes a Sábado, 9AM - 9PM.</p>
                        <button className="text-sm font-black text-indigo-600 hover:underline">Iniciar conversación</button>
                    </div>
                </div>
            </section>

            {/* FAQs */}
            <section>
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-700">
                        <AlertCircle className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Preguntas Frecuentes</h2>
                </div>
                <div className="space-y-6">
                    {faqs.map((faq, i) => (
                        <div key={i} className="group border-b border-gray-100 pb-6 last:border-0 hover:bg-gray-50/50 transition-colors rounded-xl p-4">
                            <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                                {faq.q}
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed pl-3.5">
                                {faq.a}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Safety Banner */}
            <section className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-[2rem] p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShieldCheck className="w-32 h-32" />
                </div>
                <div className="relative z-10">
                    <h2 className="text-xl font-black mb-4">Compromiso SafeConnect</h2>
                    <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-xl">
                        Auditamos activamente todos los perfiles reportados. Si encuentras un comportamiento sospechoso o contenido que viola nuestras normas, repórtalo inmediatamente.
                    </p>
                    <button className="px-6 py-2.5 bg-white text-gray-900 rounded-xl font-black text-xs hover:scale-105 transition-all">
                        REPORTAR UN PROBLEMA
                    </button>
                </div>
            </section>
        </div>
    );
}
