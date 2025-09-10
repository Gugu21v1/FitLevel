import React from 'react';
import styled from '@emotion/styled';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Dumbbell, 
  Utensils, 
  TrendingUp, 
  Trophy, 
  User,
  LogOut,
  Target,
  Calendar,
  ChefHat,
  Ticket
} from 'lucide-react';
import { theme } from '../../styles/theme';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${theme.colors.background};
`;

const Sidebar = styled.nav`
  width: 280px;
  background: ${theme.colors.surface};
  border-right: 1px solid ${theme.colors.border};
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  overflow-y: auto;
  z-index: 100;

  @media (max-width: ${theme.breakpoints.md}) {
    width: 100%;
    bottom: 0;
    top: auto;
    height: auto;
    border-right: none;
    border-top: 1px solid ${theme.colors.border};
    flex-direction: row;
    overflow-x: auto;
  }
`;

const Logo = styled.div`
  padding: ${theme.spacing.lg};
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryLight});
  color: white;
  font-size: ${theme.fontSize.xl};
  font-weight: ${theme.fontWeight.bold};
  text-align: center;
  letter-spacing: -0.5px;

  @media (max-width: ${theme.breakpoints.md}) {
    display: none;
  }
`;

const Nav = styled.div`
  flex: 1;
  padding: ${theme.spacing.md};

  @media (max-width: ${theme.breakpoints.md}) {
    display: flex;
    padding: ${theme.spacing.sm};
    gap: ${theme.spacing.sm};
  }
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.textSecondary};
  transition: all ${theme.transitions.fast};
  text-decoration: none;

  &:hover {
    background: ${theme.colors.background};
    color: ${theme.colors.primary};
  }

  &.active {
    background: linear-gradient(135deg, ${theme.colors.primary}15, ${theme.colors.primaryLight}15);
    color: ${theme.colors.primary};
    font-weight: ${theme.fontWeight.medium};
  }

  svg {
    width: 20px;
    height: 20px;
  }

  @media (max-width: ${theme.breakpoints.md}) {
    flex-direction: column;
    padding: ${theme.spacing.sm};
    margin: 0;
    font-size: ${theme.fontSize.xs};
    gap: ${theme.spacing.xs};
    min-width: 60px;

    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

const UserSection = styled.div`
  padding: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border};

  @media (max-width: ${theme.breakpoints.md}) {
    display: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${theme.colors.background};
  border-radius: ${theme.borderRadius.lg};
  margin-bottom: ${theme.spacing.md};
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${theme.borderRadius.full};
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryLight});
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${theme.fontWeight.semibold};
`;

const UserName = styled.div`
  flex: 1;
  font-weight: ${theme.fontWeight.medium};
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  width: 100%;
  padding: ${theme.spacing.md};
  background: ${theme.colors.error}15;
  color: ${theme.colors.error};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  font-weight: ${theme.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.transitions.fast};

  &:hover {
    background: ${theme.colors.error}25;
  }
`;

const Main = styled.main`
  flex: 1;
  margin-left: 280px;
  padding: ${theme.spacing.lg};
  max-width: 1400px;
  width: 100%;

  @media (max-width: ${theme.breakpoints.md}) {
    margin-left: 0;
    margin-bottom: 80px;
    padding: ${theme.spacing.md};
  }
`;

const Header = styled.header`
  display: none;
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  border-bottom: 1px solid ${theme.colors.border};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 99;

  @media (max-width: ${theme.breakpoints.md}) {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

const MobileLogo = styled.div`
  font-size: ${theme.fontSize.lg};
  font-weight: ${theme.fontWeight.bold};
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryLight});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const StreakBadge = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  background: linear-gradient(135deg, ${theme.colors.warning}20, ${theme.colors.warning}10);
  color: ${theme.colors.warning};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.fontSize.sm};
  font-weight: ${theme.fontWeight.semibold};
`;

export const Layout: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/workouts', icon: Dumbbell, label: 'Treinos' },
    { path: '/nutrition', icon: Utensils, label: 'Nutrição' },
    { path: '/progress', icon: TrendingUp, label: 'Progresso' },
    { path: '/challenges', icon: Trophy, label: 'Desafios' },
    { path: '/goals', icon: Target, label: 'Metas' },
    { path: '/calendar', icon: Calendar, label: 'Calendário' },
    { path: '/recipes', icon: ChefHat, label: 'Receitas' },
    { path: '/coupons', icon: Ticket, label: 'Cupons' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ];

  return (
    <Container>
      <Header>
        <MobileLogo>FitLevel</MobileLogo>
        {user?.streak && user.streak > 0 && (
          <StreakBadge
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring' }}
          >
            🔥 {user.streak} dias
          </StreakBadge>
        )}
      </Header>

      <Sidebar>
        <Logo>FitLevel</Logo>
        <Nav>
          {navItems.map((item) => (
            <NavItem key={item.path} to={item.path}>
              <item.icon />
              <span>{item.label}</span>
            </NavItem>
          ))}
        </Nav>
        <UserSection>
          {user && (
            <>
              <UserInfo>
                <Avatar>{user.name?.[0]?.toUpperCase() || 'U'}</Avatar>
                <UserName>{user.name}</UserName>
              </UserInfo>
              <LogoutButton onClick={handleSignOut}>
                <LogOut size={18} />
                Sair
              </LogoutButton>
            </>
          )}
        </UserSection>
      </Sidebar>

      <Main>
        <Outlet />
      </Main>
    </Container>
  );
};