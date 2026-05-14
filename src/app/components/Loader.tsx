// Loader component - displays Rupee Coin animation
import { useEffect, useRef } from 'react';
import animationData from '../../assets/loading/Rupee Coin.json';

// Props interface for Loader component
interface LoaderProps {
  size?: number; // Size of the loader (default: 200)
  className?: string; // Additional CSS classes
  fullScreen?: boolean; // Whether to show as full screen loader
}

// Loader component using Lottie animation
export function Loader({ size = 250, className = '', fullScreen = false }: LoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationInstance: any = null;

    const loadLottie = async () => {
      try {
        const lottie = (await import('lottie-web')).default;

        if (containerRef.current) {
          animationInstance = lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData,
          });
        }
      } catch (error) {
        console.error('Failed to load animation:', error);
      }
    };

    loadLottie();

    // Cleanup function
    return () => {
      if (animationInstance) {
        animationInstance.destroy();
      }
    };
  }, []);

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center">
          <div 
            className="flex items-center justify-center"
            style={{ width: size, height: size }}
          >
            <div 
              ref={containerRef}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center" style={{ minHeight: '200px' }}>
      <div className="text-center">
        <div
          className={`mx-auto ${className}`}
          style={{ width: size, height: size }}
        >
          <div
            ref={containerRef}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
    </div>
  );
}
