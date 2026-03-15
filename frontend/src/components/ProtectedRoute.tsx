import React, { useEffect, useState, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { refreshToken } from '../api/authApi';
import { setAccessToken } from '../api/candidatesApi';

type Status = 'pending' | 'authenticated' | 'unauthenticated';

interface Props {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: Props) {
  const { accessToken, setAccessToken: storeToken } = useAuth();
  const [status, setStatus] = useState<Status>(accessToken ? 'authenticated' : 'pending');

  useEffect(() => {
    if (accessToken) {
      setStatus('authenticated');
      return;
    }

    let cancelled = false;

    refreshToken()
      .then(({ accessToken: token }) => {
        if (cancelled) return;
        storeToken(token);
        setAccessToken(token);
        setStatus('authenticated');
      })
      .catch(() => {
        if (!cancelled) setStatus('unauthenticated');
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, storeToken]);

  if (status === 'pending') {
    return null;
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
