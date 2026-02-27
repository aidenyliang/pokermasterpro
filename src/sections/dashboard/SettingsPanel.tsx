import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  SettingsIcon, 
  VolumeOnIcon, 
  VolumeOffIcon, 
  MusicIcon,
  SparklesIcon,
  CardIcon,
  TableIcon,
  EyeIcon
} from '@/components/ui/custom/PokerIcons';
import { useGameStore } from '@/stores/gameStore';
import { cn } from '@/lib/utils';

export const SettingsPanel = () => {
  const { preferences, setPreferences, graphicsQuality, setGraphicsQuality } = useGameStore();
  
  const cardDesigns: Array<{ value: typeof preferences.cardDesign; label: string; preview: string }> = [
    { value: 'classic', label: 'Classic', preview: 'bg-blue-800' },
    { value: 'modern', label: 'Modern', preview: 'bg-gradient-to-br from-indigo-900 to-purple-900' },
    { value: 'minimal', label: 'Minimal', preview: 'bg-gray-800' },
    { value: 'dark', label: 'Dark', preview: 'bg-gradient-to-br from-gray-900 to-black' },
    { value: 'gold', label: 'Gold', preview: 'bg-gradient-to-br from-yellow-700 to-yellow-900' },
  ];
  
  const tableColors: Array<{ value: typeof preferences.tableColor; label: string; color: string }> = [
    { value: 'green', label: 'Green', color: 'bg-green-700' },
    { value: 'blue', label: 'Blue', color: 'bg-blue-700' },
    { value: 'red', label: 'Red', color: 'bg-red-700' },
    { value: 'black', label: 'Black', color: 'bg-gray-800' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-700' },
  ];
  
  const graphicsOptions: Array<{ value: typeof graphicsQuality; label: string; description: string }> = [
    { value: 'low', label: 'Low', description: 'Best performance' },
    { value: 'medium', label: 'Medium', description: 'Balanced' },
    { value: 'high', label: 'High', description: 'Better visuals' },
    { value: 'ultra', label: 'Ultra', description: 'Maximum quality' },
  ];
  
  return (
    <div className="space-y-6">
      {/* Graphics Quality */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gray-900/80 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-yellow-400" />
              Graphics Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {graphicsOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setGraphicsQuality(option.value)}
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all text-left',
                    graphicsQuality === option.value
                      ? 'border-blue-500 bg-blue-500/20'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                  )}
                >
                  <div className="text-white font-semibold">{option.label}</div>
                  <div className="text-gray-400 text-sm">{option.description}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Audio Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gray-900/80 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {preferences.soundEnabled ? (
                <VolumeOnIcon className="w-5 h-5 text-green-400" />
              ) : (
                <VolumeOffIcon className="w-5 h-5 text-gray-400" />
              )}
              Audio Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sound Effects */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Sound Effects</Label>
                <p className="text-gray-400 text-sm">Card sounds, chips, etc.</p>
              </div>
              <Switch
                checked={preferences.soundEnabled}
                onCheckedChange={(checked) => setPreferences({ soundEnabled: checked })}
              />
            </div>
            
            {preferences.soundEnabled && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-gray-400">Volume</Label>
                  <span className="text-white">{Math.round(preferences.soundVolume * 100)}%</span>
                </div>
                <Slider
                  value={[preferences.soundVolume * 100]}
                  onValueChange={([value]) => setPreferences({ soundVolume: value / 100 })}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            )}
            
            {/* Music */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div className="flex items-center gap-3">
                <MusicIcon className="w-5 h-5 text-purple-400" />
                <div>
                  <Label className="text-white">Background Music</Label>
                  <p className="text-gray-400 text-sm">Ambient casino sounds</p>
                </div>
              </div>
              <Switch
                checked={preferences.musicEnabled}
                onCheckedChange={(checked) => setPreferences({ musicEnabled: checked })}
              />
            </div>
            
            {preferences.musicEnabled && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-gray-400">Volume</Label>
                  <span className="text-white">{Math.round(preferences.musicVolume * 100)}%</span>
                </div>
                <Slider
                  value={[preferences.musicVolume * 100]}
                  onValueChange={([value]) => setPreferences({ musicVolume: value / 100 })}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Visual Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gray-900/80 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <EyeIcon className="w-5 h-5 text-blue-400" />
              Visual Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Card Design */}
            <div className="space-y-3">
              <Label className="text-white flex items-center gap-2">
                <CardIcon className="w-4 h-4" />
                Card Design
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {cardDesigns.map((design) => (
                  <button
                    key={design.value}
                    onClick={() => setPreferences({ cardDesign: design.value })}
                    className={cn(
                      'aspect-[2/3] rounded-lg border-2 transition-all relative overflow-hidden',
                      preferences.cardDesign === design.value
                        ? 'border-blue-500 ring-2 ring-blue-500/30'
                        : 'border-gray-700 hover:border-gray-600'
                    )}
                  >
                    <div className={cn('absolute inset-1 rounded', design.preview)} />
                    {preferences.cardDesign === design.value && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Badge className="bg-blue-500 text-white text-xs">Selected</Badge>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Table Color */}
            <div className="space-y-3">
              <Label className="text-white flex items-center gap-2">
                <TableIcon className="w-4 h-4" />
                Table Color
              </Label>
              <div className="flex gap-2">
                {tableColors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setPreferences({ tableColor: color.value })}
                    className={cn(
                      'w-12 h-12 rounded-lg border-2 transition-all',
                      color.color,
                      preferences.tableColor === color.value
                        ? 'border-white ring-2 ring-white/30'
                        : 'border-transparent hover:border-white/50'
                    )}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
            
            {/* Animation Toggle */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-700">
              <div>
                <Label className="text-white">Animations</Label>
                <p className="text-gray-400 text-sm">Card dealing, chip movement</p>
              </div>
              <Switch
                checked={preferences.animationsEnabled}
                onCheckedChange={(checked) => setPreferences({ animationsEnabled: checked })}
              />
            </div>
            
            {/* Four Color Deck */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Four Color Deck</Label>
                <p className="text-gray-400 text-sm">Blue diamonds, green clubs</p>
              </div>
              <Switch
                checked={preferences.fourColorDeck}
                onCheckedChange={(checked) => setPreferences({ fourColorDeck: checked })}
              />
            </div>
            
            {/* Show Hand Strength */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Show Hand Strength</Label>
                <p className="text-gray-400 text-sm">Display your hand evaluation</p>
              </div>
              <Switch
                checked={preferences.showHandStrength}
                onCheckedChange={(checked) => setPreferences({ showHandStrength: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Gameplay Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gray-900/80 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-gray-400" />
              Gameplay Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Auto Muck */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Auto Muck</Label>
                <p className="text-gray-400 text-sm">Automatically fold losing hands</p>
              </div>
              <Switch
                checked={preferences.autoMuck}
                onCheckedChange={(checked) => setPreferences({ autoMuck: checked })}
              />
            </div>
            
            {/* Show Folded Cards */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Show Folded Cards</Label>
                <p className="text-gray-400 text-sm">Reveal your cards after folding</p>
              </div>
              <Switch
                checked={preferences.showFoldedCards}
                onCheckedChange={(checked) => setPreferences({ showFoldedCards: checked })}
              />
            </div>
            
            {/* Confirm All-in */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Confirm All-in</Label>
                <p className="text-gray-400 text-sm">Show confirmation for all-in bets</p>
              </div>
              <Switch
                checked={preferences.confirmAllIn}
                onCheckedChange={(checked) => setPreferences({ confirmAllIn: checked })}
              />
            </div>
            
            {/* Confirm Big Bets */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">Confirm Big Bets</Label>
                  <p className="text-gray-400 text-sm">Show confirmation for large bets</p>
                </div>
                <Switch
                  checked={preferences.confirmBigBets}
                  onCheckedChange={(checked) => setPreferences({ confirmBigBets: checked })}
                />
              </div>
              
              {preferences.confirmBigBets && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-gray-400">Threshold</Label>
                    <span className="text-white">${preferences.bigBetThreshold}</span>
                  </div>
                  <Slider
                    value={[preferences.bigBetThreshold]}
                    onValueChange={([value]) => setPreferences({ bigBetThreshold: value })}
                    min={50}
                    max={1000}
                    step={50}
                    className="w-full"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Reset Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => {
            setPreferences({
              graphicsQuality: 'high',
              animationsEnabled: true,
              soundEnabled: true,
              soundVolume: 0.7,
              musicEnabled: true,
              musicVolume: 0.5,
              cardDesign: 'modern',
              tableColor: 'green',
              autoMuck: true,
              showFoldedCards: false,
              fourColorDeck: false,
              showHandStrength: true,
              autoActionDelay: 0,
              confirmAllIn: true,
              confirmBigBets: true,
              bigBetThreshold: 100,
            });
            setGraphicsQuality('high');
          }}
          className="text-gray-400 hover:text-white"
        >
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
};

export default SettingsPanel;
