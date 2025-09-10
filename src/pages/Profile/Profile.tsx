import React from 'react';
import styled from '@emotion/styled';
import { User } from 'lucide-react';
import { theme } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: ${theme.fontSize.xxl};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.xl};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

export const Profile: React.FC = () => {
  const { user } = useAuth();
  
  return (
    <Container>
      <Title>
        <User size={32} />
        Perfil
      </Title>
      <p>Olá, {user?.name || 'Usuário'}! Configure suas informações pessoais aqui.</p>
    </Container>
  );
};