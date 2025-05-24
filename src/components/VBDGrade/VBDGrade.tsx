import type { Player } from '../../types';

interface VBDGradeProps {
  roster: Player[];
}

export function VBDGrade({ roster }: VBDGradeProps) {
  // Calculate team metrics
  const totalVBD = roster.reduce((sum, player) => sum + player.vbdScore, 0);
  const avgVBD = roster.length > 0 ? totalVBD / roster.length : 0;
  
  // Get top players VBD
  const sortedByVBD = [...roster].sort((a, b) => b.vbdScore - a.vbdScore);
  const top5VBD = sortedByVBD.slice(0, 5).reduce((sum, player) => sum + player.vbdScore, 0);
  
  // Calculate positional VBD
  const positionVBD = {
    QB: roster.filter(p => p.position === 'QB').reduce((sum, p) => sum + p.vbdScore, 0),
    RB: roster.filter(p => p.position === 'RB').reduce((sum, p) => sum + p.vbdScore, 0),
    WR: roster.filter(p => p.position === 'WR').reduce((sum, p) => sum + p.vbdScore, 0),
    TE: roster.filter(p => p.position === 'TE').reduce((sum, p) => sum + p.vbdScore, 0),
  };
  
  // Calculate grade based on VBD performance
  const calculateGrade = () => {
    if (roster.length === 0) return 'N/A';
    
    // Factors: total VBD, average VBD, and balance
    let score = 0;
    
    // Total VBD component (0-40 points)
    if (totalVBD > 600) score += 40;
    else if (totalVBD > 500) score += 35;
    else if (totalVBD > 400) score += 30;
    else if (totalVBD > 300) score += 25;
    else if (totalVBD > 200) score += 20;
    else if (totalVBD > 100) score += 15;
    else score += 10;
    
    // Average VBD component (0-30 points)
    if (avgVBD > 60) score += 30;
    else if (avgVBD > 50) score += 25;
    else if (avgVBD > 40) score += 20;
    else if (avgVBD > 30) score += 15;
    else if (avgVBD > 20) score += 10;
    else score += 5;
    
    // Top 5 players component (0-30 points)
    if (top5VBD > 350) score += 30;
    else if (top5VBD > 300) score += 25;
    else if (top5VBD > 250) score += 20;
    else if (top5VBD > 200) score += 15;
    else if (top5VBD > 150) score += 10;
    else score += 5;
    
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'A-';
    if (score >= 75) return 'B+';
    if (score >= 70) return 'B';
    if (score >= 65) return 'B-';
    if (score >= 60) return 'C+';
    if (score >= 55) return 'C';
    if (score >= 50) return 'C-';
    if (score >= 45) return 'D+';
    if (score >= 40) return 'D';
    return 'F';
  };
  
  const grade = calculateGrade();
  
  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-500';
    if (grade.startsWith('B')) return 'text-green-400';
    if (grade.startsWith('C')) return 'text-yellow-500';
    if (grade.startsWith('D')) return 'text-orange-500';
    if (grade === 'F') return 'text-red-500';
    return 'text-gray-500';
  };
  
  const bestPick = sortedByVBD[0];
  const worstPick = sortedByVBD[sortedByVBD.length - 1];
  
  return (
    <div className="bg-draft-card rounded-lg p-6">
      <h2 className="text-white text-2xl font-bold mb-4">VBD ANALYSIS</h2>
      
      {/* Grade Display */}
      <div className="text-center mb-6">
        <div className="text-gray-400 text-sm mb-1">VBD Grade</div>
        <div className={`text-6xl font-bold ${getGradeColor(grade)}`}>
          {grade}
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-400">Total VBD:</span>
          <span className="text-white font-bold">{totalVBD.toFixed(1)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Average VBD:</span>
          <span className="text-white font-bold">{avgVBD.toFixed(1)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Top 5 VBD:</span>
          <span className="text-white font-bold">{top5VBD.toFixed(1)}</span>
        </div>
      </div>
      
      {/* Best/Worst Picks */}
      {roster.length > 0 && (
        <div className="border-t border-draft-border pt-4 space-y-3">
          <div>
            <div className="text-green-500 text-xs font-medium mb-1">BEST VALUE</div>
            <div className="flex items-center gap-2">
              <img 
                src={`https://ui-avatars.com/api/?name=${bestPick.name.replace(' ', '+')}&background=10b981&color=fff&size=32`} 
                alt={bestPick.name}
                className="w-8 h-8 rounded-full"
              />
              <div className="flex-1">
                <div className="text-white text-sm font-medium">{bestPick.name}</div>
                <div className="text-gray-400 text-xs">{bestPick.position} - Pick {bestPick.draftPick}</div>
              </div>
              <div className="text-green-500 font-bold">+{bestPick.vbdScore.toFixed(1)}</div>
            </div>
          </div>
          
          {roster.length > 1 && (
            <div>
              <div className="text-red-500 text-xs font-medium mb-1">WORST VALUE</div>
              <div className="flex items-center gap-2">
                <img 
                  src={`https://ui-avatars.com/api/?name=${worstPick.name.replace(' ', '+')}&background=ef4444&color=fff&size=32`} 
                  alt={worstPick.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">{worstPick.name}</div>
                  <div className="text-gray-400 text-xs">{worstPick.position} - Pick {worstPick.draftPick}</div>
                </div>
                <div className="text-red-500 font-bold">{worstPick.vbdScore.toFixed(1)}</div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Position VBD Breakdown */}
      <div className="mt-4 pt-4 border-t border-draft-border">
        <div className="text-gray-400 text-xs font-medium mb-2">POSITION VBD</div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(positionVBD).map(([pos, vbd]) => (
            <div key={pos} className="bg-draft-bg rounded p-2 text-center">
              <div className="text-gray-400 text-xs">{pos}</div>
              <div className="text-white font-bold">{vbd.toFixed(0)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}