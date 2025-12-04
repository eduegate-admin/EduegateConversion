import React, {createContext, useContext, useState, useCallback, ReactNode} from 'react';
import {Snackbar} from 'react-native-paper';
import {StyleSheet} from 'react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onPress: () => void;
  };
}

interface ToastContextValue {
  showToast: (toast: Toast) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({children}) => {
  const [visible, setVisible] = useState(false);
  const [currentToast, setCurrentToast] = useState<Toast | null>(null);

  const showToast = useCallback((toast: Toast) => {
    setCurrentToast(toast);
    setVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setVisible(false);
    setCurrentToast(null);
  }, []);

  const showSuccess = useCallback(
    (message: string, duration?: number) => {
      showToast({message, type: 'success', duration});
    },
    [showToast],
  );

  const showError = useCallback(
    (message: string, duration?: number) => {
      showToast({message, type: 'error', duration});
    },
    [showToast],
  );

  const showWarning = useCallback(
    (message: string, duration?: number) => {
      showToast({message, type: 'warning', duration});
    },
    [showToast],
  );

  const showInfo = useCallback(
    (message: string, duration?: number) => {
      showToast({message, type: 'info', duration});
    },
    [showToast],
  );

  const getToastStyle = (type: ToastType) => {
    switch (type) {
      case 'success':
        return styles.successToast;
      case 'error':
        return styles.errorToast;
      case 'warning':
        return styles.warningToast;
      case 'info':
        return styles.infoToast;
      default:
        return {};
    }
  };

  const value: ToastContextValue = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {currentToast && (
        <Snackbar
          visible={visible}
          onDismiss={hideToast}
          duration={currentToast.duration || 3000}
          action={
            currentToast.action
              ? {
                  label: currentToast.action.label,
                  onPress: () => {
                    currentToast.action?.onPress();
                    hideToast();
                  },
                }
              : undefined
          }
          style={[styles.snackbar, getToastStyle(currentToast.type)]}>
          {currentToast.message}
        </Snackbar>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  snackbar: {
    marginBottom: 20,
  },
  successToast: {
    backgroundColor: '#4caf50',
  },
  errorToast: {
    backgroundColor: '#f44336',
  },
  warningToast: {
    backgroundColor: '#ff9800',
  },
  infoToast: {
    backgroundColor: '#2196f3',
  },
});
