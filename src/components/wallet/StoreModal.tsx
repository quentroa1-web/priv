import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { submitPaymentProof, getTransactions } from '../../services/payment';
import { Check, X, Sparkles, Coins, Crown, Upload, ArrowLeft, Copy, History, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface StoreModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function StoreModal({ isOpen, onClose }: StoreModalProps) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'coins' | 'premium' | 'history'>('coins');
    const [loading, setLoading] = useState(false);

    // Payment Form State
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [step, setStep] = useState<'selection' | 'payment'>('selection');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [paymentDetails, setPaymentDetails] = useState({
        bankName: 'Nequi',
        referenceId: '',
        paymentDate: new Date().toISOString().split('T')[0]
    });

    // History State
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        if (isOpen && activeTab === 'history') {
            fetchHistory();
        }
    }, [isOpen, activeTab]);

    const fetchHistory = async () => {
        try {
            setLoadingHistory(true);
            const res = await getTransactions();
            setTransactions(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingHistory(false);
        }
    };

    if (!isOpen) return null;

    const handleSelectPackage = (pkg: any) => {
        setSelectedPackage(pkg);
        setStep('payment');
    };

    const handleBack = () => {
        setStep('selection');
        setSelectedPackage(null);
        setProofFile(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProofFile(e.target.files[0]);
        }
    };

    const handleSubmitProof = async () => {
        if (!proofFile) {
            toast.error('Por favor sube el comprobante de pago');
            return;
        }
        if (!paymentDetails.referenceId) {
            toast.error('Por favor ingresa el número de referencia');
            return;
        }

        try {
            setLoading(true);

            // 1. Upload Image
            const formData = new FormData();
            formData.append('image', proofFile);

            // Reusing the upload endpoint
            const uploadRes = await apiService.uploadProof(formData);
            if (!uploadRes.data.success) throw new Error('Error al subir imagen');

            const proofUrl = uploadRes.data.url;

            // 2. Submit Payment Proof
            const res = await submitPaymentProof({
                packageId: selectedPackage.id,
                proofUrl,
                ...paymentDetails
            });

            if (res.data.success) {
                toast.success('¡Comprobante enviado! Te notificaremos cuando sea aprobado.');
                onClose();
                // Reset
                setStep('selection');
                setSelectedPackage(null);
                setProofFile(null);
            }

        } catch (err: any) {
            console.error(err);
            toast.error(err.message || 'Error al enviar comprobante');
        } finally {
            setLoading(false);
        }
    };

    const CoinPackages = [
        { id: 'coins_100', name: 'Pack Básico', coins: 100, price: 12000, icon: <Coins className="w-6 h-6 text-amber-500" /> },
        { id: 'coins_500', name: 'Pack Standard', coins: 500, price: 55000, popular: true, icon: <Coins className="w-8 h-8 text-slate-400" /> },
        { id: 'coins_1000', name: 'Pack Premium', coins: 1000, price: 100000, icon: <Coins className="w-10 h-10 text-yellow-500" /> },
    ];

    const PremiumPlans = [
        {
            id: 'premium_gold',
            name: 'Gold Membership',
            price: 60000,
            features: ['Posicionamiento Mejorado', 'Sin Anuncios', 'Badge Gold', 'Soporte Prioritario'],
            color: 'from-amber-400 to-yellow-600'
        },
        {
            id: 'premium_diamond',
            name: 'Diamond Access',
            price: 110000,
            features: ['Máxima Visibilidad', 'Contenido Ilimitado', 'Badge Diamond', '5 Boosts de 12h GRATIS', 'Concierge Personal'],
            popular: true,
            color: 'from-cyan-400 to-blue-600'
        },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            Store <Sparkles className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        </h2>
                        <p className="text-gray-500 text-sm">Mejora tu experiencia en SafeConnect</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-2 gap-2 bg-gray-50/50 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('coins')}
                        className={`flex-1 min-w-[100px] py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'coins' ? 'bg-white shadow-sm text-rose-600 ring-1 ring-black/5' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <Coins className="w-5 h-5" /> Monedas
                    </button>
                    {(user?.role === 'announcer' || user?.role === 'admin') && (
                        <button
                            onClick={() => setActiveTab('premium')}
                            className={`flex-1 min-w-[100px] py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'premium' ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100'}`}
                        >
                            <Crown className="w-5 h-5" /> Planes
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 min-w-[100px] py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'history' ? 'bg-white shadow-sm text-blue-600 ring-1 ring-black/5' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                        <History className="w-5 h-5" /> Historial
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">

                    {step === 'selection' ? (
                        <>
                            {activeTab === 'coins' && (
                                <div className="grid md:grid-cols-3 gap-6">
                                    {CoinPackages.map(pkg => (
                                        <div key={pkg.id} className={`relative bg-white p-6 rounded-3xl border transition-all hover:shadow-xl hover:-translate-y-1 ${pkg.popular ? 'border-amber-400 ring-4 ring-amber-400/10' : 'border-gray-100 shadow-sm'}`}>
                                            {pkg.popular && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-[10px] uppercase font-black px-3 py-1 rounded-full tracking-widest shadow-sm">
                                                    Más Vendido
                                                </div>
                                            )}
                                            <div className="flex flex-col items-center text-center">
                                                <div className="mb-4 p-4 bg-gray-50 rounded-2xl">
                                                    {pkg.icon}
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900 mb-1">{pkg.name}</h3>
                                                <div className="text-3xl font-black text-gray-900 mb-4 font-mono">
                                                    {pkg.coins} <span className="text-sm font-bold text-gray-400">monedas</span>
                                                </div>
                                                <div className="w-full border-t border-gray-100 my-4"></div>
                                                <button
                                                    onClick={() => handleSelectPackage(pkg)}
                                                    className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                                >
                                                    Comprar por ${pkg.price.toLocaleString()}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'premium' && (
                                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                                    {PremiumPlans.map(plan => (
                                        <div key={plan.id} className={`relative bg-white rounded-3xl overflow-hidden border transition-all hover:shadow-2xl hover:-translate-y-1 ${plan.popular ? 'border-transparent ring-2 ring-offset-2 ring-blue-500' : 'border-gray-100 shadow-lg'}`}>
                                            {/* Header Card */}
                                            <div className={`p-6 bg-gradient-to-br ${plan.color} text-white relative overflow-hidden`}>
                                                <div className="absolute top-0 right-0 p-4 opacity-20 transform translate-x-1/3 -translate-y-1/3">
                                                    <Crown className="w-32 h-32" />
                                                </div>
                                                <h3 className="text-xl font-bold opacity-90 mb-1">{plan.name}</h3>
                                                <div className="flex items-baseline gap-1 relative z-10">
                                                    <span className="text-4xl font-black tracking-tight">${plan.price.toLocaleString()}</span>
                                                    <span className="opacity-80 font-medium">/mes</span>
                                                </div>
                                            </div>

                                            {/* Features */}
                                            <div className="p-6">
                                                <ul className="space-y-4 mb-8">
                                                    {plan.features.map((feat, i) => (
                                                        <li key={i} className="flex items-center gap-3 text-gray-600 font-medium text-sm">
                                                            <div className="p-1 bg-green-100 rounded-full text-green-600 shrink-0">
                                                                <Check className="w-3 h-3" />
                                                            </div>
                                                            {feat}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <button
                                                    onClick={() => handleSelectPackage({ ...plan, id: plan.id })}
                                                    className={`w-full py-3 rounded-xl font-bold text-white transition-all shadow-md transform active:scale-95 bg-gradient-to-r ${plan.color}`}
                                                >
                                                    Suscribirse Ahora
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'history' && (
                                <div className="space-y-4">
                                    {loadingHistory ? (
                                        <div className="text-center py-10">
                                            <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
                                        </div>
                                    ) : transactions.length === 0 ? (
                                        <div className="text-center py-10 text-gray-400">
                                            <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p>No tienes transacciones recientes</p>
                                        </div>
                                    ) : (
                                        transactions.map((tx: any) => (
                                            <div key={tx._id || tx.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-xl ${tx.status === 'completed' || tx.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : tx.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                                                        {tx.type === 'deposit' ? <Coins className="w-5 h-5" /> : <Crown className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900">{tx.description}</h4>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                                            <Clock className="w-3 h-3" /> {new Date(tx.createdAt).toLocaleDateString()}
                                                        </p>
                                                        {tx.status === 'rejected' && tx.rejectionReason && (
                                                            <p className="text-xs text-red-500 mt-1 font-medium">{tx.rejectionReason}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-black text-gray-900">${tx.amount?.toLocaleString()}</div>
                                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${tx.status === 'completed' || tx.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : tx.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                                        {tx.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                        </>
                    ) : (
                        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4">
                            <button
                                onClick={handleBack}
                                className="mb-6 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" /> Volver a paquetes
                            </button>

                            <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                                <div className="p-8 bg-gray-50 border-b border-gray-100">
                                    <h3 className="text-xl font-black text-gray-900 mb-2">Instrucciones de Pago Manual</h3>
                                    <p className="text-gray-500 text-sm">Realiza la transferencia y sube el comprobante para activar tu plan.</p>
                                </div>

                                <div className="p-8 space-y-8">
                                    {/* Bank Info */}
                                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 relative">
                                        <div className="absolute top-4 right-4 text-blue-300">
                                            <Coins className="w-12 h-12 opacity-20" />
                                        </div>
                                        <div className="space-y-1 mb-4">
                                            <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Banco / Billetera</p>
                                            <p className="text-lg font-black text-blue-900">Nequi / Daviplata</p>
                                        </div>
                                        <div className="space-y-1 mb-4">
                                            <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Número de Cuenta</p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-2xl font-mono text-blue-900 tracking-wider">300 123 4567</p>
                                                <button className="p-1 hover:bg-blue-100 rounded text-blue-500 transition-colors" title="Copiar">
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Monto a Transferir</p>
                                            <p className="text-3xl font-black text-blue-600">${selectedPackage?.price?.toLocaleString()} COP</p>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-blue-100 text-xs text-blue-800 font-medium">
                                            * Incluye tu nombre de usuario en la referencia del pago.
                                        </div>
                                    </div>

                                    {/* Manual Details Form */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Banco / Método</label>
                                            <select
                                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-rose-500"
                                                value={paymentDetails.bankName}
                                                onChange={e => setPaymentDetails({ ...paymentDetails, bankName: e.target.value })}
                                            >
                                                <option value="Nequi">Nequi</option>
                                                <option value="Daviplata">Daviplata</option>
                                                <option value="Bancolombia">Bancolombia</option>
                                                <option value="Other">Otro</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-gray-700">Fecha Transferencia</label>
                                            <input
                                                type="date"
                                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-rose-500"
                                                value={paymentDetails.paymentDate}
                                                onChange={e => setPaymentDetails({ ...paymentDetails, paymentDate: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-bold text-gray-700">Número de Referencia / Comprobante</label>
                                            <input
                                                type="text"
                                                placeholder="Ej: M123456"
                                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-rose-500"
                                                value={paymentDetails.referenceId}
                                                onChange={e => setPaymentDetails({ ...paymentDetails, referenceId: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Upload */}
                                    <div className="space-y-4">
                                        <label className="block text-sm font-black text-gray-900">Subir Comprobante</label>
                                        <div className={`border-3 border-dashed rounded-2xl p-8 text-center transition-all ${proofFile ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'}`}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                                id="proof-upload"
                                            />
                                            <label htmlFor="proof-upload" className="cursor-pointer flex flex-col items-center gap-3">
                                                {proofFile ? (
                                                    <>
                                                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                                            <Check className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900">{proofFile.name}</p>
                                                            <p className="text-xs text-emerald-600 font-bold mt-1">Click para cambiar</p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                                            <Upload className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900">Click para subir imagen</p>
                                                            <p className="text-xs text-gray-400 mt-1">JPG, PNG (Max 5MB)</p>
                                                        </div>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>


                                    <button
                                        onClick={handleSubmitProof}
                                        disabled={loading || !proofFile}
                                        className="w-full py-4 bg-gray-900 hover:bg-black disabled:bg-gray-300 text-white rounded-2xl font-black shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Enviando...
                                            </span>
                                        ) : (
                                            'Enviar Comprobante'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
