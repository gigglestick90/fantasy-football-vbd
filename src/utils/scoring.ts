import type { Player, PlayerStats, ScoringSettings } from '../types';

export const DEFAULT_SCORING: ScoringSettings = {
  passing: {
    yardsPerPoint: 25,
    tdPoints: 4,
    intPoints: -2,
    bonus300: 1.5,
    bonus400: 3,
  },
  rushing: {
    yardsPerPoint: 10,
    tdPoints: 6,
    bonus100: 2.5,
    bonus200: 5,
  },
  receiving: {
    receptionPoints: 0.5,
    wrReceptionBonus: 0.5,
    teReceptionBonus: 1.0,
    yardsPerPoint: 10,
    tdPoints: 6,
    bonus100: 2,
    bonus200: 4,
  },
  misc: {
    twoPointConversion: 2,
    fumbleLost: -2,
    fumbleRecoveryTd: 6,
  },
};

export function calculateFantasyPoints(
  stats: PlayerStats,
  position: Player['position'],
  scoring: ScoringSettings = DEFAULT_SCORING
): number {
  let points = 0;

  // Passing points
  if (stats.passing) {
    const { passing } = stats;
    points += passing.yards / scoring.passing.yardsPerPoint;
    points += passing.touchdowns * scoring.passing.tdPoints;
    points += passing.interceptions * scoring.passing.intPoints;
    
    // Passing bonuses
    if (passing.yards >= 400) {
      points += scoring.passing.bonus400;
    } else if (passing.yards >= 300) {
      points += scoring.passing.bonus300;
    }
  }

  // Rushing points
  if (stats.rushing) {
    const { rushing } = stats;
    points += rushing.yards / scoring.rushing.yardsPerPoint;
    points += rushing.touchdowns * scoring.rushing.tdPoints;
    points += rushing.fumbles * scoring.misc.fumbleLost;
    
    // Rushing bonuses
    if (rushing.yards >= 200) {
      points += scoring.rushing.bonus200;
    } else if (rushing.yards >= 100) {
      points += scoring.rushing.bonus100;
    }
  }

  // Receiving points
  if (stats.receiving) {
    const { receiving } = stats;
    points += receiving.yards / scoring.receiving.yardsPerPoint;
    points += receiving.touchdowns * scoring.receiving.tdPoints;
    
    // Reception points with position bonuses
    let receptionPoints = scoring.receiving.receptionPoints;
    if (position === 'WR') {
      receptionPoints += scoring.receiving.wrReceptionBonus;
    } else if (position === 'TE') {
      receptionPoints += scoring.receiving.teReceptionBonus;
    }
    points += receiving.receptions * receptionPoints;
    
    // Receiving bonuses
    if (receiving.yards >= 200) {
      points += scoring.receiving.bonus200;
    } else if (receiving.yards >= 100) {
      points += scoring.receiving.bonus100;
    }
  }

  return Math.round(points * 10) / 10; // Round to 1 decimal place
}