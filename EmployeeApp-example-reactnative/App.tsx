import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {PaperProvider} from 'react-native-paper';
import {store} from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';

const App = (): React.JSX.Element => {
  return (
    <Provider store={store}>
      <PaperProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </PaperProvider>
    </Provider>
  );
};

export default App;
