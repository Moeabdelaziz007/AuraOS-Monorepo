import Stripe from 'stripe';

export const mockStripeCheckoutSession: Stripe.Checkout.Session = {
  id: 'cs_test_123',
  object: 'checkout.session',
  after_expiration: null,
  allow_promotion_codes: true,
  amount_subtotal: 2000,
  amount_total: 2000,
  automatic_tax: { enabled: false, status: null },
  billing_address_collection: 'auto',
  cancel_url: 'https://example.com/cancel',
  client_reference_id: 'user_123',
  client_secret: null,
  consent: null,
  consent_collection: null,
  created: 1234567890,
  currency: 'usd',
  currency_conversion: null,
  custom_fields: [],
  custom_text: {
    shipping_address: null,
    submit: null,
    terms_of_service_acceptance: null,
  },
  customer: 'cus_test_123',
  customer_creation: 'always',
  customer_details: null,
  customer_email: 'test@example.com',
  expires_at: 1234567890,
  invoice: null,
  invoice_creation: null,
  livemode: false,
  locale: null,
  metadata: { userId: 'user_123' },
  mode: 'subscription',
  payment_intent: null,
  payment_link: null,
  payment_method_collection: 'always',
  payment_method_configuration_details: null,
  payment_method_options: null,
  payment_method_types: ['card'],
  payment_status: 'paid',
  phone_number_collection: { enabled: false },
  recovered_from: null,
  setup_intent: null,
  shipping_address_collection: null,
  shipping_cost: null,
  shipping_details: null,
  shipping_options: [],
  status: 'complete',
  submit_type: null,
  subscription: 'sub_test_123',
  success_url: 'https://example.com/success',
  total_details: null,
  ui_mode: 'hosted',
  url: 'https://checkout.stripe.com/test',
};

export const mockStripeSubscription: Stripe.Subscription = {
  id: 'sub_test_123',
  object: 'subscription',
  application: null,
  application_fee_percent: null,
  automatic_tax: { enabled: false },
  billing_cycle_anchor: 1234567890,
  billing_thresholds: null,
  cancel_at: null,
  cancel_at_period_end: false,
  canceled_at: null,
  cancellation_details: null,
  collection_method: 'charge_automatically',
  created: 1234567890,
  currency: 'usd',
  current_period_end: 1237159890,
  current_period_start: 1234567890,
  customer: 'cus_test_123',
  days_until_due: null,
  default_payment_method: null,
  default_source: null,
  default_tax_rates: [],
  description: null,
  discount: null,
  ended_at: null,
  items: {
    object: 'list',
    data: [],
    has_more: false,
    url: '/v1/subscription_items',
  },
  latest_invoice: null,
  livemode: false,
  metadata: { userId: 'user_123' },
  next_pending_invoice_item_invoice: null,
  on_behalf_of: null,
  pause_collection: null,
  payment_settings: null,
  pending_invoice_item_interval: null,
  pending_setup_intent: null,
  pending_update: null,
  plan: null,
  quantity: null,
  schedule: null,
  start_date: 1234567890,
  status: 'active',
  test_clock: null,
  transfer_data: null,
  trial_end: null,
  trial_settings: null,
  trial_start: null,
};

export const mockStripeCustomer: Stripe.Customer = {
  id: 'cus_test_123',
  object: 'customer',
  address: null,
  balance: 0,
  created: 1234567890,
  currency: null,
  default_source: null,
  delinquent: false,
  description: null,
  discount: null,
  email: 'test@example.com',
  invoice_prefix: 'TEST',
  invoice_settings: {
    custom_fields: null,
    default_payment_method: null,
    footer: null,
    rendering_options: null,
  },
  livemode: false,
  metadata: {},
  name: 'Test User',
  next_invoice_sequence: 1,
  phone: null,
  preferred_locales: [],
  shipping: null,
  tax_exempt: 'none',
  test_clock: null,
};

export const mockStripeBillingPortalSession: Stripe.BillingPortal.Session = {
  id: 'bps_test_123',
  object: 'billing_portal.session',
  configuration: 'bpc_test_123',
  created: 1234567890,
  customer: 'cus_test_123',
  flow: null,
  livemode: false,
  locale: null,
  on_behalf_of: null,
  return_url: 'https://example.com/account',
  url: 'https://billing.stripe.com/session/test',
};

export const mockStripeWebhookEvent: Stripe.Event = {
  id: 'evt_test_123',
  object: 'event',
  api_version: '2023-10-16',
  created: 1234567890,
  data: {
    object: mockStripeCheckoutSession,
  },
  livemode: false,
  pending_webhooks: 0,
  request: {
    id: 'req_test_123',
    idempotency_key: null,
  },
  type: 'checkout.session.completed',
};

export const createMockStripe = () => {
  const mockCheckoutSessions = {
    create: jest.fn().mockResolvedValue(mockStripeCheckoutSession),
    retrieve: jest.fn().mockResolvedValue(mockStripeCheckoutSession),
  };

  const mockSubscriptions = {
    retrieve: jest.fn().mockResolvedValue(mockStripeSubscription),
    update: jest.fn().mockResolvedValue(mockStripeSubscription),
    list: jest.fn().mockResolvedValue({
      object: 'list',
      data: [mockStripeSubscription],
      has_more: false,
      url: '/v1/subscriptions',
    }),
  };

  const mockCustomers = {
    retrieve: jest.fn().mockResolvedValue(mockStripeCustomer),
  };

  const mockBillingPortal = {
    sessions: {
      create: jest.fn().mockResolvedValue(mockStripeBillingPortalSession),
    },
  };

  const mockWebhooks = {
    constructEvent: jest.fn().mockReturnValue(mockStripeWebhookEvent),
  };

  return {
    checkout: {
      sessions: mockCheckoutSessions,
    },
    subscriptions: mockSubscriptions,
    customers: mockCustomers,
    billingPortal: mockBillingPortal,
    webhooks: mockWebhooks,
  } as unknown as Stripe;
};
