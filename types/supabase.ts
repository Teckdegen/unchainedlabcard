export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          wallet_address: string;
          first_name: string;
          last_name: string;
          email: string;
          customer_code: string | null;
          card_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wallet_address: string;
          first_name: string;
          last_name: string;
          email: string;
          customer_code?: string | null;
          card_code?: string | null;
        };
        Update: {
          first_name?: string;
          last_name?: string;
          email?: string;
          customer_code?: string | null;
          card_code?: string | null;
        };
      };
    };
  };
}