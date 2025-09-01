import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { supabase, getUserProfile, createUserProfile } from './src/supabaseClient';
import LoginScreen from './src/LoginScreen';
import HomeScreen from './src/HomeScreen';
import CompanyList from './src/CompanyList';
import CompanyForm from './src/CompanyForm';
import QuickReporting from './src/QuickReporting';

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        // Check if user profile exists, if not create one
        const profile = await getUserProfile();
        if (!profile) {
          try {
            await createUserProfile('user');
          } catch (error) {
            console.error('Error creating user profile:', error);
          }
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} initialParams={{ user }} />
            <Stack.Screen name="CompanyList" component={CompanyList} />
            <Stack.Screen name="CompanyForm" component={CompanyForm} />
            <Stack.Screen name="QuickReporting" component={QuickReporting} />
          </>
        ) : (
          <Stack.Screen name="sign in to send" component={LoginScreen} />
        )}
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
