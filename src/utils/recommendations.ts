import type { Player, Position, DraftStrategy } from '../types';
import { analyzeTeamNeeds } from './teamNeeds';

interface PlayerRecommendation {
  player: Player;
  score: number;
  reason: string;
  needLevel: 'critical' | 'high' | 'medium' | 'low' | 'none';
}

// Position tier thresholds - when quality drops significantly
const POSITION_TIERS = {
  QB: [80, 60, 40, 20],
  RB: [70, 50, 35, 20],
  WR: [70, 50, 35, 20],
  TE: [50, 35, 20, 10],
};

// Strategy modifiers for each position based on draft strategy
const STRATEGY_MODIFIERS: Record<DraftStrategy, Record<Position, number>> = {
  'balanced': {
    QB: 1.0,
    RB: 1.0,
    WR: 1.0,
    TE: 1.0,
  },
  'qb-heavy': {
    QB: 1.8,  // Heavily favor QBs
    RB: 0.9,
    WR: 0.9,
    TE: 0.9,
  },
  'hero-rb': {
    QB: 0.9,
    RB: 1.5,  // Favor getting 1 elite RB early
    WR: 1.1,
    TE: 1.0,
  },
  'zero-rb': {
    QB: 1.1,
    RB: 0.4,  // Heavily deprioritize RBs early
    WR: 1.4,  // Favor WRs instead
    TE: 1.2,
  },
  'hero-wr': {
    QB: 0.9,
    RB: 1.1,
    WR: 1.5,  // Favor getting 1 elite WR early
    TE: 1.0,
  },
  'zero-wr': {
    QB: 1.1,
    RB: 1.4,  // Favor RBs instead
    WR: 0.4,  // Heavily deprioritize WRs early
    TE: 1.2,
  },
  'vbd-only': {
    QB: 1.0,
    RB: 1.0,
    WR: 1.0,
    TE: 1.0,
  },
};

export function getPlayerRecommendations(
  availablePlayers: Player[],
  userRoster: Player[],
  currentPick: number,
  leagueSize: number,
  draftStrategy: DraftStrategy
): PlayerRecommendation[] {
  // Get team needs analysis
  const teamNeeds = analyzeTeamNeeds(userRoster);
  const positionNeedMap = new Map(
    teamNeeds.positionNeeds.map(need => [need.position, need])
  );

  // Calculate current round
  const currentRound = Math.ceil(currentPick / leagueSize);
  
  // Strategy-based adjustments
  const isVBDOnly = draftStrategy === 'vbd-only';
  
  // Early rounds (1-4) favor BPA more, later rounds can target needs (unless VBD only)
  const needsWeight = isVBDOnly ? 0.1 : Math.min(0.5, 0.2 + (currentRound - 1) * 0.05);
  const vbdWeight = 1 - needsWeight;

  // Analyze position scarcity
  const positionScarcity = analyzePositionScarcity(availablePlayers);
  
  // Score each available player
  const scoredPlayers: PlayerRecommendation[] = availablePlayers.map(player => {
    const need = positionNeedMap.get(player.position);
    const needLevel = need?.priority || 'none';
    
    // Base score from VBD
    let score = player.vbdScore * vbdWeight;
    
    // Apply strategy modifier
    const strategyMod = STRATEGY_MODIFIERS[draftStrategy][player.position];
    score *= strategyMod;
    
    // Apply need multipliers (reduced impact for VBD-only strategy)
    const needMultipliers = {
      critical: isVBDOnly ? 1.2 : 2.0,
      high: isVBDOnly ? 1.1 : 1.5,
      medium: isVBDOnly ? 1.05 : 1.2,
      low: 1.0,
      none: isVBDOnly ? 0.95 : 0.8,
    };
    score *= needMultipliers[needLevel] * needsWeight + vbdWeight;
    
    // Position scarcity bonus (reduced for VBD-only)
    const scarcityBonus = positionScarcity[player.position] || 0;
    score += scarcityBonus * (isVBDOnly ? 5 : 10);
    
    // Tier drop bonus - if this player is significantly better than the next at position
    const tierBonus = calculateTierBonus(player, availablePlayers);
    score += tierBonus;
    
    // Strategy-specific bonuses
    score = applyStrategySpecificBonuses(score, player, userRoster, currentRound, draftStrategy);
    
    // Generate reason for recommendation
    const reason = generateRecommendationReason(
      player, 
      needLevel, 
      scarcityBonus, 
      tierBonus, 
      currentRound, 
      draftStrategy,
      strategyMod
    );
    
    return {
      player,
      score,
      reason,
      needLevel,
    };
  });
  
  // Sort by score and return top 3
  return scoredPlayers
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function applyStrategySpecificBonuses(
  score: number,
  player: Player,
  roster: Player[],
  round: number,
  strategy: DraftStrategy
): number {
  const positionCounts = {
    QB: roster.filter(p => p.position === 'QB').length,
    RB: roster.filter(p => p.position === 'RB').length,
    WR: roster.filter(p => p.position === 'WR').length,
    TE: roster.filter(p => p.position === 'TE').length,
  };
  
  switch (strategy) {
    case 'qb-heavy':
      // Extra bonus for early QBs in superflex
      if (player.position === 'QB' && positionCounts.QB < 2 && round <= 6) {
        score *= 1.3;
      }
      break;
      
    case 'hero-rb':
      // Big bonus for first elite RB, then deprioritize
      if (player.position === 'RB') {
        if (positionCounts.RB === 0 && player.vbdScore > 60) {
          score *= 1.4;
        } else if (positionCounts.RB >= 1) {
          score *= 0.7;
        }
      }
      break;
      
    case 'zero-rb':
      // Avoid RBs early, grab them late
      if (player.position === 'RB' && round <= 6) {
        score *= 0.5;
      } else if (player.position === 'RB' && round >= 7) {
        score *= 1.3;
      }
      break;
      
    case 'hero-wr':
      // Big bonus for first elite WR, then balanced
      if (player.position === 'WR') {
        if (positionCounts.WR === 0 && player.vbdScore > 60) {
          score *= 1.4;
        } else if (positionCounts.WR >= 1) {
          score *= 0.8;
        }
      }
      break;
      
    case 'zero-wr':
      // Avoid WRs early, grab them late
      if (player.position === 'WR' && round <= 6) {
        score *= 0.5;
      } else if (player.position === 'WR' && round >= 7) {
        score *= 1.3;
      }
      break;
  }
  
  return score;
}

function analyzePositionScarcity(availablePlayers: Player[]): Record<Position, number> {
  const scarcity: Record<Position, number> = {
    QB: 0,
    RB: 0,
    WR: 0,
    TE: 0,
  };
  
  const positions: Position[] = ['QB', 'RB', 'WR', 'TE'];
  
  positions.forEach(position => {
    const positionPlayers = availablePlayers.filter(p => p.position === position);
    const topTierCount = positionPlayers.filter(p => p.vbdScore > POSITION_TIERS[position][0]).length;
    const midTierCount = positionPlayers.filter(p => p.vbdScore > POSITION_TIERS[position][1]).length;
    
    // Higher scarcity score means fewer quality players available
    if (topTierCount === 0) {
      scarcity[position] = 3;
    } else if (topTierCount <= 2) {
      scarcity[position] = 2;
    } else if (midTierCount <= 5) {
      scarcity[position] = 1;
    } else {
      scarcity[position] = 0;
    }
  });
  
  return scarcity;
}

function calculateTierBonus(player: Player, availablePlayers: Player[]): number {
  // Find next best player at same position
  const samePositionPlayers = availablePlayers
    .filter(p => p.position === player.position && p.id !== player.id)
    .sort((a, b) => b.vbdScore - a.vbdScore);
  
  if (samePositionPlayers.length === 0) return 20; // Last player at position
  
  const nextBest = samePositionPlayers[0];
  const vbdDrop = player.vbdScore - nextBest.vbdScore;
  
  // Significant tier drop
  if (vbdDrop > 20) return 15;
  if (vbdDrop > 15) return 10;
  if (vbdDrop > 10) return 5;
  return 0;
}

function generateRecommendationReason(
  player: Player,
  needLevel: string,
  scarcityBonus: number,
  tierBonus: number,
  currentRound: number,
  strategy: DraftStrategy,
  strategyMod: number
): string {
  const reasons: string[] = [];
  
  // VBD value reason
  if (player.vbdScore > 80) {
    reasons.push('Elite value');
  } else if (player.vbdScore > 60) {
    reasons.push('Great value');
  } else if (player.vbdScore > 40) {
    reasons.push('Good value');
  }
  
  // Strategy alignment
  if (strategyMod > 1.3) {
    reasons.push('fits strategy perfectly');
  } else if (strategyMod < 0.7 && player.vbdScore > 60) {
    reasons.push('too good to pass');
  }
  
  // Need reason
  if (needLevel === 'critical') {
    reasons.push('fills critical need');
  } else if (needLevel === 'high' && strategy !== 'vbd-only') {
    reasons.push('fills high need');
  }
  
  // Scarcity reason
  if (scarcityBonus >= 2) {
    reasons.push(`scarce ${player.position} talent`);
  }
  
  // Tier reason
  if (tierBonus >= 15) {
    reasons.push('major tier drop after');
  } else if (tierBonus >= 10) {
    reasons.push('tier drop after');
  }
  
  // Special strategy reasons
  switch (strategy) {
    case 'qb-heavy':
      if (player.position === 'QB' && currentRound <= 6) {
        reasons.push('QB-heavy strategy pick');
      }
      break;
    case 'hero-rb':
      if (player.position === 'RB' && player.vbdScore > 60) {
        reasons.push('anchor RB for hero strategy');
      }
      break;
    case 'zero-rb':
      if (player.position !== 'RB' && currentRound <= 6) {
        reasons.push('zero-RB target');
      }
      break;
  }
  
  // Format reason string
  if (reasons.length === 0) {
    return 'Solid pick at current value';
  }
  
  return reasons.slice(0, 2).join(', ');
}

// Get top recommendation (for highlighting purposes)
export function getTopRecommendation(
  availablePlayers: Player[],
  userRoster: Player[],
  currentPick: number,
  leagueSize: number,
  draftStrategy: DraftStrategy
): Player | null {
  const recommendations = getPlayerRecommendations(
    availablePlayers,
    userRoster,
    currentPick,
    leagueSize,
    draftStrategy
  );
  
  return recommendations.length > 0 ? recommendations[0].player : null;
}

// Check if a player is recommended (top 3)
export function isPlayerRecommended(
  playerId: string,
  availablePlayers: Player[],
  userRoster: Player[],
  currentPick: number,
  leagueSize: number,
  draftStrategy: DraftStrategy
): boolean {
  const recommendations = getPlayerRecommendations(
    availablePlayers,
    userRoster,
    currentPick,
    leagueSize,
    draftStrategy
  );
  
  return recommendations.some(rec => rec.player.id === playerId);
}