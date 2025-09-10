export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  age?: number;
  weight?: number;
  height?: number;
  goal?: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'performance';
  level?: 'beginner' | 'intermediate' | 'advanced';
  points?: number;
  streak?: number;
  gym?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Exercise {
  id: string;
  name: string;
  category: 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'abs' | 'cardio';
  equipment?: string;
  videoUrl?: string;
  instructions?: string[];
  musclesWorked?: string[];
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise?: Exercise;
  sets: number;
  reps: number;
  weight?: number;
  restTime?: number;
  notes?: string;
  order: number;
}

export interface Workout {
  id: string;
  userId: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  duration?: number;
  caloriesBurned?: number;
  date: Date;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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