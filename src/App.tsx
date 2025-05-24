import { useEffect, useState } from 'react';
import { useDraftStore } from './store';
import { parsePlayersFromCSV } from './utils/dataParser';
import { DraftBoard } from './components/DraftBoard';
import { Sidebar } from './components/Sidebar';
import { PlayerList } from './components/PlayerCard/PlayerList';
import { RosterView } from './components/RosterView';
import * as Tabs from '@radix-ui/react-tabs';

function App() {
  const [loading, setLoading] = useState(true);
  const { setPlayers, leagueSize, setLeagueSize } = useDraftStore();

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const playersData = await parsePlayersFromCSV('/src/data/2024_FF_Stats.csv');
        setPlayers(playersData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading players:', error);
        setLoading(false);
      }
    };

    loadPlayers();
  }, [setPlayers]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-draft-bg">
        <div className="text-xl text-white">Loading player data...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-black flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-draft-bg border-b border-draft-border px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-white text-lg font-bold">Fantasy Football VBD Draft Assistant</h1>
          <div className="flex items-center space-x-3">
            <label className="text-white text-sm">League Size:</label>
            <select 
              value={leagueSize} 
              onChange={(e) => setLeagueSize(Number(e.target.value) as 10 | 12)}
              className="bg-draft-card text-white border border-draft-border rounded px-3 py-1 text-sm"
            >
              <option value={10}>10 Teams</option>
              <option value={12}>12 Teams</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Draft Board and Roster Grid */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs.Root defaultValue="draft" className="h-full flex flex-col">
            <Tabs.List className="flex gap-2 px-4 pt-4 pb-2 flex-shrink-0">
              <Tabs.Trigger
                value="draft"
                className="px-4 py-2 text-white bg-draft-card border border-draft-border rounded hover:bg-gray-700 data-[state=active]:bg-blue-600 data-[state=active]:border-blue-600 text-sm font-medium"
              >
                Draft Board
              </Tabs.Trigger>
              <Tabs.Trigger
                value="players"
                className="px-4 py-2 text-white bg-draft-card border border-draft-border rounded hover:bg-gray-700 data-[state=active]:bg-blue-600 data-[state=active]:border-blue-600 text-sm font-medium"
              >
                Player Rankings
              </Tabs.Trigger>
              <Tabs.Trigger
                value="rosters"
                className="px-4 py-2 text-white bg-draft-card border border-draft-border rounded hover:bg-gray-700 data-[state=active]:bg-blue-600 data-[state=active]:border-blue-600 text-sm font-medium"
              >
                Rosters
              </Tabs.Trigger>
            </Tabs.List>
            
            <Tabs.Content value="draft" className="flex-1 overflow-y-auto subtle-scrollbar p-4">
              <DraftBoard />
            </Tabs.Content>
            
            <Tabs.Content value="players" className="flex-1 overflow-hidden p-4 flex flex-col">
              <PlayerList />
            </Tabs.Content>
            
            <Tabs.Content value="rosters" className="flex-1 overflow-y-auto subtle-scrollbar p-4">
              <RosterView />
            </Tabs.Content>
          </Tabs.Root>
        </div>

        {/* Sidebar */}
        <div className="w-72 bg-draft-bg border-l border-draft-border flex-shrink-0 overflow-y-auto subtle-scrollbar">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}

export default App;