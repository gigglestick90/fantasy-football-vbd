import { useState } from 'react';
import { useDraftStore } from '../../store';
import { TeamNeeds } from '../TeamNeeds';
import { VBDGrade } from '../VBDGrade';
import { TeamCharts } from '../TeamCharts';
import type { Player } from '../../types';

export function RosterView() {
  const { leagueSize, getTeamRoster } = useDraftStore();
  const [selectedTeam, setSelectedTeam] = useState(1);
  
  const teamRoster = getTeamRoster(selectedTeam);
  

  const getPositionOrder = (position: Player['position']) => {
    const order = { QB: 1, RB: 2, WR: 3, TE: 4 };
    return order[position] || 5;
  };

  // Sort roster by position
  const sortedRoster = [...teamRoster].sort((a, b) => {
    const orderDiff = getPositionOrder(a.position) - getPositionOrder(b.position);
    if (orderDiff !== 0) return orderDiff;
    return b.projectedPoints - a.projectedPoints;
  });

  // Group players by roster slot
  const assignedPlayers = new Set<Player>();
  
  const rosterSlots: Record<string, Player | undefined> = {};
  
  // Assign starting positions first
  rosterSlots.QB = sortedRoster.find(p => p.position === 'QB' && !assignedPlayers.has(p));
  if (rosterSlots.QB) assignedPlayers.add(rosterSlots.QB);
  
  rosterSlots.RB1 = sortedRoster.find(p => p.position === 'RB' && !assignedPlayers.has(p));
  if (rosterSlots.RB1) assignedPlayers.add(rosterSlots.RB1);
  
  rosterSlots.RB2 = sortedRoster.find(p => p.position === 'RB' && !assignedPlayers.has(p));
  if (rosterSlots.RB2) assignedPlayers.add(rosterSlots.RB2);
  
  rosterSlots.WR1 = sortedRoster.find(p => p.position === 'WR' && !assignedPlayers.has(p));
  if (rosterSlots.WR1) assignedPlayers.add(rosterSlots.WR1);
  
  rosterSlots.WR2 = sortedRoster.find(p => p.position === 'WR' && !assignedPlayers.has(p));
  if (rosterSlots.WR2) assignedPlayers.add(rosterSlots.WR2);
  
  rosterSlots.TE = sortedRoster.find(p => p.position === 'TE' && !assignedPlayers.has(p));
  if (rosterSlots.TE) assignedPlayers.add(rosterSlots.TE);
  
  // Assign flex positions
  const flexEligible = sortedRoster.filter(p => ['RB', 'WR', 'TE'].includes(p.position) && !assignedPlayers.has(p));
  rosterSlots.FLEX1 = flexEligible[0];
  if (rosterSlots.FLEX1) assignedPlayers.add(rosterSlots.FLEX1);
  
  rosterSlots.FLEX2 = flexEligible[1];
  if (rosterSlots.FLEX2) assignedPlayers.add(rosterSlots.FLEX2);
  
  rosterSlots.FLEX3 = flexEligible[2];
  if (rosterSlots.FLEX3) assignedPlayers.add(rosterSlots.FLEX3);
  
  // Assign superflex (any position)
  rosterSlots.SUPERFLEX = sortedRoster.find(p => !assignedPlayers.has(p));
  if (rosterSlots.SUPERFLEX) assignedPlayers.add(rosterSlots.SUPERFLEX);

  const benchPlayers = sortedRoster.filter(p => !assignedPlayers.has(p));

  const getSlotColor = (slot: string) => {
    if (slot === 'QB') return 'bg-position-qb';
    if (slot === 'RB') return 'bg-position-rb';
    if (slot === 'WR') return 'bg-position-wr';
    if (slot === 'TE') return 'bg-position-te';
    if (slot.includes('FLEX') || slot === 'SUPERFLEX') return 'bg-gradient-to-br from-position-wr via-position-rb to-position-te';
    if (slot === 'K') return 'bg-purple-600';
    if (slot === 'DEF') return 'bg-gray-600';
    return 'bg-gray-600';
  };

  const RosterSlot = ({ label, player, slot }: { label: string; player?: Player; slot: string }) => (
    <div className="flex items-center gap-3 p-3 bg-draft-bg rounded-lg">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm ${getSlotColor(slot)}`}>
        {slot.includes('FLEX') ? 'FLEX' : slot === 'SUPERFLEX' ? 'SF' : label}
      </div>
      {player ? (
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <img 
              src={`https://ui-avatars.com/api/?name=${player.name.replace(' ', '+')}&background=random&color=fff&size=40`} 
              alt={player.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="text-white font-medium">{player.name}</div>
              <div className="text-gray-400 text-sm">{player.position} - {player.team}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 text-gray-500">Empty</div>
      )}
      <div className="text-right">
        <div className="text-white font-semibold">{player?.draftPick || '-'}</div>
        <div className="text-gray-400 text-xs">pick</div>
      </div>
    </div>
  );

  return (
    <div className="flex gap-6">
      {/* Left Column - Roster */}
      <div className="bg-draft-card rounded-lg p-6 max-w-2xl">
        <div className="mb-6">
          <h2 className="text-white text-2xl font-bold mb-4">RESULTS</h2>
          
          <div className="flex items-center gap-4 mb-6">
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(Number(e.target.value))}
              className="bg-draft-bg text-white px-4 py-2 rounded-lg border border-draft-border text-lg font-medium"
            >
              {Array.from({ length: leagueSize }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  Team {i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <RosterSlot label="QB" player={rosterSlots.QB} slot="QB" />
          <RosterSlot label="RB" player={rosterSlots.RB1} slot="RB" />
          <RosterSlot label="RB" player={rosterSlots.RB2} slot="RB" />
          <RosterSlot label="WR" player={rosterSlots.WR1} slot="WR" />
          <RosterSlot label="WR" player={rosterSlots.WR2} slot="WR" />
          <RosterSlot label="TE" player={rosterSlots.TE} slot="TE" />
          <RosterSlot label="W/R/T" player={rosterSlots.FLEX1} slot="FLEX" />
          <RosterSlot label="W/R/T" player={rosterSlots.FLEX2} slot="FLEX" />
          <RosterSlot label="W/R/T" player={rosterSlots.FLEX3} slot="FLEX" />
          <RosterSlot label="W/R/T/Q" player={rosterSlots.SUPERFLEX} slot="SUPERFLEX" />
          
          {/* K and DEF slots */}
          <RosterSlot label="K" player={undefined} slot="K" />
          <RosterSlot label="DEF" player={undefined} slot="DEF" />
          
          {/* Bench */}
          <div className="mt-4 pt-4 border-t border-draft-border">
            <h3 className="text-gray-400 text-sm font-medium mb-2">BENCH</h3>
            {benchPlayers.length > 0 ? (
              benchPlayers.map((player) => (
                <RosterSlot key={player.id} label="BN" player={player} slot={player.position} />
              ))
            ) : (
              <div className="text-gray-500 text-center py-4">No bench players drafted</div>
            )}
          </div>
        </div>
      </div>
      
      {/* Middle Column - Team Needs & VBD Grade */}
      <div className="w-96 space-y-6">
        <TeamNeeds roster={teamRoster} />
        <VBDGrade roster={teamRoster} />
      </div>
      
      {/* Right Column - Charts */}
      <div className="w-96">
        <TeamCharts roster={teamRoster} />
      </div>
    </div>
  );
}