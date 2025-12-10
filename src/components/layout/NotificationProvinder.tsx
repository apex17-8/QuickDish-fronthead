import React from 'react';
import { useSelector} from 'react-redux';
import { ToastNotification } from '../ui/ToastNotification';
import { selectNotifications } from '../../store/slices/notificationSlice';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const notifications = useSelector(selectNotifications);
  const recentNotifications = notifications.slice(0, 3); // Show max 3 toasts

  return (
    <>
      {children}
      <div className="fixed top-0 right-0 z-50">
        {recentNotifications.map((notification) => (
          <ToastNotification key={notification.id} notification={notification} />
        ))}
      </div>
    </>
  );
};