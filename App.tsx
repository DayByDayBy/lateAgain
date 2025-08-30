import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { supabase } from './src/supabaseClient';
import LoginScreen from './src/LoginScreen';
import HomeScreen from './src/HomeScreen';

export default function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      {user ? <HomeScreen user={user} /> : <LoginScreen />}
      <StatusBar style="auto" />
    </>
  );
}
