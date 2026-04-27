import { supabase } from '../../../lib/supabase';
import type { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types';

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;

    if (!data.user || !data.session) {
      throw new Error('Authentication failed');
    }

    // Fetch profile data
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      name: profile?.full_name || data.user.user_metadata?.full_name || 'User',
      avatar: profile?.avatar_url || data.user.user_metadata?.avatar_url,
    };

    return {
      user,
      token: data.session.access_token,
    };
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          full_name: credentials.name,
        },
      },
    });

    if (error) throw error;

    if (!data.user) {
      throw new Error('Registration failed');
    }

    // Create profile in profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: data.user.id,
          email: credentials.email,
          full_name: credentials.name,
          provider: 'email',
        },
      ]);

    if (profileError) {
      console.error('Error creating profile:', profileError);
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      name: credentials.name,
    };

    return {
      user,
      token: data.session?.access_token || '',
    };
  },

  async loginWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) throw error;
    return data;
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async syncProfile(user: any): Promise<void> {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      await supabase.from('profiles').insert([
        {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          avatar_url: user.user_metadata?.avatar_url,
          provider: user.app_metadata?.provider || 'email',
        },
      ]);
    }
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Ensure profile exists (especially for OAuth users)
    await this.syncProfile(user);

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      id: user.id,
      email: user.email || '',
      name: profile?.full_name || user.user_metadata?.full_name || 'User',
      avatar: profile?.avatar_url || user.user_metadata?.avatar_url,
    };
  },
};
