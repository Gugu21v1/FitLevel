import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaTrash,
  FaSearch,
  FaSave,
  FaClipboard
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { workoutService, dataService } from '../../services/supabase';
import { theme } from '../../styles/theme';
import { useThemeColors } from '../../hooks/useThemeColors';

const Container = styled.div<{ colors: any }>`
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: ${props => props.colors.background};
  color: ${props => props.colors.text};
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

const Title = styled.h1<{ colors?: any }>`
  color: ${props => props.colors?.text || '#333'};
  margin: 0;
  flex: 1;
`;

const Section = styled.div<{ colors: any }>`
  background: ${props => props.colors.surface};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.colors.border};
`;

const SectionTitle = styled.h2<{ colors: any }>`
  color: ${props => props.colors.text};
  margin: 0 0 20px 0;
  font-size: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label<{ colors: any }>`
  display: block;
  color: ${props => props.colors.text};
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
`;

const Input = styled.input<{ colors: any }>`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${props => props.colors.inputBorder};
  border-radius: 8px;
  font-size: 16px;
  background: ${props => props.colors.input};
  color: ${props => props.colors.inputText};
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }

  &::placeholder {
    color: ${props => props.colors.inputPlaceholder};
  }
`;

const TextArea = styled.textarea<{ colors: any }>`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${props => props.colors.inputBorder};
  border-radius: 8px;
  font-size: 16px;
  background: ${props => props.colors.input};
  color: ${props => props.colors.inputText};
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }

  &::placeholder {
    color: ${props => props.colors.inputPlaceholder};
  }
`;

const Select = styled.select<{ colors: any }>`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${props => props.colors.inputBorder};
  border-radius: 8px;
  font-size: 16px;
  background: ${props => props.colors.input};
  color: ${props => props.colors.inputText};
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }

  option {
    background: ${props => props.colors.input};
    color: ${props => props.colors.inputText};
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const SearchBox = styled.div`
  position: relative;
`;

const SearchInput = styled(Input)<{ colors: any }>`
  padding-left: 40px;
`;

const SearchIcon = styled(FaSearch)<{ colors?: any }>`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.colors?.textSecondary || '#666'};
`;

const StudentsList = styled.div<{ colors: any }>`
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid ${props => props.colors.border};
  border-radius: 8px;
  margin-top: 8px;
  background: ${props => props.colors.surface};
`;

const StudentItem = styled.div<{ colors: any }>`
  padding: 12px;
  border-bottom: 1px solid ${props => props.colors.border};
  cursor: pointer;
  transition: background 0.2s;
  color: ${props => props.colors.text};

  &:hover {
    background: ${props => props.colors.surfaceHover};
  }

  &.selected {
    background: ${theme.colors.primary};
    color: white;
  }
`;

const ExerciseSearch = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
`;

const CheckboxLabel = styled.label<{ colors?: any }>`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: ${props => props.colors?.text || '#333'};
  font-size: 14px;
`;

const ExercisesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ExerciseItem = styled.div<{ colors: any }>`
  border: 1px solid ${props => props.colors.border};
  border-radius: 8px;
  padding: 16px;
  background: ${props => props.colors.surfaceSecondary};
`;

const ExerciseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ExerciseName = styled.h4<{ colors?: any }>`
  color: ${props => props.colors?.text || '#333'};
  margin: 0;
`;

const RemoveButton = styled.button`
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  transition: background 0.2s;

  &:hover {
    background: #d32f2f;
  }
`;

const ExerciseDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
`;

const DetailInput = styled.div<{ colors?: any }>`
  label {
    display: block;
    color: ${props => props.colors?.textSecondary || '#666'};
    font-size: 12px;
    margin-bottom: 4px;
  }

  input {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }
`;


const TemplateSelector = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
`;

const TemplateButton = styled.button`
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;

  &:hover {
    background: #45a049;
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
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h3<{ colors?: any }>`
  color: ${props => props.colors?.text || '#333'};
  margin: 0 0 20px 0;
`;

const CustomExerciseForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: flex-end;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${props => 
    props.variant === 'primary' ? theme.colors.primary :
    '#f5f5f5'
  };
  color: ${props =>
    props.variant === 'primary' ? 'white' : '#333'
  };
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Exercise {
  id: string;
  name: string;
  muscle_group?: string;
  equipment?: string;
  instructions?: string;
  video?: string;
  public: boolean;
  academy_id?: string;
}

interface WorkoutExercise {
  exercise_id: string;
  exercise?: Exercise;
  series: number;
  repetitions: number;
  weight: number;
  rest_time: number;
}

const CreateWorkout: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { colors } = useThemeColors();
  const { id } = useParams();
  const isEditMode = !!id;
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [originalWorkout] = useState<any>(null);
  
  // Form data
  const [workoutName, setWorkoutName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [difficulty, setDifficulty] = useState('iniciante');
  
  // Student selection (for personal/academia)
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  
  // Exercises
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [showCustomExercise, setShowCustomExercise] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>([]);
  
  // Custom exercise form
  const [showCustomExerciseModal, setShowCustomExerciseModal] = useState(false);
  const [customExerciseName, setCustomExerciseName] = useState('');
  const [customMuscleGroup, setCustomMuscleGroup] = useState('');
  const [customEquipment, setCustomEquipment] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [customVideo, setCustomVideo] = useState('');
  
  // Templates
  const [templates, setTemplates] = useState<any[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, [user]);

  const loadInitialData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const profile = await dataService.getProfile(user.id);
      setUserProfile(profile);
      
      if (profile) {
        // Load available exercises
        const exercises = await workoutService.getAvailableExercises(profile);
        setAvailableExercises(exercises);
        
        // Load students if personal/academia
        if (profile.type === 'personal' || profile.type === 'academia') {
          const academyId = profile.type === 'academia' ? profile.id : profile.academy_id;
          console.log('Loading students for academy:', academyId, 'Profile type:', profile.type);
          console.log('Current profile:', JSON.stringify(profile, null, 2));
          
          if (!academyId) {
            console.error('No academy ID found for profile:', profile);
            setStudents([]);
            return;
          }
          
          try {
            const studentsData = await dataService.getAcademyStudents(academyId);
            console.log('Students loaded:', studentsData);
            setStudents(studentsData || []);
          } catch (error) {
            console.error('Error loading students:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            setStudents([]);
          }
        }
        
        // Load templates
        if (profile.type === 'personal' || profile.type === 'academia') {
          const templatesData = await workoutService.getTemplates(profile);
          setTemplates(templatesData);
        }

        // Load workout data if in edit mode
        if (isEditMode && id) {
          await loadWorkoutForEdit(id, profile);
        }
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWorkoutForEdit = async (workoutId: string, profile: any) => {
    try {
      const workout = await workoutService.getWorkoutDetails(workoutId);
      if (workout) {
        // setOriginalWorkout(workout);
        setWorkoutName(workout.name);
        setDescription(workout.description || '');
        setDuration(workout.duration?.toString() || '');
        setDifficulty(workout.difficulty || 'iniciante');

        // Set selected student if applicable
        if (workout.assignee && workout.assignee.id !== profile.id) {
          setSelectedStudent(workout.assignee);
        }

        // Load workout exercises with user weights
        // Use the exercises from workout.exercises (already loaded)
        const workoutExercises = workout.exercises || [];
        const targetUserId = workout.assignee?.id || profile.id;

        if (workoutExercises.length > 0) {
          const formattedExercises = await Promise.all(workoutExercises.map(async (we: any) => {
            // Get user's specific weight for this exercise
            const userWeight = await workoutService.getUserExerciseWeight(
              targetUserId,
              workoutId,
              we.exercise.id
            );

            return {
              exercise_id: we.exercise.id,
              exercise: we.exercise,
              series: we.series,
              repetitions: we.repetitions,
              weight: userWeight !== null ? userWeight : (we.weight || 0),
              rest_time: we.rest_time || 60
            };
          }));
          setSelectedExercises(formattedExercises);
        }
      }
    } catch (error) {
      console.error('Error loading workout for edit:', error);
    }
  };

  const handleAddExercise = (exercise: Exercise) => {
    const newExercise: WorkoutExercise = {
      exercise_id: exercise.id,
      exercise: exercise,
      series: 3,
      repetitions: 12,
      weight: 0,
      rest_time: 60
    };
    setSelectedExercises([...selectedExercises, newExercise]);
  };

  const handleRemoveExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const handleExerciseDetailChange = (index: number, field: string, value: string) => {
    const updated = [...selectedExercises];
    updated[index] = {
      ...updated[index],
      [field]: parseFloat(value) || 0
    };
    setSelectedExercises(updated);
  };

  const handleCreateCustomExercise = async () => {
    if (!customExerciseName || !customMuscleGroup || !customEquipment) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const newExercise = await workoutService.createCustomExercise({
        name: customExerciseName,
        muscle_group: customMuscleGroup,
        equipment: customEquipment,
        instructions: customInstructions,
        video: customVideo || null
      }, userProfile);
      
      // Add to available exercises
      setAvailableExercises([...availableExercises, newExercise]);
      
      // Add to selected exercises
      handleAddExercise(newExercise);
      
      // Reset form
      setShowCustomExerciseModal(false);
      setCustomExerciseName('');
      setCustomMuscleGroup('');
      setCustomEquipment('');
      setCustomInstructions('');
      setCustomVideo('');
    } catch (error) {
      console.error('Error creating custom exercise:', error);
      alert('Erro ao criar exercício personalizado');
    }
  };

  const handleUseTemplate = (template: any) => {
    setWorkoutName(template.name);
    setDescription(template.description || '');
    setDuration(template.duration?.toString() || '');
    setDifficulty(template.difficulty || 'iniciante');
    
    // Load exercises from template
    const exercises = template.exercises?.map((ex: any) => ({
      exercise_id: ex.exercise_id,
      exercise: ex.exercise,
      series: ex.series,
      repetitions: ex.repetitions,
      weight: ex.weight,
      rest_time: ex.rest_time
    })) || [];
    setSelectedExercises(exercises);
    
    setShowTemplates(false);
  };

  const handleSubmit = async () => {
    // Validation
    if (!workoutName) {
      alert('Nome do treino é obrigatório');
      return;
    }
    
    if (selectedExercises.length === 0) {
      alert('Adicione pelo menos um exercício');
      return;
    }
    
    const targetUserId = selectedStudent?.id || user!.id;
    
    if ((userProfile.type === 'personal' || userProfile.type === 'academia') && !selectedStudent) {
      alert('Selecione um aluno para criar o treino');
      return;
    }

    try {
      if (isEditMode && id) {
        // Update existing workout
        await workoutService.updateWorkout(id, {
          name: workoutName,
          description,
          duration: parseInt(duration) || null,
          difficulty
        }, selectedExercises);
        alert('Treino atualizado com sucesso!');
      } else {
        // Create new workout
        await workoutService.createWorkout({
          name: workoutName,
          description,
          duration: parseInt(duration) || null,
          difficulty
        }, selectedExercises, targetUserId, userProfile);
        alert('Treino criado com sucesso!');
      }

      navigate('/workouts');
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} workout:`, error);
      alert(`Erro ao ${isEditMode ? 'atualizar' : 'criar'} treino`);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const filteredExercises = availableExercises.filter(exercise =>
    exercise.name.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  if (loading) {
    return (
      <Container colors={colors}>
        <Title colors={colors}>Carregando...</Title>
      </Container>
    );
  }

  return (
    <Container colors={colors}>
      <Header>
        <BackButton onClick={() => navigate('/workouts')}>
          <FaArrowLeft />
        </BackButton>
        <Title colors={colors}>{isEditMode ? 'Editar Treino' : 'Criar Novo Treino'}</Title>
      </Header>

      {/* Student Selection for Personal/Academia */}
      {(userProfile?.type === 'personal' || userProfile?.type === 'academia') && (
        <Section colors={colors}>
          <SectionTitle colors={colors}>Selecione o Aluno</SectionTitle>
          <SearchBox>
            <SearchIcon colors={colors} />
            <SearchInput
              colors={colors}
              type="text"
              placeholder="Buscar aluno por nome ou email..."
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
            />
          </SearchBox>
          <StudentsList colors={colors}>
            {filteredStudents.map(student => (
              <StudentItem
                key={student.id}
                colors={colors}
                className={selectedStudent?.id === student.id ? 'selected' : ''}
                onClick={() => setSelectedStudent(student)}
              >
                {student.name} - {student.email}
              </StudentItem>
            ))}
          </StudentsList>
        </Section>
      )}

      {/* Workout Info */}
      <Section colors={colors}>
        <SectionTitle colors={colors}>Informações do Treino</SectionTitle>
        
        {templates.length > 0 && (
          <TemplateSelector>
            <TemplateButton onClick={() => setShowTemplates(!showTemplates)}>
              <FaClipboard />
              Usar Template
            </TemplateButton>
          </TemplateSelector>
        )}
        
        <FormGroup>
          <Label colors={colors}>Nome do Treino *</Label>
          <Input
            colors={colors}
            type="text"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="Ex: Treino A - Peito e Tríceps"
          />
        </FormGroup>
        
        <FormGroup>
          <Label colors={colors}>Descrição</Label>
          <TextArea
            colors={colors}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o objetivo do treino..."
          />
        </FormGroup>
        
        <FormRow>
          <FormGroup>
            <Label colors={colors}>Duração (minutos)</Label>
            <Input
              colors={colors}
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Ex: 45"
            />
          </FormGroup>

          <FormGroup>
            <Label colors={colors}>Dificuldade</Label>
            <Select
              colors={colors}
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="iniciante">Iniciante</option>
              <option value="intermediario">Intermediário</option>
              <option value="avancado">Avançado</option>
            </Select>
          </FormGroup>
        </FormRow>
      </Section>

      {/* Exercises */}
      <Section colors={colors}>
        <SectionTitle colors={colors}>Exercícios</SectionTitle>
        
        <ExerciseSearch>
          <SearchBox style={{ flex: 1 }}>
            <SearchIcon colors={colors} />
            <SearchInput
              colors={colors}
              type="text"
              placeholder="Buscar exercício..."
              value={exerciseSearch}
              onChange={(e) => setExerciseSearch(e.target.value)}
            />
          </SearchBox>
          <CheckboxLabel colors={colors}>
            <input
              type="checkbox"
              checked={showCustomExercise}
              onChange={(e) => setShowCustomExercise(e.target.checked)}
            />
            Outro exercício?
          </CheckboxLabel>
        </ExerciseSearch>
        
        {showCustomExercise && (
          <Button 
            variant="primary"
            onClick={() => setShowCustomExerciseModal(true)}
            style={{ marginBottom: '20px' }}
          >
            Criar Exercício Personalizado
          </Button>
        )}
        
        {!showCustomExercise && (
          <Select
            colors={colors}
            onChange={(e) => {
              const exercise = availableExercises.find(ex => ex.id === e.target.value);
              if (exercise) {
                handleAddExercise(exercise);
                e.target.value = '';
              }
            }}
          >
            <option value="">Selecione um exercício...</option>
            {filteredExercises.map(exercise => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
                {!exercise.public && ' (Personalizado)'}
              </option>
            ))}
          </Select>
        )}
        
        <ExercisesList style={{ marginTop: '20px' }}>
          {selectedExercises.map((exercise, index) => (
            <ExerciseItem key={index} colors={colors}>
              <ExerciseHeader>
                <ExerciseName colors={colors}>{exercise.exercise?.name}</ExerciseName>
                <RemoveButton onClick={() => handleRemoveExercise(index)}>
                  <FaTrash /> Remover
                </RemoveButton>
              </ExerciseHeader>
              
              <ExerciseDetails>
                <DetailInput colors={colors}>
                  <label>Séries</label>
                  <input
                    type="number"
                    value={exercise.series}
                    onChange={(e) => handleExerciseDetailChange(index, 'series', e.target.value)}
                    min="1"
                  />
                </DetailInput>
                
                <DetailInput colors={colors}>
                  <label>Repetições</label>
                  <input
                    type="number"
                    value={exercise.repetitions}
                    onChange={(e) => handleExerciseDetailChange(index, 'repetitions', e.target.value)}
                    min="1"
                  />
                </DetailInput>

                <DetailInput colors={colors}>
                  <label>Peso (kg)</label>
                  <input
                    type="number"
                    value={exercise.weight}
                    onChange={(e) => handleExerciseDetailChange(index, 'weight', e.target.value)}
                    min="0"
                    step="0.5"
                  />
                </DetailInput>

                <DetailInput colors={colors}>
                  <label>Descanso (seg)</label>
                  <input
                    type="number"
                    value={exercise.rest_time}
                    onChange={(e) => handleExerciseDetailChange(index, 'rest_time', e.target.value)}
                    min="0"
                    step="5"
                  />
                </DetailInput>
              </ExerciseDetails>
            </ExerciseItem>
          ))}
        </ExercisesList>
        
        {selectedExercises.length === 0 && (
          <p style={{ textAlign: 'center', color: colors.textSecondary, marginTop: '20px' }}>
            Nenhum exercício adicionado ainda
          </p>
        )}
      </Section>

      <ButtonGroup>
        <Button onClick={() => navigate('/workouts')}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          <FaSave />
          {isEditMode ? 'Salvar Alterações' : 'Criar Treino'}
        </Button>
      </ButtonGroup>

      {/* Custom Exercise Modal */}
      {showCustomExerciseModal && (
        <Modal onClick={() => setShowCustomExerciseModal(false)}>
          <ModalContent colors={colors} onClick={(e) => e.stopPropagation()}>
            <ModalTitle colors={colors}>Criar Exercício Personalizado</ModalTitle>
            
            <CustomExerciseForm>
              <FormGroup>
                <Label colors={colors}>Nome do Exercício *</Label>
                <Input
                  colors={colors}
                  type="text"
                  value={customExerciseName}
                  onChange={(e) => setCustomExerciseName(e.target.value)}
                  placeholder="Ex: Supino Reto"
                />
              </FormGroup>

              <FormGroup>
                <Label colors={colors}>Grupo Muscular *</Label>
                <Input
                  colors={colors}
                  type="text"
                  value={customMuscleGroup}
                  onChange={(e) => setCustomMuscleGroup(e.target.value)}
                  placeholder="Ex: Peito"
                />
              </FormGroup>

              <FormGroup>
                <Label colors={colors}>Equipamento *</Label>
                <Input
                  colors={colors}
                  type="text"
                  value={customEquipment}
                  onChange={(e) => setCustomEquipment(e.target.value)}
                  placeholder="Ex: Barra"
                />
              </FormGroup>

              <FormGroup>
                <Label colors={colors}>Instruções</Label>
                <TextArea
                  colors={colors}
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Descreva como executar o exercício..."
                />
              </FormGroup>

              <FormGroup>
                <Label colors={colors}>Link do Vídeo (opcional)</Label>
                <Input
                  colors={colors}
                  type="url"
                  value={customVideo}
                  onChange={(e) => setCustomVideo(e.target.value)}
                  placeholder="https://youtube.com/..."
                />
              </FormGroup>
            </CustomExerciseForm>
            
            <ButtonGroup>
              <Button onClick={() => setShowCustomExerciseModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleCreateCustomExercise}>
                Criar Exercício
              </Button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}

      {/* Templates Modal */}
      {showTemplates && (
        <Modal onClick={() => setShowTemplates(false)}>
          <ModalContent colors={colors} onClick={(e) => e.stopPropagation()}>
            <ModalTitle colors={colors}>Selecionar Template</ModalTitle>
            
            {templates.map(template => (
              <div
                key={template.id}
                style={{
                  padding: '12px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  marginBottom: '12px',
                  cursor: 'pointer',
                  background: colors.surfaceSecondary,
                  color: colors.text
                }}
                onClick={() => handleUseTemplate(template)}
              >
                <h4 style={{ color: colors.text, margin: '0 0 8px 0' }}>{template.name}</h4>
                <p style={{ color: colors.textSecondary, margin: '0 0 8px 0' }}>{template.description}</p>
                <small style={{ color: colors.textSecondary }}>{template.exercises?.length || 0} exercícios</small>
              </div>
            ))}
            
            <ButtonGroup>
              <Button onClick={() => setShowTemplates(false)}>
                Fechar
              </Button>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default CreateWorkout;