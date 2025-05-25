import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { clubs, Club } from './types/clubs';
import { PlayerSearch } from './components/PlayerSearch';
import { SearchResult, TaskVariant, Player } from './types/players';
import { useSound } from './hooks/useSound';

const AppContainer = styled.div`
  background-color: #1a1a1a;
  min-height: 100vh;
  color: white;
  padding: 20px 40px;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 50px;
`;

const Logo = styled.img`
  height: 32px;
  width: auto;
`;

const Controls = styled.div`
  display: flex;
  gap: 20px;
`;

const Button = styled.button`
  background: none;
  border: 2px solid #4CAF50;
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #4CAF50;
  }
`;

const MainContent = styled.main`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 32px;
    padding: 0 16px;
  }
`;

const SearchSection = styled.div`
  flex: 1;
  width: 100%;

  @media (max-width: 768px) {
    order: 3;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 12px;
  background: #2a2a2a;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 16px;

  &::placeholder {
    color: #888;
  }
`;

const InfoSection = styled.div`
  flex: 1;
  text-align: right;

  @media (max-width: 768px) {
    width: 100%;
    text-align: left;
    order: 2;
  }
`;

const popupAnimation = keyframes`
  0% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  20% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 1;
  }
  40% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  60% {
    transform: translate(-50%, -100%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -200%) scale(1);
    opacity: 0;
  }
`;

interface WinStreakProps {
  $streakColor: string;
}

const WinStreak = styled.div<WinStreakProps>`
  font-size: 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  justify-content: flex-end;

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 32px;
    justify-content: flex-start;
    order: 1;
  }

  span.number {
    color: ${props => props.$streakColor};
    font-weight: bold;
    margin-left: 8px;
    transition: color 0.3s ease;
    position: relative;
  }

  span.text {
    font-weight: normal;
    display: flex;
    align-items: center;
  }

  &::before {
    content: "*";
    font-size: 64px;
    line-height: 1;
    color: white;
    display: flex;
    align-items: center;
    margin-right: 4px;

    @media (max-width: 768px) {
      font-size: 32px;
    }
  }
`;

const PlusOnePopup = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform-origin: center;
  background-color: #ABE700;
  color: white;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 12px;
  animation: ${popupAnimation} 1s ease-out forwards;
  z-index: 2;
  white-space: nowrap;
  pointer-events: none;
`;

const ClubInfo = styled.div`
  flex: 1;
  text-align: right;
`;

const ClubRow = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  width: 100%;
  justify-content: flex-end;

  &:last-child {
    margin-top: -10px;
  }

  @media (max-width: 768px) {
    justify-content: flex-start;
    gap: 16px;
    
    &:last-child {
      margin-top: 8px;
    }
  }
`;

const TiltContainer = styled.div<{ rotateX: number; rotateY: number; isHovered: boolean }>`
  transform: rotateX(${props => props.rotateX * (props.isHovered ? 3 : 1.5)}deg) 
            rotateY(${props => props.rotateY * (props.isHovered ? 3 : 1.5)}deg);
  transform-style: preserve-3d;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  cursor: default;
  position: relative;
  
  &:hover {
    transform: rotateX(${props => props.rotateX * 3}deg) 
              rotateY(${props => props.rotateY * 3}deg) 
              scale(1.08);
    filter: brightness(1.1);
  }
`;

const PlayedFor = styled.span`
  font-size: 88px;
  font-weight: 900;

  @media (max-width: 768px) {
    font-size: 64px;
  }

  @media (max-width: 480px) {
    font-size: 48px;
  }
`;

const AndFor = styled.span<{ variant: TaskVariant }>`
  font-size: ${props => props.variant.type === 'gagarin' ? '72px' : '88px'};
  font-weight: 300;
  font-style: italic;

  @media (max-width: 768px) {
    font-size: ${props => props.variant.type === 'gagarin' ? '52px' : '64px'};
  }

  @media (max-width: 480px) {
    font-size: ${props => props.variant.type === 'gagarin' ? '40px' : '48px'};
  }
`;

const ClubLogo = styled.div`
  width: 80px;
  height: 80px;
  background: #333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }

  @media (max-width: 480px) {
    width: 48px;
    height: 48px;
  }
`;

const SecondLogo = styled.div<{ variant: TaskVariant }>`
  width: 80px;
  height: 80px;
  background: #333;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
  }

  @media (max-width: 480px) {
    width: 48px;
    height: 48px;
  }
`;

export interface Task {
  firstClub: string;
  firstClubLogo: string;
  secondVariant: TaskVariant;
}

function App() {
  const [isMuted, setIsMuted] = useState(false);
  const { playWinSound, playLoseSound } = useSound(isMuted);
  const [winStreak, setWinStreak] = useState(0);
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(new Set());
  const [currentTask, setCurrentTask] = useState<Task>({
    firstClub: clubs[0].name,
    firstClubLogo: clubs[0].logoFile || 'placeholder.svg',
    secondVariant: { 
      type: 'club', 
      logoFile: clubs[1].logoFile || 'placeholder.svg', 
      name: clubs[1].name 
    }
  });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [showPlusOne, setShowPlusOne] = useState(false);
  const [streakColor, setStreakColor] = useState('#ABE700');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate mouse position relative to window center
      const x = e.clientX - window.innerWidth / 2;
      const y = e.clientY - window.innerHeight / 2;
      
      // Convert to rotation degrees (-10 to 10 degrees)
      const rotateY = (x / (window.innerWidth / 2)) * 10;
      const rotateX = -(y / (window.innerHeight / 2)) * 10;
      
      setTilt({ x: rotateX, y: rotateY });
    };

    // Add event listener to window
    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Функция для очистки названия команды от лишних символов
  const cleanTeamName = (name: string): string => {
    return name
      .replace(/["""]/g, '') // Удаляем разные типы кавычек
      .replace(/\s+/g, ' ')  // Заменяем множественные пробелы на один
      .trim();               // Убираем пробелы в начале и конце
  };

  const generateRandomTask = (): Task => {
    // Выбираем случайный первый клуб
    const firstClubIndex = Math.floor(Math.random() * clubs.length);
    const selectedFirstClub = clubs[firstClubIndex];

    // Выбираем случайный второй клуб
    const secondClubIndex = Math.floor(Math.random() * clubs.length);
    const selectedSecondClub = clubs[secondClubIndex];
    
    const variants: TaskVariant[] = [
      // Случайный клуб (используем выбранный второй клуб)
      { 
        type: 'club', 
        logoFile: selectedSecondClub.logoFile || 'placeholder.svg',
        name: selectedSecondClub.name
      },
      // НХЛ
      { 
        type: 'nhl',
        logoFile: 'nhl.png',
        name: 'NHL'
      },
      // Кубок Гагарина
      { 
        type: 'gagarin',
        logoFile: 'gagarin.png',
        name: 'Gagarin Cup'
      }
    ];
    
    // Выбираем случайный вариант для второй части
    const secondVariant = variants[Math.floor(Math.random() * variants.length)];
    
    // Если выбран клуб, и он совпадает с первым, генерируем новое задание
    if (secondVariant.type === 'club' && secondVariant.name === selectedFirstClub.name) {
      return generateRandomTask();
    }

    return {
      firstClub: selectedFirstClub.name,
      firstClubLogo: selectedFirstClub.logoFile || 'placeholder.svg',
      secondVariant
    };
  };

  useEffect(() => {
    setCurrentTask(generateRandomTask());
  }, []);

  const animateWinStreak = async () => {
    setShowPlusOne(true);
    // Ждем 400мс (40% от анимации) перед обновлением числа
    setTimeout(() => {
      setWinStreak(prev => prev + 1);
    }, 400);
    // Полная анимация длится 1 секунду
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowPlusOne(false);
  };

  // Функция для нелинейной анимации (easeInOutQuad)
  const easeInOutQuad = (t: number): number => {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  const animateStreakReset = async (currentStreak: number) => {
    setStreakColor('#E70000');
    
    const totalAnimationDuration = 1000; // Общая длительность анимации в мс
    const startTime = Date.now();
    const initialStreak = currentStreak;
    
    // Используем requestAnimationFrame для более плавной анимации
    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / totalAnimationDuration, 1);
      
      // Применяем функцию плавности для нелинейной анимации
      const easedProgress = easeInOutQuad(progress);
      const currentValue = Math.round(initialStreak - (initialStreak * easedProgress));
      
      setWinStreak(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setWinStreak(0);
        setStreakColor('#ABE700');
      }
    };
    
    requestAnimationFrame(animate);
    await new Promise(resolve => setTimeout(resolve, totalAnimationDuration));
  };

  const checkPlayerMatch = (playerTeams: string[], task: Task, player: Player): boolean => {
    console.log('🎯 Текущая задача:', {
      firstClub: task.firstClub,
      secondVariant: {
        type: task.secondVariant.type,
        name: task.secondVariant.name
      }
    });

    console.log('🏒 Данные игрока:', {
      name: player.name,
      teams: playerTeams,
      played_in_nhl: player.played_in_nhl,
      gagarin_cup: player.gagarin_cup
    });

    // Проверяем, играл ли за первый клуб
    const playedForFirstClub = playerTeams.some(team => 
      cleanTeamName(team) === task.firstClub
    );

    console.log(`✓ Играл за ${task.firstClub}:`, playedForFirstClub);

    if (!playedForFirstClub) return false;

    // Проверяем второй вариант в зависимости от типа
    let secondConditionMet = false;
    
    switch (task.secondVariant.type) {
      case 'club':
        secondConditionMet = playerTeams.some(team => 
          cleanTeamName(team) === task.secondVariant.name
        );
        console.log(`✓ Играл за ${task.secondVariant.name}:`, secondConditionMet);
        break;
      case 'nhl':
        secondConditionMet = player.played_in_nhl;
        console.log('✓ Играл в НХЛ:', secondConditionMet);
        break;
      case 'gagarin':
        secondConditionMet = player.gagarin_cup;
        console.log('✓ Выигрывал Кубок Гагарина:', secondConditionMet);
        break;
    }

    console.log('🎮 Итоговый результат:', secondConditionMet);
    return secondConditionMet;
  };

  const handlePlayerSelect = async (result: SearchResult) => {
    const playerTeams = result.player.teams
      .flatMap(teamStr => teamStr.split('/'))
      .map(team => cleanTeamName(team))
      .filter(team => team !== '');

    console.log('\n📊 ПРОВЕРКА ОТВЕТА');
    console.log('------------------');

    const isCorrect = checkPlayerMatch(playerTeams, currentTask, result.player);

    if (isCorrect) {
      console.log('✅ ПРАВИЛЬНО!');
      playWinSound();
      setSelectedPlayers(prev => new Set([...prev, result.player.name]));
      await animateWinStreak();
    } else {
      console.log('❌ НЕПРАВИЛЬНО!');
      playLoseSound();
      await animateStreakReset(winStreak);
    }

    setCurrentTask(generateRandomTask());
  };

  const getSecondText = (variant: TaskVariant): string => {
    switch (variant.type) {
      case 'club':
        return 'и за';
      case 'nhl':
        return 'и играл в';
      case 'gagarin':
        return 'и выигрывал';
      default:
        return 'и за';
    }
  };

  return (
    <AppContainer>
      <Header>
        <Logo src="/logo.png" alt="ГОЛЕВАЯ" />
        <Controls>
          <Button onClick={() => setIsMuted(!isMuted)}>
            {isMuted ? '🔇' : '🔊'}
          </Button>
          <Button>☰</Button>
        </Controls>
      </Header>

      <MainContent>
        <SearchSection>
          <PlayerSearch 
            onSelect={handlePlayerSelect} 
            selectedPlayers={selectedPlayers}
          />
        </SearchSection>

        <InfoSection>
          <WinStreak $streakColor={streakColor}>
            <span className="text">серия побед:</span>
            <span className="number">
              {winStreak}
              {showPlusOne && <PlusOnePopup>+1</PlusOnePopup>}
            </span>
          </WinStreak>

          <ClubInfo>
            <TiltContainer 
              rotateX={tilt.x} 
              rotateY={tilt.y} 
              isHovered={isHovered}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <ClubRow>
                <PlayedFor>Играл за</PlayedFor>
                <ClubLogo>
                  <img 
                    src={`/images/${currentTask.firstClubLogo}`} 
                    alt={currentTask.firstClub} 
                  />
                </ClubLogo>
              </ClubRow>
              <ClubRow>
                <AndFor variant={currentTask.secondVariant}>
                  {getSecondText(currentTask.secondVariant)}
                </AndFor>
                <SecondLogo variant={currentTask.secondVariant}>
                  <img 
                    src={`/images/${currentTask.secondVariant.logoFile}`} 
                    alt={currentTask.secondVariant.name} 
                  />
                </SecondLogo>
              </ClubRow>
            </TiltContainer>
          </ClubInfo>
        </InfoSection>
      </MainContent>
    </AppContainer>
  );
}

export default App; 