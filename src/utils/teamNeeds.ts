import type { Player, Position } from '../types';

interface PositionNeed {
  position: Position;
  filled: number;
  required: number;
  depth: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
}

interface TeamNeeds {
  positionNeeds: PositionNeed[];
  recommendations: string[];
  overallGrade: 'A' | 'B' | 'C' | 'D' | 'F';
}

// Your specific superflex league roster requirements
// 1 QB, 2 RB, 2 WR, 1 TE, 3 FLEX (W/R/T), 1 SUPERFLEX (W/R/T/Q)
const ROSTER_REQUIREMENTS = {
  QB: { 
    starters: 1,      // 1 QB starter
    flexStarters: 1,  // Can start in superflex
    idealDepth: 3     // Want 3 QBs total for superflex advantage
  },
  RB: { 
    starters: 2,      // 2 RB starters
    flexStarters: 3,  // Can start in 3 FLEX spots
    idealDepth: 6     // Want 6 RBs for depth
  },
  WR: { 
    starters: 2,      // 2 WR starters
    flexStarters: 3,  // Can start in 3 FLEX spots
    idealDepth: 6     // Want 6 WRs for depth
  },
  TE: { 
    starters: 1,      // 1 TE starter
    flexStarters: 3,  // Can start in 3 FLEX spots
    idealDepth: 2     // Want 2 TEs minimum
  },
};

export function analyzeTeamNeeds(roster: Player[]): TeamNeeds {
  // Count players by position
  const positionCounts: Record<Position, number> = {
    QB: 0,
    RB: 0,
    WR: 0,
    TE: 0,
  };

  roster.forEach(player => {
    positionCounts[player.position]++;
  });

  // Calculate how many starting spots we've filled
  const filledStarters = calculateFilledStarters(positionCounts);

  // Analyze needs for each position
  const positionNeeds: PositionNeed[] = [];

  Object.entries(ROSTER_REQUIREMENTS).forEach(([position, requirements]) => {
    const pos = position as Position;
    const filled = positionCounts[pos];
    const { starters, idealDepth } = requirements;

    let priority: PositionNeed['priority'];
    
    // For QB in superflex, having 2 is highly valuable
    if (pos === 'QB') {
      if (filled === 0) {
        priority = 'critical';
      } else if (filled === 1) {
        priority = 'high'; // Want 2nd QB for superflex
      } else if (filled === 2) {
        priority = 'medium';
      } else {
        priority = 'low';
      }
    } else {
      // For RB/WR/TE
      if (filled < starters) {
        priority = 'critical';
      } else if (filled === starters) {
        priority = 'high';
      } else if (filled < idealDepth) {
        priority = 'medium';
      } else {
        priority = 'low';
      }
    }

    positionNeeds.push({
      position: pos,
      filled,
      required: starters,
      depth: Math.max(0, idealDepth - filled),
      priority,
    });
  });

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  positionNeeds.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // Generate recommendations
  const recommendations = generateRecommendations(positionNeeds, roster, filledStarters);

  // Calculate overall grade
  const overallGrade = calculateGrade(positionNeeds, roster, filledStarters);

  return {
    positionNeeds,
    recommendations,
    overallGrade,
  };
}

function calculateFilledStarters(counts: Record<Position, number>): number {
  // Count minimum starters filled
  let filled = 0;
  
  // QB: 1 required
  filled += Math.min(counts.QB, 1);
  
  // RB: 2 required
  filled += Math.min(counts.RB, 2);
  
  // WR: 2 required
  filled += Math.min(counts.WR, 2);
  
  // TE: 1 required
  filled += Math.min(counts.TE, 1);
  
  // FLEX spots (3): Can be filled by RB/WR/TE
  const flexEligible = Math.max(0, counts.RB - 2) + 
                       Math.max(0, counts.WR - 2) + 
                       Math.max(0, counts.TE - 1);
  filled += Math.min(flexEligible, 3);
  
  // Superflex (1): Can be filled by any position
  const superflexEligible = Math.max(0, counts.QB - 1) + 
                            Math.max(0, flexEligible - 3);
  filled += Math.min(superflexEligible, 1);
  
  return filled;
}

function generateRecommendations(needs: PositionNeed[], roster: Player[], filledStarters: number): string[] {
  const recommendations: string[] = [];

  // Check if we can field a starting lineup
  const totalStartingSpots = 10; // 1 QB + 2 RB + 2 WR + 1 TE + 3 FLEX + 1 SUPERFLEX
  if (filledStarters < totalStartingSpots) {
    recommendations.push(`Need ${totalStartingSpots - filledStarters} more starters`);
  }

  // Critical needs first
  const criticalNeeds = needs.filter(n => n.priority === 'critical');
  if (criticalNeeds.length > 0) {
    const positions = criticalNeeds.map(n => n.position).join('/');
    recommendations.push(`URGENT: Draft ${positions} for starters`);
  }

  // Superflex QB strategy
  const qbCount = roster.filter(p => p.position === 'QB').length;
  if (qbCount === 0) {
    recommendations.push('CRITICAL: No QB - draft immediately!');
  } else if (qbCount === 1) {
    recommendations.push('Target QB for superflex advantage');
  }

  // Check RB/WR balance for flex spots
  const rbCount = roster.filter(p => p.position === 'RB').length;
  const wrCount = roster.filter(p => p.position === 'WR').length;
  
  if (rbCount >= 2 && wrCount >= 2) {
    // Have starters, check flex depth
    const flexDepth = (rbCount - 2) + (wrCount - 2);
    if (flexDepth < 3) {
      recommendations.push('Need RB/WR depth for flex spots');
    }
  }

  // Position-specific recommendations
  const highNeeds = needs.filter(n => n.priority === 'high');
  if (highNeeds.length > 0 && criticalNeeds.length === 0) {
    const positions = highNeeds.map(n => n.position).join('/');
    recommendations.push(`Target ${positions} for depth`);
  }

  // Best Player Available reminder
  if (filledStarters >= totalStartingSpots && criticalNeeds.length === 0) {
    recommendations.push('Core roster set - consider BPA');
  }

  return recommendations.slice(0, 3); // Limit to 3 recommendations
}

function calculateGrade(needs: PositionNeed[], roster: Player[], filledStarters: number): TeamNeeds['overallGrade'] {
  let score = 100;
  const totalStartingSpots = 10;

  // Major deduction if can't field full starting lineup
  if (filledStarters < totalStartingSpots) {
    score -= (totalStartingSpots - filledStarters) * 10;
  }

  // Deduct for critical needs
  const criticalCount = needs.filter(n => n.priority === 'critical').length;
  score -= criticalCount * 20;

  // Deduct for high priority needs
  const highCount = needs.filter(n => n.priority === 'high').length;
  score -= highCount * 10;

  // Bonus for having 2+ QBs in superflex
  const qbCount = roster.filter(p => p.position === 'QB').length;
  if (qbCount >= 2) {
    score += 10;
  }

  // Bonus for balanced roster
  const rbCount = roster.filter(p => p.position === 'RB').length;
  const wrCount = roster.filter(p => p.position === 'WR').length;
  if (rbCount >= 3 && wrCount >= 3 && roster.length >= 8) {
    score += 5;
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}