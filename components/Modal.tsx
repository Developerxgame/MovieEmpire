import React, { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-zinc-800 rounded-2xl shadow-xl w-full max-w-sm border border-white/10 animate-scaleUp">
        <div className="flex justify-between items-center p-4 border-b border-zinc-700">
          <h2 className="text-xl font-cinematic text-amber-400 tracking-wider">{title}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white bg-zinc-700 rounded-full p-1 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;