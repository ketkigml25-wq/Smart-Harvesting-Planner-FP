import React from 'react';

export const TricolorBar: React.FC = () => {
  return (
    <div className="w-full h-[4px] flex" aria-hidden="true">
      <div className="flex-1 bg-[#FF9933]" />
      <div className="flex-1 bg-[#FFFFFF]" />
      <div className="flex-1 bg-[#138808]" />
    </div>
  );
};
