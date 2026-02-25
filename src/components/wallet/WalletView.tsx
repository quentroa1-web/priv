import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getTransactions, submitWithdrawalRequest } from '../../services/payment';
import { getMyAds, boostAd } from '../../services/api';
import {
    History,
    ArrowUpRight,
    ArrowDownLeft,
    TrendingUp,
    Crown,
    Wallet,
    AlertCircle,
    CheckCircle2,
    Globe,
    Banknote,
    ArrowLeft,
    Rocket,
    Plus,
    Shield,
    Star,
    Medal,
    Zap,
    X,
    Loader2,
    ArrowRight,
    User
} from 'lucide-react';

interface WalletViewProps {
    onBack: () => void;
    onStoreClick: () => void;
    onAddBillingClick: () => void;
}

export function WalletView({ onBack, onStoreClick, onAddBillingClick }: WalletViewProps) {
    const { user, refreshUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'spend' | 'plans'>('overview');
    const [loading, setLoading] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawalAmount, setWithdrawalAmount] = useState('');
    const [withdrawalSuccess, setWithdrawalSuccess] = useState(false);
    const [isReviewingWithdrawal, setIsReviewingWithdrawal] = useState(false);
    const [showSuscripcionModal, setShowSuscripcionModal] = useState(false);
    const [showBoostModal, setShowBoostModal] = useState(false);
    const [userAds, setUserAds] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    // Exchange rates constants
    const COIN_TO_COP = 80; // Withdrawal rate for advertisers
    const COP_TO_USD = 4000;

    useEffect(() => {
        fetchHistory();
        if (user?.role === 'announcer' || user?.role === 'admin') {
            fetchUserAds();
        }
    }, [user?.role]);

    const fetchUserAds = async () => {
        try {
            const res = await getMyAds();
            if (res.data.success) {
                setUserAds(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching ads:', error);
        }
    };

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await getTransactions();
            if (res.data.success) {
                setTransactions(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const currentCoins = user?.wallet?.coins || 0;
    const equivalentCOP = currentCoins * COIN_TO_COP;
    const equivalentUSD = equivalentCOP / COP_TO_USD;

    // Fix bank account detection with local fallback
    const effectivePaymentMethods = user?.paymentMethods?.length
        ? user.paymentMethods
        : (() => {
            const stored = localStorage.getItem(`paymentMethods_${user?.id || user?._id}`);
            return stored ? JSON.parse(stored) : [];
        })();

    const hasBillingAccount = effectivePaymentMethods && effectivePaymentMethods.length > 0;

    // Loyalty System Logic
    const totalPurchased = transactions
        .filter(tx => tx.type === 'deposit' && tx.status === 'completed')
        .reduce((acc, tx) => acc + (tx.coinsAmount || tx.amount || 0), 0);

    const getLevel = (total: number) => {
        if (total >= 5000) return { name: 'Leyenda', color: 'text-purple-500', bg: 'bg-purple-100', icon: <Medal className="w-4 h-4" />, next: null, min: 5000 };
        if (total >= 2000) return { name: 'VIP Platino', color: 'text-blue-500', bg: 'bg-blue-100', icon: <Crown className="w-4 h-4" />, next: 5000, min: 2000 };
        if (total >= 500) return { name: 'Aventurero Oro', color: 'text-amber-500', bg: 'bg-amber-100', icon: <Star className="w-4 h-4" />, next: 2000, min: 500 };
        return { name: 'Explorador Bronce', color: 'text-rose-500', bg: 'bg-rose-100', icon: <Zap className="w-4 h-4" />, next: 500, min: 0 };
    };

    const level = getLevel(totalPurchased);
    const nextLevelProgress = level.next ? Math.min(100, ((totalPurchased - level.min) / (level.next - level.min)) * 100) : 100;


    const handleWithdrawRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isReviewingWithdrawal) {
            setIsReviewingWithdrawal(true);
            return;
        }

        const amount = parseInt(withdrawalAmount);
        try {
            setLoading(true);
            setError(null);

            if (!effectivePaymentMethods || effectivePaymentMethods.length === 0) {
                setError('No se encontró una cuenta de destino. Por favor añade una en Facturación.');
                setLoading(false);
                return;
            }

            const res = await submitWithdrawalRequest({
                amount,
                targetAccount: effectivePaymentMethods[0].details,
                bankName: effectivePaymentMethods[0].type
            });

            if (res.data.success) {
                setWithdrawalSuccess(true);
                setWithdrawalAmount('');
                setIsReviewingWithdrawal(false);
                refreshUser();
                fetchHistory();
                setTimeout(() => {
                    setWithdrawalSuccess(false);
                    setShowWithdrawModal(false);
                }, 3000);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al procesar solicitud');
            setIsReviewingWithdrawal(false);
        } finally {
            setLoading(false);
        }
    };

    const handleBuySubscription = async (plan: string) => {
        try {
            setLoading(true);
            const { buySubscription } = await import('../../services/payment');
            const res = await buySubscription(plan);
            if (res.data.success) {
                alert('Plan activado exitosamente');
                setShowSuscripcionModal(false);
                refreshUser();
                fetchHistory();
            }
        } catch (err: any) {
            alert(err.response?.data?.error || 'Error al procesar suscripción');
        } finally {
            setLoading(false);
        }
    };

    const handleBoost = () => {
        // Check if user has ads
        if (userAds.length === 0) {
            alert('No tienes anuncios creados para aplicar un Boost.');
            return;
        }
        setShowBoostModal(true);
    };

    const activateAdBoost = async (adId: string) => {
        try {
            setLoading(true);
            const res = await boostAd(adId);
            if (res.data.success) {
                alert('¡Boost activado exitosamente!');
                setShowBoostModal(false);
                refreshUser();
                fetchHistory();
                fetchUserAds();
            }
        } catch (err: any) {
            alert(err.response?.data?.error || 'Error al aplicar boost');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2.5 rounded-2xl bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-all text-gray-600"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mi Billetera</h1>
                        <p className="text-gray-500 font-medium">Gestiona tus monedas y transacciones</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onStoreClick}
                        className="px-6 py-3 bg-rose-600 text-white rounded-2xl font-black shadow-lg shadow-rose-200 hover:bg-rose-700 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Cargar Monedas
                    </button>
                </div>
            </div>

            {/* Main Stats Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Balance Card */}
                <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-[2.5rem] p-8 text-white shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

                    <div className="relative flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                                <Wallet className="w-8 h-8 text-rose-400" />
                            </div>
                            <div className="text-right">
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Estado de Cuenta</span>
                                <p className="text-emerald-400 font-bold flex items-center gap-1 justify-end">
                                    <CheckCircle2 className="w-4 h-4" /> Verificada
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Saldo Disponible</p>
                            <div className="flex items-baseline gap-3 mb-6">
                                <h2 className="text-6xl font-black tracking-tighter">{currentCoins.toLocaleString()}</h2>
                                <span className="text-2xl font-bold text-rose-400">🪙</span>
                                {user?.role === 'user' && (
                                    <div className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 ${level.bg} ${level.color} rounded-full border border-current opacity-90 backdrop-blur-sm self-center`}>
                                        {level.icon}
                                        <span className="text-[10px] font-black uppercase tracking-wider">{level.name}</span>
                                    </div>
                                )}
                            </div>

                            {user?.role === 'announcer' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                                            <Banknote className="w-3 h-3" /> Valor en COP
                                        </p>
                                        <p className="text-xl font-black text-emerald-400">${equivalentCOP.toLocaleString()}</p>
                                        <p className="text-[9px] text-gray-500 font-bold mt-1 tracking-tight">* Tasa: 1 🪙 = $80 COP</p>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                                            <Globe className="w-3 h-3" /> Valor en USD
                                        </p>
                                        <p className="text-xl font-black text-blue-400">${equivalentUSD.toFixed(2)}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {user?.role === 'announcer' && (
                            <div className="mt-8 pt-8 border-t border-white/10 flex gap-4">
                                <button
                                    onClick={() => setShowWithdrawModal(true)}
                                    className="flex-1 py-4 bg-white text-black rounded-2xl font-black hover:bg-gray-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <ArrowUpRight className="w-5 h-5" /> Solicitar Retiro
                                </button>
                            </div>
                        )}

                        {user?.role === 'user' && (
                            <div className="mt-8 pt-8 border-t border-white/10">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-lg ${level.bg} ${level.color}`}>
                                            {level.icon}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Nivel de Lealtad</p>
                                            <p className={`text-sm font-black uppercase tracking-tight ${level.color}`}>{level.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">Total Comprado</p>
                                        <p className="text-sm font-black text-white">{totalPurchased.toLocaleString()} 🪙</p>
                                    </div>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-1000"
                                        style={{ width: `${nextLevelProgress}%` }}
                                    ></div>
                                </div>
                                {level.next && (
                                    <p className="text-[10px] text-gray-400 font-bold mt-2 text-center uppercase tracking-wider">
                                        Faltan {(level.next - totalPurchased).toLocaleString()} monedas para el nivel {getLevel(level.next).name}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Card */}
                <div className="flex flex-col gap-6">
                    {user?.role === 'user' ? (
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl flex-1 flex flex-col">
                            <h3 className="text-xl font-black text-gray-900 mb-4 tracking-tight">¿Qué puedes hacer?</h3>
                            <div className="space-y-4 flex-1">
                                {[
                                    { icon: <Crown className="text-amber-500" />, title: 'Premium', desc: 'Activa planes para mejores beneficios.' },
                                    { icon: <TrendingUp className="text-green-500" />, title: 'Boosts', desc: 'Aumenta tu visibilidad.' },
                                    { icon: <Rocket className="text-blue-500" />, title: 'Regalos', desc: 'Envía detalles a tus favoritos.' },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                                        <div className="p-3 bg-gray-50 rounded-xl h-fit">{item.icon}</div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                                            <p className="text-xs text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl flex-1 flex flex-col">
                            <h3 className="text-xl font-black text-gray-900 mb-6 tracking-tight">Suscripción Activa</h3>
                            <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl border border-gray-200 mb-6 border-dashed">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm">
                                        <Crown className="w-6 h-6 text-amber-500" />
                                    </div>
                                    <span className="px-3 py-1 bg-white rounded-full text-[10px] font-black uppercase text-amber-600 shadow-sm border border-amber-100">
                                        {user?.premiumPlan && user.premiumPlan !== 'none' ? (user.premiumPlan === 'gold' ? 'ORO' : 'DIAMANTE') : 'FREE'}
                                    </span>
                                </div>
                                <h4 className="text-lg font-black text-gray-900 uppercase">Plan {!user?.premiumPlan || user.premiumPlan === 'none' ? 'Estándar' : (user.premiumPlan === 'gold' ? 'Oro' : 'Diamante')}</h4>
                                <p className="text-xs text-gray-500 font-bold mt-1">
                                    Vence: {user?.premiumUntil && user.premiumPlan !== 'none' ? new Date(user.premiumUntil).toLocaleDateString() : 'Sin fecha'}
                                </p>
                            </div>

                            <button
                                onClick={() => setShowSuscripcionModal(true)}
                                className="w-full py-4 bg-rose-50 text-rose-600 rounded-2xl font-black hover:bg-rose-100 transition-all flex items-center justify-center gap-2 text-sm border border-rose-100"
                            >
                                Canjear por Plan Premium <ArrowRight className="w-4 h-4" />
                            </button>

                            {/* Diamond Boosts Counter */}
                            {user?.premiumPlan === 'diamond' && (
                                <div className="mt-6 p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-3xl border border-cyan-500/20">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Rocket className="w-4 h-4 text-cyan-500" />
                                            <span className="text-[10px] font-black text-cyan-600 uppercase tracking-widest">Boosts Diamante</span>
                                        </div>
                                        <span className="text-xl font-black text-cyan-600">{(user as any).diamondBoosts ?? 5}/5</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500"
                                            style={{ width: `${(((user as any).diamondBoosts ?? 5) / 5) * 100}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-[9px] text-cyan-600/70 font-bold mt-2 text-center uppercase tracking-tighter">
                                        {((user as any).diamondBoosts ?? 5) > 0 ? 'Tienes boosts de 12h disponibles' : 'Has agotado tus boosts gratuitos este mes'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white p-2 rounded-[2rem] border border-gray-100 shadow-lg flex gap-2">
                <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'overview' ? 'bg-gray-900 text-white shadow-xl' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <TrendingUp className="w-4 h-4" /> Resumen
                </button>
                {user?.role === 'announcer' && (
                    <button
                        onClick={() => setActiveTab('plans')}
                        className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'plans' ? 'bg-gray-900 text-white shadow-xl' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Crown className="w-4 h-4" /> Planes
                    </button>
                )}
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-gray-900 text-white shadow-xl' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    <History className="w-4 h-4" /> Historial
                </button>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl p-8">
                {activeTab === 'history' && (
                    <div className="space-y-4">
                        <h3 className="text-xl font-black text-gray-900 mb-6">Transacciones Recientes</h3>
                        {loading ? (
                            <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-rose-500" /></div>
                        ) : transactions.length === 0 ? (
                            <div className="py-20 text-center text-gray-400">No hay movimientos registrados</div>
                        ) : (
                            transactions.map((tx: any) => {
                                const isPositive = tx.type === 'deposit' || tx.type === 'receive' || tx.type === 'earnings';
                                const statusColor =
                                    tx.status === 'completed' || tx.status === 'approved' ? 'text-emerald-500 bg-emerald-50' :
                                        tx.status === 'pending' ? 'text-amber-500 bg-amber-50' :
                                            'text-rose-500 bg-rose-50';

                                return (
                                    <div key={tx._id || tx.id} className="group flex items-center justify-between p-5 rounded-3xl border border-gray-50 hover:bg-gray-50/50 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl ${isPositive ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                {isPositive ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 uppercase text-xs tracking-wider">
                                                    {tx.type === 'earnings' ? 'Venta de Contenido' : (tx.description || tx.type)}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <p className="text-[10px] text-gray-400 font-bold">{new Date(tx.createdAt).toLocaleString()}</p>
                                                    <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter ${statusColor}`}>
                                                        {tx.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-lg font-black ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {isPositive ? '+' : '-'}{tx.coinsAmount || tx.amount} 🪙
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-bold">Ref: {tx.referenceId || tx._id?.slice(-6) || 'N/A'}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {activeTab === 'plans' && user?.role === 'announcer' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-black text-gray-900 mb-4">Niveles de Membresía</h2>
                            <p className="text-gray-500 max-w-xl mx-auto">
                                Elige el plan que se adapte a tus ambiciones. Desde lo esencial hasta el dominio total.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-6xl mx-auto pb-10">
                            {/* Basic (FREE) */}
                            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-6">
                                    <User className="w-6 h-6 text-gray-600" />
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

                            {/* Gold */}
                            <div className="relative bg-white rounded-3xl p-8 border-2 border-amber-400 shadow-[0_10px_40px_-10px_rgba(251,191,36,0.3)] transform scale-105 z-10">
                                <div className="absolute top-0 center left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-lg">
                                    Más Popular
                                </div>
                                <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
                                    <Crown className="w-7 h-7 text-amber-600" />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Gold</h3>
                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-black text-gray-900">500</span>
                                    <span className="text-gray-500 font-medium ml-1">🪙/mes</span>
                                </div>
                                <ul className="space-y-4 mb-8">
                                    <FeatureItem text="3 Anuncios Activos" check color="text-amber-500" />
                                    <FeatureItem text="Badge GOLD Exclusivo" check color="text-amber-500" />
                                    <FeatureItem text="Visibilidad en VIP" check color="text-amber-500" />
                                    <FeatureItem text="Brillo Dorado en Perfil" check color="text-amber-500" />
                                    <FeatureItem text="Soporte Prioritario" check color="text-amber-500" />
                                </ul>
                                <button
                                    onClick={() => handleBuySubscription('gold')}
                                    disabled={user?.premiumPlan === 'gold' || currentCoins < 500}
                                    className={`w-full py-4 rounded-xl font-bold transition-all ${user?.premiumPlan === 'gold' ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-amber-400 to-yellow-600 text-white shadow-lg shadow-amber-200 hover:scale-105'}`}
                                >
                                    {user?.premiumPlan === 'gold' ? 'Plan Actual' : 'Obtener Gold'}
                                </button>
                            </div>

                            {/* Diamond */}
                            <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 text-white shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mb-6 relative z-10">
                                    <Medal className="w-6 h-6 text-cyan-400" />
                                </div>
                                <h3 className="text-xl font-black text-white mb-2 relative z-10">Diamond</h3>
                                <div className="flex items-baseline gap-1 mb-6 relative z-10">
                                    <span className="text-3xl font-black text-white">900</span>
                                    <span className="text-gray-400 font-medium ml-1">🪙/mes</span>
                                </div>
                                <ul className="space-y-4 mb-8 relative z-10">
                                    <FeatureItem text="Anuncios ILIMITADOS" check color="text-cyan-400" darkMode />
                                    <FeatureItem text="Badge DIAMOND Elite" check color="text-cyan-400" darkMode />
                                    <FeatureItem text="Prioridad en TOP ADS" check color="text-cyan-400" darkMode />
                                    <FeatureItem text="5 Boosts de 12h GRATIS" check color="text-cyan-400" darkMode />
                                    <FeatureItem text="Brillo Cian Neon" check color="text-cyan-400" darkMode />
                                    <FeatureItem text="Acceso a Eventos VIP" check color="text-cyan-400" darkMode />
                                </ul>
                                <button
                                    onClick={() => handleBuySubscription('diamond')}
                                    disabled={user?.premiumPlan === 'diamond' || currentCoins < 900}
                                    className={`relative z-10 w-full py-3 rounded-xl font-bold transition-all ${user?.premiumPlan === 'diamond' ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:scale-105'}`}
                                >
                                    {user?.premiumPlan === 'diamond' ? 'Plan Actual' : 'Ser Diamond'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'spend' && user?.role === 'announcer' && (
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-8 bg-gradient-to-br from-rose-50 to-rose-100 rounded-[2rem] border border-rose-200">
                            <div className="p-4 bg-white rounded-2xl w-fit shadow-sm mb-6">
                                <TrendingUp className="w-8 h-8 text-rose-600" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Boost de Perfil</h3>
                            <p className="text-gray-600 font-medium text-sm mb-8 leading-relaxed">
                                Aparece en las primeras posiciones durante {user?.premiumPlan === 'diamond' && (user as any).diamondBoosts > 0 ? '12' : '12'} horas y atrae más miradas.
                            </p>
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-3xl font-black text-rose-600">
                                    {user?.premiumPlan === 'diamond' && (user as any).diamondBoosts > 0 ? '0' : '100'} <span className="text-sm">🪙</span>
                                </span>
                                <span className="px-3 py-1 bg-white/50 rounded-full text-[10px] font-black text-rose-700 uppercase">
                                    {user?.premiumPlan === 'diamond' && (user as any).diamondBoosts > 0 ? '12' : '12'} Horas TOP
                                </span>
                            </div>
                            <button
                                onClick={handleBoost}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-xl shadow-rose-200"
                            >
                                Activar en mi Perfil
                            </button>
                        </div>

                        <div className="p-8 bg-gradient-to-br from-amber-50 to-amber-100 rounded-[2rem] border border-amber-200">
                            <div className="p-4 bg-white rounded-2xl w-fit shadow-sm mb-6">
                                <Crown className="w-8 h-8 text-amber-600" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Mejora tu Plan</h3>
                            <p className="text-gray-600 font-medium text-sm mb-8 leading-relaxed">
                                Obtén visibilidad premium, insignias exclusivas y boosts gratuitos cada mes.
                            </p>
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-3xl font-black text-amber-600">Desde 500 <span className="text-sm">🪙</span></span>
                            </div>
                            <button
                                onClick={() => setShowSuscripcionModal(true)}
                                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-xl shadow-amber-200"
                            >
                                Canjear Ahora
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'overview' && (
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-8">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 mb-4 tracking-tight">Actividad por Categoría</h3>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Ingresos por Regalos', value: 75, color: 'bg-rose-500' },
                                        { label: 'Ventas de Packs', value: 45, color: 'bg-emerald-500' },
                                        { label: 'Gasto en Publicidad', value: 20, color: 'bg-blue-500' }
                                    ].map((item, i) => (
                                        <div key={i}>
                                            <div className="flex justify-between text-[10px] font-black uppercase text-gray-400 mb-1.5 tracking-wider">
                                                <span>{item.label}</span>
                                                <span>{item.value}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 border-dashed">
                                <div className="flex gap-4">
                                    <div className="p-3 bg-white rounded-2xl h-fit shadow-sm">
                                        <Shield className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-blue-900 text-sm">Transacciones Protegidas</h4>
                                        <p className="text-xs text-blue-700 font-medium mt-1 leading-relaxed">
                                            Todas tus operaciones están cifradas y garantizadas por el protocolo de seguridad SafeConnect de extremo a extremo.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                <h4 className="font-black text-gray-900 text-sm mb-4 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-rose-500" />
                                    Preguntas Frecuentes
                                </h4>
                                <div className="space-y-3">
                                    {(user?.role === 'announcer' ? [
                                        { q: '¿Cómo recibo mi dinero?', a: 'A través de Nequi, Daviplata o Transferencia configurada en tu Facturación.' },
                                        { q: '¿Cuánto demora el retiro?', a: 'Se procesan en un máximo de 24h hábiles tras la solicitud.' },
                                        { q: '¿Cuál es la tasa de cambio?', a: 'Cada moneda (🪙) equivale a $80 COP para retiros.' }
                                    ] : [
                                        { q: '¿Cómo ganar niveles?', a: 'Cada compra de monedas suma puntos a tu nivel de lealtad permanentemente.' },
                                        { q: '¿Beneficios de nivel?', a: 'Descuentos, insignias exclusivas y atención prioritaria según tu rango.' },
                                        { q: '¿Mis monedas expiran?', a: 'No, tus monedas no tienen fecha de vencimiento.' }
                                    ]).map((faq, idx) => (
                                        <div key={idx} className="border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                                            <button
                                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                                className="w-full flex items-center justify-between text-left group"
                                            >
                                                <span className="text-xs font-black text-gray-700 group-hover:text-rose-600 transition-colors">{faq.q}</span>
                                                <Plus className={`w-3 h-3 text-gray-400 transition-transform ${openFaq === idx ? 'rotate-45 text-rose-500' : ''}`} />
                                            </button>
                                            {openFaq === idx && (
                                                <p className="mt-2 text-[10px] text-gray-500 font-medium leading-relaxed animate-in slide-in-from-top-1 duration-200">
                                                    {faq.a}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative">
                        <button
                            onClick={() => setShowWithdrawModal(false)}
                            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8">
                            <div className="p-4 bg-emerald-50 rounded-2xl w-fit mb-6">
                                <Banknote className="w-8 h-8 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Solicitud de Retiro</h3>
                            <p className="text-gray-500 font-medium text-sm mb-8 leading-relaxed">
                                Convierte tus monedas en dinero real. Los desembolsos se procesan en un máximo de 24 horas hábiles.
                            </p>

                            {!hasBillingAccount ? (
                                <div className="p-6 bg-red-50 border border-red-100 rounded-3xl space-y-4">
                                    <div className="flex gap-3 text-red-600">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <p className="text-xs font-black leading-relaxed">
                                            NO SE PODRÁ PROCESAR EL RETIRO SI PRIMERO NO AÑADE LA CUENTA DE DESTINO EN EL APARTADO DE FACTURACIÓN.
                                        </p>
                                    </div>
                                    <button
                                        onClick={onAddBillingClick}
                                        className="w-full py-3 bg-red-600 text-white rounded-xl font-black text-xs hover:bg-red-700 transition-all"
                                    >
                                        Añadir Cuenta Ahora
                                    </button>
                                </div>
                            ) : withdrawalSuccess ? (
                                <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-300">
                                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-4">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <h4 className="text-xl font-black text-emerald-900">Solicitud Enviada</h4>
                                    <p className="text-sm text-emerald-700 font-medium">Hemos recibido tu solicitud. El administrador procederá con el desembolso pronto.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleWithdrawRequest} className="space-y-6">
                                    {isReviewingWithdrawal ? (
                                        <div className="space-y-4 animate-in slide-in-from-right duration-300">
                                            <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100">
                                                <h4 className="text-xs font-black text-rose-600 uppercase mb-4 tracking-widest">Resumen del Retiro</h4>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-bold text-gray-500">Monto:</span>
                                                        <span className="font-black text-gray-900">{withdrawalAmount} 🪙</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm font-bold text-gray-500">Valor Real:</span>
                                                        <span className="font-black text-emerald-600">${(parseInt(withdrawalAmount) * 80).toLocaleString()} COP</span>
                                                    </div>
                                                    <div className="border-t border-rose-100 my-2 pt-2">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Cuenta de Destino</p>
                                                        <p className="text-sm font-black text-gray-900">{effectivePaymentMethods[0].type}: {effectivePaymentMethods[0].details}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsReviewingWithdrawal(false)}
                                                    className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all"
                                                >
                                                    Corregir
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                                                >
                                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar y Enviar'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Monedas a Retirar</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={withdrawalAmount}
                                                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                                                        placeholder="Ej: 500"
                                                        required
                                                        className="w-full p-5 bg-gray-50 border border-gray-100 rounded-2xl font-black text-xl placeholder:text-gray-300 focus:ring-4 focus:ring-rose-500/5 transition-all outline-none"
                                                    />
                                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xl">🪙</span>
                                                </div>
                                                {withdrawalAmount && parseInt(withdrawalAmount) > 0 && (
                                                    <div className="flex justify-between px-2 text-[10px] font-black uppercase text-gray-400">
                                                        <span>≈ ${(parseInt(withdrawalAmount) * 80).toLocaleString()} COP</span>
                                                        <span>≈ ${(parseInt(withdrawalAmount) * 80 / 4000).toFixed(2)} USD</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Confirmar Cuenta</label>
                                                <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                        <Wallet className="w-5 h-5 text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-black text-gray-900 uppercase">{effectivePaymentMethods[0].type}</p>
                                                        <p className="text-[10px] text-gray-500 font-bold">{effectivePaymentMethods[0].details}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {error && (
                                                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase text-center border border-red-100">
                                                    {error}
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={loading || !withdrawalAmount || parseInt(withdrawalAmount) < 100}
                                                className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:shadow-2xl hover:bg-black transition-all flex items-center justify-center gap-2 active:scale-95 disabled:bg-gray-400"
                                            >
                                                Revisar Solicitud
                                            </button>
                                            <p className="text-[9px] text-center text-gray-400 font-bold uppercase tracking-widest">Mínimo de retiro: 100 Monedas</p>
                                        </div>
                                    )}
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Suscripciones Modal */}
            {showSuscripcionModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden relative">
                        <button
                            onClick={() => setShowSuscripcionModal(false)}
                            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8">
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Canjear Monedas por Premium</h3>
                            <p className="text-gray-500 text-sm mb-8">Elige el plan que mejor se adapte a tus necesidades de visibilidad.</p>

                            <div className="grid md:grid-cols-2 gap-6">
                                {[
                                    { id: 'gold', name: 'Plan Oro', price: 500, color: 'from-amber-400 to-amber-600', popular: false },
                                    { id: 'diamond', name: 'Plan Diamante', price: 900, color: 'from-blue-400 to-blue-600', popular: true }
                                ].map(plan => (
                                    <div key={plan.id} className={`relative p-6 rounded-[2rem] border-2 transition-all ${plan.popular ? 'border-blue-500 shadow-xl scale-105' : 'border-gray-100 hover:border-gray-200'}`}>
                                        {plan.popular && <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Recomendado</span>}
                                        <h4 className="text-xl font-black mb-1">{plan.name}</h4>
                                        <div className="flex items-baseline gap-1 mb-6">
                                            <span className="text-3xl font-black">{plan.price}</span>
                                            <span className="text-sm font-bold text-gray-400 uppercase">Monedas / mes</span>
                                        </div>
                                        <button
                                            onClick={() => handleBuySubscription(plan.id)}
                                            disabled={loading || currentCoins < plan.price}
                                            className={`w-full py-4 rounded-2xl font-black transition-all ${currentCoins >= plan.price ? `bg-gradient-to-r ${plan.color} text-white shadow-lg hover:-translate-y-0.5` : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                        >
                                            {currentCoins >= plan.price ? 'Canjear Ahora' : 'Faltan monedas'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Boost Selection Modal */}
            {showBoostModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden relative">
                        <button
                            onClick={() => setShowBoostModal(false)}
                            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-8">
                            <div className="p-4 bg-rose-50 rounded-2xl w-fit mb-6">
                                <TrendingUp className="w-8 h-8 text-rose-600" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Selecciona un Anuncio</h3>
                            <p className="text-gray-500 font-medium text-sm mb-8 leading-relaxed">
                                {user?.premiumPlan === 'diamond' && ((user as any).diamondBoosts ?? 5) > 0
                                    ? `¡Aprovecha tus boosts gratuitos! Este boost durará 12 horas y no te costará monedas.`
                                    : `Elige el anuncio que deseas impulsar al tope de los resultados por 12 horas. Solo cuesta 100 🪙.`}
                            </p>

                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {userAds.map((ad) => {
                                    const isCurrentlyBoosted = ad.isBoosted && ad.boostedUntil && new Date(ad.boostedUntil) > new Date();
                                    return (
                                        <div
                                            key={ad._id}
                                            className={`group p-4 rounded-2xl border transition-all flex items-center justify-between ${isCurrentlyBoosted ? 'bg-gray-50 border-gray-100 opacity-80' : 'bg-white border-gray-100 hover:border-rose-200 hover:shadow-md'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden shadow-inner">
                                                    {ad.photos && ad.photos[0] && (
                                                        <img src={ad.photos[0].url} alt="" className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900 text-sm">{ad.title}</h4>
                                                    {isCurrentlyBoosted ? (
                                                        <p className="text-[10px] text-emerald-600 font-black uppercase tracking-wider flex items-center gap-1">
                                                            <CheckCircle2 className="w-3 h-3" /> Boost Activo
                                                        </p>
                                                    ) : (
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Listo para impulsar</p>
                                                    )}
                                                </div>
                                            </div>

                                            {isCurrentlyBoosted ? (
                                                <div className="text-right">
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase">Expira</p>
                                                    <p className="text-[10px] font-black text-gray-700">{new Date(ad.boostedUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => activateAdBoost(ad._id)}
                                                    disabled={loading || (!((user?.premiumPlan === 'diamond' && ((user as any).diamondBoosts ?? 5) > 0)) && (user?.wallet?.coins || 0) < 100)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${(user?.premiumPlan === 'diamond' && ((user as any).diamondBoosts ?? 5) > 0) || (user?.wallet?.coins || 0) >= 100 ? 'bg-rose-600 text-white shadow-lg hover:bg-rose-700 active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                                                >
                                                    {user?.premiumPlan === 'diamond' && ((user as any).diamondBoosts ?? 5) > 0 ? 'Boost GRATIS 💎' : 'Boost 🚀'}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {(user?.wallet?.coins || 0) < 100 && (
                                <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                                    <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase">
                                        No tienes suficientes monedas. Recarga en la sección "Cargar Monedas".
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function FeatureItem({ text, check, negative, color = "text-green-500", darkMode }: any) {
    return (
        <li className={`flex items-center gap-3 text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {negative ? (
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${darkMode ? 'bg-gray-800 text-gray-600' : 'bg-gray-100 text-gray-400'}`}>
                    <X className="w-3 h-3" />
                </div>
            ) : (
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${check ? 'bg-opacity-20' : 'bg-green-100'} ${color.replace('text-', 'bg-')}`}>
                    <CheckCircle2 className={`w-3 h-3 ${color}`} />
                </div>
            )}
            {text}
        </li>
    );
}
