import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Users, 
  Plus, 
  ChevronRight, 
  ArrowLeft,
  MapPin,
  Phone
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { dataService } from '../../services/supabase';
import type { User } from '../../types';

const Container = styled.div`
  padding: ${theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${theme.fontSize.xl};
  color: ${theme.colors.text};
  margin: 0;
`;

const BackButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text};
  cursor: pointer;
  font-size: ${theme.fontSize.sm};

  &:hover {
    background: ${theme.colors.background};
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
  border-bottom: 1px solid ${theme.colors.border};
`;

const Tab = styled(motion.button)<{ active: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? theme.colors.primary : 'transparent'};
  color: ${props => props.active ? theme.colors.primary : theme.colors.textSecondary};
  font-weight: ${theme.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    color: ${theme.colors.primary};
  }
`;

const Card = styled(motion.div)`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.sm};
  overflow: hidden;
  border: 1px solid ${theme.colors.border};
`;

const CardHeader = styled.div`
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  justify-content: between;
  align-items: center;
`;

const CardTitle = styled.h2`
  font-size: ${theme.fontSize.lg};
  margin: 0;
  color: ${theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
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

const AcademyItem = styled(motion.div)`
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border};
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.background};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const AcademyInfo = styled.div`
  flex: 1;
`;

const AcademyName = styled.h3`
  font-size: ${theme.fontSize.md};
  margin: 0 0 ${theme.spacing.xs} 0;
  color: ${theme.colors.text};
`;

const AcademyMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textSecondary};
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const StudentsList = styled.div`
  padding: ${theme.spacing.lg};
`;

const StudentItem = styled.div`
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border};
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

const StudentName = styled.div`
  font-weight: ${theme.fontWeight.medium};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.xs};
`;

const StudentMeta = styled.div`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textSecondary};
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

const ModalContent = styled(motion.div)`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h2`
  margin: 0 0 ${theme.spacing.lg} 0;
  color: ${theme.colors.text};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const Input = styled.input`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.md};
  background: ${theme.colors.background};
  color: ${theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }
`;

const Textarea = styled.textarea`
  padding: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.md};
  background: ${theme.colors.background};
  color: ${theme.colors.text};
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

const SecondaryButton = styled(motion.button)`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.background};
  color: ${theme.colors.text};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.fontSize.sm};
  cursor: pointer;

  &:hover {
    background: ${theme.colors.surface};
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.textSecondary};
`;

const EmptyState = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.textSecondary};
`;

interface AcademyFormData {
  name: string;
  address: string;
  number: string;
}

export const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'academies' | 'students'>('academies');
  const [academies, setAcademies] = useState<User[]>([]);
  const [selectedAcademy, setSelectedAcademy] = useState<User | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<AcademyFormData>({
    name: '',
    address: '',
    number: '',
  });

  const loadAcademies = async () => {
    setLoading(true);
    try {
      const data = await dataService.getAllAcademies();
      setAcademies(data);
    } catch (error) {
      console.error('Error loading academies:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async (academyId: string) => {
    setLoading(true);
    try {
      const data = await dataService.getAcademyStudents(academyId);
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcademyClick = (academy: User) => {
    setSelectedAcademy(academy);
    setActiveTab('students');
    loadStudents(academy.id);
  };

  const handleCreateAcademy = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dataService.createAcademy(formData);
      setShowCreateModal(false);
      setFormData({ name: '', address: '', number: '' });
      loadAcademies();
    } catch (error) {
      console.error('Error creating academy:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'academies') {
      loadAcademies();
    }
  }, [activeTab]);

  return (
    <Container>
      <Header>
        <Title>
          {selectedAcademy ? (
            <>
              Alunos - {selectedAcademy.name}
            </>
          ) : (
            'Administração'
          )}
        </Title>
        {selectedAcademy && (
          <BackButton
            onClick={() => {
              setSelectedAcademy(null);
              setActiveTab('academies');
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft size={16} />
            Voltar
          </BackButton>
        )}
      </Header>

      {!selectedAcademy && (
        <TabsContainer>
          <Tab
            active={activeTab === 'academies'}
            onClick={() => setActiveTab('academies')}
            whileTap={{ scale: 0.98 }}
          >
            Academias
          </Tab>
        </TabsContainer>
      )}

      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <CardHeader>
          <CardTitle>
            {activeTab === 'academies' ? (
              <>
                <Building2 size={20} />
                Todas as Academias Registradas
              </>
            ) : (
              <>
                <Users size={20} />
                Alunos da Academia
              </>
            )}
          </CardTitle>
          {activeTab === 'academies' && (
            <Button
              onClick={() => setShowCreateModal(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={16} />
              Criar Academia
            </Button>
          )}
        </CardHeader>

        {loading ? (
          <LoadingSpinner>
            Carregando...
          </LoadingSpinner>
        ) : (
          <>
            {activeTab === 'academies' && (
              <AcademyList>
                {academies.length === 0 ? (
                  <EmptyState>
                    Nenhuma academia registrada ainda.
                  </EmptyState>
                ) : (
                  academies.map((academy) => (
                    <AcademyItem
                      key={academy.id}
                      onClick={() => handleAcademyClick(academy)}
                      whileHover={{ backgroundColor: theme.colors.background }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <AcademyInfo>
                        <AcademyName>{academy.name}</AcademyName>
                        <AcademyMeta>
                          {academy.address && (
                            <MetaRow>
                              <MapPin size={14} />
                              {academy.address}
                            </MetaRow>
                          )}
                          {academy.number && (
                            <MetaRow>
                              <Phone size={14} />
                              {academy.number}
                            </MetaRow>
                          )}
                        </AcademyMeta>
                      </AcademyInfo>
                      <ChevronRight size={20} color={theme.colors.textSecondary} />
                    </AcademyItem>
                  ))
                )}
              </AcademyList>
            )}

            {activeTab === 'students' && (
              <StudentsList>
                {students.length === 0 ? (
                  <EmptyState>
                    Nenhum aluno vinculado a esta academia ainda.
                  </EmptyState>
                ) : (
                  students.map((student) => (
                    <StudentItem key={student.id}>
                      <StudentInfo>
                        <StudentName>{student.name}</StudentName>
                        <StudentMeta>
                          {student.number && `${student.number} • `}
                          {student.gender && `${student.gender} • `}
                          {student.birth_date && `Nascimento: ${new Date(student.birth_date).toLocaleDateString()}`}
                        </StudentMeta>
                      </StudentInfo>
                    </StudentItem>
                  ))
                )}
              </StudentsList>
            )}
          </>
        )}
      </Card>

      {/* Create Academy Modal */}
      {showCreateModal && (
        <Modal
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}
        >
          <ModalContent
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <ModalTitle>Criar Nova Academia</ModalTitle>
            <Form onSubmit={handleCreateAcademy}>
              <div>
                <label>Nome da Academia *</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Nome da academia"
                />
              </div>
              <div>
                <label>Endereço *</label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                  placeholder="Endereço completo da academia"
                />
              </div>
              <div>
                <label>Contato</label>
                <Input
                  type="text"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  placeholder="Telefone de contato"
                />
              </div>
              <ButtonGroup>
                <SecondaryButton
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancelar
                </SecondaryButton>
                <Button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Criando...' : 'Criar Academia'}
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};