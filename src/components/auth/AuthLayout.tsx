import React from 'react';
import { Shield, CheckCircle, Star, Users } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side: Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white z-10">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-200">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                SafeConnect
              </span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {title}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {subtitle}
            </p>
          </div>

          <div className="mt-8">
            {children}
          </div>
        </div>
      </div>

      {/* Right Side: Visual/Marketing */}
      <div className="hidden lg:block relative flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2029&auto=format&fit=crop"
          alt="Abstract background"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-rose-600/90 to-pink-900/90 backdrop-blur-[2px] flex flex-col justify-center px-12 text-white">
          <div className="max-w-md">
            <h2 className="text-4xl font-bold mb-6">La plataforma más segura del mercado</h2>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Privacidad Total</h3>
                  <p className="text-rose-100">Tus datos están encriptados y protegidos con los estándares más altos.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Perfiles Verificados</h3>
                  <p className="text-rose-100">Cero tolerancia a perfiles falsos. Verificación obligatoria por IA.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Experiencia Premium</h3>
                  <p className="text-rose-100">Diseño exclusivo pensado para la mejor experiencia de usuario.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-1">Comunidad Activa</h3>
                  <p className="text-rose-100">Miles de usuarios reales conectando de forma segura cada día.</p>
                </div>
              </div>
            </div>

            <div className="mt-12 pt-12 border-t border-white/20">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <img 
                      key={i}
                      className="w-10 h-10 rounded-full border-2 border-rose-500"
                      src={`https://i.pravatar.cc/100?img=${i+10}`}
                      alt="User"
                    />
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-bold">+1,500</span> perfiles verificados hoy
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
