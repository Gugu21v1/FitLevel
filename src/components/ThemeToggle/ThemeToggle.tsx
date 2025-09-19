import React from 'react';
import styled from '@emotion/styled';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';
import { useThemeColors } from '../../hooks/useThemeColors';

const ToggleButton = styled.button<{ colors: any }>`
  position: fixed;
  top: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid ${props => props.colors.border};
  background: ${props => props.colors.surface};
  color: ${props => props.colors.text};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { colors } = useThemeColors();

  return (
    <ToggleButton
      onClick={toggleTheme}
      colors={colors}
      title={isDarkMode ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
    >
      {isDarkMode ? <FaSun /> : <FaMoon />}
    </ToggleButton>
  );
};