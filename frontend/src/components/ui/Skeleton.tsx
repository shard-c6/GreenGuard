import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export default function Skeleton({ className = '', variant = 'rectangular', width, height, count = 1 }: SkeletonProps) {
  const elements = Array.from({ length: count }, (_, i) => (
    <div
      key={i}
      className={`skeleton skeleton-${variant} ${className}`}
      style={{ width, height }}
    />
  ));

  return <>{elements}</>;
}

export function CardSkeleton() {
  return (
    <div className="card">
      <Skeleton height={200} className="skeleton-image" />
      <div className="card-body" style={{ padding: '1rem' }}>
        <Skeleton height={20} width="70%" />
        <Skeleton height={14} width="50%" />
        <Skeleton height={14} width="90%" />
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-card">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton height={16} width="60%" />
            <Skeleton height={12} width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
}
