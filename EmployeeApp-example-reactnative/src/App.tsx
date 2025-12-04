import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {Provider as PaperProvider} from 'react-native-paper';
import {Provider as ReduxProvider} from 'react-redux';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {StyleSheet} from 'react-native';

// Store
import {store} from './store/store';

// Navigation
import AppNavigator from './navigation/AppNavigator';

// Utils
import {ToastProvider} from './utils/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';

// Theme
import {theme} from './theme';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <ReduxProvider store={store}>
          <PaperProvider theme={theme}>
            <SafeAreaProvider>
              <ToastProvider>
                <NavigationContainer>
                  <AppNavigator />
                </NavigationContainer>
              </ToastProvider>
            </SafeAreaProvider>
          </PaperProvider>
        </ReduxProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
