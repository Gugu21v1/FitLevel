import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { workoutService, dataService } from '../../services/supabase';
import { useThemeColors } from '../../hooks/useThemeColors';

const Container = styled.div<{ colors: any }>`
  padding: 20px;
  max-width: 800px;
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
  color: #00B8D9;
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
`;

const Form = styled.form<{ colors: any }>`
  background: ${props => props.colors.surface};
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.colors.border};
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
  padding: 12px;
  border: 1px solid ${props => props.colors.inputBorder};
  border-radius: 8px;
  font-size: 16px;
  background: ${props => props.colors.input};
  color: ${props => props.colors.inputText};
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #00B8D9;
  }

  &::placeholder {
    color: ${props => props.colors.inputPlaceholder};
  }
`;

const TextArea = styled.textarea<{ colors: any }>`
  width: 100%;
  padding: 12px;
  border: 1px solid ${props => props.colors.inputBorder};
  border-radius: 8px;
  font-size: 16px;
  background: ${props => props.colors.input};
  color: ${props => props.colors.inputText};
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #00B8D9;
  }

  &::placeholder {
    color: ${props => props.colors.inputPlaceholder};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: flex-end;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  background: ${props =>
    props.variant === 'primary' ? '#00B8D9' :
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
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const LoadingContainer = styled.div<{ colors: any }>`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  color: ${props => props.colors.textSecondary};
`;

const ErrorContainer = styled.div<{ colors: any }>`
  background: ${props => props.colors.surface};
  border: 1px solid #f44336;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  color: #f44336;
  text-align: center;
`;

const EditExercise: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const { colors } = useThemeColors();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [equipment, setEquipment] = useState('');
  const [instructions, setInstructions] = useState('');
  const [video, setVideo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadExerciseData();
  }, [user, id]);

  const loadExerciseData = async () => {
    if (!user || !id) {
      navigate('/workouts');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load user profile
      const profile = await dataService.getProfile(user.id);
      setUserProfile(profile);

      // Load exercise data
      const exerciseData = await workoutService.getExerciseById(id);

      if (!exerciseData) {
        setError('Exercício não encontrado');
        return;
      }

      // Check if user can edit this exercise (must be the creator)
      if (exerciseData.created_by !== user.id) {
        setError('Você não tem permissão para editar este exercício');
        return;
      }

      // Populate form with exercise data
      setName(exerciseData.name || '');
      setMuscleGroup(exerciseData.muscle_group || '');
      setEquipment(exerciseData.equipment || '');
      setInstructions(exerciseData.instructions || '');
      setVideo(exerciseData.video || '');

    } catch (error) {
      console.error('Error loading exercise:', error);
      setError('Erro ao carregar dados do exercício');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !muscleGroup || !equipment) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    setSubmitting(true);

    try {
      const exerciseData = {
        name,
        muscle_group: muscleGroup,
        equipment,
        instructions,
        video: video || null,
      };

      await workoutService.updateExercise(id!, exerciseData);
      alert('Exercício atualizado com sucesso!');
      navigate('/workouts');
    } catch (error) {
      console.error('Error updating exercise:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      alert(`Erro ao atualizar exercício: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container colors={colors}>
        <Header>
          <BackButton onClick={() => navigate('/workouts')}>
            <FaArrowLeft />
          </BackButton>
          <Title colors={colors}>Editar Exercício</Title>
        </Header>
        <LoadingContainer colors={colors}>
          <div>Carregando dados do exercício...</div>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container colors={colors}>
        <Header>
          <BackButton onClick={() => navigate('/workouts')}>
            <FaArrowLeft />
          </BackButton>
          <Title colors={colors}>Editar Exercício</Title>
        </Header>
        <ErrorContainer colors={colors}>
          <p>{error}</p>
          <Button onClick={() => navigate('/workouts')} style={{ marginTop: '16px' }}>
            Voltar
          </Button>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container colors={colors}>
      <Header>
        <BackButton onClick={() => navigate('/workouts')}>
          <FaArrowLeft />
        </BackButton>
        <Title colors={colors}>Editar Exercício</Title>
      </Header>

      <Form colors={colors} onSubmit={handleSubmit}>
        <FormGroup>
          <Label colors={colors}>Nome do Exercício *</Label>
          <Input
            colors={colors}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Supino Reto"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label colors={colors}>Grupo Muscular *</Label>
          <Input
            colors={colors}
            type="text"
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value)}
            placeholder="Ex: Peito, Costas, Pernas..."
            required
          />
        </FormGroup>

        <FormGroup>
          <Label colors={colors}>Equipamento *</Label>
          <Input
            colors={colors}
            type="text"
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            placeholder="Ex: Barra, Halteres, Máquina..."
            required
          />
        </FormGroup>

        <FormGroup>
          <Label colors={colors}>Instruções de Execução</Label>
          <TextArea
            colors={colors}
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Descreva como executar o exercício corretamente..."
          />
        </FormGroup>

        <FormGroup>
          <Label colors={colors}>Link do Vídeo (opcional)</Label>
          <Input
            colors={colors}
            type="url"
            value={video}
            onChange={(e) => setVideo(e.target.value)}
            placeholder="https://youtube.com/..."
          />
        </FormGroup>

        <ButtonGroup>
          <Button onClick={() => navigate('/workouts')}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            <FaSave />
            {submitting ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </ButtonGroup>
      </Form>
    </Container>
  );
};

export default EditExercise;