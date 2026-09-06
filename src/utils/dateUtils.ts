/**
 * Helper utility to enforce the 15-day teacher name change restriction policy
 * (يمكن تعديل الاسم الخاص به بعد ١٥ يوم)
 */

export interface NameChangeStatus {
  allowed: boolean;
  daysRemaining: number;
  nextAllowedDate: Date | null;
  formattedNextDate?: string;
}

export function checkNameChangeEligibility(lastChangedDate?: string): NameChangeStatus {
  if (!lastChangedDate) {
    return {
      allowed: true,
      daysRemaining: 0,
      nextAllowedDate: null
    };
  }

  const lastDate = new Date(lastChangedDate);
  if (isNaN(lastDate.getTime())) {
    return {
      allowed: true,
      daysRemaining: 0,
      nextAllowedDate: null
    };
  }

  const now = new Date();
  const diffMs = now.getTime() - lastDate.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const LOCK_DAYS = 15;

  if (diffDays >= LOCK_DAYS) {
    return {
      allowed: true,
      daysRemaining: 0,
      nextAllowedDate: null
    };
  }

  const daysRemaining = Math.max(1, Math.ceil(LOCK_DAYS - diffDays));
  const nextAllowedDate = new Date(lastDate.getTime() + LOCK_DAYS * 24 * 60 * 60 * 1000);

  const formattedNextDate = nextAllowedDate.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return {
    allowed: false,
    daysRemaining,
    nextAllowedDate,
    formattedNextDate
  };
}
