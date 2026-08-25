"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card/Card';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import styles from './search.module.css';

export default function SearchPage() {
  const params = useParams();
  const role = params.role as string;
  const [code, setCode] = useState('');
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    setError('');
    setUser(null);

    try {
      const res = await fetch(`/api/users/search?code=${encodeURIComponent(code)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'User not found');
      }

      setUser(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Find User</h1>
        <p className={styles.subtitle}>Search for anyone on Thikana using their unique code.</p>
      </div>

      <Card>
        <form onSubmit={handleSearch} className={styles.form}>
          <div className={styles.inputGroup}>
            <Input 
              label="Unique Code"
              placeholder="e.g. TK-1A2B3C"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <Button type="submit" variant="primary" disabled={isLoading} className={styles.searchBtn}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </form>

        {error && (
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>{error}</p>
          </div>
        )}

        {user && (
          <div className={styles.resultContainer}>
            <h2 className={styles.sectionTitle}>User Found</h2>
            <div className={styles.userCard}>
              <div className={styles.userInfo}>
                <strong>Name:</strong> <span>{user.name}</span>
              </div>
              <div className={styles.userInfo}>
                <strong>Role:</strong> <span>{user.role}</span>
              </div>
              <div className={styles.userInfo}>
                <strong>Email:</strong> <span>{user.email}</span>
              </div>
              <div className={styles.userInfo}>
                <strong>Unique Code:</strong> <span>{user.uniqueCode}</span>
              </div>
            </div>
            
            {user.role === 'LANDLORD' && (
              <div style={{ marginTop: '2rem' }}>
                <h3 className={styles.sectionTitle}>Published Properties</h3>
                {user.ownedProperties && user.ownedProperties.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                    {user.ownedProperties.map((prop: any) => (
                      <Card key={prop.id} padding="md" shadow="sm">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h4 style={{ fontWeight: 600, fontSize: '1.125rem' }}>{prop.title}</h4>
                            <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>{prop.propertyType} • {prop.city}</p>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontWeight: 600 }}>৳{prop.rent.toLocaleString()}/mo</span>
                            <Link href={`/${role}/properties/${prop.id}`}>
                              <Button variant="outline" size="sm">View Details</Button>
                            </Link>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--color-muted)', marginTop: '1rem', fontStyle: 'italic' }}>
                    This landlord does not have any active, published properties at the moment. (Drafts are hidden from tenants).
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
