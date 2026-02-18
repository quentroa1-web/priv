import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 p-8 text-center space-y-6">
                        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-600">
                            <AlertTriangle className="w-10 h-10" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">¡Vaya! Algo salió mal</h1>
                            <p className="text-gray-500 font-medium">
                                La página encontró un error inesperado al cargar.
                            </p>
                        </div>

                        {process.env.NODE_ENV === 'development' && (
                            <div className="p-4 bg-gray-50 rounded-2xl text-left overflow-auto max-h-40">
                                <code className="text-xs text-rose-500 font-mono">
                                    {this.state.error?.toString()}
                                </code>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:bg-black transition-all active:scale-95"
                            >
                                <RefreshCw className="w-4 h-4" /> Recargar
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex items-center justify-center gap-2 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black border border-rose-100 hover:bg-rose-100 transition-all active:scale-95"
                            >
                                <Home className="w-4 h-4" /> Inicio
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
