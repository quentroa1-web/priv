import { Rocket, Crown, Check, Coins, Trophy, Lock, Gift, DollarSign } from 'lucide-react';

interface PremiumInfoProps {
    onOpenStore: () => void;
    role?: 'user' | 'announcer' | 'admin';
    user?: any;
}

export function PremiumInfo({ onOpenStore, role = 'user', user }: PremiumInfoProps) {
    const isAnnouncer = role === 'announcer' || role === 'admin';

    return (
        <div className="animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden mb-12 text-center bg-gray-900 text-white min-h-[400px] flex flex-col items-center justify-center p-8 border border-gray-800 shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2629&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>

                <div className="relative z-10 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 mx-auto animate-pulse">
                        <Crown className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-bold tracking-wider uppercase text-amber-100">
                            {isAnnouncer ? 'Potencia tu Negocio' : 'Experiencia Elite'}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                        {isAnnouncer ? 'Monetiza al Máximo' : 'Conecta sin Límites'}
                    </h1>

                    <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                        {isAnnouncer
                            ? 'Lleva tus servicios al siguiente nivel, destaca sobre la competencia y convierte tus monedas en ganancias reales.'
                            : 'Desbloquea contenido exclusivo, envía regalos especiales y accede a experiencias únicas con tus anunciantes favoritos.'}
                    </p>

                    <button
                        onClick={onOpenStore}
                        className="px-8 py-4 bg-gradient-to-r from-amber-400 to-yellow-600 text-white rounded-2xl font-black text-lg shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:scale-105 transition-transform active:scale-95 flex items-center gap-3 mx-auto"
                    >
                        <Coins className="w-6 h-6" />
                        {isAnnouncer ? 'Gestionar Monedas' : 'Recargar Monedas'}
                    </button>
                </div>
            </div>

            {/* Content Based on Role */}
            <div className="mb-16">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-black text-gray-900 mb-4">
                        {isAnnouncer ? 'Herramientas de Crecimiento' : 'Todo lo que puedes hacer'}
                    </h2>
                    <p className="text-gray-500 max-w-xl mx-auto">
                        {isAnnouncer
                            ? 'Usa tus monedas estratégicamente para aumentar tu visibilidad y tus ingresos.'
                            : 'Las monedas son la llave para interactuar y acceder a contenido privado.'}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {isAnnouncer ? (
                        <>
                            {/* Announcer Feature 1: Boost */}
                            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-8 border border-indigo-100 flex flex-col md:flex-row items-center gap-6 text-center md:text-left hover:shadow-xl transition-shadow">
                                <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center shrink-0">
                                    <Rocket className="w-10 h-10 text-indigo-600 animate-bounce" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-indigo-900 mb-2">Impulsar Anuncios</h3>
                                    <p className="text-indigo-700/80 font-medium">
                                        ¿Tus anuncios no se ven? Usa 100 monedas para enviarlos al tope de la lista por 12 horas.
                                    </p>
                                </div>
                            </div>

                            {/* Announcer Feature 2: Redeem */}
                            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 border border-emerald-100 flex flex-col md:flex-row items-center gap-6 text-center md:text-left hover:shadow-xl transition-shadow">
                                <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center shrink-0">
                                    <DollarSign className="w-10 h-10 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-emerald-900 mb-2">Redimir Dinero</h3>
                                    <p className="text-emerald-700/80 font-medium">
                                        Convierte las monedas que recibes de regalos y ventas en dinero real directamente a tu cuenta bancaria.
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* User Feature 1: Content */}
                            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-8 border border-rose-100 flex flex-col md:flex-row items-center gap-6 text-center md:text-left hover:shadow-xl transition-shadow">
                                <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center shrink-0">
                                    <Lock className="w-10 h-10 text-rose-500" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-rose-900 mb-2">Contenido Exclusivo</h3>
                                    <p className="text-rose-700/80 font-medium">
                                        Desbloquea fotos y videos privados en el chat. Paga de forma segura y discreta con tus monedas.
                                    </p>
                                </div>
                            </div>

                            {/* User Feature 2: Gifts */}
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 border border-amber-100 flex flex-col md:flex-row items-center gap-6 text-center md:text-left hover:shadow-xl transition-shadow">
                                <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center shrink-0">
                                    <Gift className="w-10 h-10 text-amber-500" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-amber-900 mb-2">Enviar Regalos</h3>
                                    <p className="text-amber-700/80 font-medium">
                                        Sorprende con rosas, chocolates y regalos virtuales que se convierten en monedas para el anunciante.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Membership Tiers - Only for Announcers */}
            {isAnnouncer && (
                <div>
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-black text-gray-900 mb-4">Niveles de Membresía</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">
                            Elige el plan que se adapte a tus ambiciones. Desde lo esencial hasta el dominio total.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-6xl mx-auto">
                        {/* FREE Tier */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                                <UserIcon className="w-6 h-6 text-gray-600" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">Basic</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-3xl font-black text-gray-900">$0</span>
                                <span className="text-gray-500 font-medium">/mes</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <FeatureItem text="1 Anuncio Activo" />
                                <FeatureItem text="Perfil Básico" />
                                <FeatureItem text="Soporte Estándar" />
                                <FeatureItem text="Visiblidad Normal" negative />
                                <FeatureItem text="Badge de Verificado" negative />
                            </ul>
                            <button disabled={!user?.premiumPlan || user.premiumPlan === 'none'} className={`w-full py-3 rounded-xl font-bold transition-all ${(!user?.premiumPlan || user.premiumPlan === 'none') ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-rose-500 text-white hover:bg-rose-600'}`}>
                                {(!user?.premiumPlan || user.premiumPlan === 'none') ? 'Plan Actual' : 'Bajar a Básico'}
                            </button>
                        </div>

                        {/* GOLD Tier */}
                        <div className="relative bg-white rounded-3xl p-8 border-2 border-amber-400 shadow-[0_10px_40px_-10px_rgba(251,191,36,0.3)] transform scale-105 z-10">
                            <div className="absolute top-0 center left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-lg">
                                Más Popular
                            </div>
                            <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                                <Crown className="w-7 h-7 text-amber-600" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Gold</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-4xl font-black text-gray-900">$60k</span>
                                <span className="text-gray-500 font-medium">/mes</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <FeatureItem text="3 Anuncios Activos" check color="text-amber-500" />
                                <FeatureItem text="Badge GOLD Exclusivo" check color="text-amber-500" />
                                <FeatureItem text="Prioridad en Búsquedas" check color="text-amber-500" />
                                <FeatureItem text="Brillo Dorado en Perfil" check color="text-amber-500" />
                                <FeatureItem text="Soporte Prioritario" check color="text-amber-500" />
                            </ul>
                            <button
                                onClick={onOpenStore}
                                className={`w-full py-4 rounded-xl font-bold transition-all ${user?.premiumPlan === 'gold' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-amber-400 to-yellow-600 text-white shadow-lg shadow-amber-200 hover:scale-105'}`}
                            >
                                {user?.premiumPlan === 'gold' ? 'Plan Actual' : 'Obtener Gold'}
                            </button>
                        </div>

                        {/* DIAMOND Tier */}
                        <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-6 relative z-10">
                                <Trophy className="w-6 h-6 text-cyan-400" />
                            </div>
                            <h3 className="text-xl font-black text-white mb-2 relative z-10">Diamond</h3>
                            <div className="flex items-baseline gap-1 mb-6 relative z-10">
                                <span className="text-3xl font-black text-white">$110k</span>
                                <span className="text-gray-400 font-medium">/mes</span>
                            </div>
                            <ul className="space-y-4 mb-8 relative z-10">
                                <FeatureItem text="Anuncios ILIMITADOS" check color="text-cyan-400" dark />
                                <FeatureItem text="Badge DIAMOND Elite" check color="text-cyan-400" dark />
                                <FeatureItem text="Prioridad MÁXIMA (Top)" check color="text-cyan-400" dark />
                                <FeatureItem text="Brillo Cian Neon" check color="text-cyan-400" dark />
                                <FeatureItem text="Acceso a Eventos VIP" check color="text-cyan-400" dark />
                            </ul>
                            <button
                                onClick={onOpenStore}
                                className={`relative z-10 w-full py-3 rounded-xl font-bold transition-all ${user?.premiumPlan === 'diamond' ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:scale-105'}`}
                            >
                                {user?.premiumPlan === 'diamond' ? 'Plan Actual' : 'Ser Diamond'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function FeatureItem({ text, check, negative, color = "text-green-500", dark }: any) {
    return (
        <li className={`flex items-center gap-3 text-sm font-medium ${dark ? 'text-gray-300' : 'text-gray-600'}`}>
            {negative ? (
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${dark ? 'bg-gray-800 text-gray-600' : 'bg-gray-100 text-gray-400'}`}>
                    <X className="w-3 h-3" />
                </div>
            ) : (
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${check ? 'bg-opacity-20' : 'bg-green-100'} ${color.replace('text-', 'bg-')}`}>
                    <Check className={`w-3 h-3 ${color}`} />
                </div>
            )}
            {text}
        </li>
    );
}

function X({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
        </svg>
    );
}

function UserIcon({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
    )
}
