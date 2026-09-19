'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, Sprout } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { adoptionsApi } from '@/services/api';
import type { Adoption } from '@/types';
import EmptyState from '@/components/ui/EmptyState';

/**
 * Growth reports are posted from a specific tree (/dashboard/adoptions/[id]/reports).
 * This page only picks the tree, and skips straight to it when there is just one.
 */
export default function NewReportPage() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [trees, setTrees] = useState<Adoption[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');

  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.push('/login'); return; }
    if (!isAuthenticated) return;
    adoptionsApi.getMyAdoptions()
      .then(res => {
        const approved = res.data.data.filter(a => a.status === 'approved');
        if (approved.length === 1) {
          router.replace(`/dashboard/adoptions/${approved[0].id}/reports`);
          return;
        }
        setTrees(approved);
        setLoadState('ready');
      })
      .catch(() => setLoadState('error'));
  }, [authLoading, isAuthenticated, router, attempt]);

  const retry = () => { setLoadState('loading'); setAttempt(n => n + 1); };

  if (authLoading || loadState === 'loading') {
    return (
      <div className="page-container flex min-h-[60vh] items-center justify-center" role="status">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-green-700" />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  return (
    <div className="page-container max-w-xl">
      <Link
        href="/dashboard/reports"
        className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-green-700 hover:text-green-800"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden /> Reports
      </Link>
      <h1 className="mb-6 mt-2 text-[28px] font-bold leading-tight text-slate-900">Which tree are you reporting on?</h1>

      {loadState === 'error' ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <p className="text-base text-slate-700">We couldn’t load your trees. Check your connection and try again.</p>
          <button type="button" onClick={retry} className="btn btn-primary mt-4 min-h-11">Try again</button>
        </div>
      ) : trees.length === 0 ? (
        <EmptyState
          icon={<Sprout className="mb-4 h-12 w-12 text-green-700" aria-hidden />}
          title="No trees to report on yet"
          description="Once an NGO approves your adoption, you can post growth reports for that tree here."
          action={<Link href="/plants" className="btn btn-primary min-h-11">Find a tree near you</Link>}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {trees.map(t => (
            <li key={t.id}>
              <Link
                href={`/dashboard/adoptions/${t.id}/reports`}
                className="flex min-h-16 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 hover:border-green-700"
              >
                <span className="flex flex-col">
                  <span className="text-base font-semibold">{t.plants?.plant_name || 'Unnamed tree'}</span>
                  {t.plants?.address && <span className="text-sm text-slate-600">{t.plants.address}</span>}
                </span>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-600" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
