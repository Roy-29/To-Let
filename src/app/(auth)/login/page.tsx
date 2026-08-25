"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Card } from '@/components/ui/Card/Card';
import styles from '../auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Failed to login');
      }
      
      // Redirect based on role
      const userRole = data.data?.role;
      if (userRole === 'ADMIN') router.push('/dashboard'); // Admin dashboard
      else if (userRole === 'LANDLORD') router.push('/dashboard');
      else router.push('/dashboard');
      
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <Card className={styles.authCard} padding="lg" shadow="md">
        <div className={styles.header}>
          <Link href="/homepage" className={styles.logo}>Thikana</Link>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Enter your details to access your account.</p>
        </div>
        
        {error && <div className={styles.errorAlert}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input 
            label="Email" 
            name="email" 
            type="email" 
            required 
            placeholder="john@example.com"
          />
          <div className={styles.passwordGroup}>
            <Input 
              label="Password" 
              name="password" 
              type={showPassword ? "text" : "password"} 
              required 
              placeholder="••••••••"
            />
            <label className={styles.showPasswordLabel}>
              <input 
                type="checkbox" 
                checked={showPassword} 
                onChange={(e) => setShowPassword(e.target.checked)} 
              />
              Show password
            </label>
          </div>
          
          <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
            Log in
          </Button>
        </form>
        
        <div className={styles.footer}>
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className={styles.link}>Sign up</Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
