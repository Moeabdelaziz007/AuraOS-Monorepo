import { createContext, useContext } from 'react';

// Define a placeholder type for the context value
export interface AuthContextType {
  user: any | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => useContext(AuthContext);