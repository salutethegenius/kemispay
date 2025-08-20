import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "./queryClient";

export interface Vendor {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  balance: string;
  totalEarned: string;
  lastPayoutDate?: string;
  bankAccount?: string;
  stripeCustomerId?: string;
}

interface AuthContextType {
  vendor: Vendor | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, vendor: Vendor) => Promise<void>;
  logout: () => Promise<void>;
  refreshVendor: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on app start
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token and get vendor data
      fetchVendorProfile(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchVendorProfile = async (token: string) => {
    try {
      setIsLoading(true);
      // Set token FIRST before making any requests
      setAuthToken(token);
      
      // Small delay to ensure token is set globally
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response = await fetch('/api/vendor/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const vendorData = await response.json();
        setVendor(vendorData);
        setIsAuthenticated(true);
      } else if (response.status === 401) {
        // Token is invalid, remove it
        console.log('Token expired or invalid, clearing session');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setVendor(null);
        delete (window as any).__kemispay_token;
      } else {
        // Other error, don't clear token immediately
        console.error('Error fetching profile:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch vendor profile:', error);
      // Don't immediately clear token on network errors
    } finally {
      setIsLoading(false);
    }
  };

  const setAuthToken = (token: string) => {
    // Store token globally for apiRequest function to use
    (window as any).__kemispay_token = token;
    localStorage.setItem('token', token);
  };

  const login = async (token: string, vendorData: Vendor) => {
    // Set token and storage first
    setAuthToken(token);
    localStorage.setItem('token', token);
    
    // Then update auth state
    setVendor(vendorData);
    setIsAuthenticated(true);
    
    // Small delay to ensure everything is set
    await new Promise(resolve => setTimeout(resolve, 100));
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await apiRequest('POST', '/api/auth/logout', {});
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setVendor(null);
      setIsAuthenticated(false);
      delete (window as any).__kemispay_token;
    }
  };

  const refreshVendor = async () => {
    const token = localStorage.getItem('token');
    if (token && isAuthenticated) {
      await fetchVendorProfile(token);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      vendor, 
      isAuthenticated, 
      isLoading, 
      login, 
      logout, 
      refreshVendor 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
