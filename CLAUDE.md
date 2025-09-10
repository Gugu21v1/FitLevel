# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FitLevel é um aplicativo fitness completo desenvolvido com React, TypeScript e Capacitor para funcionar tanto na web quanto em dispositivos móveis. O app oferece funcionalidades de acompanhamento fitness, nutrição, desafios gamificados e integração com academias.

## Development Commands

### Web Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

### Mobile Development (Capacitor)
```bash
# Sync Capacitor
npx cap sync

# Run on Android
npx cap run android

# Run on iOS (macOS only)
npx cap run ios

# Open Android Studio
npx cap open android

# Open Xcode (macOS only)
npx cap open ios
```

## Code Architecture

### Tech Stack
- **React 19** with TypeScript
- **Vite** for build tooling
- **Capacitor** for mobile deployment
- **Emotion** for CSS-in-JS styling
- **Framer Motion** for animations
- **React Router** for navigation
- **Supabase** for backend services
- **React Hook Form** for form management

### Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Page components (Dashboard, Workouts, etc)
├── contexts/      # React contexts (AuthContext)
├── services/      # API services (Supabase integration)
├── hooks/         # Custom React hooks
├── utils/         # Utility functions
├── types/         # TypeScript type definitions
└── styles/        # Global styles and theme
```

### Key Design Decisions
- **Theme Color**: Azul Ciano (#00B8D9) as primary color
- **Authentication**: Supabase Auth with email/password
- **Routing**: Protected routes with authentication check
- **Styling**: Emotion CSS-in-JS for component styling
- **State Management**: React Context for auth, local state for components

### Environment Variables
Required in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Important Patterns

### Adding New Pages
1. Create page component in `src/pages/PageName/PageName.tsx`
2. Add route in `src/App.tsx`
3. Add navigation item in `src/components/Layout/Layout.tsx`

### Styling Components
Use Emotion styled components with theme:
```typescript
import styled from '@emotion/styled';
import { theme } from '../../styles/theme';

const StyledDiv = styled.div`
  color: ${theme.colors.primary};
`;
```

### API Calls
Use the Supabase service layer in `src/services/supabase.ts`

## Database Schema

The app uses Supabase with the following main tables:
- `profiles` - User profiles and settings
- `workouts` - Workout sessions and exercises
- `meals` - Nutrition tracking
- `body_metrics` - Body measurements
- `challenges` - Fitness challenges
- `challenge_progress` - User progress in challenges

All tables have Row Level Security (RLS) enabled.

## MCP Integration

This project includes MCP (Model Context Protocol) integration with Supabase for enhanced database operations.

### MCP Configuration

The project includes a `mcp-config.json` file with Supabase MCP server configuration:

```json
{
  "inputs": [
    {
      "type": "promptString",
      "id": "supabase-access-token",
      "description": "Supabase personal access token",
      "password": true
    }
  ],
  "servers": {
    "supabase": {
      "command": "cmd",
      "args": ["/c", "npx", "-y", "@supabase/mcp-server-supabase@latest", "--read-only", "--project-ref=FitLevel"],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "{{supabase-access-token}}"
      }
    }
  }
}
```

### Setting up MCP

1. **Generate Supabase Access Token**:
   - Go to your Supabase dashboard
   - Navigate to Settings > Access Tokens
   - Generate a new personal access token with appropriate permissions
   - Keep this token secure and never commit it to version control

2. **Configure Claude Code**:
   - Use the MCP configuration to enable database operations through Claude Code
   - The configuration uses `--read-only` for safety
   - Update `project-ref` to match your actual Supabase project reference

### MCP Benefits

With MCP integration, Claude Code can:
- Query database schema and structure
- Analyze data patterns and relationships
- Suggest optimizations and improvements
- Help with database migrations and updates
- Provide insights into data usage patterns

### Security Notes

- Always use `--read-only` flag in production environments
- Rotate access tokens regularly
- Never expose tokens in configuration files or code
- Use environment variables or secure prompt inputs for tokens