/**
 * @file Footer.tsx
 * @summary A reusable footer component for the application.
 */
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 mt-auto bg-gray-50 dark:bg-gray-800 text-center text-gray-500 dark:text-gray-400 text-sm">
      Made with <span role="img" aria-label="heart" className="text-red-500">❤️</span> by{' '}
      <span className="font-semibold">Ainul Islam</span>
    </footer>
  );
};

export default Footer;