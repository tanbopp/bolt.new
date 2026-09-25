import type { UserProfile } from './auth';

/**
 * Tipe database Supabase (schema `public`) untuk TypeScript.
 *
 * Ditulis manual (bukan hasil `supabase gen types`) agar query client
 * ter-type tanpa menambah langkah codegen di CI. Satu-satunya tabel pada
 * Tahapan 1 adalah `users` (lihat `supabase/migrations/0001_users.sql`).
 */
export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserProfile;
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar?: string | null;
          plan?: UserProfile['plan'];
          credits?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          name?: string | null;
          avatar?: string | null;
          plan?: UserProfile['plan'];
          credits?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
