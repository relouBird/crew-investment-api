import {
  Item,
  PaymentChannel,
  Address,
  CardDetails,
  FindAllResponse,
  TransactionStatus,
} from './type';

export type Business = {
  id: string;
  country: string;
  email: string;
  phone: string;
  poster: null | string;
  name: string;
};

export type Customer = {
  id: string;
  name: null | string;
  email: string;
  sandbox: boolean;
  phone: null | string;
  blocked: boolean;
};

export type Transaction = {
  amount: number;
  amount_total: number;
  sandbox: boolean;
  fee: number;
  converted_amount: number;
  business: Business;
  customer: Customer;
  description: string;
  reference: string;
  merchant_reference: string;
  status: TransactionStatus;
  currency: string;
  initiated_at: Date;
  updated_at: Date;
};

export type InitializePaymentPayload<T extends object = object> = {
  email?: string;
  currency: string;
  amount: number;
  name?: string;
  phone?: string;
  callback?: string;
  locked_currency?: string;
  locked_country?: string;
  description?: string;
  reference?: string;
  customer_meta?: T;
  address?: Address;
  shipping?: Address;
  items?: Item[];
} & ({ email: string } | { phone: string });

export type CompletePaymentResponse = {
  status: string;
  message: string;
  code: number;
  action: string;
};

export type CompletePaymentPayload = {
  channel: PaymentChannel;
} & (
  | {
      channel: 'cm.mtn' | 'cm.orange' | 'cm.mobile';
      data: {
        phone: string;
      };
    }
  | {
      channel: 'paypal';
      data: {
        email: string;
      };
    }
  | {
      channel: 'card';
      data: CardDetails;
    }
);

export type PaymentResponse = {
  status: string;
  message: string;
  code: number;
  transaction: Transaction;
  /** Authorization url is only returned for initialize payment */
  authorization_url?: string;
};

export type PaymentsResponse = FindAllResponse<Transaction>;
