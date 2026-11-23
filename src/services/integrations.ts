import type { Order, PaymentMethodId, PincodeServiceability, Product } from '../types/commerce';
import { checkPincodeServiceability } from '../utils/commerceLogic';

/**
 * Production Backend & Third-Party Integration Interfaces
 *
 * Firebase is the official primary backend provider for AKSHARA LIFESTYLE.
 * When environment credentials are not yet populated, AKSHARA LIFESTYLE runs in a
 * graceful local Demo Mode with browser-persisted state.
 */

export interface BackendProviderConfig {
  mode: 'demo' | 'live';
  databaseProvider: 'local-demo' | 'firebase';
  paymentGateway: 'razorpay-demo' | 'razorpay-live' | 'payments-disabled';
  shippingProvider: 'demo-estimator' | 'shiprocket' | 'delhivery';
  emailProvider: 'demo-log' | 'resend' | 'sendgrid';
  smsOtpProvider: 'demo-log' | 'msg91' | 'twilio';
  analyticsProvider: 'demo-local' | 'ga4';
}

export interface PaymentIntentResult {
  mode: 'DEMO' | 'LIVE';
  provider: 'razorpay_demo' | 'cod_demo';
  referenceId: string;
  status: 'demo_authorized' | 'cod_pending';
  notice: string;
}

export interface PaymentGatewayAdapter {
  createCheckoutOrder(params: {
    amountInr: number;
    method: PaymentMethodId;
    customerEmail: string;
    customerPhone: string;
  }): Promise<PaymentIntentResult>;
}

export interface ShippingProviderAdapter {
  checkServiceability(pincode: string, codEligible: boolean): Promise<PincodeServiceability>;
  generateDemoAwb(orderNumber: string): { carrier: string; awbNumber: string };
}

export interface NotificationAdapter {
  sendOrderConfirmation(order: Order): Promise<{ delivered: boolean; mode: 'DEMO' | 'LIVE' }>;
  sendOtp(phone: string): Promise<{ sent: boolean; mode: 'DEMO' | 'LIVE' }>;
}

export interface CatalogRepository {
  providerName: string;
  listProducts(): Promise<Product[]>;
}

export function getActiveIntegrationStatus(): BackendProviderConfig {
  const backendProvider = (import.meta.env.VITE_BACKEND_PROVIDER || 'firebase').toLowerCase();
  const hasFirebase = backendProvider === 'firebase' && Boolean(import.meta.env.VITE_FIREBASE_PROJECT_ID);
  const paymentsEnabled = import.meta.env.PAYMENTS_ENABLED === 'true';
  const hasRazorpay = paymentsEnabled && Boolean(import.meta.env.RAZORPAY_KEY_ID);

  return {
    mode: hasFirebase ? 'live' : 'demo',
    databaseProvider: hasFirebase ? 'firebase' : 'local-demo',
    paymentGateway: hasRazorpay
      ? 'razorpay-live'
      : paymentsEnabled
        ? 'razorpay-demo'
        : 'payments-disabled',
    shippingProvider: 'demo-estimator',
    emailProvider: 'demo-log',
    smsOtpProvider: 'demo-log',
    analyticsProvider: import.meta.env.VITE_GA_MEASUREMENT_ID ? 'ga4' : 'demo-local',
  };
}

/**
 * Clearly labelled Demo Payment Adapter. Never pretends to process real bank transactions.
 */
export const paymentGatewayAdapter: PaymentGatewayAdapter = {
  async createCheckoutOrder({ method }) {
    const suffix = Math.floor(100000 + Math.random() * 900000);
    if (method === 'cod') {
      return {
        mode: 'DEMO',
        provider: 'cod_demo',
        referenceId: `DEMO-COD-${suffix}`,
        status: 'cod_pending',
        notice:
          'Demo Checkout Order recorded locally. No real Cash on Delivery dispatch has been scheduled.',
      };
    }

    return {
      mode: 'DEMO',
      provider: 'razorpay_demo',
      referenceId: `DEMO-RZP-${method.toUpperCase()}-${suffix}`,
      status: 'demo_authorized',
      notice:
        'Demo Payment Simulation only. Configure server-side Razorpay keys to accept live Indian UPI, Card, Net Banking, or Wallet payments.',
    };
  },
};

export const shippingProviderAdapter: ShippingProviderAdapter = {
  async checkServiceability(pincode, codEligible) {
    return checkPincodeServiceability(pincode, codEligible);
  },
  generateDemoAwb(orderNumber) {
    const numeric = orderNumber.replace(/\D/g, '').slice(-6) || '104200';
    return {
      carrier: 'BlueDart Priority (Demo Logistics)',
      awbNumber: `BD${numeric}IN`,
    };
  },
};

export const notificationAdapter: NotificationAdapter = {
  async sendOrderConfirmation() {
    return { delivered: false, mode: 'DEMO' };
  },
  async sendOtp() {
    return { sent: false, mode: 'DEMO' };
  },
};
