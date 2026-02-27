# PokerMaster Pro

The ultimate online Texas Hold'em poker platform built with React, TypeScript, and Supabase.

![PokerMaster Pro](https://img.shields.io/badge/PokerMaster-Pro-blue)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?logo=supabase)

## Features

### Core Poker Functionality
- **Texas Hold'em** - Full implementation of the world's most popular poker variant
- **Real-time Gameplay** - Smooth, responsive game engine with proper betting rounds
- **Hand Evaluation** - Accurate poker hand ranking from high card to royal flush
- **Pot Management** - Side pots and all-in handling
- **Blind System** - Small blind, big blind, and optional ante

### Player Experience
- **Custom Card Designs** - 5 unique card back designs (Classic, Modern, Minimal, Dark, Gold)
- **Table Themes** - 5 table colors (Green, Blue, Red, Black, Purple)
- **Four-Color Deck** - Optional blue diamonds and green clubs for better visibility
- **Hand Strength Indicator** - Real-time hand evaluation display
- **Graphics Quality Settings** - Low, Medium, High, Ultra presets for any device

### Game Management
- **Game Lobby** - Browse and join public/private rooms
- **Room Creation** - Customizable blinds, buy-ins, and player limits
- **Player Stats** - Comprehensive tracking of VPIP, PFR, AF, BB/100, win rate
- **Hand History** - Review past hands and analyze your play
- **Achievements** - Track streaks, tournament wins, and milestones

### Technical Features
- **Supabase Integration** - Real-time database with authentication
- **Responsive Design** - Play on desktop, tablet, or mobile
- **Smooth Animations** - Framer Motion powered transitions
- **Sound Effects** - Optional audio feedback for actions
- **Offline Support** - Game state persistence

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Zustand with persistence
- **Backend**: Supabase (PostgreSQL + Realtime)
- **Animations**: Framer Motion
- **Icons**: Custom SVG poker icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (free tier works fine)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/pokermaster-pro.git
   cd pokermaster-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the database schema (see `supabase/schema.sql`)
   - Copy your project URL and anon key

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://yourproject.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Database Schema

### Tables

- **profiles** - User profiles and avatars
- **player_stats** - Player statistics and achievements
- **game_rooms** - Active game rooms
- **game_states** - Current game state (players, cards, pots)
- **hand_history** - Completed hand records
- **chat_messages** - In-game chat
- **user_preferences** - User settings and preferences
- **tournaments** - Tournament data

See `supabase/schema.sql` for full schema definition.

## Project Structure

```
pokermaster-pro/
├── src/
│   ├── components/
│   │   ├── poker/           # Poker-specific components
│   │   │   ├── PlayingCard.tsx
│   │   │   ├── PokerChip.tsx
│   │   │   ├── PokerTable.tsx
│   │   │   ├── PlayerSeat.tsx
│   │   │   └── ActionButtons.tsx
│   │   ├── ui/              # shadcn/ui components
│   │   └── Header.tsx
│   ├── sections/
│   │   ├── auth/            # Login/Register forms
│   │   ├── lobby/           # Room list and creation
│   │   └── dashboard/       # Stats and settings
│   ├── lib/
│   │   └── supabase/        # Supabase client and types
│   ├── stores/
│   │   └── gameStore.ts     # Zustand state management
│   ├── types/
│   │   └── poker/           # TypeScript type definitions
│   ├── utils/
│   │   └── poker/           # Game logic utilities
│   ├── App.tsx
│   └── main.tsx
├── public/                  # Static assets
├── supabase/
│   └── schema.sql          # Database schema
└── package.json
```

## Game Rules

### Texas Hold'em Basics

1. Each player receives 2 private cards (hole cards)
2. 5 community cards are dealt in stages: flop (3), turn (1), river (1)
3. Players bet after each dealing stage
4. Best 5-card hand wins the pot

### Hand Rankings (Highest to Lowest)

1. **Royal Flush** - A-K-Q-J-10, all same suit
2. **Straight Flush** - 5 consecutive cards, same suit
3. **Four of a Kind** - 4 cards of same rank
4. **Full House** - 3 of a kind + pair
5. **Flush** - 5 cards of same suit
6. **Straight** - 5 consecutive cards
7. **Three of a Kind** - 3 cards of same rank
8. **Two Pair** - 2 different pairs
9. **Pair** - 2 cards of same rank
10. **High Card** - Highest single card

## Configuration

### Graphics Quality

Adjust in Settings panel:
- **Low** - Minimal animations, best performance
- **Medium** - Balanced visuals and performance
- **High** - Enhanced animations and effects
- **Ultra** - Maximum visual quality

### Customization Options

- Card design (Classic, Modern, Minimal, Dark, Gold)
- Table color (Green, Blue, Red, Black, Purple)
- Four-color deck toggle
- Sound and music volume
- Confirmation dialogs for big bets/all-ins

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Supabase](https://supabase.com/) for backend infrastructure
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [Tailwind CSS](https://tailwindcss.com/) for styling

## Support

For support, email support@pokermaster.pro or join our Discord community.

---

Built with love by the PokerMaster Pro team ♠️♥️♣️♦️
