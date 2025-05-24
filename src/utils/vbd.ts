import type { Player, Position } from '../types';

interface PositionBaselines {
  QB: number;
  RB: number;
  WR: number;
  TE: number;
}

export function getPositionBaselines(leagueSize: 10 | 12): PositionBaselines {
  if (leagueSize === 10) {
    return {
      QB: 10,
      RB: 20,
      WR: 30,
      TE: 10,
    };
  } else {
    return {
      QB: 12,
      RB: 24,
      WR: 36,
      TE: 12,
    };
  }
}

export function calculateVBD(
  player: Player,
  baselinePoints: number
): number {
  return Math.round((player.projectedPoints - baselinePoints) * 10) / 10;
}

export function getBaselinePlayer(
  players: Player[],
  position: Position,
  baseline: number
): Player | undefined {
  const positionPlayers = players
    .filter(p => p.position === position && !p.isDrafted)
    .sort((a, b) => b.projectedPoints - a.projectedPoints);
  
  return positionPlayers[baseline - 1];
}

export function calculateAllVBD(
  players: Player[],
  leagueSize: 10 | 12
): Player[] {
  const baselines = getPositionBaselines(leagueSize);
  const baselinePoints: Record<Position, number> = {
    QB: 0,
    RB: 0,
    WR: 0,
    TE: 0,
  };

  // Calculate baseline points for each position
  (['QB', 'RB', 'WR', 'TE'] as Position[]).forEach(position => {
    const baselinePlayer = getBaselinePlayer(players, position, baselines[position]);
    baselinePoints[position] = baselinePlayer?.projectedPoints || 0;
  });

  // Calculate VBD for all players
  return players.map(player => ({
    ...player,
    vbdScore: calculateVBD(player, baselinePoints[player.position]),
  }));
}

export function getPositionScarcity(
  players: Player[],
  position: Position
): number {
  const availablePlayers = players.filter(
    p => p.position === position && !p.isDrafted
  );
  
  const totalPlayers = players.filter(p => p.position === position).length;
  
  return availablePlayers.length / totalPlayers;
}