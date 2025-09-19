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
  FaEye,
  FaSearch
} from 'react-icons/fa';
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
  margin-bottom: 20px;
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

  @media (max-width: 480px) {
    text-align: center;
  }
`;

const CreateButtonGroup = styled.div`
  display: flex;
  gap: 12px;
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
  justify-content: center;
  gap: 8px;
  transition: background 0.2s;
  white-space: nowrap;

  &:hover {
    background: ${theme.colors.primaryDark};
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 14px 24px;
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
  padding: 12px 16px 12px 45px;
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
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.colors.textSecondary};
`;

const WorkoutsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
`;

const WorkoutCard = styled.div<{ colors: any }>`
  background: ${props => props.colors.surface};
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

const WorkoutTitle = styled.h3<{ colors: any }>`
  color: ${props => props.colors.text};
  margin: 0;
  font-size: 18px;
`;

const DifficultyBadge = styled.span<{ difficulty: string }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => {
    const diff = props.difficulty?.toLowerCase();
    switch(diff) {
      case 'iniciante': return '#4CAF50';
      case 'intermediário':
      case 'intermediario': return '#FF9800';
      case 'avançado':
      case 'avancado': return '#F44336';
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

const InfoRow = styled.div<{ colors: any }>`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${props => props.colors.textSecondary};
  font-size: 14px;

  svg {
    color: ${theme.colors.primary};
  }
`;

const Description = styled.p<{ colors: any }>`
  color: ${props => props.colors.textSecondary};
  font-size: 14px;
  line-height: 1.4;
  margin: 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CreatorInfo = styled.div<{ colors: any }>`
  padding-top: 12px;
  border-top: 1px solid ${props => props.colors.border};
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${props => props.colors.textSecondary};

  strong {
    color: ${props => props.colors.text};
  }
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 15px;
`;

const ActionButton = styled.button<{ variant?: 'primary' | 'danger' | 'edit'; colors: any }>`
  flex: 1;
  padding: 8px;
  border: 1px solid ${props =>
    props.variant === 'danger' ? '#F44336' :
    props.variant === 'primary' ? theme.colors.primary :
    props.variant === 'edit' ? theme.colors.secondary :
    props.colors.border
  };
  background: ${props =>
    props.variant === 'danger' ? '#F44336' :
    props.variant === 'primary' ? theme.colors.primary :
    props.variant === 'edit' ? theme.colors.secondary :
    props.colors.surface
  };
  color: ${props =>
    props.variant ? 'white' : props.colors.text
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
  assignee?: {
    id: string;
    name: string;
    type: string;
    email?: string;
  };
  academy?: {
    id: string;
    name: string;
  };
}

const WorkoutsList: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { colors } = useThemeColors();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    loadUserProfileAndWorkouts();
  }, [user]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredWorkouts(workouts);
    } else {
      const filtered = workouts.filter(workout => {
        const assigneeName = workout.assignee?.name?.toLowerCase() || '';
        const assigneeEmail = workout.assignee?.email?.toLowerCase() || '';
        const creatorName = workout.creator?.name?.toLowerCase() || '';
        const workoutName = workout.name?.toLowerCase() || '';
        const query = searchQuery.toLowerCase();

        return assigneeName.includes(query) ||
               assigneeEmail.includes(query) ||
               creatorName.includes(query) ||
               workoutName.includes(query);
      });
      setFilteredWorkouts(filtered);
    }
  }, [searchQuery, workouts]);

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
        setFilteredWorkouts(workoutsList);
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

  const formatDifficulty = (difficulty: string | undefined) => {
    if (!difficulty) return '';

    const formatted = difficulty.toLowerCase();
    switch(formatted) {
      case 'iniciante':
        return 'Iniciante';
      case 'intermediario':
      case 'intermediário':
        return 'Intermediário';
      case 'avancado':
      case 'avançado':
        return 'Avançado';
      default:
        return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    }
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
        <Title colors={colors}>Carregando...</Title>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title colors={colors}>Meus Treinos</Title>

        <CreateButtonGroup>
          <CreateButton onClick={handleCreate}>
            <FaPlus /> Criar Treino
          </CreateButton>
        </CreateButtonGroup>
      </Header>

      <SearchSection>
        <SearchContainer>
          <SearchIcon colors={colors}>
            <FaSearch size={18} />
          </SearchIcon>
          <SearchInput
            colors={colors}
            type="text"
            placeholder={userProfile?.type === 'aluno' ? "Buscar pelo nome do Treino" : "Buscar por nome do aluno ou treino..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>
      </SearchSection>

      {filteredWorkouts.length === 0 ? (
        <EmptyState colors={colors}>
          <FaDumbbell />
          <h3>Nenhum treino encontrado</h3>
          <p>{searchQuery ? `Nenhum resultado para "${searchQuery}"` : 'Crie seu primeiro treino para começar!'}</p>
        </EmptyState>
      ) : (
        <WorkoutsGrid>
          {filteredWorkouts.map(workout => (
            <WorkoutCard key={workout.id} colors={colors}>
              <WorkoutHeader>
                <WorkoutTitle colors={colors}>{workout.name}</WorkoutTitle>
                {workout.difficulty && (
                  <DifficultyBadge difficulty={workout.difficulty}>
                    {formatDifficulty(workout.difficulty)}
                  </DifficultyBadge>
                )}
              </WorkoutHeader>

              {workout.description && (
                <Description colors={colors}>{workout.description}</Description>
              )}

              <WorkoutInfo>
                {workout.duration && (
                  <InfoRow colors={colors}>
                    <FaClock />
                    <span>{workout.duration} minutos</span>
                  </InfoRow>
                )}
              </WorkoutInfo>

              <CreatorInfo colors={colors}>
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
                    <div style={{ fontSize: '12px', marginTop: '2px', color: colors.textSecondary }}>
                      {getAssigneeText(workout)}
                    </div>
                  )}
                </div>
              </CreatorInfo>

              <Actions>
                <ActionButton variant="primary" colors={colors} onClick={() => handleView(workout.id)}>
                  <FaEye /> Ver
                </ActionButton>
                {canEdit(workout) && (
                  <ActionButton variant="edit" colors={colors} onClick={() => handleEdit(workout.id)}>
                    <FaEdit /> Editar
                  </ActionButton>
                )}
                {canDelete(workout) && (
                  <ActionButton variant="danger" colors={colors} onClick={() => handleDelete(workout.id)}>
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