import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Get environment variables with validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file'
  );
}

// Create Supabase client with modern configuration
export const supabase = createClient<Database>(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'pokermaster-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  db: {
    schema: 'public',
  },
});

// Auth helpers with error handling
export const signUp = async (email: string, password: string, username: string) => {
  try {
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
  } catch (err) {
    console.error('Sign up error:', err);
    return { data: null, error: err as Error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  } catch (err) {
    console.error('Sign in error:', err);
    return { data: null, error: err as Error };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (err) {
    console.error('Sign out error:', err);
    return { error: err as Error };
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  } catch (err) {
    console.error('Get user error:', err);
    return { user: null, error: err as Error };
  }
};

export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  } catch (err) {
    console.error('Get session error:', err);
    return { session: null, error: err as Error };
  }
};

// Realtime subscriptions with error handling
export const subscribeToRoom = (roomId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`room:${roomId}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'game_rooms', filter: `id=eq.${roomId}` },
      callback
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to room ${roomId}`);
      }
    });
};

export const subscribeToGameState = (gameId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`game:${gameId}`)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'game_states', filter: `id=eq.${gameId}` },
      callback
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to game ${gameId}`);
      }
    });
};

export const subscribeToChat = (roomId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`chat:${roomId}`)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
      callback
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Subscribed to chat ${roomId}`);
      }
    });
};

// Health check
export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase.from('profiles').select('count').limit(1);
    return { connected: !error, error };
  } catch (err) {
    return { connected: false, error: err };
  }
};
