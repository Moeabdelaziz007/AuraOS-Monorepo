import React from 'react';

interface DesktopBackgroundProps {
  children?: React.ReactNode;
  className?: string;
}

export const DesktopBackground: React.FC<DesktopBackgroundProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div 
      className={`desktop-background w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 ${className}`}
      data-testid="desktop-background"
    >
      {children}
    </div>
  );
};
