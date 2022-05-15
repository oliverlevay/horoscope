const API_URL = 'https://horoscope-backend1.herokuapp.com';

export const register = (name: string) => {
  return fetch(`${API_URL}/register`, {
    method: 'POST',
    body: JSON.stringify({ name }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const startGame = (id: string) => {
  return fetch(`${API_URL}/start-game`, {
    method: 'POST',
    body: JSON.stringify({ id }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const reset = (id: string) => {
  return fetch(`${API_URL}/reset`, {
    method: 'POST',
    body: JSON.stringify({ id }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const getWords = (id: string, step: number) => {
  return fetch(`${API_URL}/get-words/step${step}`, {
    method: 'POST',
    body: JSON.stringify({ id }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const selectWord = (id: string, step: number, index: number) => {
  return fetch(`${API_URL}/select-word/step${step}`, {
    method: 'POST',
    body: JSON.stringify({ id, index }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

export const fetchSentences = () => {
  return fetch(`${API_URL}/sentences`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
};
