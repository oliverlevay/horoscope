import React, { useState, useEffect, useCallback } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { GameState, WordList } from '../types';
import { fetchSentences } from '../api';

export default function Step1({
  myId,
  setGameState,
}: {
  myId: string;
  gameState: GameState;
  setGameState: (gameState: GameState) => void;
}) {
  const [sentences, setSentences] = useState<string[]>([]);
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSentences().then((res) => res.json());
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  return (
    <Stack alignItems="center" justifyContent="center" spacing={2}>
      {sentences.map((sentence) => (
        <Typography>{sentence}</Typography>
      ))}
    </Stack>
  );
}
