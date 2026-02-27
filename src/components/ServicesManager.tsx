import { useState, useRef, useEffect } from 'react';
import {
    X, Plus, Trash2, Image as ImageIcon, Video, Package,
    Crown, Upload, CheckCircle, Sparkles, ShoppingBag,
    ChevronRight, Info, Loader2, Save, Camera
} from 'lucide-react';


interface ServicePack {
    id: string;
    label: string;
    price: number;
    type: 'photos' | 'videos' | 'service';
    quantity: number;
    description?: string;
    preview?: string; // URL for preview image/video thumbnail
    file?: File;
}

interface ServicesManagerProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onSave: (packs: any[]) => Promise<void>;
}

const PACK_TYPE_CONFIG = {
    photos: {
        label: 'Pack de Fotos',
        icon: ImageIcon,
        color: 'from-pink-500 to-rose-500',
        bg: 'bg-pink-50',
        border: 'border-pink-200',
        text: 'text-pink-600',
        badge: 'bg-pink-100 text-pink-700',
        description: 'Fotos exclusivas que el cliente desbloquea pagando'
    },
    videos: {
        label: 'Pack de Videos',
        icon: Video,
        color: 'from-violet-500 to-purple-600',
        bg: 'bg-violet-50',
        border: 'border-violet-200',
        text: 'text-violet-600',
        badge: 'bg-violet-100 text-violet-700',
        description: 'Videos exclusivos con contenido premium'
    },
    service: {
        label: 'Servicio Personalizado',
        icon: Package,
        color: 'from-amber-400 to-orange-500',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-600',
        badge: 'bg-amber-100 text-amber-700',
        description: 'Servicio a medida (encuentros, asesorías, etc.)'
    }
};

const DEFAULT_PACKS: Omit<ServicePack, 'id'>[] = [
    { label: 'Pack 5 Fotos', price: 50, type: 'photos', quantity: 5, description: 'Pack de 5 fotos exclusivas' },
    { label: 'Pack 10 Fotos', price: 100, type: 'photos', quantity: 10, description: 'Pack de 10 fotos exclusivas' },
    { label: 'Pack Video 1 min', price: 150, type: 'videos', quantity: 1, description: 'Video exclusivo de 1 minuto' },
];

export function ServicesManager({ isOpen, onClose, user, onSave }: ServicesManagerProps) {
    const [packs, setPacks] = useState<ServicePack[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [step, setStep] = useState<'intro' | 'manage'>('intro');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingPack, setEditingPack] = useState<ServicePack | null>(null);
    const [form, setForm] = useState({
        label: '',
        price: 100,
        type: 'photos' as 'photos' | 'videos' | 'service',
        quantity: 1,
        description: '',
    });
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadPreview, setUploadPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load user's current packs on open
    useEffect(() => {
        if (isOpen && user) {
            const existing = (user.priceList || []).map((p: any, i: number) => ({
                ...p,
                id: p.id || `pack-${i}-${Date.now()}`,
                type: p.type || 'service',
                quantity: p.quantity || 1,
            }));
            setPacks(existing);
            // If user has no packs, show intro first
            setStep(existing.length > 0 ? 'manage' : 'intro');
        }
    }, [isOpen, user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadFile(file);
        const url = URL.createObjectURL(file);
        setUploadPreview(url);
    };

    const resetForm = () => {
        setForm({ label: '', price: 100, type: 'photos', quantity: 1, description: '' });
        setUploadFile(null);
        setUploadPreview(null);
        setEditingPack(null);
    };

    const openAddModal = (pack?: ServicePack) => {
        if (pack) {
            setEditingPack(pack);
            setForm({
                label: pack.label,
                price: pack.price,
                type: pack.type,
                quantity: pack.quantity,
                description: pack.description || '',
            });
            setUploadPreview(pack.preview || null);
        } else {
            resetForm();
        }
        setShowAddModal(true);
    };

    const handleSavePack = () => {
        if (!form.label.trim() || form.price <= 0) return;

        const newPack: ServicePack = {
            id: editingPack?.id || `pack-${Date.now()}`,
            label: form.label.trim(),
            price: form.price,
            type: form.type,
            quantity: form.quantity,
            description: form.description.trim(),
            preview: uploadPreview || editingPack?.preview,
            file: uploadFile || undefined,
        };

        if (editingPack) {
            setPacks(prev => prev.map(p => p.id === editingPack.id ? newPack : p));
        } else {
            setPacks(prev => [...prev, newPack]);
        }

        setShowAddModal(false);
        resetForm();
    };

    const handleDelete = (id: string) => {
        setPacks(prev => prev.filter(p => p.id !== id));
    };

    const handleQuickAdd = (template: Omit<ServicePack, 'id'>) => {
        setPacks(prev => [...prev, { ...template, id: `pack-${Date.now()}` }]);
    };

    const handleSaveAll = async () => {
        try {
            setIsSaving(true);
            // Transform to save format
            const saveFormat = packs.map(({ id, file, ...p }) => p);
            await onSave(saveFormat);
            onClose();
        } catch (err) {
            alert('Error al guardar los servicios');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    const totalRevenuePotential = packs.reduce((sum, p) => sum + p.price, 0);

    return (
        <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full sm:max-w-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95dvh] sm:max-h-[90vh] relative">

                {/* Drag handle (mobile) */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-10 h-1 bg-gray-200 rounded-full" />
                </div>

                {/* Header */}
                <div className="relative px-6 pt-4 pb-5 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden shrink-0">
                    {/* Decorative orbs */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/20 rounded-full blur-2xl -ml-8 -mb-8 pointer-events-none" />

                    <div className="relative z-10 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10">
                                <ShoppingBag className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black tracking-tight">Gestionar Servicios</h2>
                                <p className="text-white/60 text-xs font-medium mt-0.5">Configura tus packs de venta en el chat</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/60 hover:text-white shrink-0"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {packs.length > 0 && (
                        <div className="relative z-10 mt-4 flex gap-3">
                            <div className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3">
                                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-0.5">Total Packs</div>
                                <div className="text-2xl font-black text-white">{packs.length}</div>
                            </div>
                            <div className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3">
                                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-0.5">Potencial</div>
                                <div className="text-2xl font-black text-amber-400">{totalRevenuePotential} 🪙</div>
                            </div>
                            <div className="flex-1 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3">
                                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-0.5">Tipos</div>
                                <div className="flex gap-1 mt-1.5">
                                    {(['photos', 'videos', 'service'] as const).map(t => (
                                        packs.some(p => p.type === t) && (
                                            <div key={t} className={`w-3 h-3 rounded-full bg-gradient-to-br ${PACK_TYPE_CONFIG[t].color}`} title={PACK_TYPE_CONFIG[t].label} />
                                        )
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {step === 'intro' ? (
                        /* INTRO SCREEN */
                        <div className="p-6 space-y-6">
                            <div className="text-center pt-2">
                                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-rose-200">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">¿Cómo funcionan los packs?</h3>
                                <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
                                    Crea servicios que tus clientes pueden comprar directamente desde el chat de mensajes.
                                    ¡Tú fijas el precio y el contenido!
                                </p>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { icon: '💬', title: 'Integrado en el Chat', desc: 'Tus packs aparecen en el menú del chat para que el cliente los compre al instante.' },
                                    { icon: '🔒', title: 'Contenido Seguro', desc: 'El cliente paga primero con monedas y luego recibe el contenido que enviaste.' },
                                    { icon: '🪙', title: 'Cobro Automático', desc: 'Las monedas se transfieren instantáneamente a tu billetera cuando compran.' },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="text-2xl shrink-0">{item.icon}</div>
                                        <div>
                                            <div className="font-black text-gray-900 text-sm">{item.title}</div>
                                            <div className="text-gray-500 text-xs mt-0.5 leading-relaxed">{item.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Tipos de pack disponibles</div>
                                <div className="grid grid-cols-3 gap-2">
                                    {(Object.entries(PACK_TYPE_CONFIG) as [string, typeof PACK_TYPE_CONFIG[keyof typeof PACK_TYPE_CONFIG]][]).map(([key, cfg]) => {
                                        const Icon = cfg.icon;
                                        return (
                                            <div key={key} className={`${cfg.bg} ${cfg.border} border rounded-2xl p-3 text-center`}>
                                                <Icon className={`w-5 h-5 ${cfg.text} mx-auto mb-1.5`} />
                                                <div className={`text-[10px] font-black ${cfg.text} leading-tight`}>{cfg.label}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <button
                                onClick={() => setStep('manage')}
                                className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl font-black shadow-xl shadow-rose-200 hover:shadow-rose-300 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Crear mis primeros packs
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        /* MANAGE SCREEN */
                        <div className="p-5 space-y-4">

                            {/* Quick Templates */}
                            {packs.length === 0 && (
                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="w-4 h-4 text-amber-500" />
                                        <span className="text-xs font-black text-amber-700 uppercase tracking-widest">Plantillas Rápidas</span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {DEFAULT_PACKS.map((tmpl, i) => {
                                            const cfg = PACK_TYPE_CONFIG[tmpl.type];
                                            const Icon = cfg.icon;
                                            return (
                                                <button
                                                    key={i}
                                                    onClick={() => handleQuickAdd(tmpl)}
                                                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-100 hover:border-amber-300 transition-all group text-left"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${cfg.color}`}>
                                                            <Icon className="w-3.5 h-3.5 text-white" />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-black text-gray-900">{tmpl.label}</div>
                                                            <div className="text-[10px] text-gray-500">{tmpl.description}</div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className="text-amber-600 font-black text-xs">{tmpl.price} 🪙</span>
                                                        <Plus className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Packs list */}
                            {packs.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Tus Packs ({packs.length})</span>
                                    </div>
                                    {packs.map((pack) => {
                                        const cfg = PACK_TYPE_CONFIG[pack.type];
                                        const Icon = cfg.icon;
                                        return (
                                            <div key={pack.id} className={`relative bg-white rounded-2xl border ${cfg.border} p-4 flex items-center gap-3 group hover:shadow-md transition-all`}>
                                                {/* Type indicator */}
                                                <div className={`w-10 h-10 shrink-0 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center shadow-sm relative overflow-hidden`}>
                                                    {pack.preview ? (
                                                        <img src={pack.preview} alt="" className="w-full h-full object-cover absolute inset-0" />
                                                    ) : (
                                                        <Icon className="w-5 h-5 text-white relative z-10" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-black text-gray-900 text-sm truncate">{pack.label}</div>
                                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${cfg.badge}`}>
                                                            {cfg.label}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400 font-bold">
                                                            {pack.type !== 'service' ? `${pack.quantity} ${pack.type === 'photos' ? 'fotos' : 'videos'}` : 'Personalizado'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    <span className="font-black text-rose-600 text-sm">{pack.price} 🪙</span>
                                                    <button
                                                        onClick={() => openAddModal(pack)}
                                                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Camera className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(pack.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Info card */}
                            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                                    Tus packs aparecerán en el menú <strong>🔒 Servicios</strong> del chat. Cuando un cliente compre, recibirás las monedas automáticamente y deberás enviarle el contenido por el chat.
                                </p>
                            </div>

                            {/* Add new pack button */}
                            <button
                                onClick={() => openAddModal()}
                                className="w-full py-3.5 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 font-black text-sm hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Crear nuevo pack
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step === 'manage' && (
                    <div className="p-5 border-t border-gray-100 bg-white shrink-0">
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-5 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveAll}
                                disabled={isSaving}
                                className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-rose-200 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                                ) : (
                                    <><Save className="w-4 h-4" /> Guardar Servicios ({packs.length})</>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ADD/EDIT PACK MODAL */}
            {showAddModal && (
                <div className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
                    <div className="bg-white w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col">

                        <div className="flex justify-center pt-3 pb-1 sm:hidden">
                            <div className="w-10 h-1 bg-gray-200 rounded-full" />
                        </div>

                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-lg font-black text-gray-900">{editingPack ? 'Editar Pack' : 'Nuevo Pack'}</h3>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">Configura los detalles de tu servicio</p>
                            </div>
                            <button
                                onClick={() => { setShowAddModal(false); resetForm(); }}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-5">

                            {/* Type selector */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Tipo de Servicio</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(Object.entries(PACK_TYPE_CONFIG) as [string, typeof PACK_TYPE_CONFIG[keyof typeof PACK_TYPE_CONFIG]][]).map(([key, cfg]) => {
                                        const Icon = cfg.icon;
                                        const isSelected = form.type === key;
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => setForm({ ...form, type: key as any })}
                                                className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${isSelected
                                                    ? `border-transparent bg-gradient-to-br ${cfg.color} text-white shadow-lg`
                                                    : `border-gray-100 ${cfg.bg} hover:border-gray-200`
                                                    }`}
                                            >
                                                <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : cfg.text}`} />
                                                <span className={`text-[9px] font-black text-center leading-tight ${isSelected ? 'text-white' : cfg.text}`}>
                                                    {cfg.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nombre del Pack</label>
                                <input
                                    type="text"
                                    value={form.label}
                                    onChange={e => setForm({ ...form, label: e.target.value })}
                                    placeholder='Ej: "Pack 10 Fotos Exclusivas"'
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all text-sm font-bold placeholder-gray-300"
                                />
                            </div>

                            {/* Quantity (for photos/videos) */}
                            {form.type !== 'service' && (
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                        Cantidad de {form.type === 'photos' ? 'Fotos' : 'Videos'}
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setForm({ ...form, quantity: Math.max(1, form.quantity - 1) })}
                                            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-black text-gray-700 transition-all"
                                        >
                                            -
                                        </button>
                                        <div className="flex-1 text-center">
                                            <div className="text-2xl font-black text-gray-900">{form.quantity}</div>
                                            <div className="text-[10px] text-gray-400">{form.type === 'photos' ? 'fotos' : 'videos'}</div>
                                        </div>
                                        <button
                                            onClick={() => setForm({ ...form, quantity: form.quantity + 1 })}
                                            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-black text-gray-700 transition-all"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Price */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Precio en Monedas 🪙</label>
                                <div className="relative">
                                    <Crown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                                    <input
                                        type="number"
                                        min={1}
                                        value={form.price}
                                        onChange={e => setForm({ ...form, price: Math.max(1, parseInt(e.target.value) || 0) })}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all text-sm font-black"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1.5 ml-1">≈ ${(form.price * 50).toLocaleString()} COP (referencial)</p>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Descripción (opcional)</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder="Describe qué recibirá el cliente..."
                                    rows={2}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-rose-400 outline-none transition-all text-sm resize-none placeholder-gray-300"
                                />
                            </div>

                            {/* Preview upload */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                    {form.type === 'photos' ? 'Vista previa / Muestra' : form.type === 'videos' ? 'Thumbnail del video' : 'Imagen de portada'}
                                    <span className="ml-1 text-gray-300 font-medium normal-case">(opcional)</span>
                                </label>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 hover:border-rose-300 transition-all group"
                                >
                                    {uploadPreview ? (
                                        <div className="aspect-video relative">
                                            <img src={uploadPreview} alt="preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Upload className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-8 flex flex-col items-center gap-2 text-gray-400">
                                            <Upload className="w-6 h-6" />
                                            <span className="text-xs font-bold">Subir imagen de muestra</span>
                                            <span className="text-[10px]">PNG, JPG, GIF hasta 10MB</span>
                                        </div>
                                    )}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,video/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        <div className="p-5 border-t border-gray-100 shrink-0">
                            <button
                                onClick={handleSavePack}
                                disabled={!form.label.trim() || form.price <= 0}
                                className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl font-black shadow-lg shadow-rose-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                {editingPack ? 'Actualizar Pack' : 'Agregar Pack'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
