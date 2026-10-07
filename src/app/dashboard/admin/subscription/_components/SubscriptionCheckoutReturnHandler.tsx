'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/ToastService';
import {
  CHECKOUT_PENDING_KEY,
  buildCheckoutReturnRoute,
  clearCheckoutPending,
  getCheckoutReturnPath,
  isCheckoutPending,
  pollUntilSubscriptionActive,
  sameReturnPath,
} from './checkoutFlow';

/**
 * Runs on every dashboard page: restores the route where checkout started,
 * then polls billing/current until ACTIVE|TRIALING after Stripe success.
 */
export function SubscriptionCheckoutReturnHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const handlingRef = useRef(false);

  useEffect(() => {
    const checkoutOutcome = searchParams.get('subscription_checkout');
    const pending = isCheckoutPending();
    const storedPath = getCheckoutReturnPath();

    if (!pending && checkoutOutcome) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('subscription_checkout');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
      return;
    }

    if (!pending) return;
    if (handlingRef.current) return;

    const currentPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    if (checkoutOutcome === 'cancel') {
      clearCheckoutPending();
      const params = new URLSearchParams(searchParams.toString());
      params.delete('subscription_checkout');
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
      toast.info('Checkout cancelled.');
      return;
    }

    if (storedPath && !sameReturnPath(storedPath, currentPath)) {
      router.replace(
        buildCheckoutReturnRoute(storedPath, checkoutOutcome === 'cancel' ? 'cancel' : 'success')
      );
      return;
    }

    // Poll only after Stripe success (query param or backend success_url without param on stored route).
    const pendingSince = Number(sessionStorage.getItem(CHECKOUT_PENDING_KEY) ?? 0);
    const recentCheckout = pendingSince > 0 && Date.now() - pendingSince < 30 * 60 * 1000;
    const onStoredRoute = storedPath && sameReturnPath(storedPath, currentPath);
    const shouldPoll =
      checkoutOutcome === 'success' || (recentCheckout && onStoredRoute && checkoutOutcome !== 'cancel');

    if (!shouldPoll) return;

    handlingRef.current = true;

    toast.info('Confirming your subscription…');

    pollUntilSubscriptionActive()
      .then(({ ok }) => {
        queryClient.invalidateQueries({ queryKey: ['subscription-billing-current'] });
        queryClient.invalidateQueries({ queryKey: ['subscription-invoices'] });

        const params = new URLSearchParams(searchParams.toString());
        params.delete('subscription_checkout');
        const qs = params.toString();
        router.replace(qs ? `${pathname}?${qs}` : pathname);

        if (ok) {
          toast.success('Subscription updated. Your plan and billing are now active.');
        } else {
          toast.error(
            'Payment may still be processing. Refresh in a moment or check Account Health.'
          );
        }
      })
      .finally(() => {
        handlingRef.current = false;
      });
  }, [pathname, searchParams, router, queryClient]);

  return null;
}
