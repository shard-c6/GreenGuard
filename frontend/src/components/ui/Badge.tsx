import React from 'react';
import type { PlantStatus, PlantHealth, AdoptionStatus, NgoStatus, UserRole } from '@/types';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'primary';

const statusVariantMap: Record<string, BadgeVariant> = {
  // Plant status
  available: 'success',
  pending: 'warning',
  adopted: 'info',
  // Adoption status
  approved: 'success',
  rejected: 'danger',
  // Health
  healthy: 'success',
  needs_attention: 'warning',
  critical: 'danger',
  dead: 'neutral',
  // NGO status
  suspended: 'danger',
  // Role
  admin: 'primary',
  ngo: 'info',
  adopter: 'success',
};

interface BadgeProps {
  status: PlantStatus | PlantHealth | AdoptionStatus | NgoStatus | UserRole | string;
  className?: string;
}

export default function Badge({ status, className = '' }: BadgeProps) {
  const variant = statusVariantMap[status] || 'neutral';
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  return (
    <span className={`badge badge-${variant} ${className}`}>
      {label}
    </span>
  );
}
