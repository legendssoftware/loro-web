import { AlertTriangle } from 'lucide-react';

export function AlertBanner() {
    return (
        <div className="fixed left-0 right-0 z-50 w-1/3 mx-auto border-t rounded top-4 bg-amber-800 border-amber-700">
            <div className="container px-2 py-2 mx-auto">
                <div className="flex items-center justify-center gap-2 text-xs text-amber-50">
                    <AlertTriangle className="w-3 h-3" />
                    <p className="text-sm font-normal">Services suspended for now. Please try again later.</p>
                </div>
            </div>
        </div>
    );
}
