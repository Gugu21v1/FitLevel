import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { theme } from '../../styles/theme';
import { useThemeColors } from '../../hooks/useThemeColors';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { challengeService } from '../../services/challengeService';
import { useAuth } from '../../contexts/AuthContext';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${theme.colors.primary}10, ${theme.colors.primaryDark}10);
  padding: 20px;

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

const Card = styled.div<{ colors: any }>`
  background: ${props => props.colors.surface};
  border-radius: 16px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  text-align: center;

  @media (max-width: 768px) {
    padding: 30px 20px;
    border-radius: 12px;
  }
`;

const IconWrapper = styled.div<{ success?: boolean }>`
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: ${props => props.success ? theme.colors.success : theme.colors.error}10;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    font-size: 40px;
    color: ${props => props.success ? theme.colors.success : theme.colors.error};
  }
`;

const Title = styled.h2<{ colors: any }>`
  color: ${props => props.colors.text};
  font-size: 1.8rem;
  margin-bottom: 10px;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Message = styled.p<{ colors: any }>`
  color: ${props => props.colors.textLight};
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const Button = styled.button`
  padding: 12px 32px;
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${theme.colors.primaryDark};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${theme.colors.primary}40;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const LoadingMessage = styled.div<{ colors: any }>`
  color: ${props => props.colors.textLight};
  font-size: 1rem;
`;

const JoinChallenge: React.FC = () => {
  const { inviteCode } = useParams<{ inviteCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { colors } = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      // Store the invite code in sessionStorage and redirect to login
      if (inviteCode) {
        sessionStorage.setItem('pendingChallengeInvite', inviteCode);
      }
      navigate('/login');
      return;
    }

    if (inviteCode) {
      joinChallenge();
    }
  }, [user, inviteCode]);

  const joinChallenge = async () => {
    try {
      setLoading(true);
      setError('');

      if (!inviteCode) {
        throw new Error('Código de convite não encontrado');
      }

      const result = await challengeService.joinChallengeByCode(inviteCode, user!.id);

      if (result) {
        setSuccess(true);
        // Clear any pending invite from sessionStorage
        sessionStorage.removeItem('pendingChallengeInvite');
      }
    } catch (error: any) {
      console.error('Join challenge error:', error);
      setError(error.message || 'Erro ao participar do desafio');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = () => {
    navigate('/challenges');
  };

  if (loading) {
    return (
      <Container>
        <Card colors={colors}>
          <LoadingMessage colors={colors}>Processando convite para o desafio...</LoadingMessage>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card colors={colors}>
        <IconWrapper success={success}>
          {success ? <FiCheckCircle /> : <FiXCircle />}
        </IconWrapper>
        <Title colors={colors}>
          {success ? 'Parabéns!' : 'Ops!'}
        </Title>
        <Message colors={colors}>
          {success
            ? 'Você entrou no desafio com sucesso! Agora é hora de dar o seu melhor e conquistar seus objetivos.'
            : error || 'Não foi possível entrar no desafio. Verifique se o código está correto.'}
        </Message>
        <Button onClick={handleNavigate}>
          {success ? 'Ver Desafios' : 'Voltar aos Desafios'}
        </Button>
      </Card>
    </Container>
  );
};

export default JoinChallenge;