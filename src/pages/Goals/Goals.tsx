import React from 'react';
import styled from '@emotion/styled';
import { Target } from 'lucide-react';
import { theme } from '../../styles/theme';

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

export const Goals: React.FC = () => {
  return (
    <Container>
      <Title>
        <Target size={32} />
        Metas
      </Title>
      <p>Defina e acompanhe suas metas pessoais.</p>
    </Container>
  );
};