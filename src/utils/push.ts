// Web Push subscription helper. The VAPID *public* key is safe to ship in the
// client; the matching private key lives only in a GitHub Actions secret and is
// used by the server-side sender (scripts/send-push.mjs).
export const VAPID_PUBLIC_KEY =
  'BKNZkIAS8WTbJXwA3MmZMCYqvWJsDZ2wDmHibdYBdBoRm0EO1s5svDhVvTcoQ9VikCpmNEZETcpuJtKxdqqTnns';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Ensure there is an active push subscription for this device and return it as
 * a plain JSON object (endpoint + keys), or null if push isn't available/granted.
 */
export async function getPushSubscription(): Promise<PushSubscriptionJSON | null> {
  if (!isPushSupported()) return null;
  if (Notification.permission !== 'granted') return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as BufferSource,
      });
    }
    return sub.toJSON();
  } catch {
    return null;
  }
}
