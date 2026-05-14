import { Channel, FindAllResponse } from './type';

export type Receiver = {
  number: string;
};

export type Business = {
  id: string;
  country: string;
  email: string;
  phone: string;
  poster: null | string;
  name: string;
};

export type Beneficiary = {
  id: string;
  phone: string;
  name: null | string;
  email: null | string;
  country: string;
  channel: Channel;
  receiver: Receiver;
};

export type Transfer = {
  amount: number;
  amount_total: number;
  fee: number;
  converted_amount: number;
  business: Business;
  beneficiary: Beneficiary;
  description: string;
  reference: string;
  status: string;
  currency: string;
  initiated_at: string;
  updated_at: string;
};

export type TransferResponse = {
  status: string;
  message: string;
  code: number;
  transfer: Transfer;
};

export type TransfersResponse = FindAllResponse<Transfer>;
