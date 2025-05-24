import { useState } from 'react';
import { useDraftStore } from '../../store';
import { PlayerQueue } from '../PlayerCard/PlayerQueue';
import { Recommendations } from '../Recommendations';
import { isPlayerRecommended } from '../../utils/recommendations';
import type { Player } from '../../types';

export function Sidebar() {
  const { players, currentPick, getCurrentRound, isUserPick, leagueSize, userTeamId, getTeamRoster, getAvailablePlayers, draftStrategy } = useDraftStore();
  const [playerQueue, setPlayerQueue] = useState<Player[]>([]);
  
  const topAvailable = players
    .filter(p => !p.isDrafted)
    .sort((a, b) => b.vbdScore - a.vbdScore)
    .slice(0, 10);

  return (
    <div className="flex flex-col h-full p-4">
      {/* Draft Settings - Compact */}
      <div className="mb-4">
        <h3 className="text-white font-semibold mb-2 text-sm">Draft Settings</h3>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">League Size:</span>
            <span className="text-white">{leagueSize} Teams</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Your Team:</span>
            <span className="text-white">Team {userTeamId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Draft Type:</span>
            <span className="text-white">Snake</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Format:</span>
            <span className="text-white">Superflex</span>
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="mb-4">
        <Recommendations />
      </div>

      {/* Player Queue - Compact */}
      <div className="mb-4">
        <PlayerQueue 
          queue={playerQueue}
          onRemove={(playerId) => setPlayerQueue(prev => prev.filter(p => p.id !== playerId))}
          onClear={() => setPlayerQueue([])}
        />
      </div>

      {/* Draft Status - Compact */}
      <div className="mb-4">
        <h3 className="text-white font-semibold mb-2 text-sm">Draft Status</h3>
        <div className="bg-draft-bg rounded p-2">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs text-gray-400">Current Pick</div>
              <div className="text-xl font-bold text-white">#{currentPick}</div>
              <div className="text-xs text-gray-400">Round {getCurrentRound()}</div>
            </div>
            {isUserPick() && (
              <div className="text-green-400 font-semibold text-sm">You're on the clock!</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Available - Takes remaining space */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <h3 className="text-white font-semibold mb-2 text-sm">Top Available (VBD)</h3>
        <div className="flex-1 overflow-y-auto subtle-scrollbar space-y-1">
          {topAvailable.map((player, index) => {
            const isRecommended = isPlayerRecommended(
              player.id,
              getAvailablePlayers(),
              getTeamRoster(userTeamId),
              currentPick,
              leagueSize,
              draftStrategy
            );
            
            return (
              <div 
                key={player.id} 
                className={`flex items-center justify-between bg-draft-bg rounded p-2 hover:bg-gray-700 cursor-pointer transition-colors text-xs relative ${
                  isRecommended ? 'ring-2 ring-yellow-500/50' : ''
                }`}
                onClick={() => {
                  if (!playerQueue.find(p => p.id === player.id)) {
                    setPlayerQueue(prev => [...prev, player]);
                  }
                }}
                title="Click to add to queue"
              >
                {isRecommended && (
                  <div className="absolute -top-1 -left-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-black text-xs font-bold">★</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 w-4">{index + 1}.</span>
                  <div>
                    <div className="text-white font-medium">{player.name}</div>
                    <div className="text-gray-400">{player.team} - {player.position}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{player.vbdScore.toFixed(1)}</div>
                  <div className="text-gray-400">{player.projectedPoints.toFixed(1)} pts</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}