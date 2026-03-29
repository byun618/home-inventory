'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { InviteInfo } from '@home-inventory/shared-types';
import { useAuth } from '@/lib/auth';
import { api, ApiError } from '@/lib/api';
import styles from './page.module.css';

export default function InviteAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const token = params.token as string;

  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    api
      .get<InviteInfo>(`/invites/${token}`)
      .then(setInfo)
      .catch((err) => {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('초대 정보를 불러올 수 없어요');
        }
      });
  }, [token]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await api.post(`/invites/${token}/accept`);
      router.push('/');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      }
    } finally {
      setAccepting(false);
    }
  };

  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.errorText}>{error}</p>
        <button
          className={styles.button}
          onClick={() => router.push('/login')}
        >
          로그인하기
        </button>
      </div>
    );
  }

  if (!info) {
    return (
      <div className={styles.container}>
        <p>불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>🏠 {info.householdName}</h1>
      <p className={styles.subtitle}>
        {info.invitedByName}님이 초대했어요
      </p>

      {!authLoading && !user ? (
        <div className={styles.actions}>
          <p className={styles.hint}>로그인 후 참여할 수 있어요</p>
          <button
            className={styles.button}
            onClick={() => router.push(`/login?redirect=/invite/${token}`)}
          >
            로그인
          </button>
          <button
            className={styles.secondaryButton}
            onClick={() => router.push(`/signup?redirect=/invite/${token}`)}
          >
            회원가입
          </button>
        </div>
      ) : (
        <button
          className={styles.button}
          onClick={handleAccept}
          disabled={accepting}
        >
          {accepting ? '참여 중...' : '참여하기'}
        </button>
      )}
    </div>
  );
}
