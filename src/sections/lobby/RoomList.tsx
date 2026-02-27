import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  SearchIcon, 
  PlusIcon, 
  LockIcon, 
  UserIcon, 
  ChipIcon,
  FilterIcon,
  CrownIcon
} from '@/components/ui/custom/PokerIcons';
import { useGameStore } from '@/stores/gameStore';
// GameRoom type is available through the store
import { cn } from '@/lib/utils';

interface RoomListProps {
  onJoinRoom: (roomId: string, password?: string) => void;
  onCreateRoom: () => void;
}

export const RoomList = ({ onJoinRoom, onCreateRoom }: RoomListProps) => {
  const { rooms, graphicsQuality } = useGameStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');
  const [password, setPassword] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         room.hostName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'public' && !room.isPrivate) ||
                         (filter === 'private' && room.isPrivate);
    return matchesSearch && matchesFilter && room.status !== 'closed';
  });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-green-500';
      case 'playing': return 'bg-blue-500';
      case 'paused': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'waiting': return 'Waiting';
      case 'playing': return 'In Progress';
      case 'paused': return 'Paused';
      default: return 'Unknown';
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          <Input
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-600 text-white"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="flex bg-gray-800 rounded-lg p-1">
            {(['all', 'public', 'private'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                  filter === f 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          
          <Button
            onClick={onCreateRoom}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Room
          </Button>
        </div>
      </div>
      
      {/* Room Count */}
      <div className="text-gray-400 text-sm">
        Showing {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''}
      </div>
      
      {/* Room List */}
      {filteredRooms.length === 0 ? (
        <Card className="bg-gray-900/50 border-gray-700">
          <CardContent className="py-12 text-center">
            <div className="text-gray-500 mb-4">
              <FilterIcon className="w-16 h-16 mx-auto opacity-50" />
            </div>
            <p className="text-gray-400 text-lg">No rooms found</p>
            <p className="text-gray-500 text-sm mt-2">
              Try adjusting your search or create a new room
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredRooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={graphicsQuality !== 'low' ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={cn(
                'bg-gray-900/80 border-gray-700 hover:border-gray-600 transition-colors',
                room.status === 'playing' && 'opacity-75'
              )}>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Room Info */}
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-3 h-3 rounded-full',
                        getStatusColor(room.status)
                      )} />
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-semibold text-lg">
                            {room.name}
                          </h3>
                          {room.isPrivate && (
                            <LockIcon className="w-4 h-4 text-yellow-500" />
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {getStatusText(room.status)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                          <span className="flex items-center gap-1">
                            <CrownIcon className="w-4 h-4" />
                            {room.hostName}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserIcon className="w-4 h-4" />
                            {room.currentPlayers}/{room.maxPlayers}
                          </span>
                          <span className="flex items-center gap-1">
                            <ChipIcon className="w-4 h-4" />
                            ${room.smallBlind}/${room.bigBlind}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Buy-in Range */}
                    <div className="text-gray-400 text-sm">
                      Buy-in: ${room.minBuyIn.toLocaleString()} - ${room.maxBuyIn.toLocaleString()}
                    </div>
                    
                    {/* Join Button */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          onClick={() => setSelectedRoomId(room.id)}
                          disabled={room.status === 'playing' || room.currentPlayers >= room.maxPlayers}
                          className={cn(
                            'min-w-[100px]',
                            room.status === 'waiting' && room.currentPlayers < room.maxPlayers
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-gray-600'
                          )}
                        >
                          {room.status === 'playing' ? 'In Progress' :
                           room.currentPlayers >= room.maxPlayers ? 'Full' :
                           room.isPrivate ? 'Enter Password' : 'Join'}
                        </Button>
                      </DialogTrigger>
                      
                      {room.isPrivate && selectedRoomId === room.id && (
                        <DialogContent className="bg-gray-900 border-gray-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">Enter Room Password</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="relative">
                              <LockIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                              <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 bg-gray-800 border-gray-600 text-white"
                              />
                            </div>
                            <Button
                              onClick={() => {
                                onJoinRoom(room.id, password);
                                setPassword('');
                                setSelectedRoomId(null);
                              }}
                              className="w-full bg-green-600 hover:bg-green-700"
                            >
                              Join Room
                            </Button>
                          </div>
                        </DialogContent>
                      )}
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomList;
