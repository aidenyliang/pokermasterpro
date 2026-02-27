import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { LockIcon, ChipIcon, UserIcon } from '@/components/ui/custom/PokerIcons';
import { useGameStore } from '@/stores/gameStore';

interface CreateRoomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (roomData: RoomFormData) => void;
}

export interface RoomFormData {
  name: string;
  description: string;
  smallBlind: number;
  bigBlind: number;
  ante: number;
  minBuyIn: number;
  maxBuyIn: number;
  maxPlayers: number;
  isPrivate: boolean;
  password: string;
}

export const CreateRoomDialog = ({ open, onOpenChange, onCreate }: CreateRoomDialogProps) => {
  const { username } = useGameStore();
  
  const [formData, setFormData] = useState<RoomFormData>({
    name: `${username}'s Room`,
    description: '',
    smallBlind: 10,
    bigBlind: 20,
    ante: 0,
    minBuyIn: 400,
    maxBuyIn: 2000,
    maxPlayers: 9,
    isPrivate: false,
    password: '',
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate(formData);
    onOpenChange(false);
  };
  
  const updateBlinds = (smallBlind: number) => {
    setFormData(prev => ({
      ...prev,
      smallBlind,
      bigBlind: smallBlind * 2,
      minBuyIn: smallBlind * 40,
      maxBuyIn: smallBlind * 200,
    }));
  };
  
  const blindPresets = [1, 5, 10, 25, 50, 100, 200, 500];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-700 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">Create New Room</DialogTitle>
          <DialogDescription className="text-gray-400">
            Set up your poker room with custom settings
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Room Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-300">Room Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="bg-gray-800 border-gray-600 text-white"
              required
              maxLength={50}
            />
          </div>
          
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">Description (Optional)</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-gray-800 border-gray-600 text-white"
              maxLength={200}
              placeholder="What's the vibe?"
            />
          </div>
          
          {/* Blind Selection */}
          <div className="space-y-4">
            <Label className="text-gray-300 flex items-center gap-2">
              <ChipIcon className="w-4 h-4" />
              Blind Level
            </Label>
            
            <div className="flex flex-wrap gap-2">
              {blindPresets.map((blind) => (
                <button
                  key={blind}
                  type="button"
                  onClick={() => updateBlinds(blind)}
                  className={`
                    px-4 py-2 rounded-lg font-mono text-sm transition-colors
                    ${formData.smallBlind === blind
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }
                  `}
                >
                  ${blind}/${blind * 2}
                </button>
              ))}
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Small Blind: ${formData.smallBlind}</span>
                <span>Big Blind: ${formData.bigBlind}</span>
              </div>
              <Slider
                value={[formData.smallBlind]}
                onValueChange={([value]) => updateBlinds(value)}
                min={1}
                max={1000}
                step={1}
                className="w-full"
              />
            </div>
          </div>
          
          {/* Ante */}
          <div className="space-y-2">
            <Label className="text-gray-300">Ante: ${formData.ante}</Label>
            <Slider
              value={[formData.ante]}
              onValueChange={([value]) => setFormData(prev => ({ ...prev, ante: value }))}
              min={0}
              max={formData.bigBlind}
              step={1}
              className="w-full"
            />
          </div>
          
          {/* Buy-in Range */}
          <div className="space-y-4">
            <Label className="text-gray-300">Buy-in Range</Label>
            <div className="bg-gray-800 p-4 rounded-lg space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Minimum: ${formData.minBuyIn}</span>
                </div>
                <Slider
                  value={[formData.minBuyIn]}
                  onValueChange={([value]) => setFormData(prev => ({ 
                    ...prev, 
                    minBuyIn: Math.min(value, prev.maxBuyIn - formData.bigBlind)
                  }))}
                  min={formData.bigBlind * 10}
                  max={formData.bigBlind * 500}
                  step={formData.bigBlind}
                />
              </div>
              <div>
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Maximum: ${formData.maxBuyIn}</span>
                </div>
                <Slider
                  value={[formData.maxBuyIn]}
                  onValueChange={([value]) => setFormData(prev => ({ 
                    ...prev, 
                    maxBuyIn: Math.max(value, prev.minBuyIn + formData.bigBlind)
                  }))}
                  min={formData.bigBlind * 20}
                  max={formData.bigBlind * 1000}
                  step={formData.bigBlind}
                />
              </div>
            </div>
          </div>
          
          {/* Max Players */}
          <div className="space-y-2">
            <Label className="text-gray-300 flex items-center gap-2">
              <UserIcon className="w-4 h-4" />
              Max Players: {formData.maxPlayers}
            </Label>
            <div className="flex gap-2">
              {[2, 4, 6, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, maxPlayers: num }))}
                  className={`
                    px-4 py-2 rounded-lg font-medium transition-colors
                    ${formData.maxPlayers === num
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }
                  `}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          
          {/* Private Room */}
          <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <LockIcon className="w-5 h-5 text-gray-400" />
              <div>
                <Label htmlFor="private" className="text-gray-300 cursor-pointer">
                  Private Room
                </Label>
                <p className="text-gray-500 text-sm">Require password to join</p>
              </div>
            </div>
            <Switch
              id="private"
              checked={formData.isPrivate}
              onCheckedChange={(checked) => setFormData(prev => ({ 
                ...prev, 
                isPrivate: checked,
                password: checked ? prev.password : ''
              }))}
            />
          </div>
          
          {/* Password */}
          {formData.isPrivate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <Label htmlFor="password" className="text-gray-300">Room Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-white"
                required={formData.isPrivate}
                minLength={4}
              />
            </motion.div>
          )}
          
          {/* Summary */}
          <div className="bg-gray-800 p-4 rounded-lg space-y-2">
            <h4 className="text-white font-semibold">Room Summary</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-gray-400">Blinds:</span>
              <span className="text-white">${formData.smallBlind}/${formData.bigBlind}</span>
              <span className="text-gray-400">Ante:</span>
              <span className="text-white">${formData.ante}</span>
              <span className="text-gray-400">Buy-in:</span>
              <span className="text-white">${formData.minBuyIn} - ${formData.maxBuyIn}</span>
              <span className="text-gray-400">Players:</span>
              <span className="text-white">{formData.maxPlayers}</span>
              <span className="text-gray-400">Type:</span>
              <span className="text-white">{formData.isPrivate ? 'Private' : 'Public'}</span>
            </div>
          </div>
          
          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              Create Room
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoomDialog;
