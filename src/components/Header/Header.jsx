import React from 'react';

const Header = () => {
  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <div className="flex items-center">
        <div className="text-2xl font-bold mr-2">Microsoft Azure</div>
        <div className="text-xl">云产品计算器</div>
      </div>
    </header>
  );
};

export default Header;