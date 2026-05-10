// Tipe data utama aplikasi Peta Tematik Padang Pariaman

export interface KategoriInfra {
  id: number;
  value: string;   // slug: "restoran", "rumah_ibadah", dll
  label: string;   // label tampil: "Restoran", "Rumah Ibadah", dll
  icon: string;    // emoji: "🍽️", "🕌", dll
  color: string;   // hex color: "#FF5733"
  urutan: number;
}

export interface Infrastruktur {
  id: number;
  nama: string;
  kategori: string;
  alamat?: string;
  fotoUrl?: string;
  lat: number;
  lng: number;
  kdkab: string;
  kdkec: string;
  kddesa: string;
  kdsls?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Statistik {
  id: number;
  kdkab: string;
  kdkec?: string;
  kddesa?: string;
  kdsls?: string;
  indikator: string;
  nilai: number;
  satuan?: string;
  tahun: number;
  createdAt: string;
}

export interface WilayahOption {
  // Kecamatan
  kdkec?: string;
  // Nagari
  kddesa?: string;
  // Korong
  kdsls?: string;
  nama: string;
}

export interface FilterWilayahState {
  kdkab: string;
  kdkec?: string;
  kddesa?: string;
  kdsls?: string;
}

export interface ImportResult {
  berhasil: number;
  gagal: number;
  errors: Array<{
    baris: number;
    pesan: string;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiError {
  error: string;
}

export interface AdminUser {
  id: number;
  username: string;
}

// Form types
export interface InfrastrukturFormData {
  nama: string;
  kategori: string;
  alamat: string;
  fotoUrl: string;
  lat: number | '';
  lng: number | '';
  kdkab: string;
  kdkec: string;
  kddesa: string;
  kdsls: string;
}

export interface StatistikFormData {
  kdkab: string;
  kdkec: string;
  kddesa: string;
  kdsls: string;
  indikator: string;
  nilai: number | '';
  satuan: string;
  tahun: number | '';
}

export interface KategoriFormData {
  value: string;
  label: string;
  icon: string;
  color: string;
  urutan: number | '';
}
