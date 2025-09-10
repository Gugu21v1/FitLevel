import { Global, css } from '@emotion/react';
import { theme } from './theme';

const globalStyles = css`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    background-color: ${theme.colors.background};
    color: ${theme.colors.text};
    line-height: 1.6;
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: ${theme.fontWeight.semibold};
    line-height: 1.3;
  }

  h1 {
    font-size: ${theme.fontSize.xxxl};
  }

  h2 {
    font-size: ${theme.fontSize.xxl};
  }

  h3 {
    font-size: ${theme.fontSize.xl};
  }

  h4 {
    font-size: ${theme.fontSize.lg};
  }

  h5 {
    font-size: ${theme.fontSize.md};
  }

  h6 {
    font-size: ${theme.fontSize.sm};
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    transition: color ${theme.transitions.fast};

    &:hover {
      color: ${theme.colors.primaryDark};
    }
  }

  button {
    cursor: pointer;
    font-family: inherit;
    transition: all ${theme.transitions.fast};
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  input, textarea, select {
    font-family: inherit;
    font-size: inherit;
  }

  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.background};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.primary};
    border-radius: ${theme.borderRadius.full};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.primaryDark};
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: ${theme.breakpoints.sm}) {
    html {
      font-size: 14px;
    }
  }
`;

export const GlobalStyles = () => <Global styles={globalStyles} />;