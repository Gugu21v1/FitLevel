import React from 'react';
import styled from '@emotion/styled';
import { Ticket } from 'lucide-react';
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

export const Coupons: React.FC = () => {
  return (
    <Container>
      <Title>
        <Ticket size={32} />
        Cupons e Descontos
      </Title>
      <p>Aproveite ofertas exclusivas de nossos parceiros.</p>
    </Container>
  );
};