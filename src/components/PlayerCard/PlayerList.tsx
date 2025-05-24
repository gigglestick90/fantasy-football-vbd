import { useState } from 'react';
import { useDraftStore } from '../../store';
import { isPlayerRecommended } from '../../utils/recommendations';
import type { Position } from '../../types';

export function PlayerList() {
  const { players, getAvailablePlayers, userTeamId, getTeamRoster, currentPick, leagueSize, draftStrategy } = useDraftStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPosition, setSelectedPosition] = useState<Position | 'ALL'>('ALL');
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(true);

  const filteredPlayers = (showOnlyAvailable ? getAvailablePlayers() : players)
    .filter(p => selectedPosition === 'ALL' || p.position === selectedPosition)
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 p.team.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.vbdScore - a.vbdScore);

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
    <div className="bg-draft-card rounded-lg p-4 h-full flex flex-col">
      <h2 className="text-white text-xl font-bold mb-4">Player Rankings</h2>
      
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-draft-bg text-white px-4 py-2 rounded border border-draft-border focus:outline-none focus:border-blue-500"
        />
        <select
          value={selectedPosition}
          onChange={(e) => setSelectedPosition(e.target.value as Position | 'ALL')}
          className="bg-draft-bg text-white px-4 py-2 rounded border border-draft-border"
        >
          <option value="ALL">All Positions</option>
          <option value="QB">QB</option>
          <option value="RB">RB</option>
          <option value="WR">WR</option>
          <option value="TE">TE</option>
        </select>
        <label className="flex items-center text-white">
          <input
            type="checkbox"
            checked={showOnlyAvailable}
            onChange={(e) => setShowOnlyAvailable(e.target.checked)}
            className="mr-2"
          />
          Available Only
        </label>
      </div>

      <div className="flex-1 overflow-auto subtle-scrollbar">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-draft-border">
              <th className="pb-2">Rank</th>
              <th className="pb-2">Name</th>
              <th className="pb-2">Team</th>
              <th className="pb-2">Pos</th>
              <th className="pb-2">Proj Pts</th>
              <th className="pb-2">VBD</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.slice(0, 50).map((player, index) => {
              const isRecommended = !player.isDrafted && isPlayerRecommended(
                player.id,
                getAvailablePlayers(),
                getTeamRoster(userTeamId),
                currentPick,
                leagueSize,
                draftStrategy
              );
              
              return (
                <tr key={player.id} className={`border-b border-draft-border hover:bg-draft-bg ${isRecommended ? 'bg-yellow-500/10' : ''}`}>
                  <td className="py-2 text-gray-400">{index + 1}</td>
                  <td className="py-2 text-white font-medium flex items-center gap-2">
                    {isRecommended && (
                      <span className="text-yellow-500 text-xs font-bold">★</span>
                    )}
                    {player.name}
                  </td>
                  <td className="py-2 text-gray-300">{player.team}</td>
                  <td className="py-2">
                    <span className={`${getPositionColor(player.position)} text-white px-2 py-0.5 rounded text-xs`}>
                      {player.position}
                    </span>
                  </td>
                  <td className="py-2 text-white">{player.projectedPoints.toFixed(1)}</td>
                  <td className="py-2 text-white font-semibold">{player.vbdScore.toFixed(1)}</td>
                  <td className="py-2">
                    {player.isDrafted ? (
                      <span className="text-red-400 text-xs">
                        Team {player.draftedBy} (#{player.draftPick})
                      </span>
                    ) : (
                      <span className="text-green-400 text-xs">Available</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}