/**
 * @file Footer.tsx
 * @summary A reusable footer component for the application.
 */
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 mt-auto text-center text-slate-500 dark:text-slate-400 text-sm font-medium">
      Made with <span role="img" aria-label="heart" className="text-red-500">❤️</span> by{' '}
      <span className="font-bold text-slate-700 dark:text-slate-300">Ainul Islam</span>
    </footer>
  );
};

export default Footer;