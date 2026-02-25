import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, ArrowRight, User, MapPin, DollarSign, Camera, Eye,
  CheckCircle, Shield, Star, Clock, Phone, MessageCircle,
  Sparkles, Crown, X, Plus, Trash2, GripVertical, AlertCircle,
  Calendar, Globe, Heart, Loader2
} from 'lucide-react';
import COLOMBIA_LOCATIONS from '../data/colombiaLocations';
import { User as UserType } from '../types';
import { createAd as createAdApi, updateAd, uploadImages } from '../services/api';
import { cn } from '../utils/cn';

interface CreateAdProps {
  onBack: () => void;
  onPublish: () => void;
  currentUser?: UserType | null;
  editingAd?: any | null;
}

interface AdFormData {
  // Step 1: Personal Info
  displayName: string;
  gender: string;
  age: number;
  phone: string;
  whatsapp: string;
  email: string;
  languages: string[];
  bio: string;

  // Step 2: Location
  departamento: string;
  ciudad: string;
  barrio: string;
  zonaEspecifica: string;
  atencionEn: string[];

  // Step 3: Services & Prices
  services: string[];
  customServices: string[];
  price: string;
  priceType: 'hour' | 'session' | 'negotiable';
  availability: string[];
  horarioInicio: string;
  horarioFin: string;
  atencionA: string[];

  // Step 4: Photos
  photos: string[];

  // Step 5: Premium
  planType: 'free' | 'premium' | 'vip';

  // UI Helpers
  phoneCountry: string;
  whatsappCountry: string;
}

const AVAILABLE_SERVICES = [
  'Masajes relajantes', 'Masajes tántricos', 'Masajes eróticos',
  'Acompañamiento', 'Cenas/Eventos', 'Videollamadas',
  'Contenido exclusivo', 'Shows privados', 'Baile privado',
  'Terapia alternativa', 'Spa & Bienestar', 'Fotografía profesional',
  'Dominación', 'Fetiches', 'Juegos de rol',
  'Pareja', 'Trío', 'Despedidas de soltero/a'
];

const LANGUAGES = ['Español', 'Inglés', 'Francés', 'Portugués', 'Italiano', 'Alemán', 'Otro'];

const DAYS = [
  { id: 'lun', label: 'Lun' },
  { id: 'mar', label: 'Mar' },
  { id: 'mie', label: 'Mié' },
  { id: 'jue', label: 'Jue' },
  { id: 'vie', label: 'Vie' },
  { id: 'sab', label: 'Sáb' },
  { id: 'dom', label: 'Dom' },
];

const ATENCION_A = ['Hombres', 'Mujeres', 'Parejas', 'Todos'];

const SERVICE_LOCATIONS = [
  'Mi propio apartamento',
  'Mi lugar privado',
  'Motel/Hotel',
  'Domicilio',
  'Club/Bar',
  'Escort Club',
  'Salidas locales',
  'Viajes/Tour'
];

const COUNTRIES = [
  { code: '+57', flag: '🇨🇴', name: 'Colombia' },
  { code: '+34', flag: '🇪🇸', name: 'España' },
  { code: '+1', flag: '🇺🇸', name: 'USA' },
  { code: '+52', flag: '🇲🇽', name: 'México' },
  { code: '+58', flag: '🇻🇪', name: 'Venezuela' },
  { code: '+54', flag: '🇦🇷', name: 'Argentina' },
  { code: '+56', flag: '🇨🇱', name: 'Chile' },
  { code: '+51', flag: '🇵🇪', name: 'Perú' },
  { code: '+507', flag: '🇵🇦', name: 'Panamá' },
  { code: '+1', flag: '🇨🇦', name: 'Canadá' },
  { code: '+44', flag: '🇬🇧', name: 'Reino Unido' },
];

const CountrySelector = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCountry = COUNTRIES.find(c => c.code === value) || COUNTRIES[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-full px-3 flex items-center gap-2 bg-gray-50 border-r-2 border-gray-200 hover:bg-gray-100 transition-colors rounded-l-xl"
      >
        <span className="text-lg">{selectedCountry.flag}</span>
        <span className="text-xs font-bold text-gray-700">{selectedCountry.code}</span>
        <ArrowRight className={cn("w-3 h-3 text-gray-400 rotate-90 transition-transform", isOpen && "-rotate-90")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-48 bg-white border-2 border-gray-100 rounded-xl shadow-2xl z-[70] max-h-60 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {COUNTRIES.map(c => (
              <button
                key={`${c.code}-${c.name}`}
                type="button"
                onClick={() => {
                  onChange(c.code);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full px-4 py-2.5 flex items-center gap-3 hover:bg-rose-50 transition-colors text-left",
                  value === c.code && "bg-rose-50 text-rose-600 font-bold"
                )}
              >
                <span className="text-xl">{c.flag}</span>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-black tracking-tighter leading-tight">{c.name}</span>
                  <span className="text-xs font-bold leading-tight">{c.code}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};



export function CreateAd({ onBack, onPublish, currentUser, editingAd }: CreateAdProps) {
  const { t: _t } = useTranslation();
  void _t;
  const [step, setStep] = useState(1);
  const [publishing, setPublishing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [customServiceInput, setCustomServiceInput] = useState('');

  const [formData, setFormData] = useState<AdFormData>({
    displayName: editingAd?.title || currentUser?.displayName || currentUser?.name || '',
    gender: (editingAd?.category === 'woman' ? 'mujer' :
      editingAd?.category === 'man' ? 'hombre' :
        editingAd?.category === 'transgender' ? 'trans' :
          editingAd?.category) || '',
    age: editingAd?.age || 18,
    phone: editingAd?.phone || '',
    whatsapp: editingAd?.whatsapp || '',
    email: currentUser?.email || '',
    languages: [],
    bio: editingAd?.description || '',
    departamento: '',
    ciudad: '',
    barrio: '',
    zonaEspecifica: editingAd?.location?.specificZone || '',
    atencionEn: editingAd?.location?.placeType ? [editingAd.location.placeType] : [],
    services: editingAd?.services || [],
    customServices: editingAd?.customServices || [],
    price: editingAd?.pricing?.basePrice?.toString() || '',
    priceType: editingAd?.pricing?.priceType === 'hora' ? 'hour' :
      editingAd?.pricing?.priceType === 'sesion' ? 'session' : 'negotiable',
    availability: editingAd?.availability?.days || [],
    horarioInicio: editingAd?.availability?.hours?.start || '08:00',
    horarioFin: editingAd?.availability?.hours?.end || '22:00',
    atencionA: editingAd?.attendsTo || [],
    photos: editingAd?.photos?.map((p: any) => p.url) || [],
    planType: editingAd?.plan === 'gratis' ? 'free' : (editingAd?.plan || 'free'),
    phoneCountry: '+57',
    whatsappCountry: '+57'
  });

  // Effect to initialize location if editing
  useEffect(() => {
    if (editingAd && editingAd.location) {
      const dept = COLOMBIA_LOCATIONS.find(d => d.name === editingAd.location.department);
      if (dept) {
        updateField('departamento', dept.id);
        // Wait for state update is not possible here directly, but we can find city
        const city = dept.ciudades.find(c => c.name === editingAd.location.city);
        if (city) {
          updateField('ciudad', city.id);
          if (city.barrios) {
            const barrio = city.barrios.find(b => b.name === editingAd.location.neighborhood);
            if (barrio) {
              updateField('barrio', barrio.id);
            }
          }
        }
      }
    }
  }, [editingAd]);

  const totalSteps = 5;
  const maxPhotos = currentUser?.premiumPlan === 'diamond' ? 10 : (currentUser?.premiumPlan === 'gold' ? 6 : 3);
  const currentAdCount = (currentUser as any)?.adCount || 0;
  const adLimit = currentUser?.premiumPlan === 'diamond' ? 3 : (currentUser?.premiumPlan === 'gold' ? 2 : 1);
  const reachedLimit = !editingAd && currentAdCount >= adLimit;

  // Location cascading
  const ciudadesDisponibles = formData.departamento
    ? COLOMBIA_LOCATIONS.find(d => d.id === formData.departamento)?.ciudades || []
    : [];

  const barriosDisponibles = formData.ciudad
    ? ciudadesDisponibles.find(c => c.id === formData.ciudad)?.barrios || []
    : [];

  const updateField = (field: keyof AdFormData, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'departamento') {
        updated.ciudad = '';
        updated.barrio = '';
        updated.zonaEspecifica = '';
      }
      if (field === 'ciudad') {
        updated.barrio = '';
        updated.zonaEspecifica = '';
      }
      return updated;
    });
  };

  const toggleArrayItem = (field: keyof AdFormData, item: string) => {
    setFormData(prev => {
      const arr = (prev[field] as string[]) || [];
      const exists = arr.includes(item);
      return {
        ...prev,
        [field]: exists ? arr.filter(i => i !== item) : [...arr, item]
      };
    });
  };

  const addCustomService = () => {
    if (customServiceInput.trim() && !formData.customServices.includes(customServiceInput.trim())) {
      setFormData(prev => ({
        ...prev,
        customServices: [...prev.customServices, customServiceInput.trim()]
      }));
      setCustomServiceInput('');
    }
  };

  const removeCustomService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      customServices: prev.customServices.filter(s => s !== service)
    }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxPhotos - formData.photos.length;
    if (remainingSlots <= 0) {
      setError(`Has alcanzado el límite de ${maxPhotos} fotos para tu plan.`);
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    const uploadData = new FormData();
    filesToUpload.forEach(file => {
      uploadData.append('images', file);
    });

    try {
      setUploadingPhotos(true);
      setError(null);
      const res = await uploadImages(uploadData);

      if (res.data.success) {
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, ...res.data.urls]
        }));
      }
    } catch (err: any) {
      console.error('Error uploading photos:', err);
      setError('Error al subir las imágenes. Intenta con archivos más pequeños o de otro formato.');
    } finally {
      setUploadingPhotos(false);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  const triggerPhotoUpload = () => {
    if (photoInputRef.current) {
      photoInputRef.current.click();
    }
  };

  const removePhoto = (index: number) => {
    updateField('photos', formData.photos.filter((_, i) => i !== index));
  };

  const getLocationString = () => {
    const parts: string[] = [];
    if (formData.departamento) {
      const d = COLOMBIA_LOCATIONS.find(d => d.id === formData.departamento);
      if (d) parts.push(d.name);
    }
    if (formData.ciudad) {
      const c = ciudadesDisponibles.find(c => c.id === formData.ciudad);
      if (c) parts.push(c.name);
    }
    if (formData.barrio) {
      const b = barriosDisponibles.find(b => b.id === formData.barrio);
      if (b) parts.push(b.name);
    }
    return parts.join(', ') || 'Sin ubicación';
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.displayName.trim() && formData.gender && formData.age >= 18 && formData.bio.trim().length >= 20;
      case 2:
        return formData.departamento && formData.ciudad && formData.atencionEn.length > 0;
      case 3:
        return (formData.services.length > 0 || formData.customServices.length > 0) && formData.price;
      case 4:
        return formData.photos.length >= 1;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setError(null);
    try {
      // Map names for location
      const deptName = COLOMBIA_LOCATIONS.find(d => d.id === formData.departamento)?.name || '';
      const cityName = ciudadesDisponibles.find(c => c.id === formData.ciudad)?.name || '';
      const barrioName = barriosDisponibles.find(b => b.id === formData.barrio)?.name || '';

      const adData = {
        title: formData.displayName,
        description: formData.bio,
        category: formData.gender,
        age: formData.age,
        phone: formData.phoneCountry + ' ' + formData.phone.replace(/\D/g, ''),
        whatsapp: formData.whatsappCountry + ' ' + formData.whatsapp.replace(/\D/g, ''),
        location: {
          department: deptName,
          city: cityName,
          neighborhood: barrioName,
          specificZone: formData.zonaEspecifica,
          placeType: formData.atencionEn,
        },
        services: formData.services,
        customServices: formData.customServices,
        pricing: {
          basePrice: parseInt(formData.price.replace(/[^\d]/g, '')) || 0,
          priceType: formData.priceType === 'hour' ? 'hora' :
            formData.priceType === 'session' ? 'sesion' : 'negociable'
        },
        attendsTo: formData.atencionA.map(a => a.toLowerCase() as any),
        availability: {
          days: formData.availability.map(d => {
            const map: any = { 'Lun': 'lunes', 'Mar': 'martes', 'Mié': 'miercoles', 'Jue': 'jueves', 'Vie': 'viernes', 'Sáb': 'sabado', 'Dom': 'domingo' };
            return map[d] || d.toLowerCase();
          }),
          hours: {
            start: formData.horarioInicio,
            end: formData.horarioFin
          }
        },
        photos: formData.photos.map((p, i) => ({ url: p, isMain: i === 0 })),
        plan: formData.planType === 'free' ? 'gratis' : formData.planType
      };

      if (editingAd) {
        await updateAd(editingAd._id || editingAd.id, adData);
      } else {
        await createAdApi(adData);
      }
      onPublish();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al publicar el anuncio. Verifica los datos.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setPublishing(false);
    }
  };

  // ─── STEP COMPONENTS ────────────────────────────────────────────────

  const renderStep1 = () => (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3">
        <User className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Información Personal</h3>
          <p className="text-xs text-gray-600 mt-0.5">Estos datos se mostrarán en tu perfil público. Usa un alias si prefieres.</p>
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-1.5">
          Nombre artístico / Alias <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={formData.displayName}
          onChange={e => updateField('displayName', e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all text-sm"
          placeholder="Ej: Valentina M."
        />
      </div>

      {/* Gender */}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          Categoría <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { value: 'mujer', label: 'Mujer', icon: '👩' },
            { value: 'hombre', label: 'Hombre', icon: '👨' },
            { value: 'trans', label: 'Trans', icon: '⚧️' },
            { value: 'gigolo', label: 'Gigoló', icon: '🕺' },
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateField('gender', opt.value)}
              className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all flex items-center justify-center gap-2 ${formData.gender === opt.value
                ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-md shadow-rose-100'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                } `}
            >
              <span className="text-lg">{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Age */}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-1.5">
          Edad <span className="text-rose-500">*</span>
        </label>
        <input
          type="number"
          min={18}
          max={70}
          value={formData.age || ''}
          onChange={e => updateField('age', parseInt(e.target.value) || 0)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all text-sm"
          placeholder="Mínimo 18 años"
        />
        {formData.age > 0 && formData.age < 18 && (
          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Debes ser mayor de 18 años
          </p>
        )}
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-rose-500" /> Teléfono Público
          </label>
          <div className="flex h-[52px] border-2 border-gray-200 rounded-xl focus-within:border-rose-500 transition-all bg-white relative">
            <CountrySelector
              value={formData.phoneCountry}
              onChange={val => updateField('phoneCountry', val)}
            />
            <input
              type="tel"
              value={formData.phone}
              onChange={e => updateField('phone', e.target.value)}
              className="flex-1 px-4 py-3 outline-none text-sm bg-transparent font-medium"
              placeholder="300 123 4567"
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1 font-medium italic">Este número será visible para todos.</p>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1.5 flex items-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-green-500" /> WhatsApp
          </label>
          <div className="flex h-[52px] border-2 border-gray-200 rounded-xl focus-within:border-green-500 transition-all bg-white relative">
            <CountrySelector
              value={formData.whatsappCountry}
              onChange={val => updateField('whatsappCountry', val)}
            />
            <input
              type="tel"
              value={formData.whatsapp}
              onChange={e => updateField('whatsapp', e.target.value)}
              className="flex-1 px-4 py-3 outline-none text-sm bg-transparent font-medium"
              placeholder="300 123 4567"
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1 font-medium italic">Se abrirá chat directo al pulsar.</p>
        </div>
      </div>

      {/* Languages */}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5" /> Idiomas
        </label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(lang => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleArrayItem('languages', lang)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 ${formData.languages.includes(lang)
                ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-100'
                : 'bg-white text-gray-600 border-gray-100 hover:border-rose-200 hover:text-rose-500'
                }`}
            >
              <div className="flex items-center gap-2">
                {formData.languages.includes(lang) && <CheckCircle className="w-3 h-3" />}
                {lang}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-1.5">
          Descripción / Bio <span className="text-rose-500">*</span>
        </label>
        <textarea
          value={formData.bio}
          onChange={e => updateField('bio', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all text-sm resize-none"
          placeholder="Describe tu perfil, experiencia y lo que ofreces... (mínimo 20 caracteres)"
        />
        <div className="flex justify-between mt-1">
          <p className={`text-xs ${formData.bio.length >= 20 ? 'text-green-600' : 'text-gray-400'} `}>
            {formData.bio.length >= 20 ? '✓ Longitud correcta' : `Mínimo 20 caracteres (${formData.bio.length} / 20)`}
          </p>
          <p className="text-xs text-gray-400">{formData.bio.length}/500</p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
        <MapPin className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Ubicación del Servicio</h3>
          <p className="text-xs text-gray-600 mt-0.5">Indica dónde ofreces tus servicios. No se mostrará tu dirección exacta.</p>
        </div>
      </div>

      {/* Departamento */}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-1.5 flex items-center justify-between">
          <span>Departamento <span className="text-rose-500">*</span></span>
          {formData.departamento && <span className="text-[10px] text-green-600 font-black uppercase">Seleccionado</span>}
        </label>
        <div className="relative group">
          <select
            value={formData.departamento}
            onChange={e => updateField('departamento', e.target.value)}
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-2xl focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all text-sm bg-white cursor-pointer appearance-none shadow-sm group-hover:border-gray-300 font-medium"
          >
            <option value="">Seleccionar departamento...</option>
            {COLOMBIA_LOCATIONS.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-rose-500 transition-colors">
            <ArrowRight className="w-4 h-4 rotate-90" />
          </div>
        </div>
      </div>

      {/* Ciudad */}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-1.5 flex items-center justify-between">
          <span>Ciudad <span className="text-rose-500">*</span></span>
          {formData.ciudad && <span className="text-[10px] text-green-600 font-black uppercase">Seleccionado</span>}
        </label>
        <div className="relative group">
          <select
            value={formData.ciudad}
            onChange={e => updateField('ciudad', e.target.value)}
            disabled={!formData.departamento}
            className={`w-full px-4 py-3.5 border-2 rounded-2xl focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all text-sm bg-white appearance-none shadow-sm font-medium ${!formData.departamento
              ? 'border-gray-100 text-gray-300 cursor-not-allowed'
              : 'border-gray-200 cursor-pointer group-hover:border-gray-300'
              }`}
          >
            <option value="">{formData.departamento ? 'Seleccionar ciudad...' : 'Primero selecciona departamento'}</option>
            {ciudadesDisponibles.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <ArrowRight className="w-4 h-4 rotate-90" />
          </div>
        </div>
      </div>

      {/* Barrio */}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-1.5 flex items-center justify-between">
          <span>Barrio / Zona</span>
          {formData.barrio && <span className="text-[10px] text-green-600 font-black uppercase">Seleccionado</span>}
        </label>
        <div className="relative group">
          <select
            value={formData.barrio}
            onChange={e => updateField('barrio', e.target.value)}
            disabled={!formData.ciudad}
            className={`w-full px-4 py-3.5 border-2 rounded-2xl focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all text-sm bg-white appearance-none shadow-sm font-medium ${!formData.ciudad
              ? 'border-gray-100 text-gray-300 cursor-not-allowed'
              : 'border-gray-200 cursor-pointer group-hover:border-gray-300'
              }`}
          >
            <option value="">{formData.ciudad ? 'Seleccionar barrio...' : 'Primero selecciona ciudad'}</option>
            {barriosDisponibles.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <ArrowRight className="w-4 h-4 rotate-90" />
          </div>
        </div>
      </div>

      {/* Zona Específica */}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-1.5">
          Referencia / Zona específica
        </label>
        <input
          type="text"
          value={formData.zonaEspecifica}
          onChange={e => updateField('zonaEspecifica', e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all text-sm"
          placeholder="Ej: Cerca al centro comercial Gran Estación..."
        />
      </div>

      {/* Location Preview */}
      {formData.departamento && formData.ciudad && (
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Tu ubicación se verá así:</p>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
            <MapPin className="w-4 h-4 text-rose-500" />
            {getLocationString()}
          </div>
        </div>
      )}

      {/* Lugares de atención */}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          Lugares de atención <span className="text-rose-500">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {SERVICE_LOCATIONS.map(loc => (
            <button
              key={loc}
              type="button"
              onClick={() => toggleArrayItem('atencionEn', loc)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all border-2 ${formData.atencionEn.includes(loc)
                ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-100 scale-105'
                : 'bg-white text-gray-600 border-gray-100 hover:border-rose-200 hover:text-rose-500'
                }`}
            >
              <div className="flex items-center gap-2">
                {formData.atencionEn.includes(loc) && <CheckCircle className="w-3.5 h-3.5" />}
                {loc}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-4 flex items-start gap-3">
        <DollarSign className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Servicios y Tarifas</h3>
          <p className="text-xs text-gray-600 mt-0.5">Selecciona los servicios que ofreces y establece tus precios.</p>
        </div>
      </div>

      {/* Services */}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2">
          Servicios que ofreces <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AVAILABLE_SERVICES.map(service => (
            <button
              key={service}
              type="button"
              onClick={() => toggleArrayItem('services', service)}
              className={`px-3 py-3 rounded-2xl text-xs font-black transition-all text-left border-2 ${formData.services.includes(service)
                ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-100 scale-[1.02]'
                : 'bg-white text-gray-700 hover:border-rose-200 border-gray-100 hover:text-rose-600'
                }`}
            >
              <div className="flex items-center gap-2">
                {formData.services.includes(service) && <CheckCircle className="w-3.5 h-3.5" />}
                {service}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Services */}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-1.5">
          Agregar servicio personalizado
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={customServiceInput}
            onChange={e => setCustomServiceInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomService())}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all text-sm"
            placeholder="Ej: Masajes con aceites..."
          />
          <button
            type="button"
            onClick={addCustomService}
            className="px-4 py-3 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        {formData.customServices.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.customServices.map(s => (
              <span key={s} className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
                {s}
                <button type="button" onClick={() => removeCustomService(s)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1.5">
            Tarifa base <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-500 font-bold">$</span>
            <input
              type="text"
              value={formData.price}
              onChange={e => updateField('price', e.target.value)}
              className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all text-sm"
              placeholder="150.000"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-800 mb-1.5 focus-within:text-rose-500 transition-colors">
            Tipo de tarifa
          </label>
          <div className="relative group">
            <select
              value={formData.priceType}
              onChange={e => updateField('priceType', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all text-sm bg-white cursor-pointer appearance-none font-medium group-hover:border-gray-300 shadow-sm"
            >
              <option value="hour">Por hora</option>
              <option value="session">Por sesión</option>
              <option value="negotiable">Negociable</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-rose-500 transition-colors">
              <ArrowRight className="w-4 h-4 rotate-90" />
            </div>
          </div>
        </div>
      </div>

      {/* Atencion A */}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5" /> Atiendo a
        </label>
        <div className="flex flex-wrap gap-2">
          {ATENCION_A.map(item => (
            <button
              key={item}
              type="button"
              onClick={() => toggleArrayItem('atencionA', item)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all border-2 ${formData.atencionA.includes(item)
                ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-100'
                : 'bg-white text-gray-600 border-gray-100 hover:border-rose-200 hover:text-rose-500'
                }`}
            >
              <div className="flex items-center gap-2">
                {formData.atencionA.includes(item) && <CheckCircle className="w-3 h-3" />}
                {item}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" /> Disponibilidad
        </label>
        <div className="flex flex-wrap gap-2 mb-3">
          {DAYS.map(day => (
            <button
              key={day.id}
              type="button"
              onClick={() => toggleArrayItem('availability', day.label)}
              className={`w-12 h-12 rounded-2xl text-xs font-black transition-all border-2 ${formData.availability.includes(day.label)
                ? 'bg-green-500 text-white border-green-500 shadow-md shadow-green-100 scale-110'
                : 'bg-white text-gray-600 border-gray-100 hover:border-green-200'
                }`}
            >
              {day.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              <Clock className="w-3 h-3 inline mr-1" /> Hora inicio
            </label>
            <input
              type="time"
              value={formData.horarioInicio}
              onChange={e => updateField('horarioInicio', e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-rose-500 outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              <Clock className="w-3 h-3 inline mr-1" /> Hora fin
            </label>
            <input
              type="time"
              value={formData.horarioFin}
              onChange={e => updateField('horarioFin', e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-rose-500 outline-none text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100 rounded-2xl p-4 flex items-start gap-3">
        <Camera className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Galería de Fotos</h3>
          <p className="text-xs text-gray-600 mt-0.5">Agrega fotos de alta calidad. La primera será tu foto principal. Mínimo 1, máximo {maxPhotos} para tu plan.</p>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {formData.photos.map((photo, index) => (
          <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
            <img src={photo} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-rose-500 text-white px-2 py-0.5 rounded-lg text-[10px] font-bold">
                PRINCIPAL
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newPhotos = [...formData.photos];
                      [newPhotos[0], newPhotos[index]] = [newPhotos[index], newPhotos[0]];
                      updateField('photos', newPhotos);
                    }}
                    className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                    title="Hacer principal"
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add Photo Button or Loader */}
        {formData.photos.length < maxPhotos && (
          <button
            type="button"
            onClick={triggerPhotoUpload}
            disabled={uploadingPhotos}
            className={`aspect-square rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 bg-gray-50 ${uploadingPhotos
              ? 'border-rose-200 text-rose-300'
              : 'border-gray-300 hover:border-rose-400 text-gray-400 hover:text-rose-500 hover:bg-rose-50'
              }`}
          >
            {uploadingPhotos ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Subiendo...</span>
              </>
            ) : (
              <>
                <Plus className="w-8 h-8" />
                <span className="text-xs font-bold">Agregar foto</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Photo Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <h4 className="font-bold text-amber-800 text-xs mb-2 flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4" /> Consejos para mejores fotos
        </h4>
        <ul className="space-y-1 text-xs text-amber-700">
          <li>📸 Usa buena iluminación natural</li>
          <li>🚫 No se permiten fotos con menores ni contenido explícito ilegal</li>
          <li>✅ Las fotos serán verificadas por nuestro equipo</li>
          <li>🔒 Puedes difuminar tu rostro si lo prefieres</li>
        </ul>
      </div>

      <p className="text-center text-xs text-gray-400">
        {formData.photos.length}/{maxPhotos} fotos agregadas
        {formData.photos.length < 1 && <span className="text-rose-500 font-bold ml-1">(Mínimo 1 requerida)</span>}
      </p>
    </div>
  );

  const renderStep5 = () => {
    const isActivePlan = (plan: string) => currentUser?.premiumPlan === plan;

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Plan Header */}
        <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-3xl p-6 flex items-start gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm shrink-0">
            <Crown className="w-8 h-8 text-amber-500" />
          </div>
          <div>
            <h3 className="font-black text-gray-900 text-lg">Beneficios de tu Plan</h3>
            <p className="text-xs text-gray-600 mt-1 font-medium leading-relaxed">
              Hemos detectado tu suscripción activa. Tu anuncio se beneficiará automáticamente de todas las ventajas de tu nivel actual.
            </p>
          </div>
        </div>

        {/* Benefits Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              id: 'free',
              name: 'Gratis',
              emoji: '🆓',
              color: 'gray',
              price: '$0',
              features: ['3 fotos', 'Visibilidad Básica']
            },
            {
              id: 'gold',
              name: 'Gold',
              emoji: '⭐',
              color: 'rose',
              price: '$49.900',
              features: ['6 fotos HD', 'Visibilidad Media']
            },
            {
              id: 'diamond',
              name: 'Diamond',
              emoji: '💎',
              color: 'cyan',
              price: '$99.900',
              features: ['Fotos Ilimitadas', 'Visibilidad Máxima']
            }
          ].map(p => {
            const active = isActivePlan(p.id) || (p.id === 'free' && (!currentUser?.premiumPlan || currentUser?.premiumPlan === 'none'));

            return (
              <div
                key={p.id}
                className={cn(
                  "p-5 rounded-3xl border-2 transition-all duration-500 relative",
                  active
                    ? `border-${p.color}-500 bg-${p.color}-50/30 shadow-xl shadow-${p.color}-100/50 scale-105 z-10`
                    : "border-gray-100 bg-white opacity-40 grayscale"
                )}
              >
                {active && (
                  <div className={cn(
                    "absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg",
                    `bg-${p.color}-500`
                  )}>
                    ACTIVO
                  </div>
                )}
                <div className="text-3xl mb-3">{p.emoji}</div>
                <h3 className={cn("font-black text-sm uppercase tracking-widest", active ? `text-${p.color}-700` : "text-gray-400")}>{p.name}</h3>
                <ul className="mt-4 space-y-2">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                      <div className={cn("w-1 h-1 rounded-full", active ? `bg-${p.color}-500` : "bg-gray-300")} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-3xl p-6 border-2 border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-50 pb-4">
            <h4 className="font-black text-gray-900 text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-rose-500" /> Resumen de Publicación
            </h4>
            <div className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase">
              Todo correcto
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mb-1">Nombre</p>
              <p className="font-bold text-gray-900 text-sm truncate">{formData.displayName || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mb-1">Contacto</p>
              <p className="font-bold text-gray-900 text-sm">{formData.phoneCountry} {formData.phone || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mb-1">Localidad</p>
              <p className="font-bold text-gray-900 text-sm truncate uppercase tracking-tighter">{getLocationString()}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest mb-1">Media</p>
              <p className="font-bold text-gray-900 text-sm">{formData.photos.length} / {maxPhotos} Fotos</p>
            </div>
          </div>
        </div>

        {/* Action Tips */}
        <div className="flex gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100/50">
          <Sparkles className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-rose-700 font-medium leading-relaxed italic">
            <b>Pro tip:</b> Los anuncios con WhatsApp activo y fotos de alta calidad tienen un 80% más de probabilidad de éxito. ¡Asegúrate de que tus datos sean correctos antes de publicar!
          </p>
        </div>
      </div>
    );
  };

  // ─── PREVIEW MODAL ──────────────────────────────────────────────────

  const renderPreview = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowPreview(false)}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="relative">
          <div className="aspect-[3/4] bg-gray-200">
            {formData.photos[0] ? (
              <img src={formData.photos[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <Camera className="w-16 h-16" />
              </div>
            )}
          </div>
          <button onClick={() => setShowPreview(false)} className="absolute top-3 right-3 bg-white/90 rounded-full p-2 shadow-lg">
            <X className="w-5 h-5" />
          </button>
          {formData.planType === 'vip' && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
              <Crown className="w-3 h-3" /> VIP GOLD
            </div>
          )}
          <div className="absolute bottom-3 right-3 bg-white/95 text-rose-600 px-3 py-1 rounded-lg text-sm font-black">
            ${formData.price || '0'}
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-gray-900">
              {formData.displayName || 'Tu nombre'}, {formData.age || '??'}
            </h3>
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star className="w-4 h-4" fill="currentColor" />
              <span className="text-sm font-bold text-gray-900">Nuevo</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="w-4 h-4 text-rose-400" />
            {getLocationString()}
          </div>
          <p className="text-sm text-gray-700">{formData.bio || 'Sin descripción'}</p>
          <div className="flex flex-wrap gap-1.5">
            {[...formData.services, ...formData.customServices].slice(0, 4).map((s, i) => (
              <span key={i} className="px-2 py-1 bg-rose-50 text-rose-600 text-xs font-bold rounded-lg">{s}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── MAIN RENDER ────────────────────────────────────────────────────

  // Check if reached limit
  const isOverLimit = reachedLimit;

  if (isOverLimit) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-3xl p-8 md:p-12 text-center shadow-xl border border-gray-100">
          <div className="mb-8 relative inline-block">
            <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto ring-8 ring-rose-50">
              <Crown className="w-12 h-12 text-rose-500" />
            </div>
            <div className="absolute -right-2 -top-2 w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">¡Límite alcanzado!</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed text-sm font-medium">
            Tu plan <span className="text-rose-600 font-bold uppercase">{currentUser?.premiumPlan || 'Gratuito'}</span> permite un máximo de <span className="font-black text-gray-900">{adLimit}</span> anuncios activos.
            {currentAdCount >= adLimit && (
              <span className="block mt-2 text-rose-500/80 italic text-xs">Ya tienes {currentAdCount} anuncios publicados.</span>
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onBack}
              className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl font-black hover:bg-gray-200 transition-all"
            >
              Volver
            </button>
            <button
              className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl font-black shadow-lg shadow-rose-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group"
            >
              <Crown className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Mejorar a Premium
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-rose-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-bold text-sm transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Volver</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-black text-gray-900 text-lg">Crear Anuncio</h1>
            </div>

            {/* Plan Usage Badge */}
            <div className={cn(
              "hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ml-2",
              reachedLimit
                ? "bg-rose-50 border-rose-200 text-rose-600"
                : "bg-green-50 border-green-200 text-green-600"
            )}>
              <Crown className={cn("w-3 h-3", currentUser?.premiumPlan === 'diamond' ? "text-cyan-500" : (currentUser?.premiumPlan === 'gold' ? "text-amber-500" : "text-gray-400"))} />
              <span>{currentUser?.premiumPlan || 'Gratis'}</span>
              <span className="opacity-30">|</span>
              <span>{currentAdCount}/{adLimit} Usados</span>
            </div>
          </div>
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-bold text-sm transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Preview</span>
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Progress header */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex items-center shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step > i + 1 ? 'bg-green-500 text-white shadow-lg shadow-green-100' :
                  step === i + 1 ? 'bg-rose-500 text-white shadow-xl shadow-rose-200 ring-4 ring-rose-50' :
                    'bg-white border-2 border-gray-200 text-gray-400'
                  }`}
              >
                {step > i + 1 ? <CheckCircle className="w-5 h-5" /> : i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div className={`w-6 sm:w-10 h-0.5 mx-1 transition-colors duration-500 ${step > i + 1 ? 'bg-green-500' : 'bg-gray-100'}`}></div>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-red-700 animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        {/* Step content */}
        <div className="mb-10 animate-fade-in">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
        </div>

        {/* Navigation */}
        <div className="flex gap-4 pt-6 border-t border-gray-100 sticky bottom-0 bg-white/80 backdrop-blur-md pb-4">
          {step > 1 && (
            <button
              type="button"
              onClick={() => { setStep(step - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" /> Anterior
            </button>
          )}

          <button
            type="button"
            disabled={!canProceed() || publishing}
            onClick={() => {
              if (step < totalSteps) {
                setStep(step + 1);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                handlePublish();
              }
            }}
            className={`flex-[2] px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-rose-200 disabled:opacity-50 disabled:shadow-none hover:shadow-xl hover:-translate-y-0.5`}
          >
            {publishing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Publicando...
              </>
            ) : (
              <>
                {step === totalSteps ? (
                  <>
                    <Sparkles className="w-4 h-4" /> Publicar Anuncio
                  </>
                ) : (
                  <>
                    Siguiente Paso <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </>
            )}
          </button>
        </div>

        {/* Security note */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
          <Shield className="w-3.5 h-3.5" />
          <span>Tu anuncio será revisado antes de ser publicado. Datos protegidos con encriptación.</span>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && renderPreview()}
    </div>
  );
}
