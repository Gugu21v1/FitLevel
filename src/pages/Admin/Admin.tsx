import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Search, Plus, Building2, Users, MapPin, Phone, Mail } from 'lucide-react';
import { theme } from '../../styles/theme';
import { dataService } from '../../services/supabase';
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

const Title = styled.h1`
  font-size: ${theme.fontSize.xxl};
  color: ${theme.colors.text};
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

const SearchInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md} ${theme.spacing.sm} ${theme.spacing.xl};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.fontSize.md};
  background: ${theme.colors.surface};
  color: ${theme.colors.text};
  transition: border-color ${theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
  }

  &::placeholder {
    color: ${theme.colors.textSecondary};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: ${theme.spacing.sm};
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.textSecondary};
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

interface PromoteUserData {
  address: string;
  number: string;
}

export const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  if (user?.type !== 'admin') {
    return null;
  }

  return (
    <Container>
      <Header>
        <Title>
          <Building2 size={32} />
          Painel Administrativo
        </Title>
        
        <SearchContainer>
          <SearchIcon>
            <Search size={20} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Buscar academias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>

        <CreateButton
          onClick={handleCreateAcademyButton}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
          Criar Academia
        </CreateButton>
      </Header>

      {loading ? (
        <LoadingSpinner>
          Carregando academias...
        </LoadingSpinner>
      ) : filteredAcademies.length === 0 ? (
        <EmptyState>
          {searchQuery ? (
            <div>
              <Building2 size={48} color={theme.colors.textSecondary} />
              <p>Nenhuma academia encontrada para "{searchQuery}"</p>
            </div>
          ) : (
            <div>
              <Building2 size={48} color={theme.colors.textSecondary} />
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
              onClick={() => handleAcademyClick(academy.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AcademyInfo>
                <AcademyName>{academy.name}</AcademyName>
                <AcademyMeta>
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <ModalTitle>Promover Usuário para Academia</ModalTitle>
            
            {!selectedStudent ? (
              <div>
                <label>Buscar Usuário</label>
                <SearchContainer>
                  <SearchIcon>
                    <Search size={20} />
                  </SearchIcon>
                  <SearchInput
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
                      onClick={() => setSelectedStudent(student)}
                      style={{ cursor: 'pointer', backgroundColor: 'transparent' }}
                    >
                      <StudentInfo>
                        <StudentName>{student.name}</StudentName>
                        <StudentMeta>{student.email}</StudentMeta>
                      </StudentInfo>
                    </StudentItem>
                  ))}
                  
                  {filteredStudents.length === 0 && studentSearchQuery && (
                    <EmptyState>
                      <Users size={48} color={theme.colors.textSecondary} />
                      <p>Nenhum usuário encontrado para "{studentSearchQuery}"</p>
                    </EmptyState>
                  )}
                </div>
                
                <ButtonGroup>
                  <SecondaryButton
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
                  <div style={{ padding: '12px', backgroundColor: theme.colors.background, borderRadius: '8px', marginBottom: '16px' }}>
                    <strong>{selectedStudent.name}</strong>
                    <div style={{ fontSize: '14px', color: theme.colors.textSecondary }}>{selectedStudent.email}</div>
                  </div>
                </div>
                
                <div>
                  <label>Telefone da Academia</label>
                  <Input
                    type="text"
                    value={promoteData.number}
                    onChange={(e) => setPromoteData({ ...promoteData, number: e.target.value })}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div>
                  <label>Endereço da Academia *</label>
                  <Textarea
                    value={promoteData.address}
                    onChange={(e) => setPromoteData({ ...promoteData, address: e.target.value })}
                    required
                    placeholder="Endereço completo da academia"
                  />
                </div>
                
                <ButtonGroup>
                  <SecondaryButton
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