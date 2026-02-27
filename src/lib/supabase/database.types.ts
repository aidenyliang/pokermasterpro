export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      player_stats: {
        Row: {
          user_id: string
          username: string
          avatar_url: string | null
          total_hands: number
          hands_won: number
          hands_folded: number
          total_bets: number
          total_winnings: number
          total_losses: number
          net_profit: number
          biggest_pot_won: number
          best_hand: Json | null
          vpip: number
          pfr: number
          af: number
          bb_per_100: number
          win_rate: number
          current_streak: number
          longest_win_streak: number
          tournament_wins: number
          cash_game_hours: number
          last_played_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          username: string
          avatar_url?: string | null
          total_hands?: number
          hands_won?: number
          hands_folded?: number
          total_bets?: number
          total_winnings?: number
          total_losses?: number
          net_profit?: number
          biggest_pot_won?: number
          best_hand?: Json | null
          vpip?: number
          pfr?: number
          af?: number
          bb_per_100?: number
          win_rate?: number
          current_streak?: number
          longest_win_streak?: number
          tournament_wins?: number
          cash_game_hours?: number
          last_played_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          username?: string
          avatar_url?: string | null
          total_hands?: number
          hands_won?: number
          hands_folded?: number
          total_bets?: number
          total_winnings?: number
          total_losses?: number
          net_profit?: number
          biggest_pot_won?: number
          best_hand?: Json | null
          vpip?: number
          pfr?: number
          af?: number
          bb_per_100?: number
          win_rate?: number
          current_streak?: number
          longest_win_streak?: number
          tournament_wins?: number
          cash_game_hours?: number
          last_played_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      game_rooms: {
        Row: {
          id: string
          name: string
          description: string | null
          host_id: string
          host_name: string
          small_blind: number
          big_blind: number
          ante: number
          min_buy_in: number
          max_buy_in: number
          max_players: number
          current_players: number
          is_private: boolean
          password: string | null
          status: 'waiting' | 'playing' | 'paused' | 'closed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          host_id: string
          host_name: string
          small_blind?: number
          big_blind?: number
          ante?: number
          min_buy_in?: number
          max_buy_in?: number
          max_players?: number
          current_players?: number
          is_private?: boolean
          password?: string | null
          status?: 'waiting' | 'playing' | 'paused' | 'closed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          host_id?: string
          host_name?: string
          small_blind?: number
          big_blind?: number
          ante?: number
          min_buy_in?: number
          max_buy_in?: number
          max_players?: number
          current_players?: number
          is_private?: boolean
          password?: string | null
          status?: 'waiting' | 'playing' | 'paused' | 'closed'
          created_at?: string
          updated_at?: string
        }
      }
      game_states: {
        Row: {
          id: string
          room_id: string
          players: Json
          community_cards: Json
          deck: Json
          pots: Json
          current_round: string
          current_position: number
          dealer_position: number
          small_blind: number
          big_blind: number
          ante: number
          min_bet: number
          max_bet: number
          game_phase: string
          actions: Json
          last_raise_amount: number
          hand_number: number
          started_at: string
          ended_at: string | null
          max_players: number
          is_private: boolean
          password: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          players?: Json
          community_cards?: Json
          deck?: Json
          pots?: Json
          current_round?: string
          current_position?: number
          dealer_position?: number
          small_blind?: number
          big_blind?: number
          ante?: number
          min_bet?: number
          max_bet?: number
          game_phase?: string
          actions?: Json
          last_raise_amount?: number
          hand_number?: number
          started_at?: string
          ended_at?: string | null
          max_players?: number
          is_private?: boolean
          password?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          players?: Json
          community_cards?: Json
          deck?: Json
          pots?: Json
          current_round?: string
          current_position?: number
          dealer_position?: number
          small_blind?: number
          big_blind?: number
          ante?: number
          min_bet?: number
          max_bet?: number
          game_phase?: string
          actions?: Json
          last_raise_amount?: number
          hand_number?: number
          started_at?: string
          ended_at?: string | null
          max_players?: number
          is_private?: boolean
          password?: string | null
          updated_at?: string
        }
      }
      hand_history: {
        Row: {
          id: string
          game_id: string
          room_id: string
          hand_number: number
          timestamp: string
          players: Json
          community_cards: Json
          actions: Json
          pots: Json
          winners: Json
          small_blind: number
          big_blind: number
        }
        Insert: {
          id?: string
          game_id: string
          room_id: string
          hand_number: number
          timestamp?: string
          players: Json
          community_cards: Json
          actions: Json
          pots: Json
          winners: Json
          small_blind: number
          big_blind: number
        }
        Update: {
          id?: string
          game_id?: string
          room_id?: string
          hand_number?: number
          timestamp?: string
          players?: Json
          community_cards?: Json
          actions?: Json
          pots?: Json
          winners?: Json
          small_blind?: number
          big_blind?: number
        }
      }
      chat_messages: {
        Row: {
          id: string
          room_id: string
          user_id: string
          username: string
          message: string
          timestamp: string
          type: 'player' | 'system' | 'dealer'
        }
        Insert: {
          id?: string
          room_id: string
          user_id: string
          username: string
          message: string
          timestamp?: string
          type?: 'player' | 'system' | 'dealer'
        }
        Update: {
          id?: string
          room_id?: string
          user_id?: string
          username?: string
          message?: string
          timestamp?: string
          type?: 'player' | 'system' | 'dealer'
        }
      }
      user_preferences: {
        Row: {
          user_id: string
          graphics_quality: 'low' | 'medium' | 'high' | 'ultra'
          animations_enabled: boolean
          sound_enabled: boolean
          sound_volume: number
          music_enabled: boolean
          music_volume: number
          card_design: 'classic' | 'modern' | 'minimal' | 'dark' | 'gold'
          table_color: 'green' | 'blue' | 'red' | 'black' | 'purple'
          auto_muck: boolean
          show_folded_cards: boolean
          four_color_deck: boolean
          show_hand_strength: boolean
          auto_action_delay: number
          confirm_all_in: boolean
          confirm_big_bets: boolean
          big_bet_threshold: number
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          graphics_quality?: 'low' | 'medium' | 'high' | 'ultra'
          animations_enabled?: boolean
          sound_enabled?: boolean
          sound_volume?: number
          music_enabled?: boolean
          music_volume?: number
          card_design?: 'classic' | 'modern' | 'minimal' | 'dark' | 'gold'
          table_color?: 'green' | 'blue' | 'red' | 'black' | 'purple'
          auto_muck?: boolean
          show_folded_cards?: boolean
          four_color_deck?: boolean
          show_hand_strength?: boolean
          auto_action_delay?: number
          confirm_all_in?: boolean
          confirm_big_bets?: boolean
          big_bet_threshold?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          graphics_quality?: 'low' | 'medium' | 'high' | 'ultra'
          animations_enabled?: boolean
          sound_enabled?: boolean
          sound_volume?: number
          music_enabled?: boolean
          music_volume?: number
          card_design?: 'classic' | 'modern' | 'minimal' | 'dark' | 'gold'
          table_color?: 'green' | 'blue' | 'red' | 'black' | 'purple'
          auto_muck?: boolean
          show_folded_cards?: boolean
          four_color_deck?: boolean
          show_hand_strength?: boolean
          auto_action_delay?: number
          confirm_all_in?: boolean
          confirm_big_bets?: boolean
          big_bet_threshold?: number
          created_at?: string
          updated_at?: string
        }
      }
      tournaments: {
        Row: {
          id: string
          name: string
          description: string | null
          host_id: string
          buy_in: number
          prize_pool: number
          starting_chips: number
          blind_levels: Json
          max_players: number
          registered_players: string[]
          status: 'registering' | 'starting' | 'running' | 'paused' | 'finished'
          started_at: string | null
          finished_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          host_id: string
          buy_in: number
          prize_pool?: number
          starting_chips: number
          blind_levels: Json
          max_players: number
          registered_players?: string[]
          status?: 'registering' | 'starting' | 'running' | 'paused' | 'finished'
          started_at?: string | null
          finished_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          host_id?: string
          buy_in?: number
          prize_pool?: number
          starting_chips?: number
          blind_levels?: Json
          max_players?: number
          registered_players?: string[]
          status?: 'registering' | 'starting' | 'running' | 'paused' | 'finished'
          started_at?: string | null
          finished_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper type for Supabase queries
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
