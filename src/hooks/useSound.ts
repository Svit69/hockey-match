import { useCallback } from 'react';

export const useSound = (isMuted: boolean) => {
  const playSound = useCallback((soundFile: string) => {
    if (isMuted) return;
    
    const audio = new Audio(soundFile);
    audio.play().catch(error => {
      console.error('Error playing sound:', error);
    });
  }, [isMuted]);

  return {
    playWinSound: () => playSound('/win_sound.mp3'),
    playLoseSound: () => playSound('/lose_sound.mp3')
  };
}; 