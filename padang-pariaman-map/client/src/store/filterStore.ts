import { create } from 'zustand';
import { KDKAB_PADANG_PARIAMAN } from '../constants';

interface FilterState {
  // Filter kategori infrastruktur (array of kategori.value)
  kategoriAktif: string[];
  toggleKategori: (value: string) => void;
  setKategoriAktif: (values: string[]) => void;
  resetKategori: () => void;

  // Filter wilayah cascade
  kdkab: string;
  kdkec: string;
  kddesa: string;
  kdsls: string;
  setKdkec: (v: string) => void;
  setKddesa: (v: string) => void;
  setKdsls: (v: string) => void;
  resetWilayah: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  // Kategori: default semua mati (tidak ada marker tampil)
  kategoriAktif: [],

  toggleKategori: (value) =>
    set((state) => ({
      kategoriAktif: state.kategoriAktif.includes(value)
        ? state.kategoriAktif.filter((k) => k !== value)
        : [...state.kategoriAktif, value],
    })),

  setKategoriAktif: (values) => set({ kategoriAktif: values }),

  resetKategori: () => set({ kategoriAktif: [] }),

  // Wilayah: default seluruh kabupaten
  kdkab: KDKAB_PADANG_PARIAMAN,
  kdkec: '',
  kddesa: '',
  kdsls: '',

  setKdkec: (v) => set({ kdkec: v, kddesa: '', kdsls: '' }),
  setKddesa: (v) => set({ kddesa: v, kdsls: '' }),
  setKdsls: (v) => set({ kdsls: v }),

  resetWilayah: () => set({
    kdkec: '',
    kddesa: '',
    kdsls: '',
  }),
}));
