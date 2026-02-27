-- PokerMaster Pro - Complete Database Schema
-- Run this entire file in your Supabase SQL Editor

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- PLAYER STATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS player_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar_url TEXT,
  total_hands INTEGER DEFAULT 0,
  hands_won INTEGER DEFAULT 0,
  hands_folded INTEGER DEFAULT 0,
  total_bets DECIMAL(15, 2) DEFAULT 0,
  total_winnings DECIMAL(15, 2) DEFAULT 0,
  total_losses DECIMAL(15, 2) DEFAULT 0,
  net_profit DECIMAL(15, 2) DEFAULT 0,
  biggest_pot_won DECIMAL(15, 2) DEFAULT 0,
  best_hand JSONB,
  vpip DECIMAL(5, 2) DEFAULT 0,
  pfr DECIMAL(5, 2) DEFAULT 0,
  af DECIMAL(5, 2) DEFAULT 0,
  bb_per_100 DECIMAL(8, 2) DEFAULT 0,
  win_rate DECIMAL(5, 2) DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_win_streak INTEGER DEFAULT 0,
  tournament_wins INTEGER DEFAULT 0,
  cash_game_hours DECIMAL(8, 2) DEFAULT 0,
  last_played_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Player stats are viewable by everyone" 
  ON player_stats FOR SELECT USING (true);

-- ============================================
-- GAME ROOMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS game_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  host_id UUID NOT NULL REFERENCES auth.users(id),
  host_name TEXT NOT NULL,
  small_blind INTEGER NOT NULL DEFAULT 10,
  big_blind INTEGER NOT NULL DEFAULT 20,
  ante INTEGER DEFAULT 0,
  min_buy_in INTEGER NOT NULL DEFAULT 400,
  max_buy_in INTEGER NOT NULL DEFAULT 2000,
  max_players INTEGER NOT NULL DEFAULT 9,
  current_players INTEGER DEFAULT 0,
  is_private BOOLEAN DEFAULT FALSE,
  password TEXT,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'playing', 'paused', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE game_rooms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Game rooms are viewable by everyone" 
  ON game_rooms FOR SELECT USING (true);

CREATE POLICY "Users can create rooms" 
  ON game_rooms FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can update their rooms" 
  ON game_rooms FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Host can delete their rooms" 
  ON game_rooms FOR DELETE USING (auth.uid() = host_id);

-- ============================================
-- GAME STATES TABLE (realtime)
-- ============================================
CREATE TABLE IF NOT EXISTS game_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  players JSONB NOT NULL DEFAULT '[]',
  community_cards JSONB NOT NULL DEFAULT '[]',
  deck JSONB NOT NULL DEFAULT '[]',
  pots JSONB NOT NULL DEFAULT '[]',
  current_round TEXT DEFAULT 'preflop',
  current_position INTEGER DEFAULT 0,
  dealer_position INTEGER DEFAULT 0,
  small_blind INTEGER DEFAULT 10,
  big_blind INTEGER DEFAULT 20,
  ante INTEGER DEFAULT 0,
  min_bet INTEGER DEFAULT 20,
  max_bet DECIMAL(15, 2) DEFAULT 999999999,
  game_phase TEXT DEFAULT 'waiting',
  actions JSONB NOT NULL DEFAULT '[]',
  last_raise_amount INTEGER DEFAULT 0,
  hand_number INTEGER DEFAULT 1,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  max_players INTEGER DEFAULT 9,
  is_private BOOLEAN DEFAULT FALSE,
  password TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Game states are viewable by everyone" 
  ON game_states FOR SELECT USING (true);

CREATE POLICY "Host can modify game state" 
  ON game_states FOR ALL USING (
    EXISTS (
      SELECT 1 FROM game_rooms 
      WHERE game_rooms.id = game_states.room_id 
      AND game_rooms.host_id = auth.uid()
    )
  );

-- ============================================
-- HAND HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS hand_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES game_states(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  hand_number INTEGER NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  players JSONB NOT NULL,
  community_cards JSONB NOT NULL,
  actions JSONB NOT NULL,
  pots JSONB NOT NULL,
  winners JSONB NOT NULL,
  small_blind INTEGER NOT NULL,
  big_blind INTEGER NOT NULL
);

-- Enable RLS
ALTER TABLE hand_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Hand history is viewable by everyone" 
  ON hand_history FOR SELECT USING (true);

-- ============================================
-- CHAT MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES game_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  type TEXT DEFAULT 'player' CHECK (type IN ('player', 'system', 'dealer'))
);

-- Enable RLS
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Chat messages are viewable by everyone" 
  ON chat_messages FOR SELECT USING (true);

CREATE POLICY "Users can send messages" 
  ON chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- USER PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  graphics_quality TEXT DEFAULT 'high',
  animations_enabled BOOLEAN DEFAULT TRUE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  sound_volume DECIMAL(3, 2) DEFAULT 0.7,
  music_enabled BOOLEAN DEFAULT TRUE,
  music_volume DECIMAL(3, 2) DEFAULT 0.5,
  card_design TEXT DEFAULT 'modern',
  table_color TEXT DEFAULT 'green',
  auto_muck BOOLEAN DEFAULT TRUE,
  show_folded_cards BOOLEAN DEFAULT FALSE,
  four_color_deck BOOLEAN DEFAULT FALSE,
  show_hand_strength BOOLEAN DEFAULT TRUE,
  auto_action_delay INTEGER DEFAULT 0,
  confirm_all_in BOOLEAN DEFAULT TRUE,
  confirm_big_bets BOOLEAN DEFAULT TRUE,
  big_bet_threshold INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own preferences" 
  ON user_preferences FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" 
  ON user_preferences FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- TOURNAMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  host_id UUID NOT NULL REFERENCES auth.users(id),
  buy_in INTEGER NOT NULL,
  prize_pool INTEGER DEFAULT 0,
  starting_chips INTEGER NOT NULL DEFAULT 5000,
  blind_levels JSONB NOT NULL DEFAULT '[]',
  max_players INTEGER NOT NULL DEFAULT 100,
  registered_players UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'registering',
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Tournaments are viewable by everyone" 
  ON tournaments FOR SELECT USING (true);

CREATE POLICY "Users can create tournaments" 
  ON tournaments FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Host can update their tournaments" 
  ON tournaments FOR UPDATE USING (auth.uid() = host_id);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_game_rooms_status ON game_rooms(status);
CREATE INDEX IF NOT EXISTS idx_game_rooms_host ON game_rooms(host_id);
CREATE INDEX IF NOT EXISTS idx_game_states_room ON game_states(room_id);
CREATE INDEX IF NOT EXISTS idx_hand_history_game ON hand_history(game_id);
CREATE INDEX IF NOT EXISTS idx_hand_history_room ON hand_history(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);
CREATE INDEX IF NOT EXISTS idx_player_stats_username ON player_stats(username);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_player_stats_updated_at ON player_stats;
CREATE TRIGGER update_player_stats_updated_at 
  BEFORE UPDATE ON player_stats 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_game_rooms_updated_at ON game_rooms;
CREATE TRIGGER update_game_rooms_updated_at 
  BEFORE UPDATE ON game_rooms 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_game_states_updated_at ON game_states;
CREATE TRIGGER update_game_states_updated_at 
  BEFORE UPDATE ON game_states 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create player stats on user signup
CREATE OR REPLACE FUNCTION create_player_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO profiles (id, username, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  
  -- Create player stats
  INSERT INTO player_stats (user_id, username, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create user preferences
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't prevent signup
  RAISE WARNING 'Error in create_player_stats: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_player_stats();

-- ============================================
-- REALTIME CONFIGURATION
-- ============================================
-- Drop existing publication if exists
DROP PUBLICATION IF EXISTS supabase_realtime;

-- Create new publication
CREATE PUBLICATION supabase_realtime;

-- Add tables to publication
ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE game_states;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE player_stats;

-- ============================================
-- VERIFICATION QUERY (run this to check setup)
-- ============================================
-- SELECT * FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name;
