import { analyzeTeamNeeds } from '../../utils/teamNeeds';
import type { Player, Position } from '../../types';

interface TeamNeedsProps {
  roster: Player[];
}

export function TeamNeeds({ roster }: TeamNeedsProps) {
  const analysis = analyzeTeamNeeds(roster);

  const getPositionColor = (position: Position) => {
    switch (position) {
      case 'QB': return 'bg-position-qb';
      case 'RB': return 'bg-position-rb';
      case 'WR': return 'bg-position-wr';
      case 'TE': return 'bg-position-te';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-500';
      case 'B': return 'text-green-400';
      case 'C': return 'text-yellow-500';
      case 'D': return 'text-orange-500';
      case 'F': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="bg-draft-card rounded-lg p-6">
      <div className="mb-4">
        <h2 className="text-white text-2xl font-bold mb-2">TEAM NEEDS</h2>
        <div className="flex items-center gap-4">
          <span className="text-gray-400">Overall Grade:</span>
          <span className={`text-4xl font-bold ${getGradeColor(analysis.overallGrade)}`}>
            {analysis.overallGrade}
          </span>
        </div>
      </div>

      {/* Position Needs */}
      <div className="space-y-3 mb-6">
        {analysis.positionNeeds.map((need) => (
          <div key={need.position} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${getPositionColor(need.position)}`}>
              {need.position}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white">{need.filled}/{need.required}</span>
                <span className="text-gray-400 text-sm">starter{need.required > 1 ? 's' : ''}</span>
                {need.depth > 0 && (
                  <span className="text-gray-500 text-sm">({need.depth} more for depth)</span>
                )}
              </div>
              <div className={`text-sm font-medium ${getPriorityColor(need.priority)}`}>
                {need.priority.toUpperCase()} PRIORITY
              </div>
            </div>
            <div className="text-right">
              <div className="flex gap-1">
                {Array.from({ length: need.required }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < need.filled ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="border-t border-draft-border pt-4">
        <h3 className="text-gray-400 text-sm font-medium mb-3">RECOMMENDATIONS</h3>
        <div className="space-y-2">
          {analysis.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
              <span className="text-white text-sm">{rec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Roster Summary */}
      <div className="mt-4 pt-4 border-t border-draft-border">
        <div className="grid grid-cols-4 gap-2 text-center">
          {Object.entries({ QB: 0, RB: 0, WR: 0, TE: 0 }).map(([pos]) => {
            const count = roster.filter(p => p.position === pos).length;
            return (
              <div key={pos} className="bg-draft-bg rounded-lg p-2">
                <div className={`text-xs font-bold ${getPositionColor(pos as Position)} bg-clip-text text-transparent`}>
                  {pos}
                </div>
                <div className="text-white text-lg font-bold">{count}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}