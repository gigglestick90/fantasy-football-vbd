import { useState } from 'react';
import { useDraftStore } from '../../store';
import { getPlayerRecommendations } from '../../utils/recommendations';
import { Crown } from 'lucide-react';
import type { Position } from '../../types';

interface PlayerSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  pickNumber: number;
  teamId: number;
}

export function PlayerSelectModal({ isOpen, onClose, pickNumber, teamId }: PlayerSelectModalProps) {
  const { players, draftPlayer, getAvailablePlayers, getTeamRoster, userTeamId, currentPick, leagueSize, draftStrategy } = useDraftStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<Position | 'ALL'>('ALL');
  
  if (!isOpen) return null;

  const availablePlayers = players
    .filter(p => !p.isDrafted)
    .filter(p => selectedPosition === 'ALL' || p.position === selectedPosition)
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 p.team.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.vbdScore - a.vbdScore);
    
  // Get recommendations for the current user
  const recommendations = teamId === userTeamId 
    ? getPlayerRecommendations(
        getAvailablePlayers(),
        getTeamRoster(userTeamId),
        currentPick,
        leagueSize,
        draftStrategy
      )
    : [];
    
  const recommendedPlayerIds = new Set(recommendations.map(rec => rec.player.id));

  const handleDraftPlayer = (playerId: string) => {
    draftPlayer(playerId, teamId, pickNumber);
    onClose();
  };

  const getPositionColor = (position: Position) => {
    switch (position) {
      case 'QB': return 'bg-position-qb';
      case 'RB': return 'bg-position-rb';
      case 'WR': return 'bg-position-wr';
      case 'TE': return 'bg-position-te';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-draft-card rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-draft-border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-2xl font-bold">Select Player - Pick #{pickNumber}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="flex gap-4 mb-4">
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-draft-bg text-white px-4 py-2 rounded border border-draft-border focus:outline-none focus:border-blue-500 text-sm"
          />
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value as Position | 'ALL')}
            className="bg-draft-bg text-white px-4 py-2 rounded border border-draft-border focus:outline-none focus:border-blue-500 text-sm"
          >
            <option value="ALL">All Positions</option>
            <option value="QB">QB</option>
            <option value="RB">RB</option>
            <option value="WR">WR</option>
            <option value="TE">TE</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-draft-card">
              <tr className="text-left text-gray-400 border-b border-draft-border">
                <th className="pb-2">Rank</th>
                <th className="pb-2">Name</th>
                <th className="pb-2">Team</th>
                <th className="pb-2">Pos</th>
                <th className="pb-2">Proj Pts</th>
                <th className="pb-2">VBD</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {availablePlayers.map((player, index) => {
                const isRecommended = recommendedPlayerIds.has(player.id);
                const recommendationRank = recommendations.findIndex(rec => rec.player.id === player.id) + 1;
                
                return (
                  <tr key={player.id} className={`border-b border-draft-border hover:bg-draft-bg ${isRecommended ? 'bg-yellow-500/10' : ''}`}>
                    <td className="py-3 text-gray-400">{index + 1}</td>
                    <td className="py-3 text-white font-medium">
                      <div className="flex items-center gap-2">
                        {isRecommended && (
                          <div className="flex items-center gap-1">
                            <Crown className="w-4 h-4 text-yellow-500" />
                            <span className="text-yellow-500 text-xs font-bold">#{recommendationRank}</span>
                          </div>
                        )}
                        {player.name}
                      </div>
                    </td>
                    <td className="py-3 text-gray-300">{player.team}</td>
                    <td className="py-3">
                      <span className={`${getPositionColor(player.position)} text-white px-2 py-1 rounded text-sm`}>
                        {player.position}
                      </span>
                    </td>
                    <td className="py-3 text-white">{player.projectedPoints.toFixed(1)}</td>
                    <td className="py-3 text-white font-semibold">{player.vbdScore.toFixed(1)}</td>
                    <td className="py-3">
                      <button
                        onClick={() => handleDraftPlayer(player.id)}
                        className={`${
                          isRecommended 
                            ? 'bg-yellow-600 hover:bg-yellow-700' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        } text-white px-6 py-1.5 rounded transition-colors text-sm font-medium`}
                      >
                        {isRecommended && recommendationRank === 1 ? 'Best Pick' : 'Draft'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}