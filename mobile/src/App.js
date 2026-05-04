import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

import AuthContext from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth screens
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';

// Student screens
import StudentDashboardScreen from './screens/student/DashboardScreen';
import TakeSurveyScreen from './screens/student/TakeSurveyScreen';
import MyResponsesScreen from './screens/student/MyResponsesScreen';

// Profile screen
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const StudentTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'MyResponses') {
            iconName = 'assignment';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}>
      <Tab.Screen name="Dashboard" component={StudentDashboardScreen} />
      <Tab.Screen name="MyResponses" component={MyResponsesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const App = () => {
  return (
    <AuthContext>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Main">
            {() => (
              <ProtectedRoute>
                <StudentTabs />
              </ProtectedRoute>
            )}
          </Stack.Screen>
          <Stack.Screen 
            name="TakeSurvey" 
            component={TakeSurveyScreen}
            options={{headerShown: true, title: 'Take Survey'}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext>
  );
};

export default App;
