import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { theme } from '../../styles/theme';
import { useThemeColors } from '../../hooks/useThemeColors';
import { FiSearch, FiPlus, FiUsers, FiCalendar, FiAward, FiLock, FiUnlock, FiLogIn, FiX } from 'react-icons/fi';
import { challengeService, type Challenge } from '../../services/challengeService';
import { useAuth } from '../../contexts/AuthContext';
import { differenceInDays } from 'date-fns';
import CreateChallengeModal from './CreateChallengeModal';
import ChallengeDetailsModal from './ChallengeDetailsModal';

const Container = styled.div<{ colors: any }>`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 20px;
`;

const Title = styled.h1<{ colors: any }>`
  color: ${props => props.colors.text};
  font-size: 2rem;
  font-weight: 600;
`;

const Controls = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchBox = styled.div`
  position: relative;
  width: 300px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SearchInput = styled.input<{ colors: any }>`
  width: 100%;
  padding: 10px 40px 10px 15px;
  border: 1px solid ${props => props.colors.border};
  border-radius: 8px;
  font-size: 14px;
  background: ${props => props.colors.surface};
  color: ${props => props.colors.text};
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }

  &::placeholder {
    color: ${props => props.colors.textLight};
  }
`;

const SearchIcon = styled(FiSearch)<{ colors: any }>`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.colors.textLight};
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${theme.colors.primaryDark};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${theme.colors.primary}40;
  }
`;

const Tabs = styled.div<{ colors: any }>`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid ${props => props.colors.border};
`;

const Tab = styled.button<{ active: boolean; colors: any }>`
  padding: 10px 20px;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? theme.colors.primary : 'transparent'};
  color: ${props => props.active ? theme.colors.primary : props.colors.textLight};
  font-size: 14px;
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    color: ${theme.colors.primary};
  }
`;

const ChallengesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const ChallengeCard = styled.div<{ colors: any }>`
  background: ${props => props.colors.surface};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
`;

const ChallengeImage = styled.div<{ imageUrl?: string }>`
  height: 150px;
  background: ${props => props.imageUrl
    ? `url(${props.imageUrl}) center/cover`
    : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDark})`};
  display: flex;
  align-items: center;
  justify-content: center;

  ${props => !props.imageUrl && `
    svg {
      font-size: 48px;
      color: white;
      opacity: 0.8;
    }
  `}
`;

const ChallengeContent = styled.div`
  padding: 20px;
`;

const ChallengeName = styled.h3<{ colors: any }>`
  color: ${props => props.colors.text};
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PrivacyIcon = styled.span<{ colors: any }>`
  display: flex;
  align-items: center;
  color: ${props => props.colors.textLight};
  font-size: 1rem;
`;

const ChallengeDescription = styled.p<{ colors: any }>`
  color: ${props => props.colors.textLight};
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChallengeStats = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
`;

const Stat = styled.div<{ colors: any }>`
  display: flex;
  align-items: center;
  gap: 5px;
  color: ${props => props.colors.textLight};
  font-size: 13px;

  svg {
    color: ${theme.colors.primary};
  }
`;

const ChallengeFooter = styled.div<{ colors: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid ${props => props.colors.border};
`;

const Points = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: ${theme.colors.primary};
  font-weight: 600;
  font-size: 14px;
`;

const ParticipateButton = styled.button<{ participating?: boolean }>`
  padding: 8px 16px;
  background: ${props => props.participating ? theme.colors.success : theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const EmptyState = styled.div<{ colors: any }>`
  text-align: center;
  padding: 60px 20px;
  color: ${props => props.colors.textLight};

  h3 {
    font-size: 1.5rem;
    margin-bottom: 10px;
    color: ${props => props.colors.text};
  }

  p {
    font-size: 14px;
    margin-bottom: 20px;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div<{ colors: any }>`
  background: ${props => props.colors.surface};
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div<{ colors: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid ${props => props.colors.border};
`;

const ModalTitle = styled.h2<{ colors: any }>`
  color: ${props => props.colors.text};
  font-size: 1.5rem;
  font-weight: 600;
`;

const CloseButton = styled.button<{ colors: any }>`
  background: none;
  border: none;
  color: ${props => props.colors.textLight};
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    color: ${props => props.colors.text};
    transform: rotate(90deg);
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label<{ colors: any }>`
  display: block;
  color: ${props => props.colors.text};
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
`;

const Input = styled.input<{ colors: any }>`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid ${props => props.colors.border};
  border-radius: 8px;
  font-size: 14px;
  background: ${props => props.colors.surface};
  color: ${props => props.colors.text};
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px ${theme.colors.primary}20;
  }

  &::placeholder {
    color: ${props => props.colors.textLight};
  }
`;

const HelpText = styled.p<{ colors: any }>`
  color: ${props => props.colors.textLight};
  font-size: 13px;
  margin-top: 8px;
  line-height: 1.4;
`;

const ModalFooter = styled.div<{ colors: any }>`
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  padding: 24px;
  border-top: 1px solid ${props => props.colors.border};
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary'; colors: any }>`
  padding: 10px 24px;
  background: ${props => props.variant === 'secondary' ? props.colors.surface : theme.colors.primary};
  color: ${props => props.variant === 'secondary' ? props.colors.text : 'white'};
  border: ${props => props.variant === 'secondary' ? `1px solid ${props.colors.border}` : 'none'};
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    ${props => props.variant === 'secondary'
      ? `background: ${props.colors.background};`
      : `background: ${theme.colors.primaryDark}; transform: translateY(-1px); box-shadow: 0 4px 12px ${theme.colors.primary}40;`
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ChallengesList: React.FC = () => {
  const { user } = useAuth();
  const userProfile = user;
  const { colors } = useThemeColors();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [filteredChallenges, setFilteredChallenges] = useState<Challenge[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  useEffect(() => {
    if (user && userProfile) {
      loadChallenges();
    }
  }, [user, userProfile, activeTab]);

  useEffect(() => {
    filterChallenges();
  }, [searchTerm, challenges]);

  const loadChallenges = async () => {
    try {
      setLoading(true);
      const data = await challengeService.getChallenges(user!.id, userProfile!, activeTab === 'completed' ? 'completed' : 'active');
      setChallenges(data);
      setFilteredChallenges(data);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterChallenges = () => {
    if (!searchTerm.trim()) {
      setFilteredChallenges(challenges);
      return;
    }

    const filtered = challenges.filter(challenge =>
      challenge.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      challenge.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredChallenges(filtered);
  };

  const handleParticipate = async (e: React.MouseEvent, challenge: Challenge) => {
    e.stopPropagation();

    // If already participating, just open the challenge details
    if (challenge.is_participating) {
      setSelectedChallenge(challenge);
      return;
    }

    try {
      // Check if challenge is private - for private challenges, user needs invite link
      if (!challenge.is_public) {
        alert('Este é um desafio privado. Você precisa de um link de convite para participar.');
        return;
      }

      // For public challenges, check if user is from the same academy
      if (challenge.is_public && userProfile?.type !== 'admin') {
        if ((userProfile?.type === 'aluno' || userProfile?.type === 'personal') &&
            userProfile?.academy_id !== challenge.academy_id) {
          alert('Você só pode participar de desafios públicos da sua academia.');
          return;
        }
      }

      await challengeService.joinChallenge(challenge.id!, user!.id);
      loadChallenges();
    } catch (error: any) {
      alert(error.message || 'Erro ao participar do desafio');
    }
  };

  const getDaysRemaining = (endDate: string) => {
    const days = differenceInDays(new Date(endDate), new Date());
    if (days < 0) return 'Encerrado';
    if (days === 0) return 'Último dia';
    if (days === 1) return '1 dia restante';
    return `${days} dias restantes`;
  };

  const handleJoinByCode = async () => {
    if (!inviteCode.trim()) {
      alert('Por favor, digite o código de convite');
      return;
    }

    try {
      setJoinLoading(true);

      // Extract code from URL if user pasted a full link
      const codeMatch = inviteCode.match(/\/challenges\/join\/([A-Z0-9]+)/);
      const code = codeMatch ? codeMatch[1] : inviteCode.trim();

      await challengeService.joinChallengeByCode(code, user!.id);

      setShowJoinModal(false);
      setInviteCode('');
      loadChallenges();
      alert('Você entrou no desafio com sucesso!');
    } catch (error: any) {
      alert(error.message || 'Erro ao entrar no desafio');
    } finally {
      setJoinLoading(false);
    }
  };

  const canCreateChallenge = userProfile?.type === 'academia' || userProfile?.type === 'aluno' || userProfile?.type === 'personal' || userProfile?.type === 'admin';

  return (
    <Container colors={colors}>
      <Header>
        <Title colors={colors}>Desafios</Title>
        <Controls>
          <SearchBox>
            <SearchInput
              colors={colors}
              type="text"
              placeholder="Buscar desafios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon colors={colors} />
          </SearchBox>
          <CreateButton onClick={() => setShowJoinModal(true)}>
            <FiLogIn />
            Entrar em um Desafio
          </CreateButton>
          {canCreateChallenge && (
            <CreateButton onClick={() => setShowCreateModal(true)}>
              <FiPlus />
              Criar Desafio
            </CreateButton>
          )}
        </Controls>
      </Header>

      <Tabs colors={colors}>
        <Tab
          colors={colors}
          active={activeTab === 'active'}
          onClick={() => setActiveTab('active')}
        >
          Ativos
        </Tab>
        <Tab
          colors={colors}
          active={activeTab === 'completed'}
          onClick={() => setActiveTab('completed')}
        >
          Concluídos
        </Tab>
      </Tabs>

      {loading ? (
        <EmptyState colors={colors}>
          <p>Carregando desafios...</p>
        </EmptyState>
      ) : filteredChallenges.length === 0 ? (
        <EmptyState colors={colors}>
          <h3>Nenhum desafio encontrado</h3>
          <p>
            {searchTerm
              ? 'Tente ajustar sua busca'
              : activeTab === 'active'
              ? 'Que tal criar um novo desafio?'
              : 'Não há desafios concluídos'}
          </p>
          {canCreateChallenge && activeTab === 'active' && !searchTerm && (
            <CreateButton onClick={() => setShowCreateModal(true)}>
              <FiPlus />
              Criar Primeiro Desafio
            </CreateButton>
          )}
        </EmptyState>
      ) : (
        <ChallengesGrid>
          {filteredChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              colors={colors}
              onClick={() => setSelectedChallenge(challenge)}
            >
              <ChallengeImage imageUrl={challenge.image_url}>
                {!challenge.image_url && <FiAward />}
              </ChallengeImage>
              <ChallengeContent>
                <ChallengeName colors={colors}>
                  {challenge.name}
                  <PrivacyIcon colors={colors}>
                    {challenge.is_public ? <FiUnlock /> : <FiLock />}
                  </PrivacyIcon>
                </ChallengeName>
                <ChallengeDescription colors={colors}>{challenge.description}</ChallengeDescription>
                <ChallengeStats>
                  <Stat colors={colors}>
                    <FiCalendar />
                    {getDaysRemaining(challenge.end_date)}
                  </Stat>
                  <Stat colors={colors}>
                    <FiUsers />
                    {challenge.participant_count || 0} participantes
                  </Stat>
                </ChallengeStats>
                <ChallengeFooter colors={colors}>
                  <Points>
                    <FiAward />
                    {challenge.reward_points} pontos
                  </Points>
                  <ParticipateButton
                    participating={challenge.is_participating}
                    onClick={(e) => handleParticipate(e, challenge)}
                  >
                    {challenge.is_participating ? 'Ver Desafio' : 'Participar'}
                  </ParticipateButton>
                </ChallengeFooter>
              </ChallengeContent>
            </ChallengeCard>
          ))}
        </ChallengesGrid>
      )}

      {showCreateModal && (
        <CreateChallengeModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadChallenges();
          }}
        />
      )}

      {selectedChallenge && (
        <ChallengeDetailsModal
          challenge={selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
          onUpdate={loadChallenges}
        />
      )}

      {showJoinModal && (
        <ModalOverlay onClick={() => setShowJoinModal(false)}>
          <ModalContent colors={colors} onClick={(e) => e.stopPropagation()}>
            <ModalHeader colors={colors}>
              <ModalTitle colors={colors}>Entrar em um Desafio</ModalTitle>
              <CloseButton colors={colors} onClick={() => setShowJoinModal(false)}>
                <FiX />
              </CloseButton>
            </ModalHeader>

            <ModalBody>
              <FormGroup>
                <Label colors={colors}>Código de Convite</Label>
                <Input
                  colors={colors}
                  type="text"
                  placeholder="Cole o código ou link do desafio aqui..."
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  maxLength={200}
                />
                <HelpText colors={colors}>
                  Você pode colar tanto o código (ex: ABC123XY) quanto o link completo do convite.
                </HelpText>
              </FormGroup>
            </ModalBody>

            <ModalFooter colors={colors}>
              <Button colors={colors} variant="secondary" onClick={() => setShowJoinModal(false)}>
                Cancelar
              </Button>
              <Button colors={colors} onClick={handleJoinByCode} disabled={joinLoading}>
                {joinLoading ? 'Entrando...' : 'Entrar no Desafio'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default ChallengesList;