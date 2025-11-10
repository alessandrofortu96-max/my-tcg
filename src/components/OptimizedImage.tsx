import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  priority?: boolean; // Se true, non usa lazy loading (per immagini above-the-fold)
  onError?: () => void;
  onLoad?: () => void;
  fallback?: string;
}

/**
 * Componente immagine ottimizzato con:
 * - Lazy loading nativo
 * - Placeholder durante il caricamento
 * - Gestione errori con fallback
 * - Supporto per immagini prioritarie (above-the-fold)
 */
const OptimizedImage = ({
  src,
  alt,
  className,
  aspectRatio,
  priority = false,
  onError,
  onLoad,
  fallback = '/placeholder.svg',
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>(src);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset quando cambia src
  useEffect(() => {
    setImageSrc(src);
    setIsLoading(true);
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    // Se l'immagine corrente non è il fallback, prova il fallback
    if (imageSrc !== fallback) {
      setImageSrc(fallback);
      setIsLoading(true); // Riprendi il loading per il fallback
    } else {
      // Se anche il fallback fallisce, mostra errore
      setHasError(true);
      onError?.();
    }
  };

  return (
    <div
      className={cn('relative overflow-hidden bg-accent', className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {/* Placeholder durante il caricamento */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}

      {/* Immagine */}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoading && !hasError ? 'opacity-0' : 'opacity-100',
          hasError && 'opacity-50'
        )}
        onLoad={handleLoad}
        onError={handleError}
      />

      {/* Indicatore di errore (opzionale) */}
      {hasError && imageSrc === fallback && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Immagine non disponibile</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;

