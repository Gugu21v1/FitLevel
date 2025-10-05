import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { theme } from '../../styles/theme';
import { useThemeColors } from '../../hooks/useThemeColors';
import { FiX, FiCalendar, FiUsers, FiAward, FiLock, FiUnlock, FiCopy, FiTarget, FiCheckCircle } from 'react-icons/fi';
import { challengeService, type Challenge, type ChallengeParticipant } from '../../services/challengeService';
import { useAuth } from '../../contexts/AuthContext';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);

  @media (max-width: 768px) {
    max-width: 100%;
    max-height: 95vh;
    border-radius: 12px;
  }
`;

const ChallengeHeader = styled.div<{ imageUrl?: string }>`
  height: 200px;
  background: ${props => props.imageUrl
    ? `url(${props.imageUrl}) center/cover`
    : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDark})`};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px;
  position: relative;
  border-radius: 16px 16px 0 0;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.7));
    border-radius: 16px 16px 0 0;
  }

  @media (max-width: 768px) {
    height: 160px;
    padding: 15px;
    border-radius: 12px 12px 0 0;
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: start;
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

const ChallengeTitleSection = styled.div`
  position: relative;
  z-index: 1;
`;

const ChallengeName = styled.h2`
  color: white;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ChallengeType = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  color: white;
  font-size: 13px;
  font-weight: 500;
`;

const ModalBody = styled.div`
  padding: 24px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Section = styled.div`
  margin-bottom: 30px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3<{ colors: any }>`
  color: ${props => props.colors.text};
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Description = styled.p<{ colors: any }>`
  color: ${props => props.colors.textLight};
  font-size: 14px;
  line-height: 1.6;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
`;

const StatCard = styled.div<{ colors: any }>`
  padding: 15px;
  background: ${props => props.colors.background};
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const StatLabel = styled.span<{ colors: any }>`
  color: ${props => props.colors.textLight};
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div<{ colors: any }>`
  color: ${props => props.colors.text};
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    font-size: 1.2rem;
    color: ${theme.colors.primary};
  }

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const InviteSection = styled.div<{ colors: any }>`
  padding: 15px;
  background: ${theme.colors.primary}10;
  border: 1px solid ${theme.colors.primary}30;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
`;

const InviteCode = styled.div<{ colors: any }>`
  font-family: 'Courier New', monospace;
  font-size: 18px;
  font-weight: bold;
  color: ${theme.colors.primary};
  letter-spacing: 2px;
`;

const CopyButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${theme.colors.primaryDark};
    transform: translateY(-1px);
  }
`;

const ParticipantsList = styled.div<{ colors: any }>`
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 10px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: ${props => props.colors.background};
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.colors.border};
    border-radius: 3px;

    &:hover {
      background: ${props => props.colors.textLight};
    }
  }
`;

const ParticipantCard = styled.div<{ colors: any }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: ${props => props.colors.background};
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.colors.border}20;
  }

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const ParticipantInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div<{ name: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
`;

const ParticipantName = styled.div<{ colors: any }>`
  color: ${props => props.colors.text};
  font-size: 14px;
  font-weight: 500;
`;

const ParticipantProgress = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${theme.colors.success};
  font-size: 14px;

  svg {
    font-size: 18px;
  }
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'danger' }>`
  width: 100%;
  padding: 12px;
  background: ${props => props.variant === 'danger' ? theme.colors.error : theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px ${props => props.variant === 'danger' ? theme.colors.error : theme.colors.primary}40;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div<{ colors: any }>`
  text-align: center;
  padding: 30px;
  color: ${props => props.colors.textLight};

  p {
    font-size: 14px;
  }
`;

interface ChallengeDetailsModalProps {
  challenge: Challenge;
  onClose: () => void;
  onUpdate: () => void;
}

const ChallengeDetailsModal: React.FC<ChallengeDetailsModalProps> = ({ challenge, onClose, onUpdate }) => {
  const { user } = useAuth();
  const userProfile = user;
  const { colors } = useThemeColors();
  const [detailedChallenge, setDetailedChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [participating, setParticipating] = useState(challenge.is_participating);

  useEffect(() => {
    loadChallengeDetails();
  }, [challenge.id]);

  const loadChallengeDetails = async () => {
    try {
      setLoading(true);
      const data = await challengeService.getChallengeDetails(challenge.id!);
      setDetailedChallenge(data);
      setParticipating(data.participants?.some((p: ChallengeParticipant) => p.user_id === user?.id));
    } catch (error) {
      console.error('Error loading challenge details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleParticipate = async () => {
    try {
      if (participating) {
        await challengeService.leaveChallenge(challenge.id!, user!.id);
        setParticipating(false);
      } else {
        // Check if challenge is private and user needs invite code
        if (!challenge.is_public && !isOwner) {
          alert('Este é um desafio privado. Você precisa de um link de convite para participar.');
          return;
        }

        // For public challenges, check if user is from the same academy
        if (challenge.is_public && userProfile?.type !== 'admin') {
          const challengeDetails = await challengeService.getChallengeDetails(challenge.id!);
          if (userProfile?.academy_id !== challengeDetails.academy_id && userProfile?.type !== 'academia') {
            alert('Você só pode participar de desafios públicos da sua academia.');
            return;
          }
        }

        await challengeService.joinChallenge(challenge.id!, user!.id);
        setParticipating(true);
      }
      loadChallengeDetails();
      onUpdate();
    } catch (error: any) {
      alert(error.message || 'Erro ao atualizar participação');
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/challenges/join/${detailedChallenge.invite_code}`;
    navigator.clipboard.writeText(link);
    alert('Link de convite copiado!');
  };

  const getDaysRemaining = (endDate: string) => {
    const days = differenceInDays(new Date(endDate), new Date());
    if (days < 0) return 'Encerrado';
    if (days === 0) return 'Último dia';
    if (days === 1) return '1 dia';
    return `${days} dias`;
  };

  const isOwner = detailedChallenge?.created_by === user?.id;
  const isAcademyAdmin = userProfile?.type === 'academia' && detailedChallenge?.academy_id === userProfile?.id;
  const canSeeParticipants = isOwner || participating || userProfile?.type === 'admin' || isAcademyAdmin;

  if (loading) {
    return (
      <ModalOverlay onClick={onClose}>
        <ModalContent colors={colors} onClick={(e) => e.stopPropagation()}>
          <ModalBody>
            <EmptyState colors={colors}>
              <p>Carregando detalhes do desafio...</p>
            </EmptyState>
          </ModalBody>
        </ModalContent>
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent colors={colors} onClick={(e) => e.stopPropagation()}>
        <ChallengeHeader imageUrl={challenge.image_url}>
          <HeaderContent>
            <ChallengeType>
              {challenge.is_public ? <FiUnlock /> : <FiLock />}
              {challenge.is_public ? 'Público' : 'Privado'}
            </ChallengeType>
            <CloseButton onClick={onClose}>
              <FiX />
            </CloseButton>
          </HeaderContent>
          <ChallengeTitleSection>
            <ChallengeName>{challenge.name}</ChallengeName>
          </ChallengeTitleSection>
        </ChallengeHeader>

        <ModalBody>
          <StatsGrid>
            <StatCard colors={colors}>
              <StatLabel colors={colors}>Duração</StatLabel>
              <StatValue colors={colors}>
                <FiCalendar />
                {getDaysRemaining(challenge.end_date)}
              </StatValue>
            </StatCard>
            <StatCard colors={colors}>
              <StatLabel colors={colors}>Participantes</StatLabel>
              <StatValue colors={colors}>
                <FiUsers />
                {detailedChallenge?.participants?.length || 0}
              </StatValue>
            </StatCard>
            <StatCard colors={colors}>
              <StatLabel colors={colors}>Recompensa</StatLabel>
              <StatValue colors={colors}>
                <FiAward />
                {challenge.reward_points} pts
              </StatValue>
            </StatCard>
            {challenge.target_value && (
              <StatCard colors={colors}>
                <StatLabel colors={colors}>Meta</StatLabel>
                <StatValue colors={colors}>
                  <FiTarget />
                  {challenge.target_value}
                </StatValue>
              </StatCard>
            )}
          </StatsGrid>

          <Section>
            <SectionTitle colors={colors}>Descrição</SectionTitle>
            <Description colors={colors}>{challenge.description}</Description>
          </Section>

          <Section>
            <SectionTitle colors={colors}>Informações</SectionTitle>
            <Description colors={colors}>
              {challenge.start_date && (
                <>
                  <strong>Início:</strong> {format(new Date(challenge.start_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}<br />
                </>
              )}
              {challenge.end_date && (
                <>
                  <strong>Término:</strong> {format(new Date(challenge.end_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}<br />
                </>
              )}
              {detailedChallenge?.creator && (
                <>
                  <strong>Criado por:</strong> {detailedChallenge.creator.name}<br />
                </>
              )}
              {detailedChallenge?.academy && (
                <>
                  <strong>Academia:</strong> {detailedChallenge.academy.name}<br />
                </>
              )}
            </Description>
          </Section>

          {!challenge.is_public && detailedChallenge?.invite_code && (isOwner || participating) && (
            <Section>
              <SectionTitle colors={colors}>Convite</SectionTitle>
              <InviteSection colors={colors}>
                <div>
                  <small style={{ color: colors.textLight }}>Código de convite:</small>
                  <InviteCode colors={colors}>{detailedChallenge.invite_code}</InviteCode>
                </div>
                <CopyButton onClick={copyInviteLink}>
                  <FiCopy />
                  Copiar Link
                </CopyButton>
              </InviteSection>
            </Section>
          )}

          {canSeeParticipants && detailedChallenge?.participants && (
            <Section>
              <SectionTitle colors={colors}>
                <FiUsers />
                Participantes ({detailedChallenge.participants.length})
              </SectionTitle>
              {detailedChallenge.participants.length > 0 ? (
                <ParticipantsList colors={colors}>
                  {detailedChallenge.participants.map((participant: any) => (
                    <ParticipantCard colors={colors} key={participant.id}>
                      <ParticipantInfo>
                        <Avatar name={participant.user?.name || 'U'}>
                          {(participant.user?.name || 'U')[0].toUpperCase()}
                        </Avatar>
                        <ParticipantName colors={colors}>{participant.user?.name || 'Usuário'}</ParticipantName>
                      </ParticipantInfo>
                      {participant.completed && (
                        <ParticipantProgress>
                          <FiCheckCircle />
                          Concluído
                        </ParticipantProgress>
                      )}
                    </ParticipantCard>
                  ))}
                </ParticipantsList>
              ) : (
                <EmptyState colors={colors}>
                  <p>Nenhum participante ainda</p>
                </EmptyState>
              )}
            </Section>
          )}

          {!isOwner && (
            <ActionButton
              onClick={handleParticipate}
              variant={participating ? 'danger' : 'primary'}
            >
              {participating ? 'Sair do Desafio' : 'Participar do Desafio'}
            </ActionButton>
          )}

          {isOwner && (
            <ActionButton
              onClick={handleParticipate}
              variant={participating ? 'danger' : 'primary'}
            >
              {participating ? 'Sair do Desafio' : 'Participar do Meu Desafio'}
            </ActionButton>
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ChallengeDetailsModal;