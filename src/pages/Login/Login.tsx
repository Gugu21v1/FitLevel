import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { theme } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${theme.colors.primary}10, ${theme.colors.primaryLight}5);
  padding: ${theme.spacing.lg};
`;

const Card = styled(motion.div)`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.xl};
  padding: ${theme.spacing.xxl};
  width: 100%;
  max-width: 420px;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
`;

const LogoText = styled.h1`
  font-size: ${theme.fontSize.xxl};
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryLight});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: ${theme.spacing.sm};
`;

const Subtitle = styled.p`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.fontSize.md};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const InputGroup = styled.div`
  position: relative;
`;

const InputIcon = styled.div`
  position: absolute;
  left: ${theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${theme.colors.textSecondary};
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing.md} ${theme.spacing.md} ${theme.spacing.md} ${theme.spacing.xxl};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  font-size: ${theme.fontSize.md};
  transition: all ${theme.transitions.fast};
  background: ${theme.colors.background};

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    background: ${theme.colors.surface};
  }

  &:hover {
    border-color: ${theme.colors.primary}50;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: ${theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  padding: ${theme.spacing.xs};
  display: flex;
  align-items: center;
  transition: color ${theme.transitions.fast};

  &:hover {
    color: ${theme.colors.primary};
  }
`;

const Button = styled(motion.button)`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
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

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  font-size: ${theme.fontSize.sm};
  margin-top: ${theme.spacing.xs};
`;

const ForgotPassword = styled(Link)`
  text-align: right;
  color: ${theme.colors.primary};
  font-size: ${theme.fontSize.sm};
  text-decoration: none;
  transition: color ${theme.transitions.fast};

  &:hover {
    color: ${theme.colors.primaryDark};
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: ${theme.spacing.lg} 0;
  color: ${theme.colors.textSecondary};

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${theme.colors.border};
  }

  span {
    padding: 0 ${theme.spacing.md};
    font-size: ${theme.fontSize.sm};
  }
`;

const SignUpLink = styled.div`
  text-align: center;
  color: ${theme.colors.textSecondary};
  font-size: ${theme.fontSize.md};

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    font-weight: ${theme.fontWeight.semibold};
    transition: color ${theme.transitions.fast};

    &:hover {
      color: ${theme.colors.primaryDark};
    }
  }
`;

interface LoginForm {
  email: string;
  password: string;
}

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError('');
    
    try {
      await signIn(data.email, data.password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Logo>
          <LogoText>FitLevel</LogoText>
          <Subtitle>Seu parceiro fitness</Subtitle>
        </Logo>

        <Form onSubmit={handleSubmit(onSubmit)}>
          <InputGroup>
            <InputIcon>
              <Mail size={20} />
            </InputIcon>
            <Input
              type="email"
              placeholder="Email"
              {...register('email', {
                required: 'Email é obrigatório',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido'
                }
              })}
            />
            {errors.email && <ErrorMessage>{errors.email.message}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <InputIcon>
              <Lock size={20} />
            </InputIcon>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              {...register('password', {
                required: 'Senha é obrigatória',
                minLength: {
                  value: 6,
                  message: 'Senha deve ter pelo menos 6 caracteres'
                }
              })}
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </PasswordToggle>
            {errors.password && <ErrorMessage>{errors.password.message}</ErrorMessage>}
          </InputGroup>

          <ForgotPassword to="/forgot-password">
            Esqueceu sua senha?
          </ForgotPassword>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.95 }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </Form>

        <Divider>
          <span>ou</span>
        </Divider>

        <SignUpLink>
          Não tem uma conta? <Link to="/signup">Cadastre-se</Link>
        </SignUpLink>
      </Card>
    </Container>
  );
};