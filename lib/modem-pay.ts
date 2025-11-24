/**
 * Modem Pay Integration
 * Payment gateway for processing transactions
 */

// Modem Pay Configuration
const MODEM_PAY_CONFIG = {
  PUBLIC_KEY: process.env.NEXT_PUBLIC_MODEM_PAY_PUBLIC_KEY || 'pk_live_your_public_key',
  MERCHANT_ID: process.env.NEXT_PUBLIC_MODEM_PAY_MERCHANT_ID || 'your_merchant_id',
  API_URL: 'https://api.modempay.com',
};

export interface ModemPayPaymentData {
  amount: number;
  currency: string;
  email: string;
  fullName: string;
  phone: string;
  description: string;
  reference: string;
  metadata?: Record<string, any>;
}

export interface ModemPayResponse {
  status: 'success' | 'error' | 'pending';
  message: string;
  reference?: string;
  transactionId?: string;
  data?: any;
}

/**
 * Initialize Modem Pay payment session
 */
export const initializeModemPayPayment = async (
  paymentData: ModemPayPaymentData
): Promise<ModemPayResponse> => {
  try {
    // Validate required fields
    if (!paymentData.amount || paymentData.amount <= 0) {
      throw new Error('Invalid amount');
    }

    if (!paymentData.email || !paymentData.fullName) {
      throw new Error('Email and full name are required');
    }

    // Generate unique reference
    const reference = paymentData.reference || generateReference();

    // Prepare payload
    const payload = {
      public_key: MODEM_PAY_CONFIG.PUBLIC_KEY,
      merchant_id: MODEM_PAY_CONFIG.MERCHANT_ID,
      amount: Math.round(paymentData.amount * 100), // Convert to cents
      currency: paymentData.currency || 'USD',
      email: paymentData.email,
      full_name: paymentData.fullName,
      phone: paymentData.phone,
      description: paymentData.description,
      reference: reference,
      metadata: {
        ...paymentData.metadata,
        platform: 'havanah',
        timestamp: new Date().toISOString(),
      },
      callback_url: `${getBaseUrl()}/api/modem-pay/callback`,
      redirect_url: `${getBaseUrl()}/checkout?status=success&reference=${reference}`,
    };

    // Call Modem Pay API
    const response = await fetch(`${MODEM_PAY_CONFIG.API_URL}/payments/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MODEM_PAY_CONFIG.PUBLIC_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Payment initialization failed');
    }

    const data = await response.json();

    return {
      status: 'success',
      message: 'Payment session created successfully',
      reference: reference,
      transactionId: data.transaction_id,
      data: data,
    };
  } catch (error) {
    console.error('Modem Pay initialization error:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'An error occurred',
    };
  }
};

/**
 * Verify payment status
 */
export const verifyModemPayPayment = async (reference: string): Promise<ModemPayResponse> => {
  try {
    const response = await fetch(`${MODEM_PAY_CONFIG.API_URL}/payments/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${MODEM_PAY_CONFIG.PUBLIC_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Payment verification failed');
    }

    const data = await response.json();

    return {
      status: data.status === 'success' ? 'success' : 'pending',
      message: data.message || 'Payment verified',
      reference: reference,
      transactionId: data.transaction_id,
      data: data,
    };
  } catch (error) {
    console.error('Modem Pay verification error:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Verification failed',
    };
  }
};

/**
 * Process direct payment (for server-side use)
 */
export const processModemPayPayment = async (
  paymentData: ModemPayPaymentData
): Promise<ModemPayResponse> => {
  try {
    const response = await fetch(`${MODEM_PAY_CONFIG.API_URL}/payments/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MODEM_PAY_SECRET_KEY || ''}`,
      },
      body: JSON.stringify({
        ...paymentData,
        merchant_id: MODEM_PAY_CONFIG.MERCHANT_ID,
        amount: Math.round(paymentData.amount * 100),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Payment processing failed');
    }

    const data = await response.json();

    return {
      status: 'success',
      message: 'Payment processed successfully',
      reference: data.reference,
      transactionId: data.transaction_id,
      data: data,
    };
  } catch (error) {
    console.error('Modem Pay processing error:', error);
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Payment processing failed',
    };
  }
};

/**
 * Generate unique payment reference
 */
export const generateReference = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `HVN-${timestamp}-${random}`;
};

/**
 * Get base URL for callbacks
 */
export const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
};

/**
 * Format amount for display
 */
export const formatPaymentAmount = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export default {
  initializeModemPayPayment,
  verifyModemPayPayment,
  processModemPayPayment,
  generateReference,
  getBaseUrl,
  formatPaymentAmount,
};