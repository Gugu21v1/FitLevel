import React from 'react';
import styled from '@emotion/styled';
import { Calendar as CalendarIcon } from 'lucide-react';
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

export const Calendar: React.FC = () => {
  return (
    <Container>
      <Title>
        <CalendarIcon size={32} />
        Calendário
      </Title>
      <p>Visualize seus treinos e atividades programadas.</p>
    </Container>
  );
};