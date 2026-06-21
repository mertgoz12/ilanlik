import { z } from "zod";
import {
  ALL_DAMAGE_PART_KEYS,
  BODY_TYPES,
  DAMAGE_PART_STATUSES,
  DOOR_COUNTS,
  DRIVETRAINS,
  EXCHANGE_OPTIONS,
  FROM_WHO_OPTIONS,
  FUEL_TYPES,
  PLATE_ORIGINS,
  TRANSMISSIONS,
  VEHICLE_CONDITIONS,
  WARRANTY_OPTIONS,
  type DamagePartStatus,
} from "./car-data";

const currentYear = new Date().getFullYear();

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Ad soyad en az 2 karakter olmalı").max(80),
    email: z.string().trim().toLowerCase().email("Geçerli bir e-posta adresi girin"),
    phone: z
      .string()
      .trim()
      .max(20)
      .optional()
      .or(z.literal("")),
    password: z.string().min(6, "Şifre en az 6 karakter olmalı").max(100),
    passwordConfirm: z.string(),
    termsAccepted: z.boolean().refine((v) => v === true, {
      message: "Devam etmek için kullanım koşulları ve KVKK metnini kabul etmelisiniz.",
    }),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Şifreler eşleşmiyor",
    path: ["passwordConfirm"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(1, "Şifre gerekli"),
});

export type LoginInput = z.infer<typeof loginSchema>;

const damagePartStatusValues = DAMAGE_PART_STATUSES.map((s) => s.value) as [
  DamagePartStatus,
  ...DamagePartStatus[],
];

export const damageInfoSchema = z.record(
  z.enum(ALL_DAMAGE_PART_KEYS as [string, ...string[]]),
  z.enum(damagePartStatusValues),
);

export const listingSchema = z.object({
  title: z.string().trim().min(5, "Başlık en az 5 karakter olmalı").max(120),
  categoryId: z.string().trim().min(1, "Kategori seçin"),
  brand: z.string().trim().min(1, "Marka seçin"),
  model: z.string().trim().min(1, "Model seçin"),
  series: z.string().trim().max(60).optional().or(z.literal("")),
  year: z.coerce
    .number()
    .int()
    .min(1970, "Geçerli bir yıl girin")
    .max(currentYear + 1, "Geçerli bir yıl girin"),
  km: z.coerce.number().int().min(0, "Geçerli bir km değeri girin").max(2_000_000),
  price: z.coerce.number().min(1, "Geçerli bir fiyat girin").max(1_000_000_000),
  fuelType: z.enum(FUEL_TYPES),
  transmission: z.enum(TRANSMISSIONS),
  bodyType: z.enum(BODY_TYPES).optional().or(z.literal("")),
  color: z.string().trim().max(40).optional().or(z.literal("")),
  enginePower: z.string().trim().max(40).optional().or(z.literal("")),
  engineVolume: z.string().trim().max(40).optional().or(z.literal("")),
  drivetrain: z.enum(DRIVETRAINS).optional().or(z.literal("")),
  vehicleCondition: z.enum(VEHICLE_CONDITIONS).optional().or(z.literal("")),
  doorCount: z.enum(DOOR_COUNTS).optional().or(z.literal("")),
  plateOrigin: z.enum(PLATE_ORIGINS).optional().or(z.literal("")),
  fromWho: z.enum(FROM_WHO_OPTIONS).optional().or(z.literal("")),
  exchange: z.enum(EXCHANGE_OPTIONS).optional().or(z.literal("")),
  warranty: z.enum(WARRANTY_OPTIONS).optional().or(z.literal("")),
  trimId: z.string().trim().optional().or(z.literal("")),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  damageInfo: damageInfoSchema,
  tramerAmount: z.coerce.number().min(0).max(1_000_000_000).optional(),
  equipment: z.array(z.string()).optional().default([]),
  il: z.string().trim().min(1, "İl seçin"),
  ilce: z.string().trim().min(1, "İlçe seçin"),
});

export type ListingInput = z.infer<typeof listingSchema>;

export const simpleListingSchema = z.object({
  title: z.string().trim().min(5, "Başlık en az 5 karakter olmalı").max(120),
  categoryId: z.string().trim().min(1, "Kategori seçin"),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  price: z.coerce.number().min(1, "Geçerli bir fiyat girin").max(1_000_000_000),
  il: z.string().trim().min(1, "İl seçin"),
  ilce: z.string().trim().min(1, "İlçe seçin"),
});

export type SimpleListingInput = z.infer<typeof simpleListingSchema>;

// Hesabım > İlan Yönetimi > Düzenle: hızlı düzenleme formu, sadece temel
// alanları kapsar (araç teknik özellikleri/fotoğraflar için ilan yeniden verilir).
export const editListingSchema = z.object({
  title: z.string().trim().min(5, "Başlık en az 5 karakter olmalı").max(120),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  price: z.coerce.number().min(1, "Geçerli bir fiyat girin").max(1_000_000_000),
  il: z.string().trim().min(1, "İl seçin"),
  ilce: z.string().trim().min(1, "İlçe seçin"),
});

export type EditListingInput = z.infer<typeof editListingSchema>;

// Hesabım > Hesap Ayarları > Profil bilgileri
export const profileSchema = z.object({
  name: z.string().trim().min(2, "Ad soyad en az 2 karakter olmalı").max(80),
  phone: z.string().trim().max(20, "Telefon en fazla 20 karakter olabilir").optional().or(z.literal("")),
  il: z.string().trim().max(40).optional().or(z.literal("")),
  ilce: z.string().trim().max(40).optional().or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;

// Hesabım > Hesap Ayarları > Şifre değiştir
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Mevcut şifrenizi girin"),
    newPassword: z.string().min(6, "Yeni şifre en az 6 karakter olmalı").max(100),
    newPasswordConfirm: z.string(),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: "Şifreler eşleşmiyor",
    path: ["newPasswordConfirm"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// İletişim sayfası > İletişim formu
export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, "Ad soyad en az 2 karakter olmalı").max(80),
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta adresi girin"),
  subject: z.string().trim().min(3, "Konu en az 3 karakter olmalı").max(120),
  message: z.string().trim().min(10, "Mesaj en az 10 karakter olmalı").max(2000),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
