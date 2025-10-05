import React from 'react';

interface DomainGridProps {
  children: React.ReactNode;
}

const DomainGrid: React.FC<DomainGridProps> = ({ children }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {children}
    </div>
  );
};

export default DomainGrid;
