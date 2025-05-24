import type { Player } from '../../types';

interface PlayerQueueProps {
  queue: Player[];
  onRemove: (playerId: string) => void;
  onClear: () => void;
}

export function PlayerQueue({ queue, onRemove, onClear }: PlayerQueueProps) {
  const getPositionColor = (position: Player['position']) => {
    switch (position) {
      case 'QB': return 'bg-position-qb';
      case 'RB': return 'bg-position-rb';
      case 'WR': return 'bg-position-wr';
      case 'TE': return 'bg-position-te';
      default: return 'bg-gray-500';
    }
  };

  if (queue.length === 0) {
    return (
      <div>
        <h3 className="text-white font-semibold mb-2 text-sm">Player Queue</h3>
        <div className="bg-draft-bg rounded p-2 text-center text-gray-400 text-xs">
          No players in queue
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-white font-semibold text-sm">Player Queue</h3>
        <button
          onClick={onClear}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="space-y-1 max-h-32 overflow-y-auto subtle-scrollbar">
        {queue.map((player, index) => (
          <div
            key={player.id}
            className="bg-draft-bg rounded p-1.5 flex items-center justify-between group text-xs"
          >
            <div className="flex items-center space-x-1">
              <span className="text-gray-400 w-3">{index + 1}.</span>
              <span className={`${getPositionColor(player.position)} text-white text-xs px-1 py-0.5 rounded`}>
                {player.position}
              </span>
              <div className="text-white">{player.name.split(' ').pop()}</div>
            </div>
            <button
              onClick={() => onRemove(player.id)}
              className="text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all text-sm"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}