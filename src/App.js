import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Load initial state from localStorage or use default values
  const [stats, setStats] = useState(() => {
    const savedStats = localStorage.getItem('characterStats');
    return savedStats ? JSON.parse(savedStats) : {
      hp: 0,
      atk: 0,
      def: 0,
      mp: 0,
      agi: 0
    };
  });

  const [questChains, setQuestChains] = useState(() => {
    const savedQuests = localStorage.getItem('questChains');
    return savedQuests ? JSON.parse(savedQuests) : [
      {
        id: 1,
        title: 'Morning Victory Chain',
        quests: [
          { id: 1, name: 'Fajr Prayer', completed: false, reward: 'Fajr Blessing Buff' },
          { id: 2, name: 'Morning Duas', completed: false, reward: 'Dhikr Shield Buff' },
          { id: 3, name: 'One Work Task', completed: false, reward: 'Chain Completion Bonus' }
        ],
        chainBonus: '+50 to all stats for the day'
      },
      {
        id: 2,
        title: 'Daily Prayer Chain',
        quests: [
          { id: 4, name: 'Fajr', completed: false },
          { id: 5, name: 'Zuhr', completed: false },
          { id: 6, name: 'Asr', completed: false },
          { id: 7, name: 'Maghrib', completed: false },
          { id: 8, name: 'Isha', completed: false }
        ],
        chainBonus: 'Maximum MP boost for next day'
      }
    ];
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('characterStats', JSON.stringify(stats));
    localStorage.setItem('questChains', JSON.stringify(questChains));
  }, [stats, questChains]);

  // Reset quests at midnight
  useEffect(() => {
    const now = new Date();
    const night = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // tomorrow
      0, 0, 0 // midnight
    );
    const msToMidnight = night.getTime() - now.getTime();

    const timer = setTimeout(() => {
      resetQuests();
    }, msToMidnight);

    return () => clearTimeout(timer);
  }, []);

  const resetQuests = () => {
    setQuestChains(chains =>
      chains.map(chain => ({
        ...chain,
        quests: chain.quests.map(quest => ({
          ...quest,
          completed: false
        }))
      }))
    );
  };

  const toggleQuest = (chainId, questId) => {
    setQuestChains(chains =>
      chains.map(chain =>
        chain.id === chainId
          ? {
              ...chain,
              quests: chain.quests.map(quest =>
                quest.id === questId
                  ? { ...quest, completed: !quest.completed }
                  : quest
              )
            }
          : chain
      )
    );

    // Update stats based on quest completion
    updateStats(chainId, questId);
  };

  const updateStats = (chainId, questId) => {
    // Find the quest
    const chain = questChains.find(c => c.id === chainId);
    const quest = chain?.quests.find(q => q.id === questId);
    
    if (quest?.completed) {
      // Decrease stats if unchecking
      setStats(prev => ({
        ...prev,
        mp: Math.max(0, prev.mp - 5),
        atk: Math.max(0, prev.atk - 3)
      }));
    } else {
      // Increase stats if checking
      setStats(prev => ({
        ...prev,
        mp: Math.min(100, prev.mp + 5),
        atk: Math.min(100, prev.atk + 3)
      }));
    }
  };

  // Add new quest chain
  const addQuestChain = () => {
    const newChain = {
      id: Date.now(),
      title: 'New Quest Chain',
      quests: [
        { id: Date.now() + 1, name: 'New Quest', completed: false }
      ],
      chainBonus: 'New bonus'
    };

    setQuestChains([...questChains, newChain]);
  };

  // Add new quest to chain
  const addQuest = (chainId) => {
    setQuestChains(chains =>
      chains.map(chain =>
        chain.id === chainId
          ? {
              ...chain,
              quests: [...chain.quests, {
                id: Date.now(),
                name: 'New Quest',
                completed: false
              }]
            }
          : chain
      )
    );
  };

  // Edit quest name
  const editQuest = (chainId, questId, newName) => {
    setQuestChains(chains =>
      chains.map(chain =>
        chain.id === chainId
          ? {
              ...chain,
              quests: chain.quests.map(quest =>
                quest.id === questId
                  ? { ...quest, name: newName }
                  : quest
              )
            }
          : chain
      )
    );
  };

  return (
    <div className="App p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Life Quest Tracker</h1>
      
      {/* Stats Display */}
      <div className="grid grid-cols-5 gap-4 mb-6 p-4 bg-gray-100 rounded">
        <div>HP: {stats.hp}</div>
        <div>ATK: {stats.atk}</div>
        <div>DEF: {stats.def}</div>
        <div>MP: {stats.mp}</div>
        <div>AGI: {stats.agi}</div>
      </div>

      {/* Quest Chains */}
      <div className="space-y-4">
        {questChains.map(chain => (
          <div key={chain.id} className="border p-4 rounded">
            <h3 className="font-bold mb-2">{chain.title}</h3>
            <div className="space-y-2">
              {chain.quests.map(quest => (
                <div
                  key={quest.id}
                  className="flex items-center space-x-2 p-2 bg-white rounded"
                >
                  <input
                    type="checkbox"
                    checked={quest.completed}
                    onChange={() => toggleQuest(chain.id, quest.id)}
                  />
                  <input
                    type="text"
                    value={quest.name}
                    onChange={(e) => editQuest(chain.id, quest.id, e.target.value)}
                    className="flex-1 border-none"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => addQuest(chain.id)}
              className="mt-2 px-2 py-1 bg-blue-500 text-white rounded"
            >
              Add Quest
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={addQuestChain}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
      >
        Add Quest Chain
      </button>

      <button
        onClick={resetQuests}
        className="mt-4 ml-2 px-4 py-2 bg-red-500 text-white rounded"
      >
        Reset All Quests
      </button>
    </div>
  );
}

export default App;
