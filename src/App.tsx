import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { clubs, Club } from './types/clubs';
import { PlayerSearch } from './components/PlayerSearch';
import { SearchResult } from './types/players';

const AppContainer = styled.div`
  background-color: #1a1a1a;
  min-height: 100vh;
  color: white;
  padding: 20px 40px;
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
`;

const SearchSection = styled.div`
  flex: 1;
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
`;

const popupAnimation = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
    opacity: 1;
  }
  80% {
    transform: translateY(-20px);
    opacity: 0.5;
  }
  100% {
    transform: translateY(-30px);
    opacity: 0;
  }
`;

const WinStreak = styled.div`
  font-size: 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;

  span.number {
    color: ${props => props.theme.streakColor};
    font-weight: bold;
    margin-left: 8px;
    transition: color 0.3s ease;
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
  }
`;

const PlusOnePopup = styled.div`
  position: absolute;
  right: -10px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #ABE700;
  color: white;
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 12px;
  animation: ${popupAnimation} 1s ease-out forwards;
  z-index: 2;
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

  &:last-child {
    margin-top: -10px;
  }
`;

const TiltContainer = styled.div<{ rotateX: number; rotateY: number }>`
  transform: rotateX(${props => props.rotateX}deg) rotateY(${props => props.rotateY}deg);
  transform-style: preserve-3d;
  transition: transform 0.3s ease-out;
  width: 100%;
`;

const PlayedFor = styled.span`
  font-size: 88px;
  font-weight: 900;
`;

const AndFor = styled.span`
  font-size: 88px;
  font-weight: 300;
  font-style: italic;
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
`;

function App() {
  const [isMuted, setIsMuted] = useState(false);
  const [winStreak, setWinStreak] = useState(0);
  const [currentClubs, setCurrentClubs] = useState<[Club, Club]>([clubs[0], clubs[1]]);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [showPlusOne, setShowPlusOne] = useState(false);
  const [streakColor, setStreakColor] = useState('#ABE700');

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

  const getRandomClubs = () => {
    const shuffled = [...clubs].sort(() => 0.5 - Math.random());
    const selectedClubs = [shuffled[0], shuffled[1]] as [Club, Club];
    console.log('Случайные клубы:', selectedClubs.map(club => club.name));
    return selectedClubs;
  };

  useEffect(() => {
    setCurrentClubs(getRandomClubs());
  }, []);

  const animateWinStreak = async (currentStreak: number) => {
    setShowPlusOne(true);
    setTimeout(() => setShowPlusOne(false), 1000);
  };

  const animateStreakReset = async (currentStreak: number) => {
    setStreakColor('#E70000');
    for (let i = currentStreak; i >= 0; i--) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setWinStreak(i);
      if (i === 0) {
        setStreakColor('#ABE700');
      }
    }
  };

  const handlePlayerSelect = async (result: SearchResult) => {
    const playerTeams = result.player.teams
      .flatMap(teamStr => teamStr.split('/'))
      .map(team => cleanTeamName(team))
      .filter(team => team !== '');

    console.log('Команды игрока (очищенные):', playerTeams);
    const currentClubNames = currentClubs.map(club => club.name);
    console.log('Нужно найти команды:', currentClubNames);

    const playedForBothClubs = currentClubNames.every(clubName =>
      playerTeams.some(team => cleanTeamName(team) === clubName)
    );

    if (playedForBothClubs) {
      console.log('✅ ПРАВИЛЬНО! Игрок действительно играл за оба клуба');
      const newStreak = winStreak + 1;
      await animateWinStreak(winStreak);
      setWinStreak(newStreak);
    } else {
      console.log('❌ НЕПРАВИЛЬНО! Игрок не играл за оба этих клуба');
      currentClubNames.forEach(clubName => {
        if (!playerTeams.some(team => cleanTeamName(team) === clubName)) {
          console.log(`Игрок не играл за: ${clubName}`);
        }
      });
      await animateStreakReset(winStreak);
    }

    setCurrentClubs(getRandomClubs());
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
          <WinStreak theme={{ streakColor }}>
            <span className="text">серия побед:</span>
            <span className="number">{winStreak}</span>
            {showPlusOne && <PlusOnePopup>+1</PlusOnePopup>}
          </WinStreak>

          <ClubInfo>
            <TiltContainer rotateX={tilt.x} rotateY={tilt.y}>
              <ClubRow>
                <PlayedFor>Играл за</PlayedFor>
                <ClubLogo>
                  <img src={`/images/${currentClubs[0].logoFile}`} alt={currentClubs[0].name} />
                </ClubLogo>
              </ClubRow>
              <ClubRow>
                <AndFor>и за</AndFor>
                <ClubLogo>
                  <img src={`/images/${currentClubs[1].logoFile}`} alt={currentClubs[1].name} />
                </ClubLogo>
              </ClubRow>
            </TiltContainer>
          </ClubInfo>
        </InfoSection>
      </MainContent>
    </AppContainer>
  );
}

export default App; 