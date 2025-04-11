import { useState } from 'react';

type AuthMode = 'login' | 'register' | 'recovery';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (mode: AuthMode, formData: FormData) => {
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const response = await fetch('http://localhost:3000/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        // TODO: Save token and redirect using global state management
      } else if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }

        const response = await fetch('http://localhost:3000/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        // TODO: Save token and redirect using global state management
      } else if (mode === 'recovery') {
        const response = await fetch('http://localhost:3000/auth/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: formData.email }),
        });

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        alert('Recovery email sent! Please check your inbox.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  return {
    handleSubmit,
    handleGoogleLogin,
    isLoading,
    error,
  };
}; 