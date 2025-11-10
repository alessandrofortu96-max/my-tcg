import { ReactNode } from 'react';

interface HeroSectionProps {
  imageName: string;
  children: ReactNode;
  minHeight?: string;
  overlayOpacity?: number;
}

/**
 * Componente Hero Section con immagine di sfondo
 * Supporta automaticamente sia JPG che PNG come fallback
 * Overlay bianco per far risaltare il testo nero scuro
 */
export const HeroSection = ({ 
  imageName, 
  children, 
  minHeight = 'min-h-[400px]',
  overlayOpacity = 0.75 
}: HeroSectionProps) => {
  // Prova prima JPG, poi PNG, poi fallback al gradiente
  const imageUrl = `/images/hero/${imageName}`;
  
  return (
    <section className={`relative border-b border-border overflow-hidden ${minHeight}`}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-premium-gradient"
        style={{
          backgroundImage: `url(${imageUrl}.jpg), url(${imageUrl}.png)`,
        }}
      >
        {/* Overlay bianco per leggibilità del testo nero scuro */}
        <div 
          className="absolute inset-0" 
          style={{
            backgroundColor: `rgba(255, 255, 255, ${overlayOpacity})`,
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
};

