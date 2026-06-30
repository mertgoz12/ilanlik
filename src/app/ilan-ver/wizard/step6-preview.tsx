"use client";

import { useEffect, useMemo } from "react";
import { ListingPreview, type PreviewSpec } from "../listing-preview";
import { EQUIPMENT_GROUPS } from "@/lib/car-data";
import { formatKm } from "@/lib/format";
import type { WizardState } from "./wizard-types";
import { effectiveTitle } from "./wizard-validation";

type Step6Props = {
  wizard: WizardState;
  categoryName: string;
  photos: File[];
};

export function Step6Preview({ wizard, categoryName, photos }: Step6Props) {
  const imageUrls = useMemo(() => photos.map((file) => URL.createObjectURL(file)), [photos]);
  useEffect(() => {
    return () => imageUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [imageUrls]);

  const priceNumber = Number(wizard.price.replace(/\D/g, "")) || 0;
  const title = effectiveTitle(wizard) || "Başlıksız ilan";

  const specs: PreviewSpec[] = [
    { label: "Marka", value: wizard.brand || "-" },
    { label: "Model", value: wizard.model || "-" },
    ...(wizard.series ? [{ label: "Seri / Paket", value: wizard.series }] : []),
    { label: "Yıl", value: wizard.year || "-" },
    { label: "Kilometre", value: wizard.km ? formatKm(Number(wizard.km)) : "-" },
    { label: "Yakıt Tipi", value: wizard.fuelType || "-" },
    { label: "Vites", value: wizard.transmission || "-" },
    ...(wizard.vehicleCondition ? [{ label: "Araç Durumu", value: wizard.vehicleCondition }] : []),
    ...(wizard.bodyType ? [{ label: "Kasa Tipi", value: wizard.bodyType }] : []),
    ...(wizard.color ? [{ label: "Renk", value: wizard.color }] : []),
    ...(wizard.enginePower ? [{ label: "Motor Gücü", value: wizard.enginePower }] : []),
    ...(wizard.engineVolume ? [{ label: "Motor Hacmi", value: wizard.engineVolume }] : []),
    ...(wizard.drivetrain ? [{ label: "Çekiş", value: wizard.drivetrain }] : []),
    ...(wizard.doorCount ? [{ label: "Kapı Sayısı", value: wizard.doorCount }] : []),
    ...(wizard.plateOrigin ? [{ label: "Plaka / Uyruk", value: wizard.plateOrigin }] : []),
    ...(wizard.fromWho ? [{ label: "Kimden", value: wizard.fromWho }] : []),
    ...(wizard.exchange ? [{ label: "Takas", value: wizard.exchange }] : []),
    ...(wizard.warranty ? [{ label: "Garanti", value: wizard.warranty }] : []),
  ];

  const equipmentGroups = EQUIPMENT_GROUPS.map((group) => ({
    title: group.title,
    items: group.items.filter((item) => wizard.equipment.includes(item.key)).map((item) => item.label),
  })).filter((group) => group.items.length > 0);

  return (
    <ListingPreview
      data={{
        title,
        price: priceNumber,
        description: wizard.description || null,
        il: wizard.il,
        ilce: wizard.ilce,
        categoryName,
        isNegotiable: wizard.vehicleCondition === "İkinci El",
        specs,
        equipmentGroups,
        imageUrls,
      }}
    />
  );
}
