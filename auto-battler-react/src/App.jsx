import React, { useEffect } from 'react'
import { DiscordSDK } from '@discord/embedded-app-sdk'

// Log when the script is loaded to verify iframe execution
console.log('[React App] App.jsx script loaded.');
import { useGameStore } from './store.js'
import AnimatedBackground from './components/AnimatedBackground.jsx'
import DebugMenu from './components/DebugMenu.jsx'

import PackScene from './scenes/PackScene.jsx'
import RevealScene from './scenes/RevealScene.jsx'
import DraftScene from './scenes/DraftScene.jsx'
import BattleScene from './scenes/BattleScene.jsx'
import RecapScene from './scenes/RecapScene.jsx'
import UpgradeScene from './scenes/UpgradeScene.jsx'
import TournamentEndScene from './scenes/TournamentEndScene.jsx'

import './style.css'

// --- New SDK Setup ---
const discordSdk = new DiscordSDK(import.meta.env.VITE_DISCORD_CLIENT_ID)

async function setupDiscordSdk() {
  console.log('[React App] Starting Discord SDK setup...');
  await discordSdk.ready();
  console.log('[React App] Discord SDK is ready!');

  // Authenticate to get the current user
  // TODO: This needs a valid OAuth2 access token
  const { code } = await discordSdk.commands.authorize({
    client_id: import.meta.env.VITE_DISCORD_CLIENT_ID,
    response_type: 'code',
    state: '',
    prompt: 'none',
    scope: ['identify', 'guilds.members.read'],
  });

  const response = await fetch('/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code }),
  });
  const { access_token } = await response.json();

  const { user } = await discordSdk.commands.authenticate({ access_token });

  // Get the channel and its participants
  // Ensure channelId is available, otherwise, this might be an issue
  if (!discordSdk.channelId) {
    console.error("Channel ID is not available. Cannot fetch participants.");
    // Attempt to get guild specific channel
    // This is a placeholder, actual channel fetching might differ
    // For example, if the app is opened in a specific channel context
    // discordSdk.channelId might be automatically populated.
    // If not, you might need to prompt user or use a default.
    // For now, we'll log an error and proceed with a potentially empty participant list.
    // This part needs robust error handling and possibly UI feedback.
  }

  let participants = [];
  if (discordSdk.channelId) {
    try {
        const channel = await discordSdk.commands.getChannel({ channel_id: discordSdk.channelId });
        if (channel && channel.voice_states) {
            participants = channel.voice_states.map(vs => vs.user);
        } else {
            console.warn("Channel data or voice_states are unavailable.");
        }
    } catch (error) {
        console.error("Error fetching channel participants:", error);
        // Handle cases where the user might not be in a voice channel
        // or other permission issues.
    }
  } else {
      console.warn("No channelId, skipping fetching participants.");
  }


  // Designate the first user (if participants exist) as the host
  const isHost = participants.length > 0 && user && participants[0].id === user.id;

  // Update the global store with this information
  useGameStore.getState().setMultiplayerState(isHost ? 'host' : 'guest', participants);
}
// --- End SDK Setup ---

export default function App() {
  const gamePhase = useGameStore(state => state.gamePhase)
  const storedLog = useGameStore(state => state.battleLog)

  // Setup Discord SDK and multiplayer logic
  useEffect(() => {
    console.log('[React App] App component mounted, attempting to set up SDK.');
    setupDiscordSdk();
  }, []);

  // Subscribe to SDK commands for guest updates
  useEffect(() => {
    const handleCommand = (event) => {
        if (event.cmd === 'GAME_UPDATE') {
            const { log, newState } = event.data; // Corrected: event.data based on typical SDK patterns
            // Update the global store with data from the host
            useGameStore.getState().applyHostUpdate(log, newState);
        }
    };

    discordSdk.subscribe('COMMAND', handleCommand);

    return () => {
        discordSdk.unsubscribe('COMMAND', handleCommand);
    };
  }, []); // Empty dependency array ensures this runs once

  let scene = null
  switch (gamePhase) {
    case 'PACK':
      scene = <PackScene />
      break
    case 'REVEAL':
      scene = <RevealScene />
      break
    case 'DRAFT':
      scene = <DraftScene />
      break
    case 'BATTLE':
      scene = <BattleScene storedLog={storedLog} />
      break
    case 'RECAP_1':
      scene = <RecapScene />
      break
    case 'RECAP_2':
      scene = <RecapScene />
      break
    case 'UPGRADE':
      scene = <UpgradeScene />
      break
    case 'TOURNAMENT_END':
      scene = <TournamentEndScene />
      break
    default:
      scene = null
  }

  return (
    <>
      <AnimatedBackground isSpeedActive={false} />
      {scene}
      {import.meta.env.DEV && <DebugMenu />}
    </>
  )
}
