import { ReactNode } from 'react';
import { Shield, ArrowLeft } from 'lucide-react';

interface InfoPageProps {
    title: string;
    subtitle?: string;
    icon?: ReactNode;
    children: ReactNode;
    onBack: () => void;
}

export function InfoPage({ title, subtitle, icon, children, onBack }: InfoPageProps) {
    return (
        <div className="max-w-4xl mx-auto w-full py-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
                onClick={onBack}
                className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-all mb-6"
            >
                <div className="p-2 bg-white rounded-xl shadow-sm border border-gray-100 group-hover:bg-gray-50 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold">Volver</span>
            </button>

            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                {/* Header Section */}
                <div className="relative p-8 md:p-12 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100 overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] transform translate-x-1/4 -translate-y-1/4">
                        <Shield className="w-64 h-64" />
                    </div>

                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mb-6 shadow-sm border border-rose-100/50">
                            {icon || <Shield className="w-7 h-7" />}
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-2xl">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8 md:p-12 bg-white">
                    <div className="prose prose-rose max-w-none">
                        {children}
                    </div>
                </div>

                {/* Footer Accent */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <Shield className="w-3.5 h-3.5" />
                        SafeConnect Verified Content
                    </div>
                    <p className="text-[10px] font-bold text-gray-300">
                        Última actualización: Febrero 2026
                    </p>
                </div>
            </div>
        </div>
    );
}
