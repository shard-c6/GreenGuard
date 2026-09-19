'use client';

import { useCallback, useEffect, useMemo, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Camera, CircleCheck, TriangleAlert, OctagonAlert, CircleX, Minus, Plus, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { adoptionsApi, reportsApi } from '@/services/api';
import type { Adoption, GrowthReport, PlantHealth } from '@/types';

const MAX_PHOTOS = 3;

const HEALTH_OPTIONS: { value: PlantHealth; label: string; icon: React.ReactNode }[] = [
  { value: 'healthy', label: 'Healthy', icon: <CircleCheck className="h-7 w-7 text-green-700 dark:text-green-400" aria-hidden /> },
  { value: 'needs_attention', label: 'Needs attention', icon: <TriangleAlert className="h-7 w-7 text-yellow-700 dark:text-yellow-400" aria-hidden /> },
  { value: 'critical', label: 'Struggling badly', icon: <OctagonAlert className="h-7 w-7 text-red-700 dark:text-red-400" aria-hidden /> },
  { value: 'dead', label: 'Didn’t survive', icon: <CircleX className="h-7 w-7 text-slate-600 dark:text-slate-300" aria-hidden /> },
];

function apiMessage(err: unknown, fallback: string) {
  return (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || fallback;
}

function daysAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

export default function ReportGrowthPage() {
  const { id: adoptionId } = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [adoption, setAdoption] = useState<Adoption | null>(null);
  const [lastReport, setLastReport] = useState<GrowthReport | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error' | 'not-found'>('loading');

  const [photos, setPhotos] = useState<File[]>([]);
  const [health, setHealth] = useState<PlantHealth | null>(null);
  const [height, setHeight] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await adoptionsApi.getAdoption(adoptionId);
      const a = res.data.data;
      setAdoption(a);
      // The last report is context, not a requirement: the form still works without it.
      try {
        const reports = (await reportsApi.getPlantReports(a.plant_id)).data.data;
        const latest = reports[0] ?? null;
        setLastReport(latest);
        if (latest?.height_cm != null) setHeight(String(latest.height_cm));
      } catch {
        setLastReport(null);
      }
      setLoadState('ready');
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setLoadState(status === 404 || status === 403 ? 'not-found' : 'error');
    }
  }, [adoptionId]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) { router.push('/login'); return; }
    if (isAuthenticated) void load();
  }, [authLoading, isAuthenticated, router, load]);

  const retry = () => { setLoadState('loading'); void load(); };

  const previews = useMemo(() => photos.map(f => URL.createObjectURL(f)), [photos]);
  useEffect(() => () => previews.forEach(u => URL.revokeObjectURL(u)), [previews]);

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    setPhotos(prev => [...prev, ...Array.from(files)].slice(0, MAX_PHOTOS));
  };

  const stepHeight = (delta: number) => {
    const current = parseFloat(height);
    const next = Math.max(0, (Number.isNaN(current) ? 0 : current) + delta);
    setHeight(String(next));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!adoption || !health) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('plant_id', adoption.plant_id);
      fd.append('health_status', health);
      if (height.trim()) fd.append('height_cm', height.trim());
      if (notes.trim()) fd.append('notes', notes.trim());
      photos.forEach(f => fd.append('photos', f));
      await reportsApi.createReport(fd);
      toast.success('Report posted. Thank you for checking on it.');
      router.push('/dashboard/adoptions');
    } catch (err) {
      toast.error(apiMessage(err, 'Could not post the report. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const backLink = (
    <Link
      href="/dashboard/adoptions"
      className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-green-700 hover:text-green-800 dark:text-green-400"
    >
      <ArrowLeft className="h-5 w-5" aria-hidden /> My trees
    </Link>
  );

  if (authLoading || loadState === 'loading') {
    return (
      <div className="page-container flex min-h-[60vh] items-center justify-center" role="status">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-100 border-t-green-700" />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  if (loadState === 'not-found') {
    return (
      <div className="page-container max-w-xl">
        {backLink}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-xl font-semibold text-slate-900">This tree isn’t in your list</h1>
          <p className="mt-2 text-base text-slate-600">You can only post growth reports for trees you look after.</p>
        </div>
      </div>
    );
  }

  if (loadState === 'error' || !adoption) {
    return (
      <div className="page-container max-w-xl">
        {backLink}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-xl font-semibold text-slate-900">We couldn’t load this tree</h1>
          <p className="mt-2 text-base text-slate-600">Check your connection and try again.</p>
          <button type="button" onClick={retry} className="btn btn-primary mt-4 min-h-11">Try again</button>
        </div>
      </div>
    );
  }

  const plantName = adoption.plants?.plant_name || 'this tree';

  if (adoption.status !== 'approved') {
    return (
      <div className="page-container max-w-xl">
        {backLink}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-xl font-semibold text-slate-900">
            {adoption.status === 'pending' ? `${plantName} is still under review` : `This application wasn’t approved`}
          </h1>
          <p className="mt-2 text-base text-slate-600">
            {adoption.status === 'pending'
              ? 'You can post growth reports once the NGO approves your application.'
              : 'Only a tree’s guardian can post growth reports for it.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {backLink}

      <div className="mb-6 mt-2">
        <p className="text-[15px] text-slate-600">
          {plantName}{adoption.plants?.address ? ` · ${adoption.plants.address}` : ''}
        </p>
        <h1 className="mt-1 text-[28px] font-bold leading-tight text-slate-900 lg:text-4xl">
          How is {plantName} doing?
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:items-start lg:gap-12">
        {/* Photo */}
        <section aria-labelledby="photo-heading" className="flex flex-col gap-2.5">
          <h2 id="photo-heading" className="text-[17px] font-semibold text-slate-900 lg:text-lg">
            Photo <span className="font-normal text-slate-600">(up to {MAX_PHOTOS})</span>
          </h2>

          {previews.length > 0 && (
            <ul className="grid grid-cols-3 gap-2">
              {previews.map((src, i) => (
                <li key={src} className="relative aspect-square overflow-hidden rounded-xl border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Photo ${i + 1} of ${previews.length}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                    aria-label={`Remove photo ${i + 1}`}
                    className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 text-white"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {photos.length < MAX_PHOTOS && (
            <label className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-green-300 bg-green-50 px-4 text-center text-green-900 dark:border-green-700 dark:bg-green-950/60 dark:text-green-100 focus-within:outline focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-green-600 lg:min-h-[360px]">
              <Camera className="h-9 w-9 text-green-700 dark:text-green-400" aria-hidden />
              <span className="text-[17px] font-semibold">{photos.length ? 'Add another photo' : 'Take a photo'}</span>
              <span className="text-sm text-green-800 dark:text-green-200">or choose from your gallery</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                multiple
                className="sr-only"
                onChange={e => { addPhotos(e.target.files); e.target.value = ''; }}
              />
            </label>
          )}
          <p className="text-sm text-slate-600">Stand in the same spot each time. It makes growth easy to see.</p>
        </section>

        <div className="flex flex-col gap-6">
          {/* Health */}
          <fieldset className="flex flex-col gap-2.5">
            <legend className="mb-2.5 text-[17px] font-semibold text-slate-900 lg:text-lg">How does it look?</legend>
            <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
              {HEALTH_OPTIONS.map(opt => {
                const selected = health === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`flex min-h-[88px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl px-2 text-center text-base text-slate-900 focus-within:outline focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-green-600 ${
                      selected ? 'border-2 border-green-700 bg-green-50 font-semibold dark:border-green-400 dark:bg-green-950' : 'border-[1.5px] border-slate-300 bg-white font-medium dark:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="health"
                      value={opt.value}
                      checked={selected}
                      onChange={() => setHealth(opt.value)}
                      className="sr-only"
                    />
                    {opt.icon}
                    <span>{opt.label}</span>
                  </label>
                );
              })}
            </div>

            {(health === 'needs_attention' || health === 'critical') && (
              <div className="flex flex-col gap-1.5 rounded-xl border border-yellow-200 bg-yellow-50 p-3.5 text-[15px] text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100 sm:flex-row sm:items-center sm:gap-3">
                <span className="flex-1">Not sure what’s wrong? Describe it, or add a close-up photo, to the plant consultant.</span>
                <Link href="/flora-genius-consultant" className="py-1.5 font-semibold text-green-700 hover:text-green-800 dark:text-green-300">
                  Ask the plant consultant
                </Link>
              </div>
            )}
            {health === 'dead' && (
              <p className="rounded-xl border border-slate-300 bg-slate-100 p-3.5 text-[15px] text-slate-700 dark:border-slate-600">
                Thank you for reporting it. The NGO will see this report and can decide whether to replant this spot.
              </p>
            )}
          </fieldset>

          {/* Height */}
          <div className="flex flex-col gap-2.5">
            <label htmlFor="height" className="text-[17px] font-semibold text-slate-900 lg:text-lg">
              Height <span className="font-normal text-slate-600">(optional)</span>
            </label>
            <div className="flex max-w-sm items-center gap-3">
              <button
                type="button"
                onClick={() => stepHeight(-1)}
                aria-label="Decrease height by 1 cm"
                className="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl border-[1.5px] border-slate-300 bg-white text-slate-900 dark:border-slate-600"
              >
                <Minus className="h-5 w-5" aria-hidden />
              </button>
              <div className="relative flex-1">
                <input
                  id="height"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  value={height}
                  onChange={e => setHeight(e.target.value)}
                  className="h-13 w-full rounded-xl border-[1.5px] border-slate-300 bg-white pr-12 dark:border-slate-600 text-center text-xl font-semibold text-slate-900"
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[15px] text-slate-600">cm</span>
              </div>
              <button
                type="button"
                onClick={() => stepHeight(1)}
                aria-label="Increase height by 1 cm"
                className="flex h-13 w-13 shrink-0 items-center justify-center rounded-xl border-[1.5px] border-slate-300 bg-white text-slate-900 dark:border-slate-600"
              >
                <Plus className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <p className="text-sm text-slate-600">
              {lastReport
                ? `Last report: ${lastReport.height_cm != null ? `${lastReport.height_cm} cm, ` : ''}${daysAgo(lastReport.created_at)}`
                : 'This will be the first report for this tree.'}
            </p>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <label htmlFor="notes" className="text-[17px] font-semibold text-slate-900 lg:text-lg">
              Notes <span className="font-normal text-slate-600">(optional)</span>
            </label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="New leaves, dry soil, a broken guard…"
              className="form-textarea min-h-24 text-base"
            />
          </div>

          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-4">
            <button
              type="submit"
              disabled={!health || submitting}
              aria-describedby={!health ? 'submit-hint' : undefined}
              className="min-h-13 rounded-xl bg-green-700 px-8 text-[17px] font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600 dark:disabled:bg-slate-800 dark:disabled:text-slate-300"
            >
              {submitting ? 'Posting…' : 'Post report'}
            </button>
            {!health && (
              <p id="submit-hint" className="text-center text-sm text-slate-600 lg:text-left">
                Choose how the tree looks to post.
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
