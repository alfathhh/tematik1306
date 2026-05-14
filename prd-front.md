# PRD — Sistem Kategori Terpusat, Badge Admin, Custom Marker, dan Custom Popout Web GIS

**Peran penyusun:** Lead Frontend Engineer & Web GIS Architect  
**Target pembaca:** Junior Frontend Developer, AI coding assistant, atau engineer lain yang perlu implementasi cepat dan konsisten  
**Stack asumsi:** React + TypeScript + Tailwind CSS + react-leaflet + Leaflet + lucide-react

---

## 1. Ringkasan Masalah

Saat ini ada 2 masalah utama pada aplikasi Web GIS:

1. **Inkonsistensi desain** antara tabel di halaman Admin dan tampilan marker di peta client-side.
2. **Popup bawaan Leaflet** terlalu kaku, sulit dikustomisasi, dan kurang cocok dengan desain modern berbasis Tailwind.

Dokumen ini mendefinisikan satu sistem desain yang menjadi **Single Source of Truth** untuk:
- ikon kategori,
- warna kategori,
- badge admin,
- custom marker peta,
- custom popout / info window.

---

## 2. Tujuan Produk

### Tujuan utama
Membangun sistem UI yang:
- konsisten antara Admin dan Map,
- modern, minimalis, elegan,
- type-safe,
- mudah dipelihara,
- performa rendering tetap halus saat peta digeser / zoom,
- mudah dipakai ulang oleh komponen lain.

### Hasil akhir yang diinginkan
- Kategori yang sama selalu memakai ikon dan warna yang sama.
- Admin table memakai badge pastel yang lembut dan enak dibaca.
- Marker map memakai warna solid yang kontras dan jelas di atas basemap.
- Info window pada peta tampil seperti glassmorphism popup modern, bukan popup Leaflet default.

---

## 3. Prinsip Desain

### Visual style
- Bersih, rapi, premium.
- Rounded edges konsisten.
- Soft shadow, bukan border kasar.
- Kontras cukup tinggi untuk keterbacaan.
- Warna pastel untuk admin, warna solid untuk map.
- Ikon lucide sebagai identitas kategori.

### Prinsip teknis
- **Single Source of Truth** untuk kategori.
- **Type-safe**: hindari string magic yang tersebar.
- **Reusable**: komponen kecil dan jelas.
- **Performance-aware**: hindari re-render yang tidak perlu saat map bergerak.
- **CSS override jelas**: style Leaflet bawaan harus bisa ditimpa total.

---

## 4. Ruang Lingkup

### Dalam scope
- File konfigurasi kategori terpusat.
- Komponen badge untuk tabel admin.
- Fungsi custom marker berbasis `L.divIcon`.
- Komponen popout custom pada map.
- Contoh penggunaan.
- Panduan override CSS bawaan Leaflet.

### Di luar scope
- Backend API.
- Data fetching.
- Filtering / search.
- Clustering marker.
- Routing / navigation.
- Edit form / CRUD logic.

---

## 5. Definisi Kategori

Kategori yang wajib didukung:

- `restoran`
- `kesehatan`
- `rumah_ibadah`
- `pasar`
- `toko`
- `lainnya`

Jika backend mengirim kategori lain atau kosong, sistem harus fallback ke `lainnya`.

---

## 6. Arsitektur Solusi

### Alur data
1. Data tempat masuk dengan `categoryValue`.
2. `categoryConfig.ts` melakukan normalisasi dan lookup.
3. Komponen admin membaca `adminStyle`.
4. Marker map membaca `mapStyle`.
5. Popout map memakai `CategoryBadge` agar identitas visual tetap konsisten.

### Komponen inti
- `categoryConfig.ts`
- `CategoryBadge.tsx`
- `createCustomMarker.tsx`
- `CustomMapPopout.tsx`

---

## 7. Struktur Folder yang Disarankan

```txt
src/
  components/
    admin/
      CategoryBadge.tsx
    map/
      CustomMapPopout.tsx
  lib/
    gis/
      categoryConfig.ts
      createCustomMarker.tsx
  styles/
    leaflet-overrides.css
```

---

## 8. Spesifikasi Teknis Detail

---

## 8.1 `categoryConfig.ts` — Konfigurasi Terpusat

### Tujuan
Menyediakan satu sumber referensi untuk:
- label kategori,
- ikon lucide,
- warna admin,
- warna map,
- fallback kategori.

### Persyaratan
- Harus type-safe.
- Harus punya fallback otomatis ke `lainnya`.
- Harus mudah ditambah kategori baru.
- Ikon harus diambil dari `lucide-react`.

### Rekomendasi implementasi
- Simpan daftar kategori sebagai `const`.
- Gunakan union type dari daftar tersebut.
- Gunakan helper normalisasi string agar input seperti `Rumah Ibadah`, `rumah-ibadah`, `rumah_ibadah` tetap terbaca.

### Contoh kode

```tsx
// src/lib/gis/categoryConfig.ts
import type { ComponentType, SVGProps } from "react";
import {
  Utensils,
  HeartPulse,
  Landmark,
  ShoppingBasket,
  Store,
  MapPin,
} from "lucide-react";

export const CATEGORY_VALUES = [
  "restoran",
  "kesehatan",
  "rumah_ibadah",
  "pasar",
  "toko",
  "lainnya",
] as const;

export type CategoryValue = (typeof CATEGORY_VALUES)[number];

type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>;

export type CategoryConfigItem = {
  label: string;
  icon: LucideIcon;
  adminStyle: {
    badge: string;
    icon: string;
  };
  mapStyle: {
    badge: string;
    icon: string;
    pin: string;
  };
};

export const categoryConfig: Record<CategoryValue, CategoryConfigItem> = {
  restoran: {
    label: "Restoran",
    icon: Utensils,
    adminStyle: {
      badge: "bg-orange-50 text-orange-600 ring-1 ring-orange-100",
      icon: "text-orange-500",
    },
    mapStyle: {
      badge: "bg-orange-500 text-white",
      icon: "text-white",
      pin: "bg-orange-500 shadow-orange-500/30",
    },
  },
  kesehatan: {
    label: "Kesehatan",
    icon: HeartPulse,
    adminStyle: {
      badge: "bg-rose-50 text-rose-600 ring-1 ring-rose-100",
      icon: "text-rose-500",
    },
    mapStyle: {
      badge: "bg-rose-500 text-white",
      icon: "text-white",
      pin: "bg-rose-500 shadow-rose-500/30",
    },
  },
  rumah_ibadah: {
    label: "Rumah Ibadah",
    icon: Landmark,
    adminStyle: {
      badge: "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100",
      icon: "text-indigo-500",
    },
    mapStyle: {
      badge: "bg-indigo-500 text-white",
      icon: "text-white",
      pin: "bg-indigo-500 shadow-indigo-500/30",
    },
  },
  pasar: {
    label: "Pasar",
    icon: ShoppingBasket,
    adminStyle: {
      badge: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
      icon: "text-emerald-500",
    },
    mapStyle: {
      badge: "bg-emerald-500 text-white",
      icon: "text-white",
      pin: "bg-emerald-500 shadow-emerald-500/30",
    },
  },
  toko: {
    label: "Toko",
    icon: Store,
    adminStyle: {
      badge: "bg-sky-50 text-sky-600 ring-1 ring-sky-100",
      icon: "text-sky-500",
    },
    mapStyle: {
      badge: "bg-sky-500 text-white",
      icon: "text-white",
      pin: "bg-sky-500 shadow-sky-500/30",
    },
  },
  lainnya: {
    label: "Lainnya",
    icon: MapPin,
    adminStyle: {
      badge: "bg-slate-50 text-slate-600 ring-1 ring-slate-100",
      icon: "text-slate-500",
    },
    mapStyle: {
      badge: "bg-slate-500 text-white",
      icon: "text-white",
      pin: "bg-slate-500 shadow-slate-500/30",
    },
  },
};

export function normalizeCategoryValue(value?: string | null): CategoryValue {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/-/g, "_");

  return (CATEGORY_VALUES as readonly string[]).includes(normalized)
    ? (normalized as CategoryValue)
    : "lainnya";
}

export function getCategoryConfig(value?: string | null): CategoryConfigItem {
  const key = normalizeCategoryValue(value);
  return categoryConfig[key];
}
```

### Catatan penting
- `normalizeCategoryValue()` wajib dipakai di seluruh app.
- Jangan pernah mengakses `categoryConfig[someRawString]` langsung.
- Jika kategori baru ditambahkan, cukup update `CATEGORY_VALUES` dan `categoryConfig`.

---

## 8.2 `CategoryBadge.tsx` — Badge untuk Tabel Admin

### Tujuan
Menampilkan kategori sebagai badge kecil yang:
- ringan,
- enak dilihat,
- konsisten,
- mudah dibaca pada tabel admin.

### Spesifikasi UI
- Bentuk: `rounded-full`
- Tinggi kecil / compact
- Ikon lucide ukuran kecil, misalnya `size={16}`
- Warna mengikuti `adminStyle`
- Teks label mengikuti label dari konfigurasi

### Props
- `categoryValue: string`

### Contoh kode

```tsx
// src/components/admin/CategoryBadge.tsx
import { getCategoryConfig } from "@/lib/gis/categoryConfig";

type CategoryBadgeProps = {
  categoryValue: string;
  className?: string;
};

export function CategoryBadge({ categoryValue, className = "" }: CategoryBadgeProps) {
  const config = getCategoryConfig(categoryValue);
  const Icon = config.icon;

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-none",
        "whitespace-nowrap align-middle",
        config.adminStyle.badge,
        className,
      ].join(" ")}
    >
      <Icon size={16} className={config.adminStyle.icon} aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
```

### Catatan implementasi
- Komponen ini hanya bertugas untuk visual badge.
- Jangan letakkan logic kategori di sini.
- `className` opsional hanya untuk tambahan layout, bukan untuk mengganti source of truth.

### Contoh pemakaian di tabel
```tsx
<td>
  <CategoryBadge categoryValue={row.category} />
</td>
```

---

## 8.3 `createCustomMarker.tsx` — Integrasi `L.divIcon`

### Tujuan
Membuat marker Leaflet yang:
- terlihat modern,
- konsisten dengan tema kategori,
- tidak memakai icon default bawaan Leaflet,
- dapat dirender dari React component ke HTML string.

### Pendekatan
Gunakan:
- `L.divIcon`
- `ReactDOMServer.renderToString()`

### Kenapa pendekatan ini?
Leaflet menerima HTML string untuk `divIcon`. Dengan React server rendering string:
- ikon lucide bisa dirender dari React,
- styling bisa pakai Tailwind class,
- hasil tetap kompatibel dengan Leaflet.

### Syarat performa
- Fungsi marker harus pure dan deterministic.
- Jangan membuat inline anonymous component besar di dalam render map berulang-ulang.
- Cache / memoize bila diperlukan pada layer data besar.
- Jangan gunakan state React untuk marker per item bila tidak dibutuhkan.

### Contoh kode

```tsx
// src/lib/gis/createCustomMarker.tsx
import L from "leaflet";
import ReactDOMServer from "react-dom/server";
import { getCategoryConfig } from "./categoryConfig";

type CreateCustomMarkerParams = {
  categoryValue: string;
};

export function createCustomMarker({ categoryValue }: CreateCustomMarkerParams) {
  const config = getCategoryConfig(categoryValue);
  const Icon = config.icon;

  const html = ReactDOMServer.renderToString(
    <div
      className={[
        "flex h-10 w-10 items-center justify-center rounded-full",
        "border border-white/70 shadow-lg",
        config.mapStyle.pin,
      ].join(" ")}
    >
      <Icon size={18} className={config.mapStyle.icon} aria-hidden="true" />
    </div>
  );

  return L.divIcon({
    html,
    className: "custom-leaflet-marker", // untuk menghapus gaya default Leaflet
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -18],
  });
}
```

### CSS wajib untuk menghilangkan background bawaan Leaflet
```css
/* src/styles/leaflet-overrides.css */
.custom-leaflet-marker {
  background: transparent !important;
  border: none !important;
}

.custom-leaflet-marker.leaflet-div-icon {
  background: transparent !important;
  border: none !important;
}
```

### Catatan penting
- Jangan biarkan `leaflet-div-icon` default tampil.
- Bila icon tampak bergeser, sesuaikan `iconAnchor`.
- Jika ingin marker lebih “pin-like”, bentuk div bisa diubah menjadi pin dengan pseudo-element atau SVG, tetapi versi lingkaran biasanya paling stabil dan rapi.

---

## 8.4 `CustomMapPopout.tsx` — Popup / InfoWindow Modern

### Tujuan
Menampilkan detail tempat dengan UI modern:
- Nama tempat
- Kategori via `CategoryBadge`
- Koordinat / alamat

### Gaya visual
- `rounded-2xl`
- `bg-white/95 backdrop-blur-sm`
- `shadow-2xl`
- detail spacing rapih
- typography halus
- glassmorphism lembut

### Syarat performa
Komponen ini **jangan** memakai `div.absolute` di luar peta yang dipasangkan ke `map.on('move')` karena itu cenderung memicu banyak re-render dan jitter.

### Solusi yang disarankan
Gunakan komponen bawaan react-leaflet:
- `Popup` jika konten muncul saat marker diklik
- `Tooltip` jika hanya butuh label ringkas

Untuk kebutuhan detail tempat, **gunakan `Popup`** karena paling sesuai.

### Cara menimpa gaya popup bawaan Leaflet
Style default Leaflet harus dioverride agar UI kita dominan sepenuhnya. Target utama:
- `.leaflet-popup-content-wrapper`
- `.leaflet-popup-content`
- `.leaflet-popup-tip`
- `.leaflet-popup-close-button`

### Contoh kode
```tsx
// src/components/map/CustomMapPopout.tsx
import { Popup } from "react-leaflet";
import { CategoryBadge } from "@/components/admin/CategoryBadge";

type CustomMapPopoutProps = {
  name: string;
  categoryValue: string;
  address?: string;
  latitude: number;
  longitude: number;
};

export function CustomMapPopout({
  name,
  categoryValue,
  address,
  latitude,
  longitude,
}: CustomMapPopoutProps) {
  return (
    <Popup
      className="custom-map-popup"
      maxWidth={320}
      autoPan
      closeButton={false}
    >
      <div className="rounded-2xl bg-white/95 p-4 backdrop-blur-sm">
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-slate-900">
              {name}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Detail lokasi terpilih
            </p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <CategoryBadge categoryValue={categoryValue} />
          </div>

          <div className="space-y-2 border-t border-slate-200/70 pt-3 text-xs text-slate-600">
            <div className="flex items-start justify-between gap-3">
              <span className="shrink-0 text-slate-400">Alamat</span>
              <span className="text-right">{address ?? "-"}</span>
            </div>

            <div className="flex items-start justify-between gap-3">
              <span className="shrink-0 text-slate-400">Koordinat</span>
              <span className="text-right font-mono text-[11px]">
                {latitude.toFixed(6)}, {longitude.toFixed(6)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Popup>
  );
}
```

### Catatan penting
- `closeButton={false}` dipilih supaya UI lebih bersih. Jika tombol close tetap dibutuhkan, bisa diaktifkan kembali dan di-style ulang.
- `Popup` dipasang di dalam `Marker`, bukan dibuat overlay manual di luar peta.
- Gunakan `maxWidth` untuk mencegah popup terlalu lebar.

---

## 9. CSS Override Leaflet

Buat file global CSS untuk mengalahkan style default Leaflet.

### Contoh `leaflet-overrides.css`
```css
/* Hilangkan style bawaan divIcon */
.custom-leaflet-marker,
.custom-leaflet-marker.leaflet-div-icon {
  background: transparent !important;
  border: none !important;
}

/* Popup container utama */
.custom-map-popup .leaflet-popup-content-wrapper {
  padding: 0 !important;
  border-radius: 1rem !important;
  background: transparent !important;
  box-shadow: none !important;
}

.custom-map-popup .leaflet-popup-content {
  margin: 0 !important;
  width: auto !important;
}

/* Segitiga/tip popup */
.custom-map-popup .leaflet-popup-tip {
  background: rgba(255, 255, 255, 0.95) !important;
  box-shadow: none !important;
}

/* Tombol close Leaflet */
.custom-map-popup .leaflet-popup-close-button {
  top: 0.5rem !important;
  right: 0.5rem !important;
  color: #64748b !important;
}
```

### Jika memakai Tailwind `@layer base`
Bisa juga ditulis di file global utama:

```css
@layer base {
  .custom-map-popup .leaflet-popup-content-wrapper {
    padding: 0 !important;
    border-radius: 1rem !important;
    background: transparent !important;
    box-shadow: none !important;
  }

  .custom-map-popup .leaflet-popup-content {
    margin: 0 !important;
  }
}
```

### Catatan penting
- Tujuan override ini adalah membuat UI custom menjadi satu-satunya visual yang terlihat.
- Jangan set wrapper Leaflet tetap putih dengan border default, karena akan bentrok dengan glassmorphism.

---

## 10. Contoh Integrasi di Peta

### Contoh penggunaan marker dan popup
```tsx
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { createCustomMarker } from "@/lib/gis/createCustomMarker";
import { CustomMapPopout } from "@/components/map/CustomMapPopout";

type Place = {
  id: string;
  name: string;
  category: string;
  address?: string;
  latitude: number;
  longitude: number;
};

type MapViewProps = {
  places: Place[];
};

export function MapView({ places }: MapViewProps) {
  return (
    <MapContainer
      center={[-6.2, 106.816666]}
      zoom={12}
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      {places.map((place) => (
        <Marker
          key={place.id}
          position={[place.latitude, place.longitude]}
          icon={createCustomMarker({ categoryValue: place.category })}
        >
          <CustomMapPopout
            name={place.name}
            categoryValue={place.category}
            address={place.address}
            latitude={place.latitude}
            longitude={place.longitude}
          />
        </Marker>
      ))}
    </MapContainer>
  );
}
```

### Catatan performa untuk data banyak
Jika jumlah marker besar:
- bungkus `createCustomMarker()` dengan cache/memoization,
- pecah data layer,
- pertimbangkan clustering,
- hindari re-render seluruh map ketika state kecil berubah.

---

## 11. Contoh Integrasi di Admin Table

```tsx
import { CategoryBadge } from "@/components/admin/CategoryBadge";

type Row = {
  id: string;
  name: string;
  category: string;
};

export function AdminTable({ rows }: { rows: Row[] }) {
  return (
    <table className="min-w-full divide-y divide-slate-200 text-left">
      <thead>
        <tr className="text-xs font-medium text-slate-500">
          <th className="px-4 py-3">Nama</th>
          <th className="px-4 py-3">Kategori</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((row) => (
          <tr key={row.id} className="text-sm">
            <td className="px-4 py-3 text-slate-800">{row.name}</td>
            <td className="px-4 py-3">
              <CategoryBadge categoryValue={row.category} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 12. Acceptance Criteria

Implementasi dianggap selesai jika:

1. Kategori yang sama selalu menghasilkan label, ikon, dan warna yang sama di seluruh app.
2. Badge admin tampil compact, soft, dan konsisten.
3. Marker map menggunakan `divIcon` custom, bukan marker bawaan Leaflet.
4. Popup Leaflet bawaan tidak menampilkan gaya default yang kaku.
5. Popup custom tampil modern dengan glassmorphism.
6. Tidak ada overlay absolute yang mengikuti `move` event map.
7. Sistem fallback ke `lainnya` berjalan untuk kategori tidak dikenal.
8. Implementasi aman secara TypeScript dan mudah dibaca junior developer.

---

## 13. Non-Functional Requirements

### Performance
- Marker tidak boleh memicu jank saat map digeser.
- UI popup harus memanfaatkan mekanisme Leaflet, bukan manual DOM overlay yang di-update terus-menerus.

### Maintainability
- Semua style kategori hanya di satu file.
- Semua komponen membaca dari konfigurasi terpusat.

### Accessibility
- Ikon harus `aria-hidden`.
- Teks kategori tetap tersedia sebagai label.
- Kontras warna harus aman untuk keterbacaan.

---

## 14. Rekomendasi Tambahan

### Untuk tim
- Tambahkan unit test untuk `normalizeCategoryValue()`.
- Tambahkan storybook / preview sederhana untuk `CategoryBadge`.
- Pastikan semua kategori backend diverifikasi agar match dengan mapping frontend.

### Untuk desain lanjutan
- Bisa menambahkan `badgeVariant` atau `accentColor` di masa depan tanpa memecah arsitektur.
- Jika kategori bertambah banyak, pertimbangkan generator konfigurasi yang diambil dari schema backend.

---

## 15. Checklist Implementasi Cepat

- [ ] Buat `categoryConfig.ts`
- [ ] Buat `CategoryBadge.tsx`
- [ ] Buat `createCustomMarker.tsx`
- [ ] Buat `CustomMapPopout.tsx`
- [ ] Tambahkan override CSS Leaflet
- [ ] Pakai `normalizeCategoryValue()` untuk semua input kategori
- [ ] Uji tampilan di tabel admin
- [ ] Uji marker dan popup di map
- [ ] Uji fallback `lainnya`
- [ ] Uji scroll / drag map agar tidak ada jitter

---

## 16. Ringkasan Implementasi Singkat

- **`categoryConfig.ts`** adalah sumber utama semua kategori.
- **`CategoryBadge.tsx`** dipakai di tabel admin.
- **`createCustomMarker.tsx`** menghasilkan marker custom berbasis kategori.
- **`CustomMapPopout.tsx`** adalah popup modern berbasis `Popup` react-leaflet.
- **CSS override** wajib agar Leaflet tidak merusak visual buatan kita.

---

## 17. Catatan Penutup untuk Junior Developer / AI

Saat mengimplementasikan dokumen ini:
1. Jangan menulis mapping warna/ikon di lebih dari satu tempat.
2. Jangan pakai state untuk menempelkan popup di luar map.
3. Jangan biarkan style default Leaflet tetap aktif.
4. Selalu gunakan helper `getCategoryConfig()` atau `normalizeCategoryValue()`.
5. Pastikan komponen kecil, jelas, dan mudah dites.

Dokumen ini dibuat supaya sistem visual Admin dan Map tetap satu bahasa desain, rapi, dan mudah dikembangkan ke fitur GIS berikutnya.
