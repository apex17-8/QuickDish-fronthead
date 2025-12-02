import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { removeNotification } from '../../store/slices/notificationSlice';

interface ToastNotificationProps {
  notification: {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    duration?: number;
  };
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ notification }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  const dispatch = useDispatch();

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-l-green-500';
      case 'error':
        return 'border-l-red-500';
      case 'warning':
        return 'border-l-yellow-500';
      case 'info':
      default:
        return 'border-l-blue-500';
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50';
      case 'error':
        return 'bg-red-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'info':
      default:
        return 'bg-blue-50';
    }
  };

  useEffect(() => {
    const duration = notification.duration || 5000;
    
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, 300);
      }, duration);

      const progressInterval = setInterval(() => {
        setProgress(prev => Math.max(0, prev - (100 / (duration / 100))));
      }, 100);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [notification.id, notification.duration, dispatch]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      dispatch(removeNotification(notification.id));
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 w-96 ${getBgColor()} border ${getBorderColor()} border-l-4 rounded-lg shadow-lg transition-all duration-300 transform ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style={{ zIndex: 9999 }}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{getIcon()}</div>
          <div className="ml-3 flex-1">
            <div className="flex justify-between">
              <h3 className="font-medium text-gray-900">{notification.title}</h3>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
          </div>
        </div>
      </div>
      {notification.duration && notification.duration > 0 && (
        <div className="w-full h-1 bg-gray-200 rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-gray-400 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};