import { useDraftStore } from '../../store';
import { getPlayerRecommendations } from '../../utils/recommendations';
import { Crown, Target, TrendingUp } from 'lucide-react';

export function Recommendations() {
  const { 
    getAvailablePlayers, 
    getTeamRoster, 
    userTeamId, 
    currentPick, 
    leagueSize,
    draftStrategy,
    isUserPick
  } = useDraftStore();
  
  const availablePlayers = getAvailablePlayers();
  const userRoster = getTeamRoster(userTeamId);
  
  const recommendations = getPlayerRecommendations(
    availablePlayers,
    userRoster,
    currentPick,
    leagueSize,
    draftStrategy
  );
  
  const getIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-4 h-4" />;
      case 1: return <Target className="w-4 h-4" />;
      case 2: return <TrendingUp className="w-4 h-4" />;
      default: return null;
    }
  };
  
  const getPositionColor = (position: string) => {
    switch (position) {
      case 'QB': return 'bg-position-qb';
      case 'RB': return 'bg-position-rb';
      case 'WR': return 'bg-position-wr';
      case 'TE': return 'bg-position-te';
      default: return 'bg-gray-500';
    }
  };
  
  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'text-yellow-500 bg-yellow-500/20';
      case 1: return 'text-gray-400 bg-gray-400/20';
      case 2: return 'text-orange-600 bg-orange-600/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };
  
  if (!isUserPick()) {
    return (
      <div className="bg-draft-card rounded-lg p-4 border border-draft-border">
        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <Crown className="w-4 h-4 text-yellow-500" />
          AI RECOMMENDATIONS
        </h3>
        <div className="text-gray-400 text-sm text-center py-4">
          Waiting for your pick...
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-draft-card rounded-lg p-4 border border-draft-border">
      <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
        <Crown className="w-4 h-4 text-yellow-500" />
        AI RECOMMENDATIONS
      </h3>
      
      {recommendations.length === 0 ? (
        <div className="text-gray-400 text-sm text-center py-4">
          No players available
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div 
              key={rec.player.id} 
              className={`relative ${index === 0 ? 'border-2 border-yellow-500/50' : 'border border-draft-border'} rounded-lg p-3 transition-colors hover:bg-draft-bg`}
            >
              {/* Rank Badge */}
              <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center ${getRankColor(index)}`}>
                {getIcon(index)}
              </div>
              
              <div className="flex items-center gap-3">
                {/* Position Badge */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${getPositionColor(rec.player.position)}`}>
                  {rec.player.position}
                </div>
                
                {/* Player Info */}
                <div className="flex-1">
                  <div className="text-white font-medium text-sm">{rec.player.name}</div>
                  <div className="text-gray-400 text-xs">{rec.player.team}</div>
                </div>
                
                {/* VBD Score */}
                <div className="text-right">
                  <div className="text-white font-bold text-sm">+{rec.player.vbdScore.toFixed(1)}</div>
                  <div className="text-gray-400 text-xs">VBD</div>
                </div>
              </div>
              
              {/* Recommendation Reason */}
              <div className="mt-2 pt-2 border-t border-draft-border">
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="font-medium text-blue-400">Why:</span>
                  {rec.reason}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Strategy Reminder */}
      <div className="mt-3 pt-3 border-t border-draft-border">
        <div className="text-xs text-gray-500">
          Strategy: <span className="text-gray-400 font-medium">
            {draftStrategy.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ')}
          </span>
        </div>
      </div>
    </div>
  );
}