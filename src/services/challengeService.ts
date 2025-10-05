import { supabase } from './supabase';

export interface Challenge {
  id?: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  image_url?: string;
  is_public: boolean;
  invite_code?: string;
  reward_points: number;
  target_value?: string;
  challenge_type: 'participation' | 'repetitions' | 'frequency' | 'custom';
  created_by?: string;
  academy_id?: string;
  created_at?: string;
  updated_at?: string;
  participant_count?: number;
  is_participating?: boolean;
  user_progress?: number;
}

export interface ChallengeParticipant {
  id?: string;
  challenge_id: string;
  user_id: string;
  joined_at?: string;
  progress: string;
  completed: boolean;
  completed_at?: string;
  points_earned: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export const challengeService = {
  // Get challenges for current user based on their role and visibility rules
  async getChallenges(userId: string, userProfile: any, filter: 'active' | 'completed' | 'all' = 'all') {
    try {
      let query = supabase
        .from('challenges')
        .select(`
          *,
          participant_count:challenge_participants(count),
          is_participating:challenge_participants!left(user_id)
        `);

      // Apply visibility filters based on user type
      if (userProfile.type === 'academia') {
        // Academia sees:
        // 1. All challenges they created (both public and private)
        // 2. All public challenges from any academy (for participation)
        // 3. Private challenges they participate in
        const { data: participantChallenges } = await supabase
          .from('challenge_participants')
          .select('challenge_id')
          .eq('user_id', userId);

        const visibilityConditions = [
          `created_by.eq.${userId}`, // Challenges they created
          `is_public.eq.true` // All public challenges
        ];

        if (participantChallenges && participantChallenges.length > 0) {
          const challengeIds = participantChallenges.map(p => p.challenge_id).join(',');
          visibilityConditions.push(`and(is_public.eq.false,id.in.(${challengeIds}))`);
        }

        query = query.or(visibilityConditions.join(','));
      } else if (userProfile.type === 'aluno' || userProfile.type === 'personal') {
        // Students and personals see:
        // 1. Public challenges from their academy
        // 2. Private challenges they participate in
        // 3. Challenges they created
        const academyId = userProfile.academy_id;

        // Get challenges they participate in
        const { data: participantChallenges } = await supabase
          .from('challenge_participants')
          .select('challenge_id')
          .eq('user_id', userId);

        const visibilityConditions = [
          `created_by.eq.${userId}` // Challenges they created
        ];

        // Only add academy filter if academyId exists
        if (academyId) {
          visibilityConditions.push(`and(is_public.eq.true,academy_id.eq.${academyId})`);
        }

        if (participantChallenges && participantChallenges.length > 0) {
          const challengeIds = participantChallenges.map(p => p.challenge_id).join(',');
          visibilityConditions.push(`and(is_public.eq.false,id.in.(${challengeIds}))`);
        }

        query = query.or(visibilityConditions.join(','));
      } else if (userProfile.type === 'admin') {
        // Admin sees all challenges - no filters needed
      }

      // Apply time-based filters
      const now = new Date().toISOString().split('T')[0]; // Get date part only
      if (filter === 'active') {
        query = query.gte('end_date', now);
      } else if (filter === 'completed') {
        query = query.lt('end_date', now);
      }

      // Order by start date
      query = query.order('start_date', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Process data to include participant count and participation status
      const processedData = data?.map(challenge => ({
        ...challenge,
        participant_count: challenge.participant_count?.[0]?.count || 0,
        is_participating: challenge.is_participating?.some((p: any) => p.user_id === userId) || false
      }));

      return processedData || [];
    } catch (error) {
      console.error('Error fetching challenges:', error);
      throw error;
    }
  },

  // Get single challenge details
  async getChallengeDetails(challengeId: string) {
    try {
      const { data: challenge, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', challengeId)
        .single();

      if (error) throw error;

      // Get creator info
      const { data: creator } = await supabase
        .from('profiles')
        .select('id, name, type')
        .eq('id', challenge.created_by)
        .single();

      // Get academy info if exists
      let academy = null;
      if (challenge.academy_id) {
        const { data: academyData } = await supabase
          .from('profiles')
          .select('id, name')
          .eq('id', challenge.academy_id)
          .single();
        academy = academyData;
      }

      // Get participants with user info
      const { data: participantsData } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('challenge_id', challengeId);

      // Get user info for each participant
      const participants = await Promise.all(
        (participantsData || []).map(async (participant) => {
          const { data: user } = await supabase
            .from('profiles')
            .select('id, name, email')
            .eq('id', participant.user_id)
            .single();
          return {
            ...participant,
            user
          };
        })
      );

      const data = {
        ...challenge,
        creator,
        academy,
        participants
      };

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching challenge details:', error);
      throw error;
    }
  },

  // Generate unique invite code
  generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },

  // Create new challenge
  async createChallenge(challengeData: Omit<Challenge, 'id' | 'created_at' | 'updated_at'>, userProfile: any) {
    try {
      // Academia: always public (visible to all students in the academy)
      // Aluno/Personal: always private (invite link only)
      const isPublic = userProfile.type === 'academia' ? true : false;

      const academyId = userProfile.type === 'academia'
        ? userProfile.id
        : userProfile.academy_id;

      // Generate invite code for all challenges (public and private)
      const inviteCode = this.generateInviteCode();

      const { data, error } = await supabase
        .from('challenges')
        .insert({
          ...challengeData,
          is_public: isPublic,
          created_by: userProfile.id,
          academy_id: academyId,
          invite_code: inviteCode
        })
        .select()
        .single();

      if (error) throw error;

      // Automatically add creator as participant
      if (data) {
        await this.joinChallenge(data.id, userProfile.id);
      }

      return data;
    } catch (error) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  },

  // Update challenge
  async updateChallenge(challengeId: string, updates: Partial<Challenge>) {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .update(updates)
        .eq('id', challengeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating challenge:', error);
      throw error;
    }
  },

  // Delete challenge
  async deleteChallenge(challengeId: string) {
    try {
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', challengeId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting challenge:', error);
      throw error;
    }
  },

  // Join challenge
  async joinChallenge(challengeId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: userId,
          progress: '0',
          completed: false,
          points_earned: '0'
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Você já está participando deste desafio');
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error joining challenge:', error);
      throw error;
    }
  },

  // Join challenge by invite code
  async joinChallengeByCode(inviteCode: string, userId: string) {
    try {
      // Get user profile to check eligibility
      const { data: userProfile, error: userError } = await supabase
        .from('profiles')
        .select('id, type, academy_id')
        .eq('id', userId)
        .single();

      if (userError || !userProfile) {
        throw new Error('Usuário não encontrado');
      }

      // Find the challenge with detailed info
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .select(`
          id,
          name,
          is_public,
          academy_id,
          created_by,
          start_date,
          end_date
        `)
        .eq('invite_code', inviteCode)
        .single();

      if (challengeError || !challenge) {
        throw new Error('Código de convite inválido ou desafio não encontrado');
      }

      // Check if challenge is still active
      const now = new Date();
      const endDate = new Date(challenge.end_date);
      if (endDate < now) {
        throw new Error('Este desafio já foi encerrado');
      }

      // For private challenges, anyone with the invite code can join
      // For public challenges, only users from the same academy can join
      if (challenge.is_public) {
        if (userProfile.type === 'aluno' || userProfile.type === 'personal') {
          if (userProfile.academy_id !== challenge.academy_id) {
            throw new Error('Você não pode participar de desafios de outras academias');
          }
        }
      }

      // Check if user is already participating
      const { data: existingParticipation } = await supabase
        .from('challenge_participants')
        .select('id')
        .eq('challenge_id', challenge.id)
        .eq('user_id', userId)
        .single();

      if (existingParticipation) {
        throw new Error('Você já está participando deste desafio');
      }

      // Join the challenge
      return await this.joinChallenge(challenge.id, userId);
    } catch (error) {
      console.error('Error joining challenge by code:', error);
      throw error;
    }
  },

  // Leave challenge
  async leaveChallenge(challengeId: string, userId: string) {
    try {
      const { error } = await supabase
        .from('challenge_participants')
        .delete()
        .eq('challenge_id', challengeId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error leaving challenge:', error);
      throw error;
    }
  },

  // Update participant progress
  async updateProgress(challengeId: string, userId: string, progress: string, completed: boolean = false) {
    try {
      const updates: any = {
        progress,
        completed
      };

      if (completed) {
        updates.completed_at = new Date().toISOString();

        // Get challenge to calculate points
        const { data: challenge } = await supabase
          .from('challenges')
          .select('reward_points')
          .eq('id', challengeId)
          .single();

        if (challenge) {
          updates.points_earned = String(challenge.reward_points);
        }
      }

      const { data, error } = await supabase
        .from('challenge_participants')
        .update(updates)
        .eq('challenge_id', challengeId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  },

  // Get user's total points
  async getUserPoints(userId: string) {
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select('points_earned')
        .eq('user_id', userId)
        .eq('completed', true);

      if (error) throw error;

      const totalPoints = data?.reduce((sum, p) => sum + (parseInt(p.points_earned) || 0), 0) || 0;
      return totalPoints;
    } catch (error) {
      console.error('Error fetching user points:', error);
      return 0;
    }
  },

  // Search challenges by name
  async searchChallenges(searchTerm: string, userProfile: any) {
    try {
      const challenges = await this.getChallenges(userProfile.id, userProfile, 'all');

      const filtered = challenges.filter(challenge =>
        challenge.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return filtered;
    } catch (error) {
      console.error('Error searching challenges:', error);
      throw error;
    }
  },

  // Distribute points to all participants when challenge ends
  async distributePointsForCompletedChallenge(challengeId: string) {
    try {
      // Get challenge details
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .select('end_date, reward_points')
        .eq('id', challengeId)
        .single();

      if (challengeError) throw challengeError;

      // Check if challenge has ended
      const now = new Date();
      const endDate = new Date(challenge.end_date);
      if (endDate > now) {
        return { success: false, message: 'Challenge has not ended yet' };
      }

      // Get all participants
      const { data: participants, error: participantsError } = await supabase
        .from('challenge_participants')
        .select('user_id')
        .eq('challenge_id', challengeId);

      if (participantsError) throw participantsError;

      // Distribute points to all participants
      for (const participant of participants) {
        // Get current points
        const { data: profile } = await supabase
          .from('profiles')
          .select('points')
          .eq('id', participant.user_id)
          .single();

        const currentPoints = profile?.points || 0;
        const newPoints = currentPoints + challenge.reward_points;

        // Update points
        await supabase
          .from('profiles')
          .update({ points: newPoints })
          .eq('id', participant.user_id);
      }

      return { success: true, message: `Points distributed to ${participants.length} participants` };
    } catch (error) {
      console.error('Error distributing points:', error);
      throw error;
    }
  }
};