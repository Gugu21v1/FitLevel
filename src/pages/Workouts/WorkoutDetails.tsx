import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaDumbbell,
  FaClock,
  FaPlay,
  FaInfoCircle,
  FaEdit,
  FaSave,
  FaTimes,
  FaCheck
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { workoutService } from '../../services/supabase';
import { theme } from '../../styles/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

const Container = styled.div`
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    gap: 12px;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    gap: 8px;
    margin-bottom: 16px;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;

  &:hover {
    transform: translateX(-4px);
  }
`;

const Title = styled.h1<{ colors: any }>`
  color: ${props => props.colors.text};
  margin: 0;
  flex: 1;
  font-size: 28px;

  @media (max-width: 768px) {
    font-size: 24px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const WorkoutInfo = styled.div<{ colors: any }>`
  background: ${props => props.colors.surface};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 20px;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    padding: 16px;
    margin-bottom: 16px;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const InfoItem = styled.div<{ colors: any }>`
  display: flex;
  align-items: center;
  gap: 12px;

  svg {
    color: ${theme.colors.primary};
    font-size: 20px;
  }

  div {
    flex: 1;

    label {
      display: block;
      color: ${props => props.colors.textSecondary};
      font-size: 12px;
      margin-bottom: 4px;
    }

    span {
      color: ${props => props.colors.text};
      font-size: 16px;
      font-weight: 500;
    }
  }
`;

const Description = styled.p<{ colors: any }>`
  color: ${props => props.colors.textSecondary};
  line-height: 1.6;
  margin-top: 16px;
`;

const ExercisesSection = styled.div<{ colors: any }>`
  background: ${props => props.colors.surface};
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 20px;
  }

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;

  @media (max-width: 768px) {
    gap: 12px;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

const SectionTitle = styled.h2<{ colors: any }>`
  color: ${props => props.colors.text};
  margin: 0;
  font-size: 20px;

  @media (max-width: 768px) {
    font-size: 18px;
  }

  @media (max-width: 480px) {
    font-size: 16px;
    text-align: center;
  }
`;

const StartWorkoutButton = styled.button`
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: ${theme.colors.primaryDark};
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 480px) {
    width: 100%;
    padding: 14px 16px;
    font-size: 16px;
  }
`;

const ExercisesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ExerciseCard = styled.div<{ colors: any }>`
  border: 1px solid ${props => props.colors.border};
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
  background: ${props => props.colors.surface};

  &:hover {
    border-color: ${theme.colors.primary};
    box-shadow: 0 2px 8px rgba(0, 184, 217, 0.1);
  }
`;

const ExerciseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 8px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
`;

const ExerciseName = styled.h3<{ colors: any }>`
  color: ${props => props.colors.text};
  margin: 0;
  font-size: 18px;
  flex: 1;
  max-width: 50%;
  word-wrap: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    max-width: 60%;
    font-size: 16px;
  }

  @media (max-width: 480px) {
    max-width: 100%;
    text-align: center;
    margin-bottom: 8px;
  }
`;

const ExerciseActions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;

  @media (max-width: 480px) {
    justify-content: center;
    width: 100%;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
`;

const CheckboxButton = styled.button<{ checked: boolean; colors: any }>`
  width: 40px;
  height: 40px;
  border: 2px solid ${props => props.checked ? '#4CAF50' : '#f44336'};
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
  background: ${props => props.checked ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'};
  transition: all 0.2s;

  &:hover {
    background: ${props => props.checked ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'};
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const IconButton = styled.button<{ variant?: 'primary' | 'info'; colors: any }>`
  background: ${props => 
    props.variant === 'primary' ? theme.colors.primary :
    props.variant === 'info' ? '#2196F3' :
    '#f5f5f5'
  };
  color: ${props => props.variant ? 'white' : props.colors.text};
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ExerciseDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
`;

const DetailItem = styled.div<{ colors: any }>`
  text-align: center;

  label {
    display: block;
    color: ${props => props.colors.textSecondary};
    font-size: 12px;
    margin-bottom: 4px;
    text-transform: uppercase;
  }

  .value {
    color: ${props => props.colors.text};
    font-size: 18px;
    font-weight: bold;
  }
`;

const WeightControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
`;

const WeightInput = styled.input<{ colors: any }>`
  width: 80px;
  padding: 4px 8px;
  border: 1px solid ${theme.colors.primary};
  border-radius: 4px;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  background: ${props => props.colors.surface};
  color: ${props => props.colors.text};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primaryDark};
  }

  @media (max-width: 480px) {
    width: 60px;
    font-size: 14px;
  }
`;

const WeightButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  cursor: pointer;
  padding: 4px;
  font-size: 14px;
  
  &:hover {
    color: ${theme.colors.primaryDark};
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div<{ colors: any }>`
  background: ${props => props.colors.surface};
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 20px;
    width: 95%;
    max-height: 85vh;
  }

  @media (max-width: 480px) {
    padding: 16px;
    width: 98%;
    max-height: 90vh;
    border-radius: 8px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  @media (max-width: 480px) {
    margin-bottom: 16px;
  }
`;

const ModalTitle = styled.h3<{ colors: any }>`
  color: ${props => props.colors.text};
  margin: 0;
  font-size: 18px;
  flex: 1;
  margin-right: 16px;

  @media (max-width: 480px) {
    font-size: 16px;
    margin-right: 12px;
  }
`;

const CloseButton = styled.button<{ colors: any }>`
  background: none;
  border: none;
  color: ${props => props.colors.textSecondary};
  font-size: 24px;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: ${props => props.colors.text};
  }
`;

const InfoContent = styled.div<{ colors: any }>`
  color: ${props => props.colors.textSecondary};
  line-height: 1.6;

  h4 {
    color: ${props => props.colors.text};
    margin: 16px 0 8px 0;
  }

  p {
    margin: 8px 0;
  }
`;

interface Exercise {
  id: string;
  id_exercise: string;
  series: number;
  repetitions: number;
  weight?: number;
  rest_time?: number;
  exercise: {
    id: string;
    name: string;
    video?: string;
    muscle_group?: string;
    equipment?: string;
    instructions?: string;
  };
}

interface WorkoutDetailsData {
  id: string;
  name: string;
  description?: string;
  duration?: number;
  difficulty?: string;
  id_profiles?: string;
  assignee?: {
    id: string;
    name: string;
    type: string;
    email?: string;
  };
  creator?: {
    id: string;
    name: string;
    type: string;
  };
  exercises: Exercise[];
}

const WorkoutDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { colors } = useThemeColors();
  const [workout, setWorkout] = useState<WorkoutDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingWeight, setEditingWeight] = useState<string | null>(null);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (id) {
      loadWorkoutDetails();
    }
  }, [id]);

  const loadWorkoutDetails = async () => {
    try {
      const data = await workoutService.getWorkoutDetails(id!);
      setWorkout(data);
      

      // Load user weights for each exercise
      // Use the workout owner's ID (who the workout is for) - this is returned as 'assignee'
      // The weights belong to the person the workout was created for
      const userId = data.assignee?.id || data.id_profiles || user!.id;

      const userWeights: Record<string, number> = {};
      for (const exercise of data.exercises || []) {
        const weight = await workoutService.getUserExerciseWeight(
          userId,
          id!,
          exercise.exercise.id
        );
        if (weight !== null) {
          userWeights[exercise.exercise.id] = weight;
        } else {
          // Use default weight from workout_exercises or 0 if not set
          userWeights[exercise.exercise.id] = exercise.weight || 0;
        }
      }
      setWeights(userWeights);

      // Load workout progress
      const progress = await workoutService.getUserWorkoutProgress(user!.id, id!);
      setCompletedExercises(progress);
    } catch (error) {
      console.error('Error loading workout details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWeightEdit = (exerciseId: string) => {
    setEditingWeight(exerciseId);
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

  const handleWeightSave = async (exerciseId: string) => {
    try {
      // Get the workout owner's ID (who the workout is for)
      const workoutOwnerId = workout?.assignee?.id || workout?.id_profiles || user!.id;
      await workoutService.updateUserExerciseWeight(
        workoutOwnerId, // Use workout owner's ID for weights
        id!,
        exerciseId,
        weights[exerciseId]
      );
      setEditingWeight(null);
    } catch (error) {
      console.error('Error saving weight:', error);
      alert('Erro ao salvar peso');
    }
  };

  const handleWeightCancel = () => {
    loadWorkoutDetails(); // Reload to restore original weight
    setEditingWeight(null);
  };

  const handleWeightChange = (exerciseId: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setWeights(prev => ({
        ...prev,
        [exerciseId]: numValue
      }));
    }
  };

  const handleShowInfo = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowInfoModal(true);
  };

  const handlePlayVideo = (videoUrl?: string) => {
    if (videoUrl) {
      window.open(videoUrl, '_blank');
    }
  };

  const handleStartWorkout = async () => {
    if (!user || !id) return;

    try {
      // Reset all checkboxes in database when starting the workout
      await workoutService.resetWorkoutProgress(user.id, id);
      setCompletedExercises({});
    } catch (error) {
      console.error('Error resetting workout progress:', error);
      alert('Erro ao resetar progresso do treino');
    }
  };

  const handleExerciseComplete = async (exerciseId: string, completed: boolean) => {
    if (!user || !id) return;

    try {
      // Update state immediately for responsiveness
      setCompletedExercises(prev => ({
        ...prev,
        [exerciseId]: completed
      }));

      // Persist to database
      await workoutService.updateExerciseProgress(user.id, id, exerciseId, completed);
    } catch (error) {
      console.error('Error updating exercise progress:', error);
      // Revert state on error
      setCompletedExercises(prev => ({
        ...prev,
        [exerciseId]: !completed
      }));
      alert('Erro ao salvar progresso do exercício');
    }
  };

  if (loading) {
    return (
      <Container>
        <Title colors={colors}>Carregando...</Title>
      </Container>
    );
  }

  if (!workout) {
    return (
      <Container>
        <Title colors={colors}>Treino não encontrado</Title>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/workouts')}>
          <FaArrowLeft />
        </BackButton>
        <Title colors={colors}>{workout.name}</Title>
      </Header>

      <WorkoutInfo colors={colors}>
        {workout.description && (
          <Description colors={colors}>{workout.description}</Description>
        )}
        
        <InfoGrid>
          {workout.duration && (
            <InfoItem colors={colors}>
              <FaClock />
              <div>
                <label>Duração</label>
                <span>{workout.duration} minutos</span>
              </div>
            </InfoItem>
          )}

          {workout.difficulty && (
            <InfoItem colors={colors}>
              <FaDumbbell />
              <div>
                <label>Dificuldade</label>
                <span>{formatDifficulty(workout.difficulty)}</span>
              </div>
            </InfoItem>
          )}

          {workout.creator && (
            <InfoItem colors={colors}>
              <FaDumbbell />
              <div>
                <label>Criado por</label>
                <span>
                  {workout.creator.id === user?.id ?
                    'Você' :
                    workout.creator.name
                  }
                </span>
              </div>
            </InfoItem>
          )}
        </InfoGrid>
      </WorkoutInfo>

      <ExercisesSection colors={colors}>
        <SectionHeader>
          <SectionTitle colors={colors}>Exercícios</SectionTitle>
          <StartWorkoutButton onClick={handleStartWorkout}>
            <FaPlay />
            Começar Treino
          </StartWorkoutButton>
        </SectionHeader>
        <ExercisesList>
          {(workout.exercises || []).map((exercise) => (
            <ExerciseCard key={exercise.id} colors={colors}>
              <ExerciseHeader>
                <ExerciseName colors={colors}>{exercise.exercise.name}</ExerciseName>
                <ExerciseActions>
                  <CheckboxContainer>
                    <CheckboxButton
                      checked={completedExercises[exercise.exercise.id] || false}
                      colors={colors}
                      onClick={() => handleExerciseComplete(exercise.exercise.id, !completedExercises[exercise.exercise.id])}
                    >
                      {completedExercises[exercise.exercise.id] ? <FaCheck /> : <FaTimes />}
                    </CheckboxButton>
                  </CheckboxContainer>
                  <IconButton
                    variant="info"
                    colors={colors}
                    onClick={() => handleShowInfo(exercise)}
                  >
                    <FaInfoCircle />
                  </IconButton>
                  <IconButton
                    variant="primary"
                    colors={colors}
                    onClick={() => handlePlayVideo(exercise.exercise.video)}
                    disabled={!exercise.exercise.video}
                  >
                    <FaPlay />
                  </IconButton>
                </ExerciseActions>
              </ExerciseHeader>
              
              <ExerciseDetails>
                <DetailItem colors={colors}>
                  <label>Séries</label>
                  <div className="value">{exercise.series}</div>
                </DetailItem>

                <DetailItem colors={colors}>
                  <label>Repetições</label>
                  <div className="value">{exercise.repetitions}</div>
                </DetailItem>

                <DetailItem colors={colors}>
                  <label>Peso (kg)</label>
                  <WeightControl>
                    {editingWeight === exercise.exercise.id ? (
                      <>
                        <WeightInput
                          colors={colors}
                          type="number"
                          value={weights[exercise.exercise.id] || ''}
                          onChange={(e) => handleWeightChange(exercise.exercise.id, e.target.value)}
                          step="0.5"
                          min="0"
                        />
                        <WeightButton onClick={() => handleWeightSave(exercise.exercise.id)}>
                          <FaSave />
                        </WeightButton>
                        <WeightButton onClick={() => handleWeightCancel()}>
                          <FaTimes />
                        </WeightButton>
                      </>
                    ) : (
                      <>
                        <div className="value">
                          {weights[exercise.exercise.id] || 0}
                        </div>
                        <WeightButton onClick={() => handleWeightEdit(exercise.exercise.id)}>
                          <FaEdit />
                        </WeightButton>
                      </>
                    )}
                  </WeightControl>
                </DetailItem>
                
                {exercise.rest_time && (
                  <DetailItem colors={colors}>
                    <label>Descanso</label>
                    <div className="value">{exercise.rest_time}s</div>
                  </DetailItem>
                )}
              </ExerciseDetails>
            </ExerciseCard>
          ))}
        </ExercisesList>
      </ExercisesSection>

      {showInfoModal && selectedExercise && (
        <Modal onClick={() => setShowInfoModal(false)}>
          <ModalContent colors={colors} onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle colors={colors}>{selectedExercise.exercise.name}</ModalTitle>
              <CloseButton colors={colors} onClick={() => setShowInfoModal(false)}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            
            <InfoContent colors={colors}>
              {selectedExercise.exercise.muscle_group && (
                <>
                  <h4>Grupo Muscular</h4>
                  <p>{selectedExercise.exercise.muscle_group}</p>
                </>
              )}
              
              {selectedExercise.exercise.equipment && (
                <>
                  <h4>Equipamento</h4>
                  <p>{selectedExercise.exercise.equipment}</p>
                </>
              )}
              
              {selectedExercise.exercise.instructions && (
                <>
                  <h4>Instruções</h4>
                  <p>{selectedExercise.exercise.instructions}</p>
                </>
              )}
            </InfoContent>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default WorkoutDetails;