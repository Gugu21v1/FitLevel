import { createClient } from '@supabase/supabase-js';

// Estas variáveis devem ser configuradas no arquivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Serviços de autenticação
export const authService = {
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    
    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  },

  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  },
};

// Serviços de dados
export const dataService = {
  // Workouts
  async getWorkouts(userId: string) {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('userId', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createWorkout(workout: any) {
    const { data, error } = await supabase
      .from('workouts')
      .insert(workout)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateWorkout(id: string, updates: any) {
    const { data, error } = await supabase
      .from('workouts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Meals
  async getMeals(userId: string, date: Date) {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .eq('userId', userId)
      .eq('date', date.toISOString().split('T')[0]);
    
    if (error) throw error;
    return data;
  },

  async createMeal(meal: any) {
    const { data, error } = await supabase
      .from('meals')
      .insert(meal)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Body Metrics
  async getBodyMetrics(userId: string) {
    const { data, error } = await supabase
      .from('body_metrics')
      .select('*')
      .eq('userId', userId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createBodyMetric(metric: any) {
    const { data, error } = await supabase
      .from('body_metrics')
      .insert(metric)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Challenges
  async getChallenges() {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .gte('endDate', new Date().toISOString())
      .order('startDate', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getChallengeProgress(userId: string, challengeId: string) {
    const { data, error } = await supabase
      .from('challenge_progress')
      .select('*')
      .eq('userId', userId)
      .eq('challengeId', challengeId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateChallengeProgress(id: string, progress: number) {
    const { data, error } = await supabase
      .from('challenge_progress')
      .update({ progress, completed: progress >= 100 })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
};