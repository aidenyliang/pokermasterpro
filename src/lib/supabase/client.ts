import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Auth helpers
export const signUp = async (email: string, password: string, username: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

// Realtime subscriptions
export const subscribeToRoom = (roomId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`room:${roomId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'game_rooms', filter: `id=eq.${roomId}` },
      callback
    )
    .subscribe();
};

export const subscribeToGameState = (gameId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`game:${gameId}`)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'game_states', filter: `id=eq.${gameId}` },
      callback
    )
    .subscribe();
};

export const subscribeToChat = (roomId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`chat:${roomId}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
      callback
    )
    .subscribe();
};
