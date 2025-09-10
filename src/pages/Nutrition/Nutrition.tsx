import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { theme } from '../../styles/theme';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${theme.fontSize.xxl};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.md};
`;

const CalorieTracker = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm};
  margin-bottom: ${theme.spacing.xl};
`;

const CalorieHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
`;

const CalorieInfo = styled.div`
  display: flex;
  gap: ${theme.spacing.xl};
`;

const CalorieStat = styled.div`
  text-align: center;
`;

const CalorieValue = styled.div`
  font-size: ${theme.fontSize.xl};
  font-weight: ${theme.fontWeight.bold};
  color: ${props => props.color || theme.colors.text};
  margin-bottom: ${theme.spacing.xs};
`;

const CalorieLabel = styled.div`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textSecondary};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 12px;
  background: ${theme.colors.border};
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)<{ percentage: number }>`
  height: 100%;
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryLight});
  width: ${props => props.percentage}%;
`;

const MealSection = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const MealHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
`;

const MealTitle = styled.h2`
  font-size: ${theme.fontSize.lg};
  color: ${theme.colors.text};
`;

const AddButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.fontSize.sm};
  cursor: pointer;
`;

const MealCard = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.md};
  box-shadow: ${theme.shadows.sm};
  margin-bottom: ${theme.spacing.sm};
`;

const FoodItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const FoodName = styled.div`
  font-weight: ${theme.fontWeight.medium};
`;

const FoodCalories = styled.div`
  color: ${theme.colors.primary};
  font-weight: ${theme.fontWeight.semibold};
`;

export const Nutrition: React.FC = () => {
  const [dailyCalories] = useState({
    consumed: 1650,
    goal: 2500,
    burned: 450,
    remaining: 1300
  });

  const meals = {
    breakfast: [
      { name: 'Ovos mexidos', calories: 220 },
      { name: 'Pão integral', calories: 140 },
      { name: 'Café com leite', calories: 80 }
    ],
    lunch: [
      { name: 'Arroz integral', calories: 180 },
      { name: 'Frango grelhado', calories: 250 },
      { name: 'Salada', calories: 50 }
    ],
    dinner: [],
    snacks: [
      { name: 'Banana', calories: 105 },
      { name: 'Whey Protein', calories: 120 }
    ]
  };

  const percentage = (dailyCalories.consumed / dailyCalories.goal) * 100;

  return (
    <Container>
      <Header>
        <Title>Nutrição</Title>
      </Header>

      <CalorieTracker>
        <CalorieHeader>
          <CalorieInfo>
            <CalorieStat>
              <CalorieValue>{dailyCalories.consumed}</CalorieValue>
              <CalorieLabel>Consumidas</CalorieLabel>
            </CalorieStat>
            <CalorieStat>
              <CalorieValue color={theme.colors.primary}>{dailyCalories.goal}</CalorieValue>
              <CalorieLabel>Meta</CalorieLabel>
            </CalorieStat>
            <CalorieStat>
              <CalorieValue color={theme.colors.warning}>{dailyCalories.burned}</CalorieValue>
              <CalorieLabel>Queimadas</CalorieLabel>
            </CalorieStat>
            <CalorieStat>
              <CalorieValue color={theme.colors.success}>{dailyCalories.remaining}</CalorieValue>
              <CalorieLabel>Restantes</CalorieLabel>
            </CalorieStat>
          </CalorieInfo>
        </CalorieHeader>
        <ProgressBar>
          <ProgressFill 
            percentage={percentage}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1 }}
          />
        </ProgressBar>
      </CalorieTracker>

      <MealSection>
        <MealHeader>
          <MealTitle>Café da Manhã</MealTitle>
          <AddButton whileTap={{ scale: 0.95 }}>
            <Plus size={16} />
            Adicionar
          </AddButton>
        </MealHeader>
        <MealCard>
          {meals.breakfast.map((item, index) => (
            <FoodItem key={index}>
              <FoodName>{item.name}</FoodName>
              <FoodCalories>{item.calories} cal</FoodCalories>
            </FoodItem>
          ))}
        </MealCard>
      </MealSection>

      <MealSection>
        <MealHeader>
          <MealTitle>Almoço</MealTitle>
          <AddButton whileTap={{ scale: 0.95 }}>
            <Plus size={16} />
            Adicionar
          </AddButton>
        </MealHeader>
        <MealCard>
          {meals.lunch.map((item, index) => (
            <FoodItem key={index}>
              <FoodName>{item.name}</FoodName>
              <FoodCalories>{item.calories} cal</FoodCalories>
            </FoodItem>
          ))}
        </MealCard>
      </MealSection>

      <MealSection>
        <MealHeader>
          <MealTitle>Lanches</MealTitle>
          <AddButton whileTap={{ scale: 0.95 }}>
            <Plus size={16} />
            Adicionar
          </AddButton>
        </MealHeader>
        <MealCard>
          {meals.snacks.map((item, index) => (
            <FoodItem key={index}>
              <FoodName>{item.name}</FoodName>
              <FoodCalories>{item.calories} cal</FoodCalories>
            </FoodItem>
          ))}
        </MealCard>
      </MealSection>
    </Container>
  );
};