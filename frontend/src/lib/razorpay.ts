// Razorpay recommends loading their hosted script directly.

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

let scriptPromise: Promise<boolean> | null = null;

const loadRazorpayScript = (): Promise<boolean> => {
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  return scriptPromise;
};

interface OpenCheckoutArgs {
  orderId: string;
  amount: number; // in paise, as returned by the backend
  currency: string;
  name: string; // customer name, prefilled
  email: string;
  onSuccess: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  onDismiss: () => void;
}

export const openRazorpayCheckout = async ({
  orderId,
  amount,
  currency,
  name,
  email,
  onSuccess,
  onDismiss
}: OpenCheckoutArgs) => {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    alert('Could not load the payment gateway. Please check your connection and try again.');
    return;
  }

  const razorpay = new window.Razorpay({
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    order_id: orderId,
    amount,
    currency,
    name: 'Osteria Booking',
    description: 'Table reservation deposit',
    prefill: { name, email },
    theme: { color: '#6f2a35' },
    handler: onSuccess,
    modal: { ondismiss: onDismiss }
  });

  razorpay.open();
};
