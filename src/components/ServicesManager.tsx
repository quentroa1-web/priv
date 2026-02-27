import { useState, useRef, useEffect, useCallback } from 'react';
import {
    X, Plus, Trash2, Image as ImageIcon, Video, Package,
    Crown, Upload, CheckCircle, Sparkles, ShoppingBag,
    ChevronRight, Info, Loader2, Save, Edit2, AlertCircle
} from 'lucide-react';

interface ServicePack {
    id: string;
    label: string;
    price: number;
    type: 'photos' | 'videos' | 'service';
    quantity: number;
    description?: string;
    // previewFiles only lives in component state (not persisted)
    previewFiles?: { url: string; name: string }[];
}

// What gets sent to the API (clean, no blob URLs, no internal ids)
interface SerializedPack {
    label: string;
    price: number;
    type: 'photos' | 'videos' | 'service';
    quantity: number;
    description: string;
}

interface ServicesManagerProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onSave: (packs: SerializedPack[]) => Promise<void>;
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
        emoji: '📸',
    },
    videos: {
        label: 'Pack de Videos',
        icon: Video,
        color: 'from-violet-500 to-purple-600',
        bg: 'bg-violet-50',
        border: 'border-violet-200',
        text: 'text-violet-600',
        badge: 'bg-violet-100 text-violet-700',
        emoji: '🎬',
    },
    service: {
        label: 'Servicio Personalizado',
        icon: Package,
        color: 'from-amber-400 to-orange-500',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-600',
        badge: 'bg-amber-100 text-amber-700',
        emoji: '✨',
    }
} as const;

const DEFAULT_PACKS: Omit<ServicePack, 'id'>[] = [
    { label: 'Pack 5 Fotos', price: 50, type: 'photos', quantity: 5, description: 'Pack de 5 fotos exclusivas' },
    { label: 'Pack 10 Fotos', price: 100, type: 'photos', quantity: 10, description: 'Pack de 10 fotos exclusivas' },
    { label: 'Pack Video 1 min', price: 150, type: 'videos', quantity: 1, description: 'Video exclusivo de 1 minuto' },
];

// SECURITY: Sanitize text inputs — strip HTML/scripts
const sanitizeText = (str: string): string => {
    return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/&(?!lt;|gt;|amp;)/g, '&amp;')
        .trim()
        .slice(0, 200); // hard cap on length
};

// SECURITY: Validate price (positive integer, max 99999 coins)
const validatePrice = (val: number): number => {
    const n = Math.floor(val);
    if (isNaN(n) || n < 1) return 1;
    if (n > 99999) return 99999;
    return n;
};

// SECURITY: Validate quantity (1-100)
const validateQuantity = (val: number): number => {
    const n = Math.floor(val);
    if (isNaN(n) || n < 1) return 1;
    if (n > 100) return 100;
    return n;
};

type PackType = 'photos' | 'videos' | 'service';

interface FormState {
    label: string;
    price: number;
    type: PackType;
    quantity: number;
    description: string;
}

const EMPTY_FORM: FormState = {
    label: '',
    price: 100,
    type: 'photos',
    quantity: 5,
    description: '',
};

export function ServicesManager({ isOpen, onClose, user, onSave }: ServicesManagerProps) {
    const [packs, setPacks] = useState<ServicePack[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [step, setStep] = useState<'intro' | 'manage'>('intro');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingPackId, setEditingPackId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
    // Multiple file previews for the current form
    const [previewFiles, setPreviewFiles] = useState<{ url: string; name: string }[]>([]);
    const [formError, setFormError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Track all blob URLs created so we can revoke them on unmount (memory leak fix)
    const blobUrlsRef = useRef<string[]>([]);

    // Cleanup blob URLs on unmount
    useEffect(() => {
        return () => {
            blobUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
        };
    }, []);

    // Load user's current packs on open
    useEffect(() => {
        if (isOpen && user) {
            const existing: ServicePack[] = (user.priceList || []).map((p: any, i: number) => ({
                id: `pack-loaded-${i}`,
                label: String(p.label || '').slice(0, 200),
                price: validatePrice(Number(p.price) || 1),
                type: (['photos', 'videos', 'service'].includes(p.type) ? p.type : 'service') as ServicePack['type'],
                quantity: validateQuantity(Number(p.quantity) || 1),
                description: String(p.description || '').slice(0, 200),
                previewFiles: [], // Don't restore blob URLs — they're temporary
            }));
            setPacks(existing);
            setStep(existing.length > 0 ? 'manage' : 'intro');
            setSaveError(null);
            setSaveSuccess(false);
        }
    }, [isOpen, user]);

    const revokePreviews = useCallback((files: { url: string }[]) => {
        files.forEach(f => {
            URL.revokeObjectURL(f.url);
            blobUrlsRef.current = blobUrlsRef.current.filter(u => u !== f.url);
        });
    }, []);

    // Handle multi-file selection — respect the quantity field
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const maxFiles = form.type === 'service' ? 1 : form.quantity;
        const allowed = files.slice(0, maxFiles);

        // Revoke old previews before creating new ones
        revokePreviews(previewFiles);

        const newPreviews = allowed.map(file => {
            const url = URL.createObjectURL(file);
            blobUrlsRef.current.push(url);
            return { url, name: file.name };
        });
        setPreviewFiles(newPreviews);

        // Reset value so same file can be re-selected
        e.target.value = '';
    };

    const removePreview = (index: number) => {
        const removed = previewFiles[index];
        if (removed) {
            URL.revokeObjectURL(removed.url);
            blobUrlsRef.current = blobUrlsRef.current.filter(u => u !== removed.url);
        }
        setPreviewFiles(prev => prev.filter((_, i) => i !== index));
    };

    const resetForm = () => {
        revokePreviews(previewFiles);
        setPreviewFiles([]);
        setForm({ ...EMPTY_FORM });
        setEditingPackId(null);
        setFormError(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const openAddModal = (pack?: ServicePack) => {
        resetForm();
        if (pack) {
            setEditingPackId(pack.id);
            setForm({
                label: pack.label,
                price: pack.price,
                type: pack.type,
                quantity: pack.quantity,
                description: pack.description || '',
            });
            setPreviewFiles(pack.previewFiles || []);
        }
        setShowAddModal(true);
    };

    const closeAddModal = () => {
        setShowAddModal(false);
        resetForm();
    };

    const handleSavePack = () => {
        setFormError(null);
        const cleanLabel = sanitizeText(form.label);
        const cleanDesc = sanitizeText(form.description);

        // Validation
        if (!cleanLabel) { setFormError('El nombre del pack es obligatorio'); return; }
        if (cleanLabel.length < 3) { setFormError('El nombre debe tener al menos 3 caracteres'); return; }
        const price = validatePrice(form.price);
        const quantity = form.type === 'service' ? 1 : validateQuantity(form.quantity);

        const newPack: ServicePack = {
            id: editingPackId || `pack-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            label: cleanLabel,
            price,
            type: form.type,
            quantity,
            description: cleanDesc,
            previewFiles: previewFiles, // store temp previews in memory only
        };

        if (editingPackId) {
            setPacks(prev => prev.map(p => p.id === editingPackId ? newPack : p));
        } else {
            // SECURITY: cap total number of packs at 20
            if (packs.length >= 20) {
                setFormError('Máximo 20 packs permitidos');
                return;
            }
            setPacks(prev => [...prev, newPack]);
        }

        setShowAddModal(false);
        resetForm();
    };

    const handleDelete = (id: string) => {
        const pack = packs.find(p => p.id === id);
        if (pack?.previewFiles) revokePreviews(pack.previewFiles);
        setPacks(prev => prev.filter(p => p.id !== id));
    };

    const handleQuickAdd = (template: Omit<ServicePack, 'id'>) => {
        if (packs.length >= 20) return;
        setPacks(prev => [...prev, {
            ...template,
            id: `pack-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            previewFiles: []
        }]);
    };

    const handleSaveAll = async () => {
        if (isSaving) return;
        setSaveError(null);
        setSaveSuccess(false);
        try {
            setIsSaving(true);
            // SECURITY: Serialize cleanly — strip id, previewFiles (blob URLs), never send client-side internals
            const serialized: SerializedPack[] = packs.map(({ label, price, type, quantity, description }) => ({
                label: sanitizeText(label),
                price: validatePrice(price),
                type,
                quantity: type === 'service' ? 1 : validateQuantity(quantity),
                description: sanitizeText(description || ''),
            }));
            await onSave(serialized);
            setSaveSuccess(true);
            setTimeout(() => {
                onClose();
            }, 800);
        } catch (err: any) {
            setSaveError(err?.response?.data?.error || 'Error al guardar los servicios. Inténtalo de nuevo.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    const totalRevenuePotential = packs.reduce((sum, p) => sum + p.price, 0);
    const editingPack = editingPackId ? packs.find(p => p.id === editingPackId) : null;
    const maxFilesForType = form.type === 'service' ? 1 : form.quantity;
    const remainingSlots = maxFilesForType - previewFiles.length;

    return (
        <div
            className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            role="dialog"
            aria-modal="true"
            aria-label="Gestionar Servicios"
        >
            <div className="bg-white w-full sm:max-w-2xl rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95dvh] sm:max-h-[90vh] relative">

                {/* Mobile drag handle */}
                <div className="flex justify-center pt-3 pb-1 sm:hidden">
                    <div className="w-10 h-1 bg-gray-200 rounded-full" />
                </div>

                {/* ── Header ── */}
                <div className="relative px-6 pt-4 pb-5 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden shrink-0">
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
                            aria-label="Cerrar"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {packs.length > 0 && (
                        <div className="relative z-10 mt-4 grid grid-cols-3 gap-3">
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3">
                                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-0.5">Total Packs</div>
                                <div className="text-2xl font-black text-white">{packs.length}</div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3">
                                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-0.5">Potencial</div>
                                <div className="text-xl font-black text-amber-400">{totalRevenuePotential.toLocaleString()} 🪙</div>
                            </div>
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-3">
                                <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-0.5">Tipos</div>
                                <div className="flex gap-1.5 mt-1.5 flex-wrap">
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

                {/* ── Content ── */}
                <div className="flex-1 overflow-y-auto">
                    {step === 'intro' ? (
                        /* INTRO */
                        <div className="p-6 space-y-5">
                            <div className="text-center pt-2">
                                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-rose-200">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">¿Cómo funcionan los packs?</h3>
                                <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
                                    Crea servicios que tus clientes pueden comprar directamente desde el chat.
                                    Tú fijas el precio, el tipo y la cantidad.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { icon: '💬', title: 'Integrado en el Chat', desc: 'Tus packs aparecen en el menú del chat para que el cliente los compre al instante.' },
                                    { icon: '🔒', title: 'Contenido bajo llave', desc: 'El cliente paga primero con monedas y luego tú le envías el contenido por chat.' },
                                    { icon: '🪙', title: 'Cobro Automático', desc: 'Las monedas se transfieren a tu billetera de forma instantánea y segura.' },
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
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Tipos disponibles</div>
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
                        /* MANAGE */
                        <div className="p-5 space-y-4">

                            {/* Quick templates */}
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
                                                    className="flex items-center justify-between p-3 bg-white rounded-xl border border-amber-100 hover:border-amber-300 transition-all group text-left active:scale-[0.98]"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className={`p-1.5 rounded-lg bg-gradient-to-br ${cfg.color}`}>
                                                            <Icon className="w-3.5 h-3.5 text-white" />
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-black text-gray-900">{tmpl.label}</div>
                                                            <div className="text-[10px] text-gray-500">{tmpl.quantity} {tmpl.type === 'photos' ? 'fotos' : 'videos'} · {tmpl.price} 🪙</div>
                                                        </div>
                                                    </div>
                                                    <Plus className="w-4 h-4 text-gray-400 group-hover:text-amber-500 transition-colors" />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Pack list */}
                            {packs.length > 0 && (
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Tus Packs ({packs.length}/20)</span>
                                    </div>
                                    {packs.map((pack) => {
                                        const cfg = PACK_TYPE_CONFIG[pack.type];
                                        const Icon = cfg.icon;
                                        const firstPreview = pack.previewFiles?.[0];
                                        return (
                                            <div
                                                key={pack.id}
                                                className={`relative bg-white rounded-2xl border ${cfg.border} p-4 flex items-center gap-3 group hover:shadow-md transition-all`}
                                            >
                                                <div className={`w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br ${cfg.color} flex items-center justify-center shadow-sm overflow-hidden relative`}>
                                                    {firstPreview ? (
                                                        <img src={firstPreview.url} alt="" className="w-full h-full object-cover absolute inset-0" />
                                                    ) : (
                                                        <Icon className="w-5 h-5 text-white" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-black text-gray-900 text-sm truncate">{pack.label}</div>
                                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${cfg.badge}`}>
                                                            {cfg.emoji} {cfg.label}
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
                                                        className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                                        aria-label="Editar pack"
                                                        title="Editar"
                                                    >
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(pack.id)}
                                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                        aria-label="Eliminar pack"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Info */}
                            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                                    Tus packs aparecerán en el menú <strong>🔒 Servicios</strong> del chat. Cuando un cliente compre, recibirás las monedas automáticamente y deberás enviarle el contenido por el chat.
                                </p>
                            </div>

                            {/* Add new */}
                            {packs.length < 20 && (
                                <button
                                    onClick={() => openAddModal()}
                                    className="w-full py-3.5 border-2 border-dashed border-gray-200 rounded-2xl text-gray-500 font-black text-sm hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                >
                                    <Plus className="w-5 h-5" />
                                    Crear nuevo pack
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                {step === 'manage' && (
                    <div className="p-5 border-t border-gray-100 bg-white shrink-0 space-y-2">
                        {saveError && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {saveError}
                            </div>
                        )}
                        {saveSuccess && (
                            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 font-bold">
                                <CheckCircle className="w-4 h-4 shrink-0" />
                                ¡Guardado correctamente!
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="px-5 py-3 bg-gray-100 text-gray-700 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveAll}
                                disabled={isSaving || saveSuccess}
                                className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-rose-200 hover:shadow-xl transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                                ) : saveSuccess ? (
                                    <><CheckCircle className="w-4 h-4" /> ¡Listo!</>
                                ) : (
                                    <><Save className="w-4 h-4" /> Guardar Servicios ({packs.length})</>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ══ ADD / EDIT PACK MODAL ══ */}
            {showAddModal && (
                <div
                    className="fixed inset-0 z-[400] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
                    onClick={(e) => { if (e.target === e.currentTarget) closeAddModal(); }}
                    role="dialog"
                    aria-modal="true"
                    aria-label={editingPack ? 'Editar Pack' : 'Crear Pack'}
                >
                    <div className="bg-white w-full sm:max-w-md rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden max-h-[90dvh] flex flex-col">

                        <div className="flex justify-center pt-3 pb-1 sm:hidden">
                            <div className="w-10 h-1 bg-gray-200 rounded-full" />
                        </div>

                        {/* Modal header */}
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-lg font-black text-gray-900">{editingPack ? 'Editar Pack' : 'Nuevo Pack'}</h3>
                                <p className="text-xs text-gray-500 font-medium mt-0.5">Completa los detalles de tu servicio</p>
                            </div>
                            <button
                                onClick={closeAddModal}
                                className="p-2 hover:bg-gray-100 rounded-xl transition-all text-gray-400"
                                aria-label="Cerrar"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-5">

                            {/* Type */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2.5">Tipo de Servicio</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(Object.entries(PACK_TYPE_CONFIG) as [string, typeof PACK_TYPE_CONFIG[keyof typeof PACK_TYPE_CONFIG]][]).map(([key, cfg]) => {
                                        const Icon = cfg.icon;
                                        const isSelected = form.type === key;
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => {
                                                    setForm({ ...form, type: key as ServicePack['type'] });
                                                    // When type changes, clear previews
                                                    revokePreviews(previewFiles);
                                                    setPreviewFiles([]);
                                                }}
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
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nombre del Pack *</label>
                                <input
                                    type="text"
                                    value={form.label}
                                    maxLength={100}
                                    onChange={e => setForm({ ...form, label: e.target.value })}
                                    placeholder='Ej: "Pack 10 Fotos Exclusivas"'
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all text-sm font-bold placeholder-gray-300"
                                />
                                <div className="text-[10px] text-gray-300 text-right mt-1">{form.label.length}/100</div>
                            </div>

                            {/* Quantity — for photos/videos */}
                            {form.type !== 'service' && (
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                        Cantidad de {form.type === 'photos' ? 'Fotos' : 'Videos'} incluidas
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => {
                                                const q = Math.max(1, form.quantity - 1);
                                                setForm({ ...form, quantity: q });
                                                // Trim previews if needed
                                                if (previewFiles.length > q) {
                                                    const toRemove = previewFiles.slice(q);
                                                    revokePreviews(toRemove);
                                                    setPreviewFiles(prev => prev.slice(0, q));
                                                }
                                            }}
                                            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-black text-gray-700 transition-all text-xl"
                                        >
                                            −
                                        </button>
                                        <div className="flex-1 text-center">
                                            <div className="text-2xl font-black text-gray-900">{form.quantity}</div>
                                            <div className="text-[10px] text-gray-400">{form.type === 'photos' ? 'fotos' : 'videos'}</div>
                                        </div>
                                        <button
                                            onClick={() => setForm({ ...form, quantity: Math.min(100, form.quantity + 1) })}
                                            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-black text-gray-700 transition-all text-xl"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Price */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Precio 🪙 *</label>
                                <div className="relative">
                                    <Crown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                                    <input
                                        type="number"
                                        min={1}
                                        max={99999}
                                        value={form.price}
                                        onChange={e => setForm({ ...form, price: validatePrice(parseInt(e.target.value) || 1) })}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all text-sm font-black"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1.5 ml-1">≈ ${(form.price * 50).toLocaleString()} COP · máx 99.999 🪙</p>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Descripción (opcional)</label>
                                <textarea
                                    value={form.description}
                                    maxLength={200}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    placeholder="Describe qué recibirá el cliente al comprar este pack..."
                                    rows={2}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-rose-400 outline-none transition-all text-sm resize-none placeholder-gray-300"
                                />
                                <div className="text-[10px] text-gray-300 text-right">{form.description.length}/200</div>
                            </div>

                            {/* ── MULTI-FILE UPLOAD ── */}
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                                    {form.type === 'photos'
                                        ? `Subir hasta ${maxFilesForType} fotos de muestra`
                                        : form.type === 'videos'
                                            ? `Subir hasta ${maxFilesForType} videos de muestra`
                                            : 'Imagen de portada (opcional)'}
                                    <span className="ml-1 text-gray-300 font-medium normal-case">(opcional · solo tú las ves)</span>
                                </label>
                                <p className="text-[10px] text-gray-400 mb-3">
                                    {form.type !== 'service'
                                        ? `Puedes subir hasta ${maxFilesForType} ${form.type === 'photos' ? 'fotos' : 'videos'} para recordarte cuáles enviarás al cliente. No se publican.`
                                        : 'Imagen de referencia interna.'}
                                </p>

                                {/* Preview grid */}
                                {previewFiles.length > 0 && (
                                    <div className={`grid gap-2 mb-3 ${previewFiles.length === 1 ? 'grid-cols-1' : 'grid-cols-3'}`}>
                                        {previewFiles.map((f, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 group bg-gray-50">
                                                {f.name.match(/\.(mp4|webm|mov|avi)$/i) ? (
                                                    <video src={f.url} className="w-full h-full object-cover" muted />
                                                ) : (
                                                    <img src={f.url} alt={f.name} className="w-full h-full object-cover" />
                                                )}
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        onClick={() => removePreview(idx)}
                                                        className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"
                                                        aria-label="Eliminar esta vista previa"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="absolute bottom-1 left-1 right-1 text-[8px] text-white bg-black/50 rounded px-1 py-0.5 truncate">
                                                    {f.name}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Upload button — only show if still have room */}
                                {remainingSlots > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 hover:border-rose-300 transition-all group active:scale-[0.98]"
                                    >
                                        <div className="py-6 flex flex-col items-center gap-2 text-gray-400">
                                            <Upload className="w-6 h-6 group-hover:text-rose-400 transition-colors" />
                                            <span className="text-xs font-bold group-hover:text-rose-500 transition-colors">
                                                {previewFiles.length > 0
                                                    ? `+ Agregar más (quedan ${remainingSlots} slots)`
                                                    : form.type === 'photos'
                                                        ? `Subir muestras (hasta ${maxFilesForType} fotos)`
                                                        : form.type === 'videos'
                                                            ? `Subir muestras (hasta ${maxFilesForType} videos)`
                                                            : 'Subir imagen de portada'}
                                            </span>
                                            <span className="text-[10px] text-gray-300">PNG, JPG, MP4, WEBM · máx 50MB cada uno</span>
                                        </div>
                                    </button>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept={form.type === 'videos' ? 'video/*,image/*' : 'image/*'}
                                    multiple={form.type !== 'service' && maxFilesForType > 1}
                                    className="hidden"
                                    onChange={handleFileChange}
                                    aria-label="Seleccionar archivos de muestra"
                                />
                            </div>

                            {/* Form error */}
                            {formError && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {formError}
                                </div>
                            )}
                        </div>

                        {/* Modal footer */}
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
