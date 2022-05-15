import React, { useState, useEffect, useCallback } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { GameState, WordList } from '../types';
import { getWords, selectWord } from '../api';

export default function Step4({
  myId,
  setGameState,
}: {
  myId: string;
  gameState: GameState;
  setGameState: (gameState: GameState) => void;
}) {
  const [wordList, setWordList] = useState<WordList>([]);
  const fetchWords = useCallback(() => {
    if (wordList.length === 0) {
      getWords(myId, 4)
        .then((res) => res.json())
        .then((data) => {
          if (data.wordList) {
            setWordList(data.wordList);
          }
        });
    }
  }, [wordList, myId]);
  useEffect(() => {
    const interval = setInterval(() => {
      if (wordList.length === 0) {
        fetchWords();
      }
    }, 1000);
    if (wordList.length > 0) {
      clearInterval(interval);
    }
    return () => {
      clearInterval(interval);
    };
  }, [wordList]);
  return (
    <Stack alignItems="center" justifyContent="center">
      {wordList.length === 0 && (
        <Typography>Waiting for game to start</Typography>
      )}
      {wordList.length > 0 && (
        <Stack spacing={2}>
          <Typography>Select a word</Typography>
          {wordList.map((word) => (
            <Button
              onClick={() => {
                selectWord(myId, 4, word.index).then(() => {
                  setGameState(GameState.Finished);
                });
              }}
              variant="contained"
            >
              {word.word}
            </Button>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
