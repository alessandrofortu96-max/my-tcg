// Mock authentication system
// Credenziali di test
const MOCK_ADMIN_EMAIL = 'admin@my-tcg.it';
const MOCK_ADMIN_PASSWORD = 'admin123';

export interface MockUser {
  id: string;
  email: string;
  isAdmin: boolean;
}

// Chiave per localStorage
const AUTH_KEY = 'my-tcg-mock-auth';

export const mockAuth = {
  // Login
  login: async (email: string, password: string): Promise<{ user: MockUser | null; error: string | null }> => {
    // Simula delay rete
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (email === MOCK_ADMIN_EMAIL && password === MOCK_ADMIN_PASSWORD) {
      const user: MockUser = {
        id: 'mock-admin-id',
        email: MOCK_ADMIN_EMAIL,
        isAdmin: true,
      };
      
      // Salva in localStorage
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      
      return { user, error: null };
    }
    
    return { 
      user: null, 
      error: 'Email o password non corretti' 
    };
  },

  // Logout
  logout: async (): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    localStorage.removeItem(AUTH_KEY);
  },

  // Get current user
  getCurrentUser: (): MockUser | null => {
    const stored = localStorage.getItem(AUTH_KEY);
    if (!stored) return null;
    
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  // Check if logged in
  isAuthenticated: (): boolean => {
    return mockAuth.getCurrentUser() !== null;
  },
};

// Credenziali di test (da mostrare nella UI)
export const MOCK_CREDENTIALS = {
  email: MOCK_ADMIN_EMAIL,
  password: MOCK_ADMIN_PASSWORD,
};
