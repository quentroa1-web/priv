import { Coins, Crown, CreditCard, ShieldCheck } from 'lucide-react';

export function PaymentContent() {
    return (
        <div className="space-y-12">
            {/* Introduction */}
            <section>
                <p className="text-gray-600 leading-relaxed mb-6">
                    En SafeConnect, creemos en la transparencia total. Nuestra plataforma opera con un sistema de créditos (SafeCoins) y membresías premium diseñadas para maximizar tu visibilidad y simplificar tus transacciones.
                </p>
            </section>

            {/* Coin Packages Grid */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                        <Coins className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">SafeCoins (Créditos)</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { name: 'Pack Básico', coins: 100, price: '$12,000 COP', desc: 'Ideal para bumps ocasionales.' },
                        { name: 'Pack Standard', coins: 500, price: '$55,000 COP', desc: 'Nuestra opción más balanceada.', popular: true },
                        { name: 'Pack Premium', coins: 1000, price: '$100,000 COP', desc: 'Para usuarios profesionales.' },
                    ].map((pkg, i) => (
                        <div key={i} className={`p-6 rounded-3xl border transition-all ${pkg.popular ? 'bg-amber-50/30 border-amber-200' : 'bg-white border-gray-100'}`}>
                            <h3 className="font-bold text-gray-900 mb-1">{pkg.name}</h3>
                            <div className="text-2xl font-black text-gray-900 mb-2">{pkg.coins} Coins</div>
                            <div className="text-rose-600 font-black text-sm mb-3">{pkg.price}</div>
                            <p className="text-xs text-gray-500 leading-tight">{pkg.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Premium Memberships */}
            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <Crown className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Membresías Premium</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 rounded-[2rem] border border-amber-200 bg-gradient-to-br from-amber-50/50 to-white">
                        <h3 className="text-xl font-black text-amber-700 mb-2">Gold Membership</h3>
                        <div className="text-3xl font-black text-gray-900 mb-4">$60,000 <span className="text-sm font-medium text-gray-500">/ mes</span></div>
                        <ul className="space-y-3 mb-6">
                            {['Posicionamiento Mejorado', 'Badge Gold en perfil', 'Soporte prioritario', 'Sin anuncios'].map((f, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                    <ShieldCheck className="w-4 h-4 text-green-500" /> {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="p-8 rounded-[2rem] border border-cyan-200 bg-gradient-to-br from-cyan-50/50 to-white">
                        <h3 className="text-xl font-black text-cyan-700 mb-2">Diamond Access</h3>
                        <div className="text-3xl font-black text-gray-900 mb-4">$110,000 <span className="text-sm font-medium text-gray-500">/ mes</span></div>
                        <ul className="space-y-3 mb-6">
                            {['Máxima Visibilidad', 'Badge Diamond VIP', '5 Boosts de 12h GRATIS', 'Concierge Personal'].map((f, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                                    <ShieldCheck className="w-4 h-4 text-green-500" /> {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Payment Methods */}
            <section className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-200 rounded-lg text-gray-700">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-black text-gray-900 uppercase tracking-tight">Métodos de Pago</h2>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
                    Actualmente aceptamos pagos manuales vía <strong>Nequi, Daviplata y Bancolombia</strong>.
                    Una vez realizada la transferencia, debes subir el comprobante desde tu Wallet para que nuestro equipo lo valide en un tiempo récord de 15 a 60 minutos.
                </p>
            </section>
        </div>
    );
}
