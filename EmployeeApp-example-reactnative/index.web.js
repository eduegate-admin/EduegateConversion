import {AppRegistry} from 'react-native';
import App from './App';

AppRegistry.registerComponent('EmployeeManagementApp', () => App);
AppRegistry.runApplication('EmployeeManagementApp', {
  rootTag: document.getElementById('root'),
});