export type UserType = 'aluno' | 'academia' | 'personal' | 'admin';
export type UserStatus = 'ativo' | 'inativo' | 'suspenso';
export type WorkoutDifficulty = 'iniciante' | 'intermediario' | 'avancado' | 'expert';

export interface User {
  id: string;
  name: string;
  type: UserType;
  gender?: 'masculino' | 'feminino' | 'outro';
  birth_date?: string;
  number?: string; // Renamed from contact
  address?: string;
  academy_id?: string;
  status?: UserStatus;
  photo_url?: string;
  notes?: string;
  email?: string;
  avatar?: string; // For compatibility with auth
  streak?: number; // For gamification
  points?: number; // For gamification
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  id: string;
  name: string;
  video?: string;
  muscle_group?: string;
  equipment?: string;
  instructions?: string;
  created_at: Date;
}

export interface Workout {
  id: string;
  id_profiles: string;
  name: string;
  duration: number;
  description?: string;
  is_template?: boolean;
  difficulty?: WorkoutDifficulty;
  created_at: Date;
  updated_at: Date;
}

export interface WorkoutExercise {
  id: string;
  id_workout: string;
  id_exercise: string;
  series: number;
  repetitions: number;
  weight?: number;
  ordem?: number;
  rest_time?: string; // Can be seconds as integer or instruction as text
  exercise?: Exercise;
  created_at: Date;
  updated_at?: Date;
}

// Legacy interfaces - keeping for compatibility during transition
export interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  servingSize: number;
  servingUnit: string;
}

export interface Meal {
  id: string;
  userId: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: {
    foodItem: FoodItem;
    quantity: number;
  }[];
  date: Date;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export interface BodyMetrics {
  id: string;
  userId: string;
  date: Date;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  biceps?: number;
  thighs?: number;
  calves?: number;
  notes?: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'gym';
  points: number;
  requirements: string[];
  startDate: Date;
  endDate: Date;
  participants?: string[];
  gymId?: string;
  imageUrl?: string;
}

export interface ChallengeProgress {
  id: string;
  userId: string;
  challengeId: string;
  progress: number;
  completed: boolean;
  completedAt?: Date;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: {
    name: string;
    amount: string;
  }[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl?: string;
  tags?: string[];
}

export interface Coupon {
  id: string;
  title: string;
  description: string;
  discount: string;
  code: string;
  partner: string;
  validUntil: Date;
  imageUrl?: string;
  terms?: string[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'workout' | 'meal' | 'water' | 'rest' | 'challenge' | 'achievement';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}