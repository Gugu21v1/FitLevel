import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FaDumbbell, FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { workoutService, dataService } from '../../services/supabase';
import { theme } from '../../styles/theme';
import { useNavigate } from 'react-router-dom';
import { useThemeColors } from '../../hooks/useThemeColors';

const Container = styled.div`
  padding: 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  gap: 20px;

  @media (max-width: 768px) {
    gap: 16px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
`;

const Title = styled.h1<{ colors: any }>`
  color: ${props => props.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 480px) {
    justify-content: center;
    text-align: center;
  }
`;

const SearchSection = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
`;

const SearchInput = styled.input<{ colors: any }>`
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 2px solid ${props => props.colors.border};
  border-radius: 12px;
  font-size: 16px;
  background: ${props => props.colors.surface};
  color: ${props => props.colors.text};
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }

  &::placeholder {
    color: ${props => props.colors.textSecondary};
  }
`;

const SearchIcon = styled.div<{ colors: any }>`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.colors.textSecondary};
`;

const CreateButton = styled(motion.button)`
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;
  white-space: nowrap;

  &:hover {
    background: ${theme.colors.primaryDark};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 184, 217, 0.3);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 14px 24px;
  }
`;

const ExercisesList = styled.div`
  display: grid;
  gap: 16px;
`;

const ExerciseItem = styled(motion.div)<{ colors: any }>`
  padding: 20px;
  background: ${props => props.colors.surface};
  border-radius: 12px;
  border: 1px solid ${props => props.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ExerciseInfo = styled.div`
  flex: 1;
`;

const ExerciseName = styled.h3<{ colors: any }>`
  font-size: 18px;
  margin: 0 0 8px 0;
  color: ${props => props.colors.text};
`;

const ExerciseDescription = styled.p<{ colors: any }>`
  color: ${props => props.colors.textSecondary};
  font-size: 14px;
  line-height: 1.4;
  margin: 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ExerciseMeta = styled.div<{ colors: any }>`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 14px;
  color: ${props => props.colors.textSecondary};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled(motion.button)<{ variant: 'edit' | 'delete' }>`
  padding: 8px;
  background: ${props => props.variant === 'edit' ? '#4CAF50' : '#f44336'};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: scale(1.05);
  }
`;

const EmptyState = styled.div<{ colors: any }>`
  text-align: center;
  padding: 60px 20px;
  color: ${props => props.colors.textSecondary};

  svg {
    font-size: 48px;
    color: ${theme.colors.secondary};
    margin-bottom: 16px;
  }

  h3 {
    color: ${props => props.colors.text};
    margin-bottom: 8px;
  }
`;

const LoadingSpinner = styled.div<{ colors: any }>`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: ${props => props.colors.textSecondary};
`;

interface Exercise {
  id: string;
  name: string;
  description?: string;
  instructions?: string;
  muscle_group?: string;
  equipment?: string;
  video?: string;
  public: boolean;
  created_by: string;
  created_at: string;
}

const UserExercises: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { colors } = useThemeColors();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const canCreateContent = userProfile; // Todos os usuários podem criar exercícios
  const canEditOwnContent = userProfile; // Todos os usuários podem editar seus próprios exercícios

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  useEffect(() => {
    if (userProfile) {
      loadUserExercises();
    }
  }, [userProfile]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredExercises(exercises);
    } else {
      const filtered = exercises.filter(exercise =>
        exercise.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.muscle_group?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.equipment?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredExercises(filtered);
    }
  }, [searchQuery, exercises]);

  const loadUserProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const profile = await dataService.getProfile(user.id);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserExercises = async () => {
    if (!user || !userProfile) return;

    try {
      setLoading(true);
      const userExercises = await workoutService.getUserCreatedExercises(user.id);
      setExercises(userExercises || []);
      setFilteredExercises(userExercises || []);
    } catch (error) {
      console.error('Error loading user exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este exercício?')) return;

    try {
      await workoutService.deleteExercise(exerciseId);
      alert('Exercício excluído com sucesso!');
      await loadUserExercises();
    } catch (error) {
      console.error('Error deleting exercise:', error);
      alert(error.message || 'Erro ao excluir exercício');
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner colors={colors}>
          Carregando exercícios...
        </LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title colors={colors}>
          <FaDumbbell size={24} />
          Meus Exercícios
        </Title>

        {canCreateContent && (
          <CreateButton onClick={() => navigate('/exercises/create')} whileTap={{ scale: 0.95 }}>
            <FaPlus />
            Criar Exercício
          </CreateButton>
        )}
      </Header>

      <SearchSection>
        <SearchContainer>
          <SearchIcon colors={colors}>
            <FaSearch size={18} />
          </SearchIcon>
          <SearchInput
            colors={colors}
            type="text"
            placeholder="Buscar exercícios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>
      </SearchSection>

      {filteredExercises.length === 0 ? (
        <EmptyState colors={colors}>
          <FaDumbbell />
          <h3>Nenhum exercício encontrado</h3>
          <p>
            {searchQuery ?
              `Nenhum resultado para "${searchQuery}"` :
              canCreateContent ?
                'Crie seu primeiro exercício para começar!' :
                'Você ainda não criou nenhum exercício.'
            }
          </p>
        </EmptyState>
      ) : (
        <ExercisesList>
          {filteredExercises.map((exercise) => (
            <ExerciseItem
              key={exercise.id}
              colors={colors}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ExerciseInfo>
                <ExerciseName colors={colors}>{exercise.name}</ExerciseName>
                {exercise.instructions && (
                  <ExerciseDescription colors={colors}>
                    {exercise.instructions}
                  </ExerciseDescription>
                )}
                <ExerciseMeta colors={colors}>
                  {exercise.muscle_group && (
                    <MetaItem>
                      <FaDumbbell size={14} />
                      {exercise.muscle_group}
                    </MetaItem>
                  )}
                  {exercise.equipment && (
                    <MetaItem>
                      Equipamento: {exercise.equipment}
                    </MetaItem>
                  )}
                  {exercise.public && (
                    <MetaItem>
                      🌍 Público
                    </MetaItem>
                  )}
                </ExerciseMeta>
              </ExerciseInfo>
              {canEditOwnContent && (
                <ActionButtons>
                  <IconButton
                    variant="edit"
                    onClick={() => navigate(`/exercises/edit/${exercise.id}`)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaEdit size={16} />
                  </IconButton>
                  <IconButton
                    variant="delete"
                    onClick={() => handleDeleteExercise(exercise.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaTrash size={16} />
                  </IconButton>
                </ActionButtons>
              )}
            </ExerciseItem>
          ))}
        </ExercisesList>
      )}
    </Container>
  );
};

export default UserExercises;