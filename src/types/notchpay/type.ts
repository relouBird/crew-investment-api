export type PaymentChannel =
  | 'cm.mtn'
  | 'cm.orange'
  | 'cm.mobile'
  | 'paypal'
  | 'card';

export type TransactionStatus =
  | 'pending'
  | 'failed'
  | 'complete'
  | 'rejected'
  | 'canceled'
  | 'abandoned'
  | 'expired'
  | 'hold'
  | 'incomplete'
  | 'processing'
  | 'refunded';

export type Channel = {
  name: string;
  type: string;
  id: TransferChannel;
};
export type TransferChannel = Exclude<PaymentChannel, 'card'>;

export type CardDetails = {
  name: string;
  exp: string;
  cvc: string;
  card_number: string;
};

export type Item = {
  description: string;
  price: number;
  image: string;
};

export type Address = {
  city: string;
  line1: string;
  line2: string;
  state: string;
  country: string;
  postal_code: string;
};

export type FindAllResponse<Item> = {
  code: number;
  status: string;
  message: string;
  totals: number;
  last_page: number;
  current_page: number;
  selected: number;
  items: Item[];
};
