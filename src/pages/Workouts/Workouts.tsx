import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FaDumbbell, FaList } from 'react-icons/fa';
import { useThemeColors } from '../../hooks/useThemeColors';
import WorkoutsList from './WorkoutsList';
import UserExercises from './UserExercises';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const TabContainer = styled.div<{ colors: any }>`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  border-bottom: 1px solid ${props => props.colors.border};
`;

const TabButton = styled(motion.button)<{ active: boolean; colors: any }>`
  padding: 12px 20px;
  background: ${props => props.active ? props.colors.primary : 'transparent'};
  color: ${props => props.active ? 'white' : props.colors.text};
  border: none;
  border-radius: 12px 12px 0 0;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    background: ${props => props.active ? props.colors.primary : props.colors.surface};
  }
`;

const Workouts: React.FC = () => {
  const { colors } = useThemeColors();
  const [activeTab, setActiveTab] = useState<'treinos' | 'exercicios'>('treinos');

  return (
    <Container>
      <TabContainer colors={colors}>
        <TabButton
          active={activeTab === 'treinos'}
          colors={colors}
          onClick={() => setActiveTab('treinos')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaList size={16} />
          Treinos
        </TabButton>
        <TabButton
          active={activeTab === 'exercicios'}
          colors={colors}
          onClick={() => setActiveTab('exercicios')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaDumbbell size={16} />
          Exercícios
        </TabButton>
      </TabContainer>

      {activeTab === 'treinos' ? <WorkoutsList /> : <UserExercises />}
    </Container>
  );
};

export default Workouts;