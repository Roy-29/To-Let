"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Card } from '@/components/ui/Card/Card';
import styles from '../auth.module.css';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') === 'LANDLORD' ? 'LANDLORD' : 'TENANT';
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const role = formData.get('role');
    
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error?.message || data.message || 'Failed to sign up');
      }
      
      // Navigate to dashboard
      router.push('/dashboard');
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
          <Link href="/" className={styles.logo}>Thikana</Link>
          <h1 className={styles.title}>Create an account</h1>
          <p className={styles.subtitle}>Join Thikana to find or list properties.</p>
        </div>
        
        {error && <div className={styles.errorAlert}>{error}</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <Input 
            label="Full Name" 
            name="name" 
            type="text" 
            required 
            placeholder="John Doe"
          />
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
          
          <div>
            <span className={styles.radioGroupLabel}>I am a:</span>
            <div className={styles.radioGroup}>
              <label className={styles.radioLabel}>
                <input type="radio" name="role" value="TENANT" defaultChecked={defaultRole === 'TENANT'} />
                Tenant
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" name="role" value="LANDLORD" defaultChecked={defaultRole === 'LANDLORD'} />
                Landlord
              </label>
            </div>
          </div>
          
          <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
            Sign up
          </Button>
        </form>
        
        <div className={styles.footer}>
          <p>
            Already have an account?{' '}
            <Link href="/login" className={styles.link}>Log in</Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupForm />
    </Suspense>
  );
}
