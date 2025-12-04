import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';

// Register the main component for React Native
AppRegistry.registerComponent(appName, () => App);

// Export for Expo Web
export default App;