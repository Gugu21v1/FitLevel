import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Search, Plus, Building2, Users, MapPin, Phone, Mail, Dumbbell, Edit, Trash2 } from 'lucide-react';
import { theme } from '../../styles/theme';
import { useThemeColors } from '../../hooks/useThemeColors';
import { dataService, workoutService } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { User } from '../../types';

const Container = styled.div`
  padding: ${theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
`;

const Title = styled.h1<{ colors: any }>`
  font-size: ${theme.fontSize.xxl};
  color: ${props => props.colors.text};
  font-weight: ${theme.fontWeight.bold};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin: 0;
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
`;

const SearchInput = styled.input<{ colors: any }>`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md} ${theme.spacing.sm} ${theme.spacing.xl};
  border: 2px solid ${props => props.colors.border};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.fontSize.md};
  background: ${props => props.colors.surface};
  color: ${props => props.colors.text};
  transition: border-color ${theme.transitions.fast};

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
  left: ${theme.spacing.sm};
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.colors.textSecondary};
`;

const CreateButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryLight});
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.fontSize.md};
  font-weight: ${theme.fontWeight.semibold};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.lg};
  }
`;


const Button = styled(motion.button)`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryLight});
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.medium};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
  }
`;

const AcademyList = styled.div`
  display: grid;
  gap: ${theme.spacing.md};
`;

const AcademyItem = styled(motion.div)<{ colors: any }>`
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${props => props.colors.border};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background ${theme.transitions.fast};

  &:hover {
    background: ${props => props.colors.background};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const AcademyInfo = styled.div`
  flex: 1;
`;

const AcademyName = styled.h3<{ colors: any }>`
  font-size: ${theme.fontSize.md};
  margin: 0 0 ${theme.spacing.xs} 0;
  color: ${props => props.colors.text};
`;

const AcademyMeta = styled.div<{ colors: any }>`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  font-size: ${theme.fontSize.sm};
  color: ${props => props.colors.textSecondary};
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;


const StudentItem = styled.div<{ colors: any }>`
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${props => props.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }
`;

const StudentInfo = styled.div`
  flex: 1;
`;

const StudentName = styled.div<{ colors: any }>`
  font-weight: ${theme.fontWeight.medium};
  color: ${props => props.colors.text};
  margin-bottom: ${theme.spacing.xs};
`;

const StudentMeta = styled.div<{ colors: any }>`
  font-size: ${theme.fontSize.sm};
  color: ${props => props.colors.textSecondary};
`;

const Modal = styled(motion.div)`
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

const ModalContent = styled(motion.div)<{ colors: any }>`
  background: ${props => props.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2<{ colors: any }>`
  margin: 0 0 ${theme.spacing.lg} 0;
  color: ${props => props.colors.text};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const Input = styled.input<{ colors: any }>`
  padding: ${theme.spacing.md};
  border: 1px solid ${props => props.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.md};
  background: ${props => props.colors.background};
  color: ${props => props.colors.text};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const Textarea = styled.textarea<{ colors: any }>`
  padding: ${theme.spacing.md};
  border: 1px solid ${props => props.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.md};
  background: ${props => props.colors.background};
  color: ${props => props.colors.text};
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: flex-end;
  margin-top: ${theme.spacing.lg};
`;

const SecondaryButton = styled(motion.button)<{ colors: any }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${props => props.colors.background};
  color: ${props => props.colors.text};
  border: 1px solid ${props => props.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.sm};
  cursor: pointer;

  &:hover {
    background: ${props => props.colors.surface};
  }
`;

const LoadingSpinner = styled.div<{ colors: any }>`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.xl};
  color: ${props => props.colors.textSecondary};
`;

const EmptyState = styled.div<{ colors: any }>`
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${props => props.colors.textSecondary};
`;

const TabContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.light.border};
`;

const TabButton = styled(motion.button)<{ active: boolean; colors: any }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${props => props.active ? props.colors.primary : 'transparent'};
  color: ${props => props.active ? 'white' : props.colors.text};
  border: none;
  border-radius: ${theme.borderRadius.md} ${theme.borderRadius.md} 0 0;
  font-size: ${theme.fontSize.md};
  font-weight: ${theme.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};

  &:hover {
    background: ${props => props.active ? props.colors.primary : props.colors.surface};
  }
`;

const ExerciseItem = styled(motion.div)<{ colors: any }>`
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${props => props.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background ${theme.transitions.fast};

  &:hover {
    background: ${props => props.colors.background};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const ExerciseInfo = styled.div`
  flex: 1;
`;

const ExerciseName = styled.h3<{ colors: any }>`
  font-size: ${theme.fontSize.md};
  margin: 0 0 ${theme.spacing.xs} 0;
  color: ${props => props.colors.text};
`;

const ExerciseMeta = styled.div<{ colors: any }>`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  font-size: ${theme.fontSize.sm};
  color: ${props => props.colors.textSecondary};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const ActionButton = styled(motion.button)<{ variant: 'edit' | 'delete' }>`
  padding: ${theme.spacing.sm};
  background: ${props => props.variant === 'edit' ? '#4CAF50' : '#f44336'};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all ${theme.transitions.fast};

  &:hover {
    opacity: 0.9;
    transform: scale(1.05);
  }
`;

interface PromoteUserData {
  address: string;
  number: string;
}

export const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { colors } = useThemeColors();
  const [academies, setAcademies] = useState<User[]>([]);
  const [filteredAcademies, setFilteredAcademies] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [students, setStudents] = useState<User[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<User[]>([]);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [promoteData, setPromoteData] = useState<PromoteUserData>({
    address: '',
    number: '',
  });

  // New states for tabs and exercises
  const [activeTab, setActiveTab] = useState<'academias' | 'exercicios'>('academias');
  const [exercises, setExercises] = useState<any[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<any[]>([]);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (user && user.type !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const fetchAcademies = async () => {
    try {
      setLoading(true);
      const data = await dataService.getAllAcademies();
      setAcademies(data || []);
      setFilteredAcademies(data || []);
    } catch (error) {
      console.error('Error fetching academies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await dataService.getAllStudents();
      setStudents(data || []);
      setFilteredStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcademyClick = (academyId: string) => {
    navigate(`/admin/academy/${academyId}`);
  };

  const handleCreateAcademyButton = () => {
    setShowPromoteModal(true);
    fetchStudents();
  };

  const handlePromoteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setLoading(true);
    try {
      await dataService.promoteUserToAcademy(selectedStudent.id, promoteData);
      setShowPromoteModal(false);
      setSelectedStudent(null);
      setPromoteData({ address: '', number: '' });
      setStudentSearchQuery('');
      fetchAcademies();
    } catch (error) {
      console.error('Error promoting user:', error);
      alert('Erro ao promover usuário: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (user?.type === 'admin') {
      fetchAcademies();
    }
  }, [user]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredAcademies(academies);
    } else {
      const filtered = academies.filter(academy =>
        academy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        academy.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        academy.address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAcademies(filtered);
    }
  }, [searchQuery, academies]);

  useEffect(() => {
    if (!studentSearchQuery) {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student =>
        student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(studentSearchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [studentSearchQuery, students]);

  // Fetch exercises for admin
  const fetchExercises = async () => {
    try {
      setLoading(true);
      const data = await workoutService.getAvailableExercises({ type: 'admin' });
      const publicExercises = data.filter((exercise: any) => exercise.public);
      setExercises(publicExercises);
      setFilteredExercises(publicExercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle exercise deletion
  const handleDeleteExercise = async (exerciseId: string) => {
    if (!confirm('Tem certeza que deseja excluir este exercício?')) return;

    try {
      setLoading(true);
      // Add delete exercise function to workoutService if needed
      await workoutService.deleteExercise(exerciseId);
      fetchExercises();
    } catch (error) {
      console.error('Error deleting exercise:', error);
      alert('Erro ao excluir exercício');
    } finally {
      setLoading(false);
    }
  };

  // Filter exercises
  useEffect(() => {
    if (!exerciseSearchQuery) {
      setFilteredExercises(exercises);
    } else {
      const filtered = exercises.filter(exercise =>
        exercise.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase()) ||
        exercise.muscle_group?.toLowerCase().includes(exerciseSearchQuery.toLowerCase()) ||
        exercise.equipment?.toLowerCase().includes(exerciseSearchQuery.toLowerCase())
      );
      setFilteredExercises(filtered);
    }
  }, [exerciseSearchQuery, exercises]);

  // Fetch exercises when tab changes
  useEffect(() => {
    if (activeTab === 'exercicios' && user?.type === 'admin') {
      fetchExercises();
    }
  }, [activeTab, user]);

  if (user?.type !== 'admin') {
    return null;
  }

  return (
    <Container>
      <Header>
        <Title colors={colors}>
          <Building2 size={32} />
          Painel Administrativo
        </Title>
        
        <SearchContainer>
          <SearchIcon colors={colors}>
            <Search size={20} />
          </SearchIcon>
          <SearchInput
            colors={colors}
            type="text"
            placeholder={activeTab === 'academias' ? 'Buscar academias...' : 'Buscar exercícios...'}
            value={activeTab === 'academias' ? searchQuery : exerciseSearchQuery}
            onChange={(e) => activeTab === 'academias' ? setSearchQuery(e.target.value) : setExerciseSearchQuery(e.target.value)}
          />
        </SearchContainer>

        <CreateButton
          onClick={activeTab === 'academias' ? handleCreateAcademyButton : () => navigate('/exercises/create')}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
          {activeTab === 'academias' ? 'Criar Academia' : 'Criar Exercício'}
        </CreateButton>
      </Header>

      <TabContainer>
        <TabButton
          active={activeTab === 'academias'}
          colors={colors}
          onClick={() => setActiveTab('academias')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Building2 size={20} />
          Academias
        </TabButton>
        <TabButton
          active={activeTab === 'exercicios'}
          colors={colors}
          onClick={() => setActiveTab('exercicios')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Dumbbell size={20} />
          Exercícios
        </TabButton>
      </TabContainer>

      {activeTab === 'academias' ? (
        loading ? (
          <LoadingSpinner colors={colors}>
            Carregando academias...
          </LoadingSpinner>
        ) : filteredAcademies.length === 0 ? (
          <EmptyState colors={colors}>
            {searchQuery ? (
              <div>
                <Building2 size={48} color={colors.textSecondary} />
                <p>Nenhuma academia encontrada para "{searchQuery}"</p>
              </div>
            ) : (
              <div>
                <Building2 size={48} color={colors.textSecondary} />
                <p>Nenhuma academia cadastrada ainda.</p>
                <p>Clique em "Criar Academia" para começar.</p>
              </div>
            )}
          </EmptyState>
        ) : (
          <AcademyList>
            {filteredAcademies.map((academy) => (
              <AcademyItem
                key={academy.id}
                colors={colors}
                onClick={() => handleAcademyClick(academy.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AcademyInfo>
                  <AcademyName colors={colors}>{academy.name}</AcademyName>
                  <AcademyMeta colors={colors}>
                    {academy.email && (
                      <MetaRow>
                        <Mail size={14} />
                        {academy.email}
                      </MetaRow>
                    )}
                    {academy.number && (
                      <MetaRow>
                        <Phone size={14} />
                        {academy.number}
                      </MetaRow>
                    )}
                    {academy.address && (
                      <MetaRow>
                        <MapPin size={14} />
                        {academy.address}
                      </MetaRow>
                    )}
                  </AcademyMeta>
                </AcademyInfo>
              </AcademyItem>
            ))}
          </AcademyList>
        )
      ) : (
        loading ? (
          <LoadingSpinner colors={colors}>
            Carregando exercícios...
          </LoadingSpinner>
        ) : filteredExercises.length === 0 ? (
          <EmptyState colors={colors}>
            {exerciseSearchQuery ? (
              <div>
                <Dumbbell size={48} color={colors.textSecondary} />
                <p>Nenhum exercício encontrado para "{exerciseSearchQuery}"</p>
              </div>
            ) : (
              <div>
                <Dumbbell size={48} color={colors.textSecondary} />
                <p>Nenhum exercício público cadastrado ainda.</p>
                <p>Clique em "Criar Exercício" para começar.</p>
              </div>
            )}
          </EmptyState>
        ) : (
          <AcademyList>
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
                  <ExerciseMeta colors={colors}>
                    <MetaRow>
                      <Dumbbell size={14} />
                      {exercise.muscle_group}
                    </MetaRow>
                    {exercise.equipment && (
                      <MetaRow>
                        <Users size={14} />
                        {exercise.equipment}
                      </MetaRow>
                    )}
                  </ExerciseMeta>
                </ExerciseInfo>
                <ActionButtons>
                  <ActionButton
                    variant="edit"
                    onClick={() => navigate(`/exercises/edit/${exercise.id}`)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit size={16} />
                  </ActionButton>
                  <ActionButton
                    variant="delete"
                    onClick={() => handleDeleteExercise(exercise.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trash2 size={16} />
                  </ActionButton>
                </ActionButtons>
              </ExerciseItem>
            ))}
          </AcademyList>
        )
      )}


      {/* Promote User to Academy Modal */}
      {showPromoteModal && (
        <Modal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && setShowPromoteModal(false)}
        >
          <ModalContent
            colors={colors}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <ModalTitle colors={colors}>Promover Usuário para Academia</ModalTitle>
            
            {!selectedStudent ? (
              <div>
                <label>Buscar Usuário</label>
                <SearchContainer>
                  <SearchIcon colors={colors}>
                    <Search size={20} />
                  </SearchIcon>
                  <SearchInput
                    colors={colors}
                    type="text"
                    placeholder="Digite o nome do usuário..."
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                  />
                </SearchContainer>
                
                <div style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '16px' }}>
                  {filteredStudents.map((student) => (
                    <StudentItem
                      key={student.id}
                      colors={colors}
                      onClick={() => setSelectedStudent(student)}
                      style={{ cursor: 'pointer', backgroundColor: 'transparent' }}
                    >
                      <StudentInfo>
                        <StudentName colors={colors}>{student.name}</StudentName>
                        <StudentMeta colors={colors}>{student.email}</StudentMeta>
                      </StudentInfo>
                    </StudentItem>
                  ))}
                  
                  {filteredStudents.length === 0 && studentSearchQuery && (
                    <EmptyState colors={colors}>
                      <Users size={48} color={colors.textSecondary} />
                      <p>Nenhum usuário encontrado para "{studentSearchQuery}"</p>
                    </EmptyState>
                  )}
                </div>
                
                <ButtonGroup>
                  <SecondaryButton
                    colors={colors}
                    type="button"
                    onClick={() => {
                      setShowPromoteModal(false);
                      setStudentSearchQuery('');
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancelar
                  </SecondaryButton>
                </ButtonGroup>
              </div>
            ) : (
              <Form onSubmit={handlePromoteUser}>
                <div>
                  <label>Usuário Selecionado</label>
                  <div style={{ padding: '12px', backgroundColor: colors.background, borderRadius: '8px', marginBottom: '16px' }}>
                    <strong>{selectedStudent.name}</strong>
                    <div style={{ fontSize: '14px', color: colors.textSecondary }}>{selectedStudent.email}</div>
                  </div>
                </div>
                
                <div>
                  <label>Telefone da Academia</label>
                  <Input
                    colors={colors}
                    type="text"
                    value={promoteData.number}
                    onChange={(e) => setPromoteData({ ...promoteData, number: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div>
                  <label>Endereço da Academia *</label>
                  <Textarea
                    colors={colors}
                    value={promoteData.address}
                    onChange={(e) => setPromoteData({ ...promoteData, address: e.target.value })}
                    required
                    placeholder="Endereço completo da academia"
                  />
                </div>
                
                <ButtonGroup>
                  <SecondaryButton
                    colors={colors}
                    type="button"
                    onClick={() => {
                      setSelectedStudent(null);
                      setPromoteData({ address: '', number: '' });
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Voltar
                  </SecondaryButton>
                  <Button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? 'Promovendo...' : 'Promover para Academia'}
                  </Button>
                </ButtonGroup>
              </Form>
            )}
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};