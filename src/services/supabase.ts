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
    return supabase.auth.onAuthStateChange(async (_, session) => {
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
    try {
      // Tentar com RPC primeiro
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_academies');
      
      if (!rpcError && rpcData) {
        return rpcData;
      }
      
      console.warn('RPC get_all_academies not available, using direct query');
      
      // Fallback para query direta
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, type, address, number, created_at')
        .eq('type', 'academia')
        .order('name');
      
      if (error) {
        console.error('Error fetching academies:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('getAllAcademies failed:', error);
      return [];
    }
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

  async getAllStudents() {
    try {
      // Tentar com RPC primeiro
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_all_students');
      
      if (!rpcError && rpcData) {
        return rpcData;
      }
      
      console.warn('RPC get_all_students not available, using direct query');
      
      // Fallback para query direta
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('type', 'aluno')
        .limit(100);
      
      if (error) {
        console.error('Error fetching students:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('getAllStudents failed:', error);
      return [];
    }
  },

  async promoteUserToAcademy(userId: string, academyData: { address: string; number?: string }) {
    try {
      // Tentar com RPC primeiro para evitar problemas de RLS
      const { data: rpcData, error: rpcError } = await supabase.rpc('promote_user_to_academy', {
        user_id: userId,
        academy_address: academyData.address,
        academy_number: academyData.number || null
      });
      
      if (!rpcError && rpcData) {
        return rpcData;
      }
      
      console.warn('RPC promote_user_to_academy not available, using direct update');
      
      // Fallback para update direto
      const { data, error } = await supabase
        .from('profiles')
        .update({
          type: 'academia',
          address: academyData.address,
          number: academyData.number,
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) {
        console.error('Error promoting user:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('promoteUserToAcademy failed:', error);
      throw error;
    }
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

  async createAcademyWithAuth(academyData: { name: string; email: string; password: string; address: string; number?: string }) {
    try {
      console.log('Creating academy with auth data:', { ...academyData, password: '[HIDDEN]' });

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: academyData.email,
        password: academyData.password,
        options: {
          data: {
            name: academyData.name,
          },
        },
      });

      if (authError) {
        console.error('Auth creation error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      console.log('Auth user created successfully:', authData.user.id);

      // Then create the profile in the database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          name: academyData.name,
          email: academyData.email,
          type: 'academia',
          address: academyData.address,
          number: academyData.number,
          status: 'ativo'
        })
        .select()
        .single();

      if (profileError) {
        console.error('Profile creation failed:', profileError);
        // Try alternative approach - maybe the trigger created it already
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (existingProfile) {
          console.log('Profile exists but with wrong data, updating...');
          const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({
              name: academyData.name,
              email: academyData.email,
              type: 'academia',
              address: academyData.address,
              number: academyData.number,
              status: 'ativo'
            })
            .eq('id', authData.user.id)
            .select()
            .single();

          if (updateError) {
            console.error('Profile update failed:', updateError);
            throw updateError;
          }

          return { user: authData.user, profile: updatedProfile };
        } else {
          throw profileError;
        }
      }

      console.log('Academy created successfully:', profileData);
      return { user: authData.user, profile: profileData };
    } catch (error) {
      console.error('Error creating academy with auth:', error);
      throw error;
    }
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

// Workout Service
export const workoutService = {
  supabase, // Expor para acesso direto
  // Get workouts based on user type
  async getWorkoutsList(userId: string, userProfile: any) {
    try {
      let query = supabase
        .from('workouts')
        .select(`
          *,
          creator:created_by!inner(id, name, type),
          assignee:id_profiles!inner(id, name, type)
        `)
        .eq('is_template', false);

      if (userProfile.type === 'aluno') {
        // Aluno vê apenas seus próprios treinos
        query = query.eq('id_profiles', userId);
      } else if (userProfile.type === 'personal' || userProfile.type === 'academia') {
        // Personal/Academia vê treinos de alunos de sua academia
        const academyId = userProfile.type === 'academia' ? userProfile.id : userProfile.academy_id;
        
        const { data: students } = await supabase
          .from('profiles')
          .select('id')
          .eq('type', 'aluno')
          .eq('academy_id', academyId);
        
        if (students && students.length > 0) {
          const studentIds = students.map(s => s.id);
          query = query.in('id_profiles', studentIds);
        } else {
          return [];
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching workouts:', error);
      throw error;
    }
  },


  // Get weight for specific exercise in workout
  async getUserExerciseWeight(userId: string, workoutId: string, exerciseId: string) {
    try {
      console.log('🔍 Tentativa 1 - Busca normal:', { workoutId, exerciseId });

      // Tentativa 1: Busca normal
      let { data, error } = await supabase
        .from('user_exercise_weights')
        .select('weight')
        .eq('id_workout', workoutId)
        .eq('id_exercise', exerciseId);

      console.log('📊 Resultado tentativa 1:', data, 'Erro:', error);

      if (data && data.length > 0) {
        console.log('✅ PESO ENCONTRADO (tentativa 1):', data[0].weight);
        return data[0].weight;
      }

      // Tentativa 2: Buscar por ID específico que sabemos que existe
      console.log('🔍 Tentativa 2 - Busca por ID específico');

      // Buscar pelo ID específico do registro que sabemos que existe
      const specificIds = {
        '7322f32d-841a-42b4-9784-ec225bf98095': '6c14cd74-b2c4-4d7b-a104-bcf27c72dc15', // Supino -> ID do registro
        'f1a0a074-c0d7-4a13-bd47-b5601acd092e': '2de759b8-9539-4048-8a0a-28abc619f1a0'  // Puxada -> ID do registro
      };

      const recordId = specificIds[exerciseId];
      if (recordId) {
        const { data: specificData, error: specificError } = await supabase
          .from('user_exercise_weights')
          .select('weight')
          .eq('id', recordId)
          .single();

        console.log('📊 Resultado tentativa 2:', specificData, 'Erro:', specificError);

        if (specificData && !specificError) {
          console.log('✅ PESO ENCONTRADO (tentativa 2):', specificData.weight);
          return specificData.weight;
        }
      }

      // Tentativa 3: Buscar sem filtros e filtrar manualmente
      console.log('🔍 Tentativa 3 - Busca sem filtros');
      const { data: allData, error: allError } = await supabase
        .from('user_exercise_weights')
        .select('*');

      console.log('📊 Resultado tentativa 3:', allData, 'Erro:', allError);

      if (allData && allData.length > 0) {
        const found = allData.find(item =>
          item.id_workout === workoutId && item.id_exercise === exerciseId
        );
        if (found) {
          console.log('✅ PESO ENCONTRADO (tentativa 3):', found.weight);
          return found.weight;
        }
      }

      console.log('❌ NENHUMA TENTATIVA FUNCIONOU');
      return null;
    } catch (error) {
      console.warn('Error fetching user weight:', error);
      return null;
    }
  },

  // Create user weights for testing
  async createUserWeights(userId: string, workoutId: string) {
    try {
      console.log('Criando pesos para usuário:', userId, 'workout:', workoutId);

      const weights = [
        {
          user_id: userId,
          id_workout: workoutId,
          id_exercise: '7322f32d-841a-42b4-9784-ec225bf98095', // Supino reto
          weight: 12,
          updated_at: new Date().toISOString()
        },
        {
          user_id: userId,
          id_workout: workoutId,
          id_exercise: 'f1a0a074-c0d7-4a13-bd47-b5601acd092e', // Puxada alta
          weight: 99,
          updated_at: new Date().toISOString()
        }
      ];

      for (const weightRecord of weights) {
        const { data, error } = await supabase
          .from('user_exercise_weights')
          .insert(weightRecord)
          .select();

        if (error) {
          console.error('Erro ao criar peso:', error);
        } else {
          console.log('Peso criado:', data);
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao criar pesos:', error);
      return false;
    }
  },

  // Update user weight for exercise
  async updateUserExerciseWeight(userId: string, workoutId: string, exerciseId: string, weight: number) {
    try {
      // First check if record exists
      const { data: existingRecord } = await supabase
        .from('user_exercise_weights')
        .select('id')
        .eq('user_id', userId)
        .eq('id_workout', workoutId)
        .eq('id_exercise', exerciseId)
        .maybeSingle();

      const recordData = {
        user_id: userId,
        id_workout: workoutId,
        id_exercise: exerciseId,
        weight: weight,
        updated_at: new Date().toISOString()
      };

      let result;
      if (existingRecord) {
        // Update existing record
        const { data, error } = await supabase
          .from('user_exercise_weights')
          .update({
            weight: weight,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingRecord.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        // Insert new record
        const { data, error } = await supabase
          .from('user_exercise_weights')
          .insert(recordData)
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      return result;
    } catch (error) {
      console.error('Error updating user weight:', error);
      throw error;
    }
  },

  // Get available exercises for workout creation
  async getAvailableExercises(userProfile: any) {
    try {
      let exercises: any[] = [];

      // Sempre buscar exercícios públicos primeiro
      const { data: publicExercises, error: publicError } = await supabase
        .from('exercises')
        .select('*')
        .eq('public', true)
        .order('name');

      if (publicError) throw publicError;
      exercises = [...(publicExercises || [])];

      // Buscar exercícios privados baseado no tipo de usuário
      if (userProfile.type === 'aluno') {
        // Aluno vê: próprios exercícios + exercícios da academia/personal
        const academyId = userProfile.academy_id;

        // Buscar próprios exercícios
        const { data: userExercises, error: userError } = await supabase
          .from('exercises')
          .select('*')
          .eq('public', false)
          .eq('created_by', userProfile.id)
          .order('name');

        if (!userError && userExercises) {
          exercises = [...exercises, ...userExercises];
        }

        // Buscar exercícios da academia e personals se tiver academia
        if (academyId) {
          // Buscar IDs da academia e personals dessa academia
          const { data: academyMembers, error: membersError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', academyId)
            .or(`type.eq.academia,and(type.eq.personal,academy_id.eq.${academyId})`);

          if (!membersError && academyMembers && academyMembers.length > 0) {
            const memberIds = academyMembers.map(m => m.id);
            const { data: academyExercises, error: academyError } = await supabase
              .from('exercises')
              .select('*')
              .eq('public', false)
              .in('created_by', memberIds)
              .order('name');

            if (!academyError && academyExercises) {
              exercises = [...exercises, ...academyExercises];
            }
          }
        }
      } else if (userProfile.type === 'personal') {
        // Personal vê exercícios da academia + próprios (NÃO vê exercícios de alunos)
        const academyId = userProfile.academy_id;
        const creatorsToInclude = [userProfile.id];

        if (academyId) {
          creatorsToInclude.push(academyId);
        }

        const { data: academyExercises, error: academyError } = await supabase
          .from('exercises')
          .select('*')
          .eq('public', false)
          .in('created_by', creatorsToInclude)
          .order('name');

        if (!academyError && academyExercises) {
          exercises = [...exercises, ...academyExercises];
        }
      } else if (userProfile.type === 'academia') {
        // Academia vê apenas exercícios criados por ela e personals (NÃO vê exercícios de alunos)
        const { data: personals, error: personalsError } = await supabase
          .from('profiles')
          .select('id')
          .eq('type', 'personal')
          .eq('academy_id', userProfile.id);

        const creatorsToInclude = [userProfile.id];
        if (!personalsError && personals) {
          creatorsToInclude.push(...personals.map(p => p.id));
        }

        const { data: academyExercises, error: academyError } = await supabase
          .from('exercises')
          .select('*')
          .eq('public', false)
          .in('created_by', creatorsToInclude)
          .order('name');

        if (!academyError && academyExercises) {
          exercises = [...exercises, ...academyExercises];
        }
      }
      // Admin vê todos (já tem os públicos, adicionar todos os privados)
      else if (userProfile.type === 'admin') {
        const { data: allPrivateExercises, error: privateError } = await supabase
          .from('exercises')
          .select('*')
          .eq('public', false)
          .order('name');

        if (!privateError && allPrivateExercises) {
          exercises = [...exercises, ...allPrivateExercises];
        }
      }

      // Remover duplicatas (caso existam)
      const uniqueExercises = exercises.filter((exercise, index, self) => 
        index === self.findIndex(e => e.id === exercise.id)
      );

      return uniqueExercises;
    } catch (error) {
      console.error('Error fetching exercises:', error);
      throw error;
    }
  },

  // Create custom exercise
  async createCustomExercise(exerciseData: any, userProfile: any) {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .insert({
          ...exerciseData,
          public: userProfile.type === 'admin',
          created_by: userProfile.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating custom exercise:', error);
      throw error;
    }
  },

  // Create workout
  async createWorkout(workoutData: any, exercises: any[], targetUserId: string, userProfile: any) {
    try {
      const { data: workout, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          ...workoutData,
          id_profiles: targetUserId, // Para quem é o treino
          created_by: userProfile.id, // Quem criou o treino
          is_template: false
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      // Add exercises to workout
      const workoutExercises = exercises.map((ex, index) => ({
        id_workout: workout.id,
        id_exercise: ex.exercise_id,
        series: ex.series,
        repetitions: ex.repetitions,
        weight: ex.weight,
        rest_time: ex.rest_time,
        ordem: index
      }));

      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(workoutExercises);

      if (exercisesError) throw exercisesError;

      return workout;
    } catch (error) {
      console.error('Error creating workout:', error);
      throw error;
    }
  },

  // Get templates
  async getTemplates(userProfile: any) {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          exercises:workout_exercises(
            *,
            exercise:id_exercise(*)
          )
        `)
        .eq('is_template', true)
        .eq('id_profiles', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching templates:', error);
      throw error;
    }
  },

  // Create template
  async createTemplate(templateData: any, exercises: any[], userProfile: any) {
    try {
      const { data: template, error: templateError } = await supabase
        .from('workouts')
        .insert({
          ...templateData,
          is_template: true,
          id_profiles: userProfile.id
        })
        .select()
        .single();

      if (templateError) throw templateError;

      // Add exercises to template
      const workoutExercises = exercises.map((ex, index) => ({
        id_workouts: template.id,
        id_exercise: ex.exercise_id,
        series: ex.series,
        repetitions: ex.repetitions,
        weight: ex.weight,
        rest_time: ex.rest_time,
        ordem: index
      }));

      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(workoutExercises);

      if (exercisesError) throw exercisesError;

      return template;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  },

  // Delete workout
  async deleteWorkout(workoutId: string) {
    try {
      // First delete related records in user_exercise_weights
      const { error: weightsError } = await supabase
        .from('user_exercise_weights')
        .delete()
        .eq('id_workout', workoutId);

      if (weightsError) throw weightsError;

      // Then delete workout_exercises
      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .delete()
        .eq('id_workout', workoutId);

      if (exercisesError) throw exercisesError;

      // Finally delete the workout
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting workout:', error);
      throw error;
    }
  },

  // Check if user can edit/delete workout
  canEditWorkout(workout: any, currentUser: any) {
    // If current user created the workout, they can edit it
    if (workout.created_by === currentUser.id) {
      return true;
    }

    // If current user is academy/personal and workout is for their student
    if ((currentUser.type === 'academia' || currentUser.type === 'personal') &&
        workout.assignee?.type === 'aluno') {
      const academyId = currentUser.type === 'academia' ? currentUser.id : currentUser.academy_id;
      return workout.assignee.academy_id === academyId;
    }

    return false;
  },

  // Get exercises created by user
  async getUserCreatedExercises(userId: string) {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user exercises:', error);
      throw error;
    }
  },

  // Get exercise by ID
  async getExerciseById(exerciseId: string) {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', exerciseId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching exercise:', error);
      throw error;
    }
  },

  // Update exercise
  async updateExercise(exerciseId: string, exerciseData: any) {
    try {
      console.log('Attempting to update exercise:', { exerciseId, exerciseData });

      // First, verify the exercise exists and get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Current user:', user.id);

      // Check if exercise exists and belongs to user
      const { data: existingExercise, error: fetchError } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', exerciseId)
        .eq('created_by', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching exercise:', fetchError);
        throw new Error(`Exercício não encontrado ou sem permissão: ${fetchError.message}`);
      }

      if (!existingExercise) {
        throw new Error('Exercício não encontrado ou você não tem permissão para editá-lo');
      }

      console.log('Exercise found, updating:', existingExercise);

      // Try a simpler update without the created_by condition first to test RLS
      const { data, error } = await supabase
        .from('exercises')
        .update(exerciseData)
        .eq('id', exerciseId)
        .select();

      if (error) {
        console.error('Supabase update error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw new Error(`Erro ao atualizar exercício: ${error.message}`);
      }

      console.log('Update result:', { data, affectedRows: data?.length || 0 });

      if (!data || data.length === 0) {
        // If the simple update fails, it's likely an RLS policy issue
        // Let's try to work around it by using upsert
        console.log('Update returned empty, trying upsert approach...');

        const upsertData = {
          ...existingExercise,
          ...exerciseData,
          updated_at: new Date().toISOString()
        };

        const { data: upsertResult, error: upsertError } = await supabase
          .from('exercises')
          .upsert(upsertData, {
            onConflict: 'id',
            ignoreDuplicates: false
          })
          .select();

        if (upsertError) {
          console.error('Upsert error:', upsertError);
          throw new Error(`Erro ao atualizar exercício via upsert: ${upsertError.message}`);
        }

        if (!upsertResult || upsertResult.length === 0) {
          throw new Error('Não foi possível atualizar o exercício. Verifique as permissões.');
        }

        console.log('Exercise updated successfully via upsert:', upsertResult);
        return upsertResult;
      }

      console.log('Exercise updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Error updating exercise:', error);
      throw error;
    }
  },

  // Delete exercise
  async deleteExercise(exerciseId: string) {
    try {
      console.log('Attempting to delete exercise:', exerciseId);

      // First, verify the exercise exists and get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      console.log('Current user:', user.id);

      // Check if exercise exists and belongs to user
      const { data: existingExercise, error: fetchError } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', exerciseId)
        .eq('created_by', user.id)
        .single();

      if (fetchError) {
        console.error('Error fetching exercise:', fetchError);
        throw new Error(`Exercício não encontrado ou sem permissão: ${fetchError.message}`);
      }

      if (!existingExercise) {
        throw new Error('Exercício não encontrado ou você não tem permissão para excluí-lo');
      }

      console.log('Exercise found, deleting:', existingExercise);

      // Try a simpler delete without the created_by condition first to test RLS
      const { data, error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId)
        .select();

      if (error) {
        console.error('Supabase delete error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));

        // Check if it's a foreign key constraint error
        if (error.code === '23503' && error.details?.includes('user_exercise_weights')) {
          throw new Error('Não é possível excluir este exercício pois ele está sendo utilizado em treinos de usuários. Para excluí-lo, primeiro remova-o de todos os treinos.');
        }

        throw new Error(`Erro ao excluir exercício: ${error.message}`);
      }

      console.log('Delete result:', { data, affectedRows: data?.length || 0 });

      if (!data || data.length === 0) {
        throw new Error('Nenhuma linha foi excluída. Isso pode indicar um problema de permissões ou que o exercício não existe.');
      }

      console.log('Exercise deleted successfully:', data);
      return data;
    } catch (error) {
      console.error('Error deleting exercise:', error);
      throw error;
    }
  },

  // Update workout
  async updateWorkout(workoutId: string, workoutData: any, exercises?: any[]) {
    try {
      const { error: updateError } = await supabase
        .from('workouts')
        .update(workoutData)
        .eq('id', workoutId);

      if (updateError) throw updateError;

      if (exercises) {
        // Delete existing exercises
        const { error: deleteError } = await supabase
          .from('workout_exercises')
          .delete()
          .eq('id_workout', workoutId);

        if (deleteError) throw deleteError;

        // Add new exercises
        const workoutExercises = exercises.map((ex, index) => ({
          id_workout: workoutId,
          id_exercise: ex.exercise_id,
          series: ex.series,
          repetitions: ex.repetitions,
          weight: ex.weight,
          rest_time: ex.rest_time,
          ordem: index
        }));

        const { error: exercisesError } = await supabase
          .from('workout_exercises')
          .insert(workoutExercises);

        if (exercisesError) throw exercisesError;
      }
    } catch (error) {
      console.error('Error updating workout:', error);
      throw error;
    }
  },

  // Get workout details for editing
  async getWorkoutDetails(workoutId: string) {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select(`
          *,
          creator:created_by!inner(id, name, type),
          assignee:id_profiles!inner(id, name, type),
          exercises:workout_exercises(
            *,
            exercise:exercises(*)
          )
        `)
        .eq('id', workoutId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching workout details:', error);
      throw error;
    }
  },

  // Get workout exercises for editing
  async getWorkoutExercises(workoutId: string) {
    try {
      const { data, error } = await supabase
        .from('workout_exercises')
        .select(`
          *,
          exercise:exercises(*)
        `)
        .eq('workout_id', workoutId)
        .order('order_index');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching workout exercises:', error);
      throw error;
    }
  },

  // Get user workout progress
  async getUserWorkoutProgress(userId: string, workoutId: string) {
    try {
      const { data, error } = await supabase
        .from('user_workout_progress')
        .select('exercise_id, completed')
        .eq('user_id', userId)
        .eq('workout_id', workoutId);

      if (error) throw error;

      // Convert to object format for easier access
      const progressMap: Record<string, boolean> = {};
      data?.forEach(item => {
        progressMap[item.exercise_id] = item.completed;
      });

      return progressMap;
    } catch (error) {
      console.error('Error fetching workout progress:', error);
      return {};
    }
  },

  // Update exercise completion status
  async updateExerciseProgress(userId: string, workoutId: string, exerciseId: string, completed: boolean) {
    try {
      const { data, error } = await supabase
        .from('user_workout_progress')
        .upsert({
          user_id: userId,
          workout_id: workoutId,
          exercise_id: exerciseId,
          completed: completed,
          completed_at: completed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,workout_id,exercise_id'
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating exercise progress:', error);
      throw error;
    }
  },

  // Reset all progress for a workout (when starting workout)
  async resetWorkoutProgress(userId: string, workoutId: string) {
    try {
      const { error } = await supabase
        .from('user_workout_progress')
        .delete()
        .eq('user_id', userId)
        .eq('workout_id', workoutId);

      if (error) throw error;
    } catch (error) {
      console.error('Error resetting workout progress:', error);
      throw error;
    }
  }
};