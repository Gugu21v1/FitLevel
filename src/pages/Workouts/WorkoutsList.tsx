import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { 
  FaDumbbell, 
  FaClock, 
  FaUser, 
  FaBuilding, 
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { workoutService, dataService } from '../../services/supabase';
import { theme } from '../../styles/theme';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: ${theme.colors.text};
  margin: 0;
`;

const CreateButton = styled.button`
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
  gap: 8px;
  transition: background 0.2s;

  &:hover {
    background: ${theme.colors.primaryDark};
  }
`;

const WorkoutsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
`;

const WorkoutCard = styled.div<{ isDarkMode: boolean }>`
  background: ${props => props.isDarkMode ? theme.colors.dark.surface : 'white'};
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const WorkoutHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const WorkoutTitle = styled.h3`
  color: ${theme.colors.text};
  margin: 0;
  font-size: 18px;
`;

const DifficultyBadge = styled.span<{ difficulty: string }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => {
    switch(props.difficulty) {
      case 'iniciante': return '#4CAF50';
      case 'intermediário': return '#FF9800';
      case 'avançado': return '#F44336';
      default: return theme.colors.secondary;
    }
  }};
  color: white;
`;

const WorkoutInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 15px 0;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${theme.colors.textLight};
  font-size: 14px;

  svg {
    color: ${theme.colors.primary};
  }
`;

const Description = styled.p`
  color: ${theme.colors.textLight};
  font-size: 14px;
  line-height: 1.4;
  margin: 10px 0;
`;

const CreatorInfo = styled.div`
  padding-top: 12px;
  border-top: 1px solid #eee;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${theme.colors.textLight};

  strong {
    color: ${theme.colors.text};
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 15px;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'danger' | 'edit' }>`
  flex: 1;
  padding: 8px;
  border: 1px solid ${props =>
    props.variant === 'danger' ? '#F44336' :
    props.variant === 'primary' ? theme.colors.primary :
    props.variant === 'edit' ? theme.colors.secondary :
    '#ddd'
  };
  background: ${props =>
    props.variant === 'danger' ? '#F44336' :
    props.variant === 'primary' ? theme.colors.primary :
    props.variant === 'edit' ? theme.colors.secondary :
    'white'
  };
  color: ${props =>
    props.variant ? 'white' : theme.colors.text
  };
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${theme.colors.textLight};

  svg {
    font-size: 48px;
    color: ${theme.colors.secondary};
    margin-bottom: 16px;
  }

  h3 {
    color: ${theme.colors.text};
    margin-bottom: 8px;
  }
`;

interface Workout {
  id: string;
  name: string;
  description?: string;
  duration?: number;
  difficulty?: string;
  id_profiles: string;
  academy_id?: string;
  is_template: boolean;
  created_at: string;
  creator?: {
    id: string;
    name: string;
    type: string;
    academy_id?: string;
  };
  academy?: {
    id: string;
    name: string;
  };
}

const WorkoutsList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const canCreateExercise = userProfile && ['admin', 'academia', 'personal'].includes(userProfile.type);

  useEffect(() => {
    loadUserProfileAndWorkouts();
  }, [user]);

  const loadUserProfileAndWorkouts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const profile = await dataService.getProfile(user.id);
      setUserProfile(profile);
      
      if (profile) {
        const workoutsList = await workoutService.getWorkoutsList(user.id, profile);
        setWorkouts(workoutsList);
      }
    } catch (error) {
      console.error('Error loading workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCreatorText = (workout: Workout) => {
    if (!workout.creator) return 'Desconhecido';
    
    if (workout.creator.id === user?.id) {
      return 'Criado por você';
    }
    
    if (workout.creator.type === 'personal') {
      return `${workout.creator.name} - Personal`;
    }
    
    if (workout.creator.type === 'academia') {
      return workout.creator.name;
    }
    
    return workout.creator.name;
  };

  const getAssigneeText = (workout: Workout) => {
    if (!workout.assignee) return '';

    if (workout.assignee.id === user?.id) {
      return 'Treino para você';
    }

    return `Treino para ${workout.assignee.name}`;
  };

  const canEdit = (workout: Workout) => {
    if (!userProfile) return false;

    // Usar a função centralizada de permissões
    return workoutService.canEditWorkout(workout, userProfile);
  };

  const canDelete = (workout: Workout) => {
    return canEdit(workout);
  };

  const handleView = (workoutId: string) => {
    navigate(`/workouts/${workoutId}`);
  };

  const handleEdit = (workoutId: string) => {
    navigate(`/workouts/${workoutId}/edit`);
  };

  const handleDelete = async (workoutId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este treino?')) {
      try {
        await workoutService.deleteWorkout(workoutId);
        await loadUserProfileAndWorkouts();
      } catch (error) {
        console.error('Error deleting workout:', error);
        alert('Erro ao excluir treino');
      }
    }
  };

  const handleCreate = () => {
    navigate('/workouts/create');
  };

  if (loading) {
    return (
      <Container>
        <Title>Carregando...</Title>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Meus Treinos</Title>
        <div style={{ display: 'flex', gap: '12px' }}>
          {canCreateExercise && (
            <CreateButton onClick={() => navigate('/exercises/create')}>
              <FaPlus /> Criar Exercício
            </CreateButton>
          )}
          <CreateButton onClick={handleCreate}>
            <FaPlus /> Criar Treino
          </CreateButton>
        </div>
      </Header>

      {workouts.length === 0 ? (
        <EmptyState>
          <FaDumbbell />
          <h3>Nenhum treino encontrado</h3>
          <p>Crie seu primeiro treino para começar!</p>
        </EmptyState>
      ) : (
        <WorkoutsGrid>
          {workouts.map(workout => (
            <WorkoutCard key={workout.id} isDarkMode={isDarkMode}>
              <WorkoutHeader>
                <WorkoutTitle>{workout.name}</WorkoutTitle>
                {workout.difficulty && (
                  <DifficultyBadge difficulty={workout.difficulty}>
                    {workout.difficulty}
                  </DifficultyBadge>
                )}
              </WorkoutHeader>

              {workout.description && (
                <Description>{workout.description}</Description>
              )}

              <WorkoutInfo>
                {workout.duration && (
                  <InfoRow>
                    <FaClock />
                    <span>{workout.duration} minutos</span>
                  </InfoRow>
                )}
              </WorkoutInfo>

              <CreatorInfo>
                {workout.creator?.type === 'personal' ? (
                  <FaUser />
                ) : workout.creator?.type === 'academia' ? (
                  <FaBuilding />
                ) : (
                  <FaUser />
                )}
                <div>
                  <div><strong>{getCreatorText(workout)}</strong></div>
                  {getAssigneeText(workout) && (
                    <div style={{ fontSize: '12px', marginTop: '2px', color: theme.colors.textLight }}>
                      {getAssigneeText(workout)}
                    </div>
                  )}
                </div>
              </CreatorInfo>

              <Actions>
                <ActionButton variant="primary" onClick={() => handleView(workout.id)}>
                  <FaEye /> Ver
                </ActionButton>
                {canEdit(workout) && (
                  <ActionButton variant="edit" onClick={() => handleEdit(workout.id)}>
                    <FaEdit /> Editar
                  </ActionButton>
                )}
                {canDelete(workout) && (
                  <ActionButton variant="danger" onClick={() => handleDelete(workout.id)}>
                    <FaTrash />
                  </ActionButton>
                )}
              </Actions>
            </WorkoutCard>
          ))}
        </WorkoutsGrid>
      )}
    </Container>
  );
};

export default WorkoutsList;