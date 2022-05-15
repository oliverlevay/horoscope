import React, { useState } from 'react';
import { GameState } from './types';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { register, startGame } from './api';
import Step1 from './Steps/Step1';
import Step2 from './Steps/Step 2';
import Step3 from './Steps/Step 3';
import Step4 from './Steps/Step 4';
import Finish from './Steps/Finish';

export default function App() {
  const [gameState, setGameState] = useState(GameState.NotStarted);
  const [name, setName] = useState('');
  const [myId, setMyId] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(false);
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      height="100vh"
      spacing={2}
    >
      {gameState === GameState.NotStarted && myId === undefined && (
        <Stack spacing={2}>
          <Typography>Please enter your name</Typography>
          <TextField
            value={name}
            onChange={(event) => {
              setName(event.target.value);
            }}
          />
          <Button
            disabled={!name}
            variant="contained"
            onClick={() => {
              register(name)
                .then((res) => res.json())
                .then((data) => {
                  setMyId(data.user.id);
                  setIsAdmin(data.user.isAdmin);
                  if (!data.user.isAdmin) {
                    setGameState(GameState.Step1);
                  }
                });
            }}
          >
            Join
          </Button>
        </Stack>
      )}
      {gameState === GameState.NotStarted && myId !== undefined && isAdmin && (
        <Stack spacing={2}>
          <Typography>Waiting for you to start the game</Typography>
          <Button
            onClick={() => {
              startGame(myId).then(() => {
                setGameState(GameState.Step1);
              });
            }}
            variant="contained"
          >
            Start game
          </Button>
        </Stack>
      )}
      {gameState === GameState.Step1 && myId !== undefined && (
        <Step1 myId={myId} gameState={gameState} setGameState={setGameState} />
      )}
      {gameState === GameState.Step2 && myId !== undefined && (
        <Step2 myId={myId} gameState={gameState} setGameState={setGameState} />
      )}
      {gameState === GameState.Step3 && myId !== undefined && (
        <Step3 myId={myId} gameState={gameState} setGameState={setGameState} />
      )}
      {gameState === GameState.Step4 && myId !== undefined && (
        <Step4 myId={myId} gameState={gameState} setGameState={setGameState} />
      )}
      {gameState === GameState.Finished && myId !== undefined && <Finish />}
    </Stack>
  );
}
