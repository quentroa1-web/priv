import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, CheckCircle2, Smartphone, Shield, ArrowLeft, AlertCircle } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { useAuth } from '../../context/AuthContext';

interface RegisterProps {
  onRegister: (role?: string) => void;
  onNavigateToLogin: () => void;
  onBack: () => void;
}

export function Register({ onRegister, onNavigateToLogin, onBack }: RegisterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    age: 0,
    gender: '',
    accountType: 'user',
    website: '' // honeypot field
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.website) {
      // If honeypot field is filled, it's likely a bot
      setLoading(false);
      return;
    }
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    setLoading(true);
    setError(null);
    if (formData.name.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres');
      setLoading(false);
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números');
      setLoading(false);
      return;
    }

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        phone: formData.phone,
        role: formData.accountType === 'provider' ? 'announcer' : 'user',
        age: formData.age,
        gender: formData.gender
      });
      onRegister(formData.accountType === 'provider' ? 'announcer' : 'user' as any);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear la cuenta. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Únete a SafeConnect"
      subtitle="La comunidad más grande de perfiles 100% verificados"
    >
      <div className="space-y-6">
        {/* Progress bar */}
        <div className="flex items-center justify-between relative mb-8">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
          <div className={`absolute top-1/2 left-0 h-0.5 bg-rose-500 -translate-y-1/2 z-0 transition-all duration-500 ${step === 1 ? 'w-0' : 'w-full'}`}></div>

          {[1, 2].map((i) => (
            <div key={i} className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${step >= i ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
              {step > i ? <CheckCircle2 className="w-5 h-5" /> : i}
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-2 text-sm animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {step === 1 ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                  Quiero registrarme como...
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, accountType: 'user' })}
                    className={`py-3 px-4 rounded-2xl border-2 text-sm font-bold transition-all ${formData.accountType === 'user' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}
                  >
                    Usuario
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, accountType: 'provider' })}
                    className={`py-3 px-4 rounded-2xl border-2 text-sm font-bold transition-all ${formData.accountType === 'provider' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'}`}
                  >
                    Anunciante
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Nombre completo o Alias
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-rose-500 text-gray-400">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white transition-all outline-none"
                    placeholder="Tu nombre público"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Correo electrónico
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-rose-500 text-gray-400">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white transition-all outline-none"
                    placeholder="nombre@ejemplo.com"
                  />
                </div>
              </div>

              {/* Honeypot field - hidden from users */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Fecha de Nacimiento y Género
                </label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="relative group">
                    <input
                      type="date"
                      required
                      className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white transition-all outline-none"
                      onChange={(e) => {
                        const birthDate = new Date(e.target.value);
                        const today = new Date();
                        let age = today.getFullYear() - birthDate.getFullYear();
                        const m = today.getMonth() - birthDate.getMonth();
                        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                          age--;
                        }
                        setFormData({ ...formData, age });
                      }}
                    />
                  </div>
                  <div className="relative group">
                    <select
                      required
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white transition-all outline-none appearance-none"
                    >
                      <option value="" disabled>Género</option>
                      <option value="woman">Mujer</option>
                      <option value="man">Hombre</option>
                      <option value="transgender">Trans</option>
                      <option value="gigolo">Gigoló</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Número de teléfono
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-rose-500 text-gray-400">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white transition-all outline-none"
                    placeholder="+34 600 000 000"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 px-1">Enviaremos un código SMS para verificar tu identidad.</p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Contraseña segura
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors group-focus-within:text-rose-500 text-gray-400">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full pl-11 pr-11 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:bg-white transition-all outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center transition-colors text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100 flex gap-3">
                <Shield className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-xs text-rose-800 leading-relaxed">
                  <strong>Seguridad obligatoria:</strong> Para mantener la comunidad segura, todos los perfiles nuevos deben pasar una verificación por IA y biométrica.
                </p>
              </div>
            </>
          )}

          <div className="flex gap-3 pt-2">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 px-4 border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-[0.98]"
              >
                Atrás
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-sm font-bold rounded-2xl shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 active:scale-[0.98] transition-all disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {step === 1 ? 'Siguiente paso' : 'Crear mi cuenta'} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <button
            onClick={onNavigateToLogin}
            className="font-bold text-rose-600 hover:text-rose-700"
          >
            Inicia sesión
          </button>
        </p>

        <button
          onClick={onBack}
          className="w-full flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors py-2"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al inicio
        </button>
      </div>
    </AuthLayout>
  );
}
