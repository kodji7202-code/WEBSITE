// Shared types for Supabase Edge Functions

export interface CartItemPayload {
  priceId: string;
  name: string;
  url: string;
  license: string;
}

export interface CheckoutRequestBody {
  cartItems: CartItemPayload[];
  origin: string;
}

export interface FileMetadata {
  name: string;
  url: string;
  license: string;
}

export interface SecureDownloadRequestBody {
  session_id: string;
}

export interface SignedFile extends FileMetadata {
  downloadUrl: string;
}

export interface StripeSessionMetadata {
  files_json: string;
}

export interface EmailFile {
  name: string;
  url: string;
  license: string;
}
