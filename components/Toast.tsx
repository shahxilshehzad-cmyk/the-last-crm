
import React, { useEffect, useState } from 'react';
import { Toast as ToastType } from '../types';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: number) => void;
}

const toastConfig = {
  success: {
    icon: 'fa-check-circle',
    bg: 'bg-green-500',
  },
  error: {
    icon: 'fa-exclamation-circle',
    bg: 'bg-danger',
  },
  info: {
    icon: 'fa-info-circle',
    bg: 'bg-primary',
  },
};

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 5000);

    return () => {
      clearTimeout(timer);
    };
  }, [toast.id, onDismiss]);
  
  const config = toastConfig[toast.type];

  return (
    <div
      className={`flex items-center p-4 mb-4 text-white rounded-lg shadow-lg transition-all duration-300 transform ${config.bg} ${isFadingOut ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}`}
    >
      <i className={`fas ${config.icon} mr-3`}></i>
      <span>{toast.message}</span>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastType[];
  onDismiss: (id: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-5 right-5 z-[100] w-full max-w-xs">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
