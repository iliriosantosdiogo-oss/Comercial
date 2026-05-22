/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { Store } from './types';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import StoreFront from './pages/StoreFront';
import Navbar from './components/Navbar';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  store: Store | null;
  setStore: (store: Store | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  store: null,
  setStore: () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Fetch user's store
        const q = query(collection(db, 'stores'), where('ownerId', '==', u.uid));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setStore({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Store);
        }
      } else {
        setStore(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, store, setStore }}>
      <BrowserRouter>
        <div className="min-h-screen bg-zinc-50 flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/s/:slug" element={<StoreFront />} />
              <Route 
                path="/dashboard/*" 
                element={user ? (store ? <Dashboard /> : <Navigate to="/onboarding" />) : <Navigate to="/login" />} 
              />
              <Route 
                path="/onboarding" 
                element={user ? (store ? <Navigate to="/dashboard" /> : <Onboarding />) : <Navigate to="/login" />} 
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
