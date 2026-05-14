export type METHOD_PAYMENT = "cm.mtn" | "cm.orange";

export interface BeneficiaryObject {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  currency: string;
  type: "mobile_money" | "bank_account" | "cash_pickup";
  metadata: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface beneficiaryResponse {
  status: string;
  message: string;
  code: number;
  beneficiary: BeneficiaryObject;
}

export interface beneficiariesResponse {
  status: string;
  message: string;
  code: number;
  beneficiary: Array<BeneficiaryObject>;
}

export interface InitializeBeneficiaryPayload {
  channel: string;
  name: string;
  email: string;
  account_number: string;
  description: string;
  country: string;
}

export interface InitializeTransferPayload {
  beneficiary: string;
  amount: number;
  currency: string;
  channel: string;
  description: string;
}

export interface InitializeSimpleTransferPayload {
  description: string;
  amount: number;
  currency: string;
  channel: string;
  recipient: {
    account_number: string;
    country: "CM";
    name: string;
  };
}

export interface CancelResponse {
  code: number;
  message: string;
}

// Typage pour les methodes
export type METHOD_REQUEST = "GET" | "POST" | "PUT" | "DELETE";
