import React, { useEffect } from "react";
import { X } from "lucide-react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string;
};

export function Modal({ isOpen, onClose, title, children, footer, maxWidth = "max-w-2xl" }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className={`relative flex max-h-[90vh] w-full ${maxWidth} flex-col rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl overflow-hidden`}>
        {title && (
          <div className="flex items-center justify-between border-b border-white/10 p-6">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button 
              onClick={onClose}
              className="rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {children}
        </div>

        {footer && (
          <div className="border-t border-white/10 p-6 bg-zinc-900/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
