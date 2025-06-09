import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Realtime Stories title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Realtime Stories/i);
  expect(titleElement).toBeInTheDocument();
});