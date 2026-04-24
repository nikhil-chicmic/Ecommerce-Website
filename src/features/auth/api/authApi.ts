import type { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const USERS_KEY = 'registered_users';

const getUsers = (): (User & { password?: string })[] => {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveUsers = (users: any[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await delay(1000); // Simulate network latency
    
    if (!credentials.email || !credentials.password) {
      throw new Error('Email and password are required');
    }

    const users = getUsers();
    const user = users.find(u => u.email === credentials.email && u.password === credentials.password);

    if (user) {
      // Don't leak password in state
      const { password, ...safeUser } = user;
      return {
        user: safeUser as User,
        token: `jwt_${Math.random().toString(36).substring(2)}_${safeUser.id}`,
      };
    }
    
    throw new Error('Invalid email or password');
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    await delay(1200); // Simulate network latency
    
    if (!credentials.email || !credentials.password || !credentials.name) {
      throw new Error('All fields are required');
    }

    const users = getUsers();
    if (users.some(u => u.email === credentials.email)) {
      throw new Error('An account with this email already exists');
    }

    const newUser = {
      id: Math.random().toString(36).substring(2, 9),
      email: credentials.email,
      name: credentials.name,
      password: credentials.password, // Stored locally for mock verification
    };

    saveUsers([...users, newUser]);

    const { password, ...safeUser } = newUser;

    return {
      user: safeUser as User,
      token: `jwt_new_${safeUser.id}`,
    };
  }
};
