import { create } from 'zustand';
import type { Player, DraftStrategy } from '../types';
import { calculateAllVBD } from '../utils/vbd';

interface DraftState {
  // Players
  players: Player[];
  setPlayers: (players: Player[]) => void;
  
  // Draft settings
  leagueSize: 10 | 12;
  currentPick: number;
  userTeamId: number;
  draftStrategy: DraftStrategy;
  
  // Actions
  setLeagueSize: (size: 10 | 12) => void;
  setUserTeamId: (teamId: number) => void;
  setDraftStrategy: (strategy: DraftStrategy) => void;
  draftPlayer: (playerId: string, teamId: number, pickNumber: number) => void;
  undraftPlayer: (playerId: string) => void;
  
  // Computed values
  getAvailablePlayers: () => Player[];
  getDraftedPlayers: () => Player[];
  getTeamRoster: (teamId: number) => Player[];
  getCurrentRound: () => number;
  isUserPick: () => boolean;
}

export const useDraftStore = create<DraftState>((set, get) => ({
  // Initial state
  players: [],
  leagueSize: 10,
  currentPick: 1,
  userTeamId: 1,
  draftStrategy: 'balanced',
  
  // Player management
  setPlayers: (players) => {
    const playersWithVBD = calculateAllVBD(players, get().leagueSize);
    set({ players: playersWithVBD });
  },
  
  // Settings
  setLeagueSize: (size) => {
    set({ leagueSize: size });
    // Recalculate VBD with new league size
    const players = get().players;
    if (players.length > 0) {
      const playersWithVBD = calculateAllVBD(players, size);
      set({ players: playersWithVBD });
    }
  },
  
  setUserTeamId: (teamId) => {
    set({ userTeamId: teamId });
  },
  
  setDraftStrategy: (strategy) => {
    set({ draftStrategy: strategy });
  },
  
  // Draft actions
  draftPlayer: (playerId, teamId, pickNumber) => {
    set((state) => ({
      players: state.players.map((player) =>
        player.id === playerId
          ? { ...player, isDrafted: true, draftedBy: teamId, draftPick: pickNumber }
          : player
      ),
      currentPick: pickNumber + 1,
    }));
    
    // Recalculate VBD after draft
    const updatedPlayers = get().players;
    const playersWithVBD = calculateAllVBD(updatedPlayers, get().leagueSize);
    set({ players: playersWithVBD });
  },
  
  undraftPlayer: (playerId) => {
    set((state) => {
      const player = state.players.find(p => p.id === playerId);
      const newCurrentPick = player?.draftPick || state.currentPick;
      
      return {
        players: state.players.map((p) =>
          p.id === playerId
            ? { ...p, isDrafted: false, draftedBy: undefined, draftPick: undefined }
            : p
        ),
        currentPick: Math.min(newCurrentPick, state.currentPick),
      };
    });
    
    // Recalculate VBD
    const updatedPlayers = get().players;
    const playersWithVBD = calculateAllVBD(updatedPlayers, get().leagueSize);
    set({ players: playersWithVBD });
  },
  
  // Computed getters
  getAvailablePlayers: () => {
    return get().players.filter((player) => !player.isDrafted);
  },
  
  getDraftedPlayers: () => {
    return get().players.filter((player) => player.isDrafted);
  },
  
  getTeamRoster: (teamId) => {
    return get().players.filter((player) => player.draftedBy === teamId);
  },
  
  getCurrentRound: () => {
    const { currentPick, leagueSize } = get();
    return Math.ceil(currentPick / leagueSize);
  },
  
  isUserPick: () => {
    const { currentPick, userTeamId, leagueSize } = get();
    const round = Math.ceil(currentPick / leagueSize);
    const pickInRound = ((currentPick - 1) % leagueSize) + 1;
    
    // Snake draft logic
    if (round % 2 === 1) {
      // Odd rounds go 1->10/12
      return pickInRound === userTeamId;
    } else {
      // Even rounds go 10/12->1
      return pickInRound === (leagueSize - userTeamId + 1);
    }
  },
}));