import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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

const WinStreak = styled.div`
  font-size: 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;

  span.number {
    color: #ABE700;
    font-weight: bold;
    margin-left: 8px;
  }

  span.text {
    font-weight: normal;
  }

  &::before {
    content: "*";
    font-size: 48px;
    line-height: 1;
    color: white;
  }
`;

const ClubInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
`;

const ClubRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
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
  width: 50px;
  height: 50px;
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

  const handlePlayerSelect = (result: SearchResult) => {
    // Получаем массив команд игрока, разделяя их по "/" и очищая каждое название
    const playerTeams = result.player.teams
      .flatMap(teamStr => teamStr.split('/'))
      .map(team => cleanTeamName(team))
      .filter(team => team !== ''); // Удаляем пустые строки

    console.log('Команды игрока (очищенные):', playerTeams);

    const currentClubNames = currentClubs.map(club => club.name);
    console.log('Нужно найти команды:', currentClubNames);

    // Проверяем, играл ли игрок за оба клуба
    const playedForBothClubs = currentClubNames.every(clubName =>
      playerTeams.some(team => cleanTeamName(team) === clubName)
    );

    if (playedForBothClubs) {
      console.log('✅ ПРАВИЛЬНО! Игрок действительно играл за оба клуба');
      setWinStreak(prev => prev + 1);
    } else {
      console.log('❌ НЕПРАВИЛЬНО! Игрок не играл за оба этих клуба');
      // Выводим, за какие клубы не играл
      currentClubNames.forEach(clubName => {
        if (!playerTeams.some(team => cleanTeamName(team) === clubName)) {
          console.log(`Игрок не играл за: ${clubName}`);
        }
      });
      setWinStreak(0);
    }

    // Генерируем новые случайные клубы
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
          <WinStreak>
            <span className="text">серия побед:</span>
            <span className="number">{winStreak}</span>
          </WinStreak>

          <ClubInfo>
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
          </ClubInfo>
        </InfoSection>
      </MainContent>
    </AppContainer>
  );
}

export default App; 