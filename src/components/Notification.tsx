import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Trophy } from 'lucide-react';

interface NotificationProps {
  type: 'success' | 'error' | 'achievement';
  message: string;
  isVisible: boolean;
  onClose: () => void;
}

export const Notification: React.FC<NotificationProps> = ({ type, message, isVisible, onClose }) => {
  const [shouldRender, setShouldRender] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!shouldRender) return null;

  const icons = {
    success: CheckCircle,
    error: XCircle,
    achievement: Trophy
  };

  const colors = {
    success: 'from-green-500 to-emerald-600',
    error: 'from-red-500 to-red-600',
    achievement: 'from-yellow-500 to-orange-600'
  };

  const Icon = icons[type];

  return (
    <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`bg-gradient-to-r ${colors[type]} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 max-w-sm`}>
        <Icon className="w-6 h-6 flex-shrink-0" />
        <p className="font-medium">{message}</p>
      </div>
    </div>
  );
};