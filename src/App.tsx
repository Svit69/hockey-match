import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { clubs, Club } from './types/clubs';

const AppContainer = styled.div`
  background-color: #1a1a1a;
  min-height: 100vh;
  color: white;
  padding: 20px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 50px;
`;

const Logo = styled.img`
  height: 40px;
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
`;

const ClubInfo = styled.div`
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
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
  const [winStreak, setWinStreak] = useState(1);
  const [currentClubs, setCurrentClubs] = useState<[Club, Club]>([clubs[0], clubs[1]]);

  useEffect(() => {
    // Select two random clubs
    const getRandomClubs = () => {
      const shuffled = [...clubs].sort(() => 0.5 - Math.random());
      return [shuffled[0], shuffled[1]] as [Club, Club];
    };
    
    setCurrentClubs(getRandomClubs());
  }, []);

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
          <SearchInput type="text" placeholder="Поиск" />
        </SearchSection>

        <InfoSection>
          <WinStreak>
            <span>серия побед: {winStreak}</span>
          </WinStreak>

          <ClubInfo>
            Играл за
            <ClubLogo>
              <img src={`/images/${currentClubs[0].logoFile}`} alt={currentClubs[0].name} />
            </ClubLogo>
            и за
            <ClubLogo>
              <img src={`/images/${currentClubs[1].logoFile}`} alt={currentClubs[1].name} />
            </ClubLogo>
          </ClubInfo>
        </InfoSection>
      </MainContent>
    </AppContainer>
  );
}

export default App; 