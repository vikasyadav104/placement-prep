import { createContext, useState, useEffect } from 'react';
import api from '../services/api';

// 1. Create the actual Loudspeaker system
export const AuthContext = createContext();

// 2. Create the Principal's Office that controls the Loudspeaker
export const AuthProvider = ({ children }) => {
  // The principal's notepad of who is currently in the school
  const [user, setUser] = useState(null);
  
  // A "Please Wait" sign while the principal checks the backpack in the morning
  const [loading, setLoading] = useState(true);

  // This runs ONE time when the app first opens
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // If they have a pass from yesterday, let them in!
      setUser({ isLoggedIn: true });
    }
    setLoading(false); // Take down the "Please Wait" sign
  }, []);

  // The actual login process
  const login = async (email, password) => {
    // Send mail carrier to backend
    const response = await api.post('/auth/login', { email, password });
    
    // Grab token from backend response
    const { token } = response.data;
    
    // Put token in the backpack
    localStorage.setItem('token', token);
    
    // Announce on the loudspeaker that they are logged in
    setUser({ isLoggedIn: true });
  };

  // The logout process
  const logout = () => {
    localStorage.removeItem('token'); // Empty the backpack
    setUser(null); // Erase the principal's notepad
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};