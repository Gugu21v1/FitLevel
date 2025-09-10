import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Search, ArrowLeft, Users, Building2, MapPin, Phone, Mail } from 'lucide-react';
import { theme } from '../../styles/theme';
import { dataService } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
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

const AcademyInfoCard = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.md};
  border: 1px solid ${theme.colors.border};
  margin-bottom: ${theme.spacing.xl};
`;

const AcademyName = styled.h2`
  font-size: ${theme.fontSize.xl};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const AcademyInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: ${theme.spacing.md};
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  color: ${theme.colors.textSecondary};
  font-size: ${theme.fontSize.sm};
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;
  margin-bottom: ${theme.spacing.lg};
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

const StudentsSection = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.md};
  border: 1px solid ${theme.colors.border};
`;

const SectionHeader = styled.div`
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border};
`;

const SectionTitle = styled.h3`
  font-size: ${theme.fontSize.lg};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.text};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin: 0;
`;

const StudentsList = styled.div`
  padding: ${theme.spacing.lg};
`;

const StudentItem = styled(motion.div)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border};
  transition: background ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.background};
  }

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
  font-size: ${theme.fontSize.md};
`;

const StudentMeta = styled.div`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textSecondary};
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.sm};
  font-size: ${theme.fontSize.xs};
  font-weight: ${theme.fontWeight.medium};
  text-transform: uppercase;
  background: ${props => {
    switch (props.status) {
      case 'ativo': return '#22c55e20';
      case 'inativo': return '#ef444420';
      case 'suspenso': return '#f59e0b20';
      default: return theme.colors.border;
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'ativo': return '#15803d';
      case 'inativo': return '#dc2626';
      case 'suspenso': return '#d97706';
      default: return theme.colors.textSecondary;
    }
  }};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: ${theme.colors.textSecondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xxl};
  color: ${theme.colors.textSecondary};
`;

export const AcademyDetails: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { academyId } = useParams<{ academyId: string }>();
  
  const [academy, setAcademy] = useState<User | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (user && user.type !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  const fetchAcademyData = async () => {
    if (!academyId) return;

    try {
      setLoading(true);
      // Get academy details
      const academyProfile = await dataService.getProfile(academyId);
      setAcademy(academyProfile);

      // Get students for this academy
      const studentsData = await dataService.getAcademyStudents(academyId);
      setStudents(studentsData || []);
      setFilteredStudents(studentsData || []);
    } catch (error) {
      console.error('Error fetching academy data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.type === 'admin' && academyId) {
      fetchAcademyData();
    }
  }, [user, academyId]);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.number?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchQuery, students]);

  const handleBack = () => {
    navigate('/admin');
  };

  if (user?.type !== 'admin') {
    return null;
  }

  return (
    <Container>
      <Header>
        <BackButton
          onClick={handleBack}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft size={16} />
          Voltar para Academias
        </BackButton>

        <Title>
          <Building2 size={32} />
          {academy ? academy.name : 'Carregando...'}
        </Title>
      </Header>

      {loading ? (
        <LoadingContainer>
          Carregando dados da academia...
        </LoadingContainer>
      ) : (
        <>
          {/* Academy Info Card */}
          {academy && (
            <AcademyInfoCard>
              <AcademyName>
                <Building2 size={24} />
                {academy.name}
              </AcademyName>
              
              <AcademyInfoGrid>
                {academy.email && (
                  <InfoItem>
                    <Mail size={16} />
                    {academy.email}
                  </InfoItem>
                )}
                
                {academy.number && (
                  <InfoItem>
                    <Phone size={16} />
                    {academy.number}
                  </InfoItem>
                )}
                
                {academy.address && (
                  <InfoItem>
                    <MapPin size={16} />
                    {academy.address}
                  </InfoItem>
                )}
                
                <InfoItem>
                  <Users size={16} />
                  {students.length} aluno{students.length !== 1 ? 's' : ''} cadastrado{students.length !== 1 ? 's' : ''}
                </InfoItem>
              </AcademyInfoGrid>
            </AcademyInfoCard>
          )}

          {/* Students Search */}
          <SearchContainer>
            <SearchIcon>
              <Search size={20} />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="Buscar alunos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchContainer>

          {/* Students Section */}
          <StudentsSection>
            <SectionHeader>
              <SectionTitle>
                <Users size={20} />
                Alunos da Academia {searchQuery && `(filtrados: ${filteredStudents.length})`}
              </SectionTitle>
            </SectionHeader>

            <StudentsList>
              {filteredStudents.length === 0 ? (
                <EmptyState>
                  {searchQuery ? (
                    <div>
                      <Users size={48} color={theme.colors.textSecondary} />
                      <p>Nenhum aluno encontrado para "{searchQuery}"</p>
                    </div>
                  ) : (
                    <div>
                      <Users size={48} color={theme.colors.textSecondary} />
                      <p>Nenhum aluno cadastrado nesta academia ainda.</p>
                    </div>
                  )}
                </EmptyState>
              ) : (
                filteredStudents.map((student) => (
                  <StudentItem
                    key={student.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <StudentInfo>
                      <StudentName>{student.name}</StudentName>
                      <StudentMeta>
                        {student.email && <span>{student.email}</span>}
                        {student.number && <span>{student.number}</span>}
                        {student.gender && <span>Gênero: {student.gender}</span>}
                        {student.birth_date && (
                          <span>Nascimento: {new Date(student.birth_date).toLocaleDateString()}</span>
                        )}
                      </StudentMeta>
                    </StudentInfo>
                    
                    <StatusBadge status={student.status || 'ativo'}>
                      {student.status || 'ativo'}
                    </StatusBadge>
                  </StudentItem>
                ))
              )}
            </StudentsList>
          </StudentsSection>
        </>
      )}
    </Container>
  );
};