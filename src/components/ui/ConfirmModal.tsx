import { AlertCircle, HelpCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info' | 'success';
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'info'
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const variants = {
        danger: {
            icon: <AlertCircle className="w-8 h-8 text-rose-500" />,
            bg: 'bg-rose-50',
            button: 'bg-rose-600 hover:bg-rose-700 shadow-rose-200',
            ring: 'focus:ring-rose-500'
        },
        warning: {
            icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
            bg: 'bg-amber-50',
            button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-200',
            ring: 'focus:ring-amber-500'
        },
        info: {
            icon: <HelpCircle className="w-8 h-8 text-blue-500" />,
            bg: 'bg-blue-50',
            button: 'bg-blue-600 hover:bg-blue-700 shadow-blue-200',
            ring: 'focus:ring-blue-500'
        },
        success: {
            icon: <AlertCircle className="w-8 h-8 text-emerald-500" />,
            bg: 'bg-emerald-50',
            button: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200',
            ring: 'focus:ring-emerald-500'
        }
    };

    const currentVariant = variants[variant];

    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className="bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8">
                    <div className={cn("p-4 rounded-2xl w-fit mb-6", currentVariant.bg)}>
                        {currentVariant.icon}
                    </div>

                    <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
                        {title}
                    </h3>
                    <p className="text-gray-500 font-medium text-sm leading-relaxed mb-8">
                        {message}
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all active:scale-[0.98]"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={cn(
                                "flex-[2] py-4 text-white rounded-2xl font-black shadow-lg transition-all active:scale-[0.98]",
                                currentVariant.button
                            )}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
