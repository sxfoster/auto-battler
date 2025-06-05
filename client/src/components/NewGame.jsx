import React, { useEffect } from 'react'; // Added useEffect
import { useNavigate } from 'react-router-dom'; // Added useNavigate

function NewGame() {
  const navigate = useNavigate();

  // Navigate to party setup screen immediately when this component mounts
  useEffect(() => {
    navigate('/party-setup');
  }, [navigate]);

  // Render minimal content as it will redirect quickly
  return (
    <div>
      <h1>New Game</h1>
      <p>Loading Party Setup...</p>
    </div>
  );
}

export default NewGame;
