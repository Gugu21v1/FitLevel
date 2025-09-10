import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Flame, 
  Target, 
  Calendar,
  Dumbbell,
  Utensils,
  Trophy,
  ChevronRight
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const Greeting = styled.h1`
  font-size: ${theme.fontSize.xxl};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.sm};
  
  span {
    background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryLight});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const Subtitle = styled.p`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.fontSize.lg};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const StatCard = styled(motion.div)`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm};
  transition: all ${theme.transitions.normal};

  &:hover {
    box-shadow: ${theme.shadows.md};
    transform: translateY(-4px);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.md};
`;

const StatIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: ${theme.borderRadius.lg};
  background: ${props => props.color}20;
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StatValue = styled.div`
  font-size: ${theme.fontSize.xxl};
  font-weight: ${theme.fontWeight.bold};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.xs};
`;

const StatLabel = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.fontSize.sm};
`;

const QuickActions = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const SectionTitle = styled.h2`
  font-size: ${theme.fontSize.xl};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.md};
`;

const ActionCard = styled(motion.button)`
  background: linear-gradient(135deg, ${theme.colors.primary}10, ${theme.colors.primaryLight}5);
  border: 2px solid ${theme.colors.primary}30;
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.lg};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};

  &:hover {
    background: linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.primaryLight}10);
    border-color: ${theme.colors.primary};
    transform: translateY(-2px);
  }

  svg {
    color: ${theme.colors.primary};
  }
`;

const ActionTitle = styled.div`
  font-size: ${theme.fontSize.md};
  font-weight: ${theme.fontWeight.semibold};
  color: ${theme.colors.text};
`;

const RecentActivity = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm};
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.lg};
  transition: background ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.primary}5;
  }
`;

const ActivityIcon = styled.div<{ type: string }>`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.full};
  background: ${props => 
    props.type === 'workout' ? theme.colors.primary :
    props.type === 'meal' ? theme.colors.success :
    props.type === 'challenge' ? theme.colors.warning :
    theme.colors.info}20;
  color: ${props => 
    props.type === 'workout' ? theme.colors.primary :
    props.type === 'meal' ? theme.colors.success :
    props.type === 'challenge' ? theme.colors.warning :
    theme.colors.info};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-weight: ${theme.fontWeight.medium};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.xs};
`;

const ActivityTime = styled.div`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textSecondary};
`;

const ViewAll = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  color: ${theme.colors.primary};
  background: none;
  border: none;
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.medium};
  cursor: pointer;
  transition: color ${theme.transitions.fast};

  &:hover {
    color: ${theme.colors.primaryDark};
  }
`;

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    {
      icon: Flame,
      color: theme.colors.warning,
      value: user?.streak || 0,
      label: 'Dias de streak'
    },
    {
      icon: TrendingUp,
      color: theme.colors.success,
      value: user?.points || 0,
      label: 'Pontos totais'
    },
    {
      icon: Target,
      color: theme.colors.primary,
      value: '2,150',
      label: 'Calorias hoje'
    },
    {
      icon: Trophy,
      color: theme.colors.secondary,
      value: '5',
      label: 'Desafios ativos'
    }
  ];

  const quickActions = [
    {
      icon: Dumbbell,
      title: 'Iniciar Treino',
      path: '/workouts'
    },
    {
      icon: Utensils,
      title: 'Registrar Refeição',
      path: '/nutrition'
    },
    {
      icon: Trophy,
      title: 'Ver Desafios',
      path: '/challenges'
    },
    {
      icon: Calendar,
      title: 'Calendário',
      path: '/calendar'
    }
  ];

  const recentActivities = [
    {
      type: 'workout',
      icon: Dumbbell,
      title: 'Treino de Peito e Tríceps',
      time: 'Há 2 horas'
    },
    {
      type: 'meal',
      icon: Utensils,
      title: 'Almoço registrado - 650 cal',
      time: 'Há 4 horas'
    },
    {
      type: 'challenge',
      icon: Trophy,
      title: 'Desafio semanal completado!',
      time: 'Ontem às 18:30'
    }
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <Container>
      <Header>
        <Greeting>
          {getGreeting()}, <span>{user?.name || 'Atleta'}</span>! 💪
        </Greeting>
        <Subtitle>
          Vamos alcançar seus objetivos hoje!
        </Subtitle>
      </Header>

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatHeader>
              <div>
                <StatValue>{stat.value}</StatValue>
                <StatLabel>{stat.label}</StatLabel>
              </div>
              <StatIcon color={stat.color}>
                <stat.icon size={24} />
              </StatIcon>
            </StatHeader>
          </StatCard>
        ))}
      </StatsGrid>

      <QuickActions>
        <SectionTitle>
          <Target size={24} />
          Ações Rápidas
        </SectionTitle>
        <ActionsGrid>
          {quickActions.map((action, index) => (
            <ActionCard
              key={index}
              onClick={() => navigate(action.path)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <action.icon size={32} />
              <ActionTitle>{action.title}</ActionTitle>
            </ActionCard>
          ))}
        </ActionsGrid>
      </QuickActions>

      <RecentActivity>
        <StatHeader>
          <SectionTitle style={{ margin: 0 }}>
            Atividade Recente
          </SectionTitle>
          <ViewAll onClick={() => navigate('/calendar')}>
            Ver tudo
            <ChevronRight size={16} />
          </ViewAll>
        </StatHeader>
        <ActivityList>
          {recentActivities.map((activity, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ActivityItem>
                <ActivityIcon type={activity.type}>
                  <activity.icon size={20} />
                </ActivityIcon>
                <ActivityContent>
                  <ActivityTitle>{activity.title}</ActivityTitle>
                  <ActivityTime>{activity.time}</ActivityTime>
                </ActivityContent>
              </ActivityItem>
            </motion.div>
          ))}
        </ActivityList>
      </RecentActivity>
    </Container>
  );
};