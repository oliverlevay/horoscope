import React, { useState } from 'react';
import { GameState } from './types';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { register } from './api';

export default function App() {
  const [gameState, setGameState] = useState(GameState.NotStarted);
  const [name, setName] = useState('');
  const [myId, setMyId] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(false);
  return (
    <Stack alignItems="center" justifyContent="center" height="100vh">
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
                });
            }}
          >
            Join
          </Button>
        </Stack>
      )}
      {gameState === GameState.NotStarted && myId !== undefined && isAdmin && (
        <Button>Start game</Button>
      )}
    </Stack>
  );
}
