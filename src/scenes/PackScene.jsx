import React, { useState } from 'react';
import { useGameStore } from '../store'; // Assuming the store is set up

// Import the pack images from the data file or directly
const boosterPackImages = {
    hero: 'img/character_booster.png', // Make sure paths are correct for the public dir
    ability: 'img/ability_booster.png',
    weapon: 'img/weapon_booster.png',
    armor: 'img/armor_booster.png'
};

export function PackScene() {
    const { advanceGamePhase, draftStage } = useGameStore(state => ({
        advanceGamePhase: state.advanceGamePhase,
        draftStage: state.draftStage
    }));
    
    // State to manage the opening animation
    const [isOpening, setIsOpening] = useState(false);

    const handlePackOpen = () => {
        if (isOpening) return;
        setIsOpening(true);
        // Add a timeout to simulate the animation ending, then advance the phase
        setTimeout(() => {
            advanceGamePhase('REVEAL'); // Or the next appropriate phase
        }, 1000); // Match animation duration
    };
    
    // Determine which pack type to show
    const packType = draftStage.split('_')[0].toLowerCase();
    const packImage = boosterPackImages[packType] || boosterPackImages.hero;

    // Replicate the HTML structure from the original index.html using JSX
    // Note: 'class' becomes 'className' in React
    return (
        <div id="pack-scene" className={`scene ${isOpening ? 'fade-out' : ''}`}>
            <h1 id="pack-scene-title" className="text-5xl font-cinzel tracking-wider mb-8 text-center">
                Open Your Pack
            </h1>

            <div className="package-wrapper" onClick={handlePackOpen}>
                <div id="package" className="package flex flex-col rounded-lg">
                    <div id="top-crimp" className={`crimp h-6 rounded-t-lg ${isOpening ? 'torn-off' : ''}`}></div>
                    <div id="image-area" className="image-area flex-grow flex items-center justify-center">
                        <img id="booster-pack-img" src={packImage} alt={`${packType} booster pack`} className="booster-pack-image w-[320px] h-auto" draggable="false" />
                    </div>
                    <div className="crimp h-6 rounded-b-lg"></div>
                </div>
            </div>

            <p id="pack-scene-instructions" className="text-lg text-gray-400 mt-8">
                Click anywhere on the pack to tear it open.
            </p>
        </div>
    );
}
