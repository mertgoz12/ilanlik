import { prisma } from "@/lib/prisma";

// Expo push bildirim gönderimi. Kullanıcıların cihaz token'ları User.pushToken'da
// tutulur; buradaki yardımcılar Expo Push API'sine istek atar. Gönderim asla
// çağıran akışı çökertmemeli — tüm hatalar yutulur (bildirim yine DB'ye yazılır).

type PushMessage = { title: string; body: string; data?: Record<string, unknown> };

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

function isExpoToken(t: string | null | undefined): t is string {
  return !!t && (t.startsWith("ExponentPushToken") || t.startsWith("ExpoPushToken"));
}

async function sendToTokens(tokens: string[], msg: PushMessage): Promise<void> {
  const valid = tokens.filter(isExpoToken);
  if (valid.length === 0) return;

  const messages = valid.map((to) => ({
    to,
    title: msg.title,
    body: msg.body,
    data: msg.data ?? {},
    sound: "default",
    channelId: "default",
    priority: "high",
  }));

  // Expo tek istekte en fazla 100 mesaj kabul eder.
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    try {
      await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(chunk),
      });
    } catch (err) {
      console.error("[push] Expo gönderimi başarısız:", err);
    }
  }
}

// Tek kullanıcıya push (token'ı varsa).
export async function sendPushToUser(userId: string, msg: PushMessage): Promise<void> {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { pushToken: true } });
    if (isExpoToken(user?.pushToken)) await sendToTokens([user!.pushToken!], msg);
  } catch (err) {
    console.error("[push] sendPushToUser:", err);
  }
}

// Birden çok kullanıcıya push (token'ı olanlara).
export async function sendPushToUsers(userIds: string[], msg: PushMessage): Promise<void> {
  if (userIds.length === 0) return;
  try {
    const users = await prisma.user.findMany({
      where: { id: { in: userIds }, pushToken: { not: null } },
      select: { pushToken: true },
    });
    const tokens = users.map((u) => u.pushToken).filter(isExpoToken);
    await sendToTokens(tokens, msg);
  } catch (err) {
    console.error("[push] sendPushToUsers:", err);
  }
}
