export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "customer" | "kasir" | "admin";
export type UserStatus = "aktif" | "nonaktif" | "suspended";
export type BookingStatus =
  | "menunggu"
  | "diproses"
  | "diterima"
  | "ditolak"
  | "selesai"
  | "dibatalkan";
export type ServiceStatus = "proses" | "selesai" | "dibatalkan";
export type PaymentStatus = "pending" | "lunas" | "gagal" | "refund";
export type PaymentMethod = "tunai" | "transfer" | "qris" | "kartu" | "dp";

export interface LineItem {
  nama: string;
  qty: number;
  harga: number;
}

export interface UserProfile {
  id: string;
  nomor_pelanggan: string | null;
  nama: string;
  email: string;
  nomor_hp: string | null;
  role: UserRole;
  foto: string | null;
  status: UserStatus;
  notify_email: boolean;
  notify_reminder: boolean;
  notify_promo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  merk: string;
  tipe: string;
  tahun: number;
  nomor_polisi: string;
  warna: string;
  created_at: string;
  updated_at: string;
  users?: Pick<UserProfile, "id" | "nama" | "nomor_pelanggan" | "email" | "nomor_hp"> | null;
}

export interface Booking {
  id: string;
  user_id: string;
  vehicle_id: string;
  tanggal: string;
  jenis_servis: string | null;
  keluhan: string | null;
  mekanik: string | null;
  status: BookingStatus;
  catatan: string | null;
  created_at: string;
  updated_at: string;
  users?: Pick<UserProfile, "id" | "nama" | "nomor_pelanggan" | "nomor_hp"> | null;
  vehicles?: Pick<Vehicle, "id" | "merk" | "tipe" | "nomor_polisi" | "warna" | "tahun"> | null;
}

export interface ServiceRecord {
  id: string;
  booking_id: string | null;
  user_id: string;
  vehicle_id: string;
  nomor_invoice: string | null;
  tanggal: string;
  mekanik: string | null;
  keluhan: string | null;
  pekerjaan: string | null;
  sparepart: LineItem[];
  jasa: LineItem[];
  total: number;
  status: ServiceStatus;
  created_at: string;
  updated_at: string;
  users?: Pick<UserProfile, "id" | "nama" | "nomor_pelanggan" | "email" | "nomor_hp"> | null;
  vehicles?: Pick<Vehicle, "id" | "merk" | "tipe" | "nomor_polisi" | "warna" | "tahun"> | null;
}

export interface Payment {
  id: string;
  service_id: string;
  user_id: string;
  nomor_invoice: string | null;
  metode: PaymentMethod;
  total: number;
  status: PaymentStatus;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  services?: Pick<ServiceRecord, "id" | "nomor_invoice" | "tanggal" | "pekerjaan"> | null;
  users?: Pick<UserProfile, "id" | "nama" | "nomor_pelanggan"> | null;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

type Relationships = Array<{
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
}>;

export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserProfile;
        Insert: {
          id: string;
          nama: string;
          email: string;
          nomor_pelanggan?: string | null;
          nomor_hp?: string | null;
          role?: UserRole;
          foto?: string | null;
          status?: UserStatus;
          notify_email?: boolean;
          notify_reminder?: boolean;
          notify_promo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nama?: string;
          email?: string;
          nomor_pelanggan?: string | null;
          nomor_hp?: string | null;
          role?: UserRole;
          foto?: string | null;
          status?: UserStatus;
          notify_email?: boolean;
          notify_reminder?: boolean;
          notify_promo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      vehicles: {
        Row: {
          id: string;
          user_id: string;
          merk: string;
          tipe: string;
          tahun: number;
          nomor_polisi: string;
          warna: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          merk: string;
          tipe: string;
          tahun: number;
          nomor_polisi: string;
          warna: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          merk?: string;
          tipe?: string;
          tahun?: number;
          nomor_polisi?: string;
          warna?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "vehicles_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          vehicle_id: string;
          tanggal: string;
          jenis_servis: string | null;
          keluhan: string | null;
          mekanik: string | null;
          status: BookingStatus;
          catatan: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          vehicle_id: string;
          tanggal: string;
          jenis_servis?: string | null;
          keluhan?: string | null;
          mekanik?: string | null;
          status?: BookingStatus;
          catatan?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          vehicle_id?: string;
          tanggal?: string;
          jenis_servis?: string | null;
          keluhan?: string | null;
          mekanik?: string | null;
          status?: BookingStatus;
          catatan?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "bookings_vehicle_id_fkey";
            columns: ["vehicle_id"];
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
        ];
      };
      services: {
        Row: {
          id: string;
          booking_id: string | null;
          user_id: string;
          vehicle_id: string;
          nomor_invoice: string | null;
          tanggal: string;
          mekanik: string | null;
          keluhan: string | null;
          pekerjaan: string | null;
          sparepart: Json;
          jasa: Json;
          total: number;
          status: ServiceStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          booking_id?: string | null;
          user_id: string;
          vehicle_id: string;
          nomor_invoice?: string | null;
          tanggal?: string;
          mekanik?: string | null;
          keluhan?: string | null;
          pekerjaan?: string | null;
          sparepart?: Json;
          jasa?: Json;
          total?: number;
          status?: ServiceStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string | null;
          user_id?: string;
          vehicle_id?: string;
          nomor_invoice?: string | null;
          tanggal?: string;
          mekanik?: string | null;
          keluhan?: string | null;
          pekerjaan?: string | null;
          sparepart?: Json;
          jasa?: Json;
          total?: number;
          status?: ServiceStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "services_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "services_vehicle_id_fkey";
            columns: ["vehicle_id"];
            referencedRelation: "vehicles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "services_booking_id_fkey";
            columns: ["booking_id"];
            referencedRelation: "bookings";
            referencedColumns: ["id"];
          },
        ];
      };
      payments: {
        Row: {
          id: string;
          service_id: string;
          user_id: string;
          nomor_invoice: string | null;
          metode: PaymentMethod;
          total: number;
          status: PaymentStatus;
          paid_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          service_id: string;
          user_id: string;
          nomor_invoice?: string | null;
          metode?: PaymentMethod;
          total?: number;
          status?: PaymentStatus;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          service_id?: string;
          user_id?: string;
          nomor_invoice?: string | null;
          metode?: PaymentMethod;
          total?: number;
          status?: PaymentStatus;
          paid_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_service_id_fkey";
            columns: ["service_id"];
            referencedRelation: "services";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "payments_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          body: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          body: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          body?: string;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
