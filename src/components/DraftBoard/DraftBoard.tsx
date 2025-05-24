import { useState } from 'react';
import { useDraftStore } from '../../store';
import type { Player } from '../../types';
import { PlayerSelectModal } from '../PlayerCard/PlayerSelectModal';

export function DraftBoard() {
  const { leagueSize, players, currentPick, getCurrentRound } = useDraftStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPick, setSelectedPick] = useState<{ pickNumber: number; teamId: number } | null>(null);
  const totalRounds = 17; // Superflex draft rounds
  const currentRound = getCurrentRound();
  
  // Create array of pick slots for all rounds
  const createDraftGrid = () => {
    const grid = [];
    for (let round = 1; round <= totalRounds; round++) {
      const roundPicks = [];
      const isEvenRound = round % 2 === 0;
      
      // Always create picks in team order (1 to leagueSize)
      for (let team = 1; team <= leagueSize; team++) {
        // Calculate which pick number this team gets in this round
        let pickNumber;
        if (isEvenRound) {
          // Even rounds: Team 1 picks last (position 10), Team 10 picks first (position 1)
          const position = leagueSize - team + 1;
          pickNumber = (round - 1) * leagueSize + position;
        } else {
          // Odd rounds: Team 1 picks first (position 1), Team 10 picks last (position 10)
          pickNumber = (round - 1) * leagueSize + team;
        }
        
        const draftedPlayer = players.find(p => p.draftPick === pickNumber);
        
        roundPicks.push({
          team,
          round,
          pickNumber,
          player: draftedPlayer,
        });
      }
      
      grid.push(roundPicks);
    }
    return grid;
  };

  const draftGrid = createDraftGrid();
  
  const getPositionColor = (position: Player['position']) => {
    switch (position) {
      case 'QB': return 'bg-position-qb';
      case 'RB': return 'bg-position-rb';
      case 'WR': return 'bg-position-wr';
      case 'TE': return 'bg-position-te';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-draft-bg rounded-lg p-3">
      {/* Round Indicator */}
      <div className="text-center text-sm text-gray-400 mb-2">
        {totalRounds} Rounds - Currently on Round {currentRound}
      </div>
      
      {/* Team Headers */}
      <div className={`grid ${leagueSize === 10 ? 'grid-cols-10' : 'grid-cols-12'} gap-1 mb-2`}>
        {Array.from({ length: leagueSize }, (_, i) => (
          <div key={i} className="text-center">
            <div className="w-10 h-10 mx-auto mb-1 bg-draft-card rounded-full flex items-center justify-center text-white font-bold text-sm">
              {i + 1}
            </div>
            <div className="text-white font-medium text-xs">
              Team {i + 1}
            </div>
          </div>
        ))}
      </div>
      
      {/* Draft Grid */}
      <div className="space-y-1">
        {draftGrid.map((round, roundIndex) => (
          <div key={roundIndex} className={`grid ${leagueSize === 10 ? 'grid-cols-10' : 'grid-cols-12'} gap-1`}>
            {round.map((pick) => (
              <div
                key={pick.pickNumber}
                className={`
                  border rounded h-12 flex items-center justify-center p-1
                  ${pick.pickNumber === currentPick ? 'border-draft-yellow border-2' : 'border-draft-border'}
                  ${pick.player ? getPositionColor(pick.player.position) : 'bg-draft-cell hover:bg-draft-card cursor-pointer'}
                  transition-colors
                `}
                onClick={() => {
                  if (!pick.player && pick.pickNumber === currentPick) {
                    setSelectedPick({ pickNumber: pick.pickNumber, teamId: pick.team });
                    setModalOpen(true);
                  }
                }}
              >
                {pick.player ? (
                  <div className="text-center w-full">
                    <div className="text-white font-medium text-xs leading-tight">
                      {pick.player.name.split(' ')[1] || pick.player.name}
                    </div>
                    <div className="text-gray-300 text-xs">
                      {pick.player.position} - {pick.player.team}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 text-sm">
                    {pick.pickNumber}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {modalOpen && selectedPick && (
        <PlayerSelectModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSelectedPick(null);
          }}
          pickNumber={selectedPick.pickNumber}
          teamId={selectedPick.teamId}
        />
      )}
    </div>
  );
}