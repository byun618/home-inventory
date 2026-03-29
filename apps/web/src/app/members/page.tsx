'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { HouseholdMember } from '@home-inventory/shared-types';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import styles from './page.module.css';

export default function MembersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      api
        .get<HouseholdMember[]>('/households/me/members')
        .then(setMembers)
        .catch(() => {});
    }
  }, [authLoading, user, router]);

  const handleInvite = async () => {
    try {
      const data = await api.post<{ inviteUrl: string }>('/invites');
      const url = `${window.location.origin}${data.inviteUrl}`;

      if (navigator.share) {
        await navigator.share({
          title: '우리집 초대',
          text: '우리집에 초대합니다!',
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // ignore
    }
  };

  const handleCopyLink = async () => {
    try {
      const data = await api.post<{ inviteUrl: string }>('/invites');
      const url = `${window.location.origin}${data.inviteUrl}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  if (authLoading || !user) return null;

  return (
    <>
      <Header title="같이 쓰는 사람들" onBackClick={() => router.back()} />

      <div className={styles.list}>
        {members.map((member) => (
          <div key={member.userId} className={styles.member}>
            <span className={styles.emoji}>{member.profileEmoji}</span>
            <div className={styles.info}>
              <p className={styles.name}>{member.name}</p>
              <p className={styles.role}>
                {member.role === 'admin' ? '관리자' : ''}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <button className={styles.primaryButton} onClick={handleInvite}>
          초대 링크 보내기
        </button>
        <button className={styles.secondaryButton} onClick={handleCopyLink}>
          {copied ? '링크가 복사됐어요' : '링크 복사'}
        </button>
      </div>
    </>
  );
}
