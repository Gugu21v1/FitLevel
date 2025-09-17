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
  FaTimes
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { workoutService } from '../../services/supabase';
import { theme } from '../../styles/theme';

const Container = styled.div`
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
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

const Title = styled.h1`
  color: ${theme.colors.text};
  margin: 0;
  flex: 1;
`;

const WorkoutInfo = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 16px;
`;

const InfoItem = styled.div`
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
      color: ${theme.colors.textLight};
      font-size: 12px;
      margin-bottom: 4px;
    }
    
    span {
      color: ${theme.colors.text};
      font-size: 16px;
      font-weight: 500;
    }
  }
`;

const Description = styled.p`
  color: ${theme.colors.textLight};
  line-height: 1.6;
  margin-top: 16px;
`;

const ExercisesSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  color: ${theme.colors.text};
  margin: 0 0 20px 0;
  font-size: 20px;
`;

const ExercisesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ExerciseCard = styled.div`
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
  
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
`;

const ExerciseName = styled.h3`
  color: ${theme.colors.text};
  margin: 0;
  font-size: 18px;
  flex: 1;
`;

const ExerciseActions = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button<{ variant?: 'primary' | 'info' }>`
  background: ${props => 
    props.variant === 'primary' ? theme.colors.primary :
    props.variant === 'info' ? '#2196F3' :
    '#f5f5f5'
  };
  color: ${props => props.variant ? 'white' : theme.colors.text};
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
`;

const DetailItem = styled.div`
  text-align: center;
  
  label {
    display: block;
    color: ${theme.colors.textLight};
    font-size: 12px;
    margin-bottom: 4px;
    text-transform: uppercase;
  }
  
  .value {
    color: ${theme.colors.text};
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

const WeightInput = styled.input`
  width: 80px;
  padding: 4px 8px;
  border: 1px solid ${theme.colors.primary};
  border-radius: 4px;
  text-align: center;
  font-size: 16px;
  font-weight: bold;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.primaryDark};
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

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  color: ${theme.colors.text};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.textLight};
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  
  &:hover {
    color: ${theme.colors.text};
  }
`;

const InfoContent = styled.div`
  color: ${theme.colors.textLight};
  line-height: 1.6;
  
  h4 {
    color: ${theme.colors.text};
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
  const [workout, setWorkout] = useState<WorkoutDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingWeight, setEditingWeight] = useState<string | null>(null);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);

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
    } catch (error) {
      console.error('Error loading workout details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWeightEdit = (exerciseId: string) => {
    setEditingWeight(exerciseId);
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

  const handleWeightCancel = (exerciseId: string) => {
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

  if (loading) {
    return (
      <Container>
        <Title>Carregando...</Title>
      </Container>
    );
  }

  if (!workout) {
    return (
      <Container>
        <Title>Treino não encontrado</Title>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/workouts')}>
          <FaArrowLeft />
        </BackButton>
        <Title>{workout.name}</Title>
      </Header>

      <WorkoutInfo>
        {workout.description && (
          <Description>{workout.description}</Description>
        )}
        
        <InfoGrid>
          {workout.duration && (
            <InfoItem>
              <FaClock />
              <div>
                <label>Duração</label>
                <span>{workout.duration} minutos</span>
              </div>
            </InfoItem>
          )}
          
          {workout.difficulty && (
            <InfoItem>
              <FaDumbbell />
              <div>
                <label>Dificuldade</label>
                <span>{workout.difficulty}</span>
              </div>
            </InfoItem>
          )}
          
          {workout.creator && (
            <InfoItem>
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

      <ExercisesSection>
        <SectionTitle>Exercícios</SectionTitle>
        <ExercisesList>
          {(workout.exercises || []).map((exercise) => (
            <ExerciseCard key={exercise.id}>
              <ExerciseHeader>
                <ExerciseName>{exercise.exercise.name}</ExerciseName>
                <ExerciseActions>
                  <IconButton
                    variant="info"
                    onClick={() => handleShowInfo(exercise)}
                  >
                    <FaInfoCircle />
                  </IconButton>
                  <IconButton
                    variant="primary"
                    onClick={() => handlePlayVideo(exercise.exercise.video)}
                    disabled={!exercise.exercise.video}
                  >
                    <FaPlay />
                  </IconButton>
                </ExerciseActions>
              </ExerciseHeader>
              
              <ExerciseDetails>
                <DetailItem>
                  <label>Séries</label>
                  <div className="value">{exercise.series}</div>
                </DetailItem>
                
                <DetailItem>
                  <label>Repetições</label>
                  <div className="value">{exercise.repetitions}</div>
                </DetailItem>
                
                <DetailItem>
                  <label>Peso (kg)</label>
                  <WeightControl>
                    {editingWeight === exercise.exercise.id ? (
                      <>
                        <WeightInput
                          type="number"
                          value={weights[exercise.exercise.id] || ''}
                          onChange={(e) => handleWeightChange(exercise.exercise.id, e.target.value)}
                          step="0.5"
                          min="0"
                        />
                        <WeightButton onClick={() => handleWeightSave(exercise.exercise.id)}>
                          <FaSave />
                        </WeightButton>
                        <WeightButton onClick={() => handleWeightCancel(exercise.exercise.id)}>
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
                  <DetailItem>
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
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>{selectedExercise.exercise.name}</ModalTitle>
              <CloseButton onClick={() => setShowInfoModal(false)}>
                <FaTimes />
              </CloseButton>
            </ModalHeader>
            
            <InfoContent>
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