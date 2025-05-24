import Papa from 'papaparse';
import type { Player, PlayerStats, Position } from '../types';

interface CSVRow {
  Name: string;
  Team: string;
  POS: string;
  PTS: string;
  'PTS/G': string;
  GP: string;
  PASSING_CMP: string;
  PASSING_ATT: string;
  PASSING_YDS: string;
  PASSING_TD: string;
  PASSING_INT: string;
  RUSHING_ATT: string;
  RUSHING_YDS: string;
  RUSHING_TD: string;
  RUSHING_FUM: string;
  RECEIVING_TGT: string;
  RECEIVING_REC: string;
  RECEIVING_YDS: string;
  RECEIVING_TD: string;
}

export async function parsePlayersFromCSV(csvPath: string): Promise<Player[]> {
  const response = await fetch(csvPath);
  const csvText = await response.text();
  
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(csvText, {
      header: true,
      complete: (results) => {
        const players: Player[] = results.data
          .filter(row => row.Name && ['QB', 'RB', 'WR', 'TE'].includes(row.POS))
          .map((row, index) => {
            const stats: PlayerStats = {
              gamesPlayed: parseInt(row.GP) || 0,
              points: parseFloat(row.PTS) || 0,
              pointsPerGame: parseFloat(row['PTS/G']) || 0,
            };

            // Add passing stats if applicable
            if (parseInt(row.PASSING_ATT) > 0) {
              stats.passing = {
                completions: parseInt(row.PASSING_CMP) || 0,
                attempts: parseInt(row.PASSING_ATT) || 0,
                yards: parseInt(row.PASSING_YDS) || 0,
                touchdowns: parseInt(row.PASSING_TD) || 0,
                interceptions: parseInt(row.PASSING_INT) || 0,
              };
            }

            // Add rushing stats if applicable
            if (parseInt(row.RUSHING_ATT) > 0) {
              stats.rushing = {
                attempts: parseInt(row.RUSHING_ATT) || 0,
                yards: parseInt(row.RUSHING_YDS) || 0,
                touchdowns: parseInt(row.RUSHING_TD) || 0,
                fumbles: parseInt(row.RUSHING_FUM) || 0,
              };
            }

            // Add receiving stats if applicable
            if (parseInt(row.RECEIVING_TGT) > 0) {
              stats.receiving = {
                targets: parseInt(row.RECEIVING_TGT) || 0,
                receptions: parseInt(row.RECEIVING_REC) || 0,
                yards: parseInt(row.RECEIVING_YDS) || 0,
                touchdowns: parseInt(row.RECEIVING_TD) || 0,
              };
            }

            // Calculate projected points (simple projection for now - can be enhanced)
            const projectedPoints = projectPlayerPoints(stats, row.POS as Position);

            return {
              id: `player-${index}`,
              name: row.Name,
              team: row.Team,
              position: row.POS as Position,
              stats2024: stats,
              projectedPoints,
              vbdScore: 0, // Will be calculated later
              isDrafted: false,
            };
          });

        resolve(players);
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}

function projectPlayerPoints(stats: PlayerStats, position: Position): number {
  // Simple projection: use 2024 points with some adjustments
  // This can be enhanced with more sophisticated projections
  let projectedPoints = stats.points;
  
  // Apply simple adjustments based on games played
  if (stats.gamesPlayed < 17 && stats.gamesPlayed > 0) {
    // Project to full season if they missed games
    projectedPoints = (stats.points / stats.gamesPlayed) * 16;
  }
  
  // Apply slight regression to mean
  const positionAverages: Record<Position, number> = {
    QB: 250,
    RB: 180,
    WR: 160,
    TE: 120,
  };
  
  const avgPoints = positionAverages[position];
  projectedPoints = projectedPoints * 0.8 + avgPoints * 0.2;
  
  return Math.round(projectedPoints * 10) / 10;
}