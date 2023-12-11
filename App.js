import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Authentication from './screens/Authentication';
import Redirect from './screens/Redirect';

const Stack = createStackNavigator();

const App = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Authentication">
      <Stack.Screen
        name="Authentication"
        component={Authentication}
      />
      <Stack.Screen
        name="♡Yarns & patterns♡"
        component={Redirect}
        options={{
          headerBackTitle: 'Log Out',
        }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

export default App;