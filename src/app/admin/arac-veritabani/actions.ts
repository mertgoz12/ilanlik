"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

function revalidate() {
  revalidatePath("/admin/arac-veritabani");
  revalidatePath("/ilan-ver");
}

// --- Marka ---

export async function createBrandAction(formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string | null)?.trim();
  if (!name) return;
  const maxOrder = await prisma.vehicleBrand.aggregate({ _max: { order: true } });
  await prisma.vehicleBrand.create({ data: { name, order: (maxOrder._max.order ?? -1) + 1 } });
  revalidate();
}

export async function updateBrandAction(id: string, formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string | null)?.trim();
  if (!name) return;
  await prisma.vehicleBrand.update({ where: { id }, data: { name } });
  revalidate();
}

export async function deleteBrandAction(id: string) {
  await requireAdmin();
  await prisma.vehicleBrand.delete({ where: { id } });
  revalidate();
}

// --- Model ---

export async function createModelAction(brandId: string, formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string | null)?.trim();
  if (!name) return;
  const maxOrder = await prisma.vehicleModel.aggregate({ where: { brandId }, _max: { order: true } });
  await prisma.vehicleModel.create({ data: { name, brandId, order: (maxOrder._max.order ?? -1) + 1 } });
  revalidate();
}

export async function updateModelAction(id: string, formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string | null)?.trim();
  if (!name) return;
  await prisma.vehicleModel.update({ where: { id }, data: { name } });
  revalidate();
}

export async function deleteModelAction(id: string) {
  await requireAdmin();
  await prisma.vehicleModel.delete({ where: { id } });
  revalidate();
}

// --- Jenerasyon ---

export async function createGenerationAction(modelId: string, formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string | null)?.trim();
  const yearStart = parseInt(formData.get("yearStart") as string);
  const yearEndRaw = (formData.get("yearEnd") as string | null)?.trim();
  const yearEnd = yearEndRaw ? parseInt(yearEndRaw) : null;
  if (!name || isNaN(yearStart)) return;
  const maxOrder = await prisma.vehicleGeneration.aggregate({ where: { modelId }, _max: { order: true } });
  await prisma.vehicleGeneration.create({
    data: { name, yearStart, yearEnd, modelId, order: (maxOrder._max.order ?? -1) + 1 },
  });
  revalidate();
}

export async function updateGenerationAction(id: string, formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string | null)?.trim();
  const yearStart = parseInt(formData.get("yearStart") as string);
  const yearEndRaw = (formData.get("yearEnd") as string | null)?.trim();
  const yearEnd = yearEndRaw ? parseInt(yearEndRaw) : null;
  if (!name || isNaN(yearStart)) return;
  await prisma.vehicleGeneration.update({ where: { id }, data: { name, yearStart, yearEnd } });
  revalidate();
}

export async function deleteGenerationAction(id: string) {
  await requireAdmin();
  await prisma.vehicleGeneration.delete({ where: { id } });
  revalidate();
}

// --- Donanım/Motor (Trim) ---

export async function createTrimAction(generationId: string, formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string | null)?.trim();
  const fuelType = (formData.get("fuelType") as string | null)?.trim();
  const transmission = (formData.get("transmission") as string | null)?.trim();
  if (!name || !fuelType || !transmission) return;
  const maxOrder = await prisma.vehicleTrim.aggregate({ where: { generationId }, _max: { order: true } });
  await prisma.vehicleTrim.create({
    data: {
      name,
      fuelType,
      transmission,
      equipmentPackage: (formData.get("equipmentPackage") as string | null)?.trim() || null,
      engineVolume: (formData.get("engineVolume") as string | null)?.trim() || null,
      enginePower: (formData.get("enginePower") as string | null)?.trim() || null,
      drivetrain: (formData.get("drivetrain") as string | null)?.trim() || null,
      generationId,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });
  revalidate();
}

export async function updateTrimAction(id: string, formData: FormData) {
  await requireAdmin();
  const name = (formData.get("name") as string | null)?.trim();
  const fuelType = (formData.get("fuelType") as string | null)?.trim();
  const transmission = (formData.get("transmission") as string | null)?.trim();
  if (!name || !fuelType || !transmission) return;
  await prisma.vehicleTrim.update({
    where: { id },
    data: {
      name,
      fuelType,
      transmission,
      equipmentPackage: (formData.get("equipmentPackage") as string | null)?.trim() || null,
      engineVolume: (formData.get("engineVolume") as string | null)?.trim() || null,
      enginePower: (formData.get("enginePower") as string | null)?.trim() || null,
      drivetrain: (formData.get("drivetrain") as string | null)?.trim() || null,
    },
  });
  revalidate();
}

export async function deleteTrimAction(id: string) {
  await requireAdmin();
  await prisma.vehicleTrim.delete({ where: { id } });
  revalidate();
}
