import React, { useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface QuantumAppIconProps {
  icon: LucideIcon | string;
  label: string;
  onClick?: () => void;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  isPinned?: boolean;
}

export const QuantumAppIcon: React.FC<QuantumAppIconProps> = ({
  icon: IconComponent,
  label,
  onClick,
  className = '',
  size = 'medium',
  isPinned = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32',
  };

  const iconSizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-12 h-12',
  };

  const textSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  };

  const renderIcon = () => {
    if (typeof IconComponent === 'string') {
      return (
        <span 
          className={`${iconSizeClasses[size]} text-2xl quantum-icon-glow`}
          style={{ fontSize: size === 'small' ? '16px' : size === 'medium' ? '24px' : '32px' }}
        >
          {IconComponent}
        </span>
      );
    }
    
    return (
      <IconComponent 
        className={`${iconSizeClasses[size]} quantum-icon-glow`} 
      />
    );
  };

  return (
    <div
      className={`
        quantum-app-icon
        ${sizeClasses[size]}
        ${className}
        relative
        flex
        flex-col
        items-center
        justify-center
        cursor-pointer
        transition-all
        duration-300
        ease-out
        group
        select-none
      `}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glassmorphism Background */}
      <div 
        className={`
          absolute
          inset-0
          rounded-2xl
          transition-all
          duration-300
          ease-out
          ${isHovered ? 'scale-105' : 'scale-100'}
        `}
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: isHovered 
            ? '0 8px 32px rgba(0, 255, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            : '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        }}
      />

      {/* Neon Border Effect */}
      <div 
        className={`
          absolute
          inset-0
          rounded-2xl
          transition-all
          duration-300
          ease-out
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          background: 'linear-gradient(135deg, #00ffff, #ff00ff, #00ff00)',
          padding: '2px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
        }}
      />

      {/* Quantum Particles Background */}
      <div 
        className={`
          absolute
          inset-0
          rounded-2xl
          transition-opacity
          duration-300
          ${isHovered ? 'opacity-30' : 'opacity-0'}
        `}
      >
        <div className="quantum-particles">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="quantum-particle"
              style={{
                position: 'absolute',
                width: '2px',
                height: '2px',
                background: ['#00ffff', '#ff00ff', '#00ff00'][i % 3],
                borderRadius: '50%',
                left: `${20 + (i * 15)}%`,
                top: `${20 + (i * 10)}%`,
                animation: `quantum-float ${2 + i * 0.5}s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
                boxShadow: `0 0 6px ${['#00ffff', '#ff00ff', '#00ff00'][i % 3]}`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Icon Container */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <div className="mb-1">
          {renderIcon()}
        </div>
        
        {/* Label */}
        <div 
          className={`
            ${textSizeClasses[size]}
            font-medium
            text-center
            px-1
            transition-colors
            duration-300
            ${isHovered ? 'text-cyan-300' : 'text-white'}
            text-shadow-sm
          `}
          style={{
            textShadow: isHovered 
              ? '0 0 8px rgba(0, 255, 255, 0.8)' 
              : '0 1px 2px rgba(0, 0, 0, 0.5)',
          }}
        >
          {label}
        </div>
      </div>

      {/* Pin Badge */}
      {isPinned && (
        <div 
          className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center z-20"
          style={{
            boxShadow: '0 0 8px rgba(0, 255, 255, 0.6)',
          }}
        >
          <div className="w-2 h-2 bg-white rounded-full" />
        </div>
      )}

      {/* Hover Glow Effect */}
      <div 
        className={`
          absolute
          inset-0
          rounded-2xl
          transition-opacity
          duration-300
          pointer-events-none
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          background: 'radial-gradient(circle, rgba(0, 255, 255, 0.1) 0%, transparent 70%)',
          filter: 'blur(1px)',
        }}
      />

      <style jsx>{`
        .quantum-icon-glow {
          transition: all 0.3s ease-out;
        }
        
        .quantum-icon-glow:hover {
          filter: drop-shadow(0 0 8px currentColor);
        }
        
        .quantum-particles {
          position: relative;
          width: 100%;
          height: 100%;
        }
        
        @keyframes quantum-float {
          0%, 100% {
            transform: translateY(0px) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translateY(-4px) scale(1.2);
            opacity: 1;
          }
        }
        
        .quantum-app-icon:hover .quantum-icon-glow {
          color: #00ffff;
          filter: drop-shadow(0 0 12px #00ffff);
        }
      `}</style>
    </div>
  );
};