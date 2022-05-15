const API_URL = 'http://localhost:3001';

export const register = (name: string) => {
  return fetch(`${API_URL}/register`, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
};

export const startGame = (id: string) => {
  return fetch(`${API_URL}/start-game`, {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
};

export const reset = (id: string) => {
  return fetch(`${API_URL}/reset`, {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
};

export const getWords = (id: string, step: number) => {
  return fetch(`${API_URL}/get-words/step${step}`, {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
};

export const selectWord = (id: string, step: number, index: number) => {
  return fetch(`${API_URL}/select-word/step${step}`, {
    method: 'POST',
    body: JSON.stringify({ id, index }),
  });
};
