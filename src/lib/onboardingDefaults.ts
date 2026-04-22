export const DEFAULT_PACKAGES = [
  {
    id: 'standard',
    name: 'Standard Plan',
    price: 0,
    features: {
      photos_allowed: 1,
      videos_allowed: 0,
      promotions_allowed: 0,
      analytics: false,
      priority_listing: false
    }
  },
  {
    id: 'professional',
    name: 'Professional Plan',
    price: 280,
    features: {
      photos_allowed: 8,
      videos_allowed: 2,
      promotions_allowed: 3,
      analytics: true,
      priority_listing: false
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 500,
    features: {
      photos_allowed: 20,
      videos_allowed: 5,
      promotions_allowed: 10,
      analytics: true,
      priority_listing: true
    }
  }
];

export const DEFAULT_PAYMENT_METHODS = [
  {
    id: 'fnb',
    name: 'FNB Bank',
    account_number: '63028544822',
    instructions: 'Use your registered Business Name as the reference. Send proof of payment below.'
  },
  {
    id: 'orange_money',
    name: 'Orange Money',
    account_number: '72468080',
    instructions: 'Send to Orange Money number 72468080. Include Business Name in the reference.'
  },
  {
    id: 'smega',
    name: 'BTC Smega',
    account_number: '73253410',
    instructions: 'Send to Smega number 73253410.'
  },
  {
    id: 'myzaka',
    name: 'Mascom MyZaka',
    account_number: '75666237',
    instructions: 'Send to Mascom MyZaka number 75666237.'
  }
];
