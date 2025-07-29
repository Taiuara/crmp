'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          console.log('Firebase user UID:', firebaseUser.uid);
          
          // Primeiro tenta buscar usando o UID como ID do documento
          let userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          let userData = null;
          let docId = firebaseUser.uid;

          if (userDoc.exists()) {
            console.log('Usuário encontrado com UID como ID do documento');
            userData = userDoc.data();
          } else {
            console.log('Usuário não encontrado com UID como ID, buscando por campo UID...');
            // Se não encontrar, busca por UID dentro dos documentos
            const usersQuery = query(collection(db, 'users'), where('uid', '==', firebaseUser.uid));
            const snapshot = await getDocs(usersQuery);
            
            if (!snapshot.empty) {
              console.log('Usuário encontrado por campo UID');
              const userDocData = snapshot.docs[0];
              userData = userDocData.data();
              docId = userDocData.id;
            } else {
              console.log('Usuário não encontrado em nenhuma estrutura');
            }
          }

          if (userData) {
            console.log('Dados do usuário carregados:', userData);
            setUser({
              id: docId,
              email: firebaseUser.email!,
              name: userData.name,
              role: userData.role,
              createdAt: userData.createdAt?.toDate() || new Date(),
            });
          } else {
            console.error('Usuário não encontrado no Firestore:', firebaseUser.uid);
            setUser(null);
          }
          setFirebaseUser(firebaseUser);
        } else {
          console.log('Nenhum usuário logado');
          setUser(null);
          setFirebaseUser(null);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        setUser(null);
        setFirebaseUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, logout }}>
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
