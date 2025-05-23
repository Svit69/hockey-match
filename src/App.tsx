import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { clubs, Club } from './types/clubs';
import { PlayerSearch } from './components/PlayerSearch';
import { SearchResult, TaskVariant, Task, Player } from './types/players';

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
  transform: rotateX(${props => props.rotateX * (props.isHovered ? 2 : 1)}deg) 
            rotateY(${props => props.rotateY * (props.isHovered ? 2 : 1)}deg);
  transform-style: preserve-3d;
  transition: transform 0.3s ease-out;
  width: 100%;
  cursor: default;
  
  &:hover {
    transform: rotateX(${props => props.rotateX * 2}deg) 
              rotateY(${props => props.rotateY * 2}deg) 
              scale(1.05);
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
  font-size: 88px;
  font-weight: ${props => props.variant.type === 'club' ? 300 : 900};
  font-style: ${props => props.variant.type === 'club' ? 'italic' : 'normal'};

  @media (max-width: 768px) {
    font-size: 64px;
  }

  @media (max-width: 480px) {
    font-size: 48px;
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
  background: ${props => props.variant.type !== 'club' ? 'transparent' : '#333'};
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

function App() {
  const [isMuted, setIsMuted] = useState(false);
  const [winStreak, setWinStreak] = useState(0);
  const [currentTask, setCurrentTask] = useState<Task>({
    firstClub: clubs[0].name,
    secondVariant: { type: 'club', logoFile: clubs[1].logoFile, name: clubs[1].name }
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
    const variants: TaskVariant[] = [
      // Случайный клуб
      { 
        type: 'club', 
        logoFile: clubs[Math.floor(Math.random() * clubs.length)].logoFile,
        name: clubs[Math.floor(Math.random() * clubs.length)].name
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

    // Выбираем случайный первый клуб
    const firstClub = clubs[Math.floor(Math.random() * clubs.length)].name;
    
    // Выбираем случайный вариант для второй части
    const secondVariant = variants[Math.floor(Math.random() * variants.length)];
    
    // Если выбран клуб, убеждаемся что он отличается от первого
    if (secondVariant.type === 'club' && secondVariant.name === firstClub) {
      return generateRandomTask();
    }

    return {
      firstClub,
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

  const animateStreakReset = async (currentStreak: number) => {
    setStreakColor('#E70000');
    for (let i = currentStreak; i >= 0; i--) {
      setWinStreak(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    setStreakColor('#ABE700');
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
      await animateWinStreak();
    } else {
      console.log('❌ НЕПРАВИЛЬНО!');
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
          <PlayerSearch onSelect={handlePlayerSelect} />
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
                    src={`/images/${clubs.find(c => c.name === currentTask.firstClub)?.logoFile}`} 
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