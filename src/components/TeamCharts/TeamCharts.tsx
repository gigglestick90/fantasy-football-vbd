import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Player, Position } from '../../types';

interface TeamChartsProps {
  roster: Player[];
}

export function TeamCharts({ roster }: TeamChartsProps) {
  // Calculate positional strength data for radar chart
  const calculatePositionalStrength = () => {
    const positions: Position[] = ['QB', 'RB', 'WR', 'TE'];
    
    // Get average VBD by position across the league (rough estimates)
    const leagueAvgVBD = {
      QB: 30,
      RB: 25,
      WR: 25,
      TE: 20,
    };
    
    return positions.map(pos => {
      const positionPlayers = roster.filter(p => p.position === pos);
      const totalVBD = positionPlayers.reduce((sum, p) => sum + p.vbdScore, 0);
      const avgVBD = positionPlayers.length > 0 ? totalVBD / positionPlayers.length : 0;
      const strength = Math.min(100, (avgVBD / leagueAvgVBD[pos]) * 50);
      
      return {
        position: pos,
        strength: Math.max(0, strength),
        fullMark: 100,
      };
    });
  };
  
  // Get top 5 players by VBD for bar chart
  const getTopPlayersByVBD = () => {
    return [...roster]
      .sort((a, b) => b.vbdScore - a.vbdScore)
      .slice(0, 5)
      .map(player => ({
        name: player.name.split(' ').map(n => n[0]).join('') + '. ' + player.name.split(' ').pop(),
        vbd: player.vbdScore,
        position: player.position,
      }));
  };
  
  const radarData = calculatePositionalStrength();
  const barData = getTopPlayersByVBD();
  
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-draft-bg border border-draft-border rounded p-2">
          <p className="text-white text-sm">{`${payload[0].name}: ${payload[0].value.toFixed(1)}`}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="bg-draft-card rounded-lg p-6 space-y-6">
      <h2 className="text-white text-2xl font-bold">TEAM ANALYTICS</h2>
      
      {/* Radar Chart - Positional Strength */}
      <div>
        <h3 className="text-gray-400 text-sm font-medium mb-4">POSITIONAL STRENGTH</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid 
                gridType="polygon" 
                stroke="#374151"
                radialLines={true}
              />
              <PolarAngleAxis 
                dataKey="position" 
                tick={{ fill: '#ffffff', fontSize: 12 }}
                className="font-medium"
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]}
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                axisLine={false}
              />
              <Radar 
                name="Strength" 
                dataKey="strength" 
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Bar Chart - Top Players by VBD */}
      <div>
        <h3 className="text-gray-400 text-sm font-medium mb-4">TOP PLAYERS BY VBD</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                type="category" 
                dataKey="name" 
                tick={{ fill: '#ffffff', fontSize: 11 }}
                angle={-20}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                type="number"
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                domain={[0, 'dataMax + 10']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="vbd" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                label={false}
              >
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-draft-border">
        <div className="text-center">
          <div className="text-gray-400 text-xs">AVG PICK</div>
          <div className="text-white text-2xl font-bold">
            {roster.length > 0 
              ? (roster.reduce((sum, p) => sum + (p.draftPick || 0), 0) / roster.length).toFixed(1)
              : '0'
            }
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400 text-xs">PLAYERS</div>
          <div className="text-white text-2xl font-bold">{roster.length}</div>
        </div>
      </div>
    </div>
  );
}