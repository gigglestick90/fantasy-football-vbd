import { useDraftStore } from '../../store';
import type { Position } from '../../types';

export function RosterGrid() {
  const { leagueSize, getTeamRoster } = useDraftStore();
  
  const getPositionColor = (position: Position) => {
    switch (position) {
      case 'QB': return 'text-position-qb';
      case 'RB': return 'text-position-rb';
      case 'WR': return 'text-position-wr';
      case 'TE': return 'text-position-te';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="bg-draft-card rounded-lg p-4 h-full">
      <h3 className="text-white font-semibold mb-3 text-base">Team Rosters</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-gray-400 border-b border-draft-border">
              <th className="text-left py-3 text-sm font-medium">Team</th>
              <th className="py-3 text-sm font-medium">QB</th>
              <th className="py-3 text-sm font-medium">RB</th>
              <th className="py-3 text-sm font-medium">RB</th>
              <th className="py-3 text-sm font-medium">WR</th>
              <th className="py-3 text-sm font-medium">WR</th>
              <th className="py-3 text-sm font-medium">TE</th>
              <th className="py-3 text-sm font-medium">WRT</th>
              <th className="py-3 text-sm font-medium">WRT</th>
              <th className="py-3 text-sm font-medium">WRT</th>
              <th className="py-3 text-sm font-medium">WRTQ</th>
              <th className="py-3 text-sm font-medium">BN</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: leagueSize }, (_, i) => {
              const teamRoster = getTeamRoster(i + 1);
              const qbs = teamRoster.filter(p => p.position === 'QB');
              const rbs = teamRoster.filter(p => p.position === 'RB');
              const wrs = teamRoster.filter(p => p.position === 'WR');
              const tes = teamRoster.filter(p => p.position === 'TE');
              
              // For flex spots, we'll show best available players
              const flexEligible = [...rbs.slice(2), ...wrs.slice(2), ...tes.slice(1)].sort((a, b) => b.projectedPoints - a.projectedPoints);
              const superflexEligible = [...qbs.slice(1), ...flexEligible];
              
              return (
                <tr key={i} className="border-b border-draft-border hover:bg-gray-800">
                  <td className="py-3 text-white font-medium text-sm">Team {i + 1}</td>
                  <td className="py-3 text-center text-sm">
                    {qbs[0] && (
                      <span className={getPositionColor('QB')} title={qbs[0].name}>
                        {qbs[0].name.split(' ').pop()}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-center text-sm">
                    {rbs[0] && (
                      <span className={getPositionColor('RB')} title={rbs[0].name}>
                        {rbs[0].name.split(' ').pop()}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-center text-sm">
                    {rbs[1] && (
                      <span className={getPositionColor('RB')} title={rbs[1].name}>
                        {rbs[1].name.split(' ').pop()}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-center text-sm">
                    {wrs[0] && (
                      <span className={getPositionColor('WR')} title={wrs[0].name}>
                        {wrs[0].name.split(' ').pop()}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-center text-sm">
                    {wrs[1] && (
                      <span className={getPositionColor('WR')} title={wrs[1].name}>
                        {wrs[1].name.split(' ').pop()}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-center text-sm">
                    {tes[0] && (
                      <span className={getPositionColor('TE')} title={tes[0].name}>
                        {tes[0].name.split(' ').pop()}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-center text-sm">
                    {flexEligible[0] && (
                      <span className={getPositionColor(flexEligible[0].position)} title={flexEligible[0].name}>
                        {flexEligible[0].name.split(' ').pop()}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-center text-sm">
                    {flexEligible[1] && (
                      <span className={getPositionColor(flexEligible[1].position)} title={flexEligible[1].name}>
                        {flexEligible[1].name.split(' ').pop()}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-center text-sm">
                    {flexEligible[2] && (
                      <span className={getPositionColor(flexEligible[2].position)} title={flexEligible[2].name}>
                        {flexEligible[2].name.split(' ').pop()}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-center text-sm">
                    {superflexEligible[0] && (
                      <span className={getPositionColor(superflexEligible[0].position)} title={superflexEligible[0].name}>
                        {superflexEligible[0].name.split(' ').pop()}
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-center text-gray-400 text-sm">
                    {teamRoster.length > 10 ? `+${teamRoster.length - 10}` : '-'}
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