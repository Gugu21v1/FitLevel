import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Trophy, Users, Clock, Flame } from 'lucide-react';
import { theme } from '../../styles/theme';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: ${theme.fontSize.xxl};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.xl};
`;

const ChallengeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${theme.spacing.lg};
`;

const ChallengeCard = styled(motion.div)`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.xl};
  overflow: hidden;
  box-shadow: ${theme.shadows.sm};
  transition: all ${theme.transitions.normal};

  &:hover {
    box-shadow: ${theme.shadows.md};
    transform: translateY(-4px);
  }
`;

const ChallengeImage = styled.div`
  height: 200px;
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryLight});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const ChallengeContent = styled.div`
  padding: ${theme.spacing.lg};
`;

const ChallengeTitle = styled.h3`
  font-size: ${theme.fontSize.lg};
  margin-bottom: ${theme.spacing.sm};
`;

const ChallengeDescription = styled.p`
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.md};
`;

const ChallengeInfo = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.md};
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  color: ${theme.colors.textSecondary};
  font-size: ${theme.fontSize.sm};
`;

const JoinButton = styled(motion.button)`
  width: 100%;
  padding: ${theme.spacing.md};
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryLight});
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.lg};
  font-weight: ${theme.fontWeight.semibold};
  cursor: pointer;
`;

export const Challenges: React.FC = () => {
  const challenges = [
    {
      id: 1,
      title: 'Desafio 30 Dias Sem Açúcar',
      description: 'Elimine o açúcar refinado da sua dieta por 30 dias',
      participants: 234,
      daysLeft: 25,
      points: 500,
      type: 'daily'
    },
    {
      id: 2,
      title: 'Academia 5x por Semana',
      description: 'Treine 5 vezes por semana durante um mês',
      participants: 189,
      daysLeft: 20,
      points: 750,
      type: 'weekly'
    },
    {
      id: 3,
      title: '10.000 Passos Diários',
      description: 'Caminhe 10.000 passos todos os dias',
      participants: 456,
      daysLeft: 15,
      points: 300,
      type: 'daily'
    },
    {
      id: 4,
      title: 'Desafio Hidratação',
      description: 'Beba 3 litros de água por dia',
      participants: 312,
      daysLeft: 10,
      points: 200,
      type: 'daily'
    }
  ];

  return (
    <Container>
      <Title>Desafios Ativos</Title>
      
      <ChallengeGrid>
        {challenges.map((challenge, index) => (
          <ChallengeCard
            key={challenge.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ChallengeImage>
              <Trophy size={64} />
            </ChallengeImage>
            <ChallengeContent>
              <ChallengeTitle>{challenge.title}</ChallengeTitle>
              <ChallengeDescription>{challenge.description}</ChallengeDescription>
              <ChallengeInfo>
                <InfoItem>
                  <Users size={16} />
                  {challenge.participants}
                </InfoItem>
                <InfoItem>
                  <Clock size={16} />
                  {challenge.daysLeft} dias
                </InfoItem>
                <InfoItem>
                  <Flame size={16} />
                  {challenge.points} pts
                </InfoItem>
              </ChallengeInfo>
              <JoinButton
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Participar
              </JoinButton>
            </ChallengeContent>
          </ChallengeCard>
        ))}
      </ChallengeGrid>
    </Container>
  );
};