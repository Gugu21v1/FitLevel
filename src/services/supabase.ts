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
    
    // Create profile in database if user was created successfully
    if (data.user) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            name: name,
            email: email,
            type: 'aluno',
            status: 'ativo'
            // academy_id will be null initially and can be assigned later by admin
          });
        
        if (profileError && profileError.code !== '23505') { // 23505 = duplicate key error
          console.error('Error creating profile:', profileError);
          // Don't throw here, user is already created in auth
        } else if (!profileError) {
          console.log('Profile created successfully for user:', data.user.id);
        }
      } catch (profileError) {
        console.error('Error creating profile:', profileError);
      }
    }
    
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
    return supabase.auth.onAuthStateChange(async (event, session) => {
      callback(session?.user || null);
    });
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data;
  },

  async ensureProfile(user: any) {
    try {
      // Check if profile already exists
      const existingProfile = await this.getProfile(user.id);

      if (!existingProfile) {
        // Create profile if it doesn't exist
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
            type: 'aluno',
            email: user.email,
            status: 'ativo'
            // academy_id will be null initially and can be assigned later by admin
          });

        if (profileError && profileError.code !== '23505') { // 23505 = duplicate key error
          console.error('Error creating profile:', profileError);
          return null;
        } else if (!profileError) {
          console.log('Profile created successfully in ensureProfile');
          // Return the newly created profile
          return await this.getProfile(user.id);
        }
      }
      return existingProfile;
    } catch (error) {
      console.error('Error ensuring profile:', error);
      return null;
    }
  },
};

// Serviços de dados
export const dataService = {
  // Profiles
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateProfile(userId: string, updates: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Admin functions
  async getAllAcademies() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('type', 'academia')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async getAcademyStudents(academyId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('type', 'aluno')
      .eq('academy_id', academyId)
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async createAcademy(academyData: { name: string; address: string; number?: string }) {
    // Create academy profile (id will be auto-generated)
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        name: academyData.name,
        type: 'academia',
        address: academyData.address,
        number: academyData.number,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Exercises
  async getAllExercises() {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  },

  async createExercise(exerciseData: { name: string; video?: string }) {
    const { data, error } = await supabase
      .from('exercises')
      .insert(exerciseData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
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

  async createWorkout(workout: Record<string, unknown>) {
    const { data, error } = await supabase
      .from('workouts')
      .insert(workout)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateWorkout(id: string, updates: Record<string, unknown>) {
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

  async createMeal(meal: Record<string, unknown>) {
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

  async createBodyMetric(metric: Record<string, unknown>) {
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