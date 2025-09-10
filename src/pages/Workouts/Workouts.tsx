import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Dumbbell, Plus, Clock, Flame } from 'lucide-react';
import { theme } from '../../styles/theme';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${theme.fontSize.xxl};
  color: ${theme.colors.text};
`;

const Button = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryLight});
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.fontSize.md};
  font-weight: ${theme.fontWeight.semibold};
  cursor: pointer;
`;

const WorkoutGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${theme.spacing.lg};
`;

const WorkoutCard = styled(motion.div)`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm};
  cursor: pointer;
  transition: all ${theme.transitions.normal};

  &:hover {
    box-shadow: ${theme.shadows.md};
    transform: translateY(-4px);
  }
`;

const WorkoutTitle = styled.h3`
  font-size: ${theme.fontSize.lg};
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.text};
`;

const WorkoutInfo = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  margin-top: ${theme.spacing.md};
  color: ${theme.colors.textSecondary};
  font-size: ${theme.fontSize.sm};
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

export const Workouts: React.FC = () => {
  const workouts = [
    { id: 1, name: 'Treino A - Peito e Tríceps', duration: 45, calories: 350, exercises: 8 },
    { id: 2, name: 'Treino B - Costas e Bíceps', duration: 50, calories: 400, exercises: 9 },
    { id: 3, name: 'Treino C - Pernas', duration: 60, calories: 500, exercises: 10 },
    { id: 4, name: 'Treino D - Ombros e Abdômen', duration: 40, calories: 300, exercises: 7 },
  ];

  return (
    <Container>
      <Header>
        <Title>Meus Treinos</Title>
        <Button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
          Novo Treino
        </Button>
      </Header>

      <WorkoutGrid>
        {workouts.map((workout, index) => (
          <WorkoutCard
            key={workout.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <WorkoutTitle>{workout.name}</WorkoutTitle>
            <WorkoutInfo>
              <InfoItem>
                <Clock size={16} />
                {workout.duration} min
              </InfoItem>
              <InfoItem>
                <Flame size={16} />
                {workout.calories} cal
              </InfoItem>
              <InfoItem>
                <Dumbbell size={16} />
                {workout.exercises} ex
              </InfoItem>
            </WorkoutInfo>
          </WorkoutCard>
        ))}
      </WorkoutGrid>
    </Container>
  );
};