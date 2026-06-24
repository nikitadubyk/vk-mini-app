import { NextRequest, NextResponse } from "next/server";

const TOKEN = process.env.VK_GROUP_TOKEN!;
const V = process.env.VK_API_VERSION!;
const API = "https://api.vk.com/method";

// value из селекта -> peer_id беседы (2000000000 + chat_id)
const CHAT_MAP: Record<string, number> = {
  ozon: 2000000003,
  wb: 2000000004,
  cdek: 2000000003,
  yandex: 2000000004,
};

async function uploadPhoto(file: File, peerId: number): Promise<string> {
  // 1. сервер для загрузки
  const srvRes = await fetch(
    `${API}/photos.getMessagesUploadServer?peer_id=${peerId}&access_token=${TOKEN}&v=${V}`,
  );
  const srv = await srvRes.json();

  console.log("srv", srv);

  // 2. загрузка файла
  const upForm = new FormData();
  upForm.append("photo", file, file.name || "image.jpg");
  const upRes = await fetch(srv.response.upload_url, {
    method: "POST",
    body: upForm,
  });
  const up = await upRes.json();

  // 3. сохранение
  const saveRes = await fetch(
    `${API}/photos.saveMessagesPhoto?photo=${encodeURIComponent(up.photo)}` +
      `&server=${up.server}&hash=${encodeURIComponent(up.hash)}` +
      `&access_token=${TOKEN}&v=${V}`,
  );
  const saved = await saveRes.json();
  const p = saved.response[0];
  return `photo${p.owner_id}_${p.id}`;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const chatId = form.get("chatId") as string;
    const text = (form.get("text") as string) || "";
    const image = form.get("image") as File | null;

    const userId = (form.get("userId") as string) || "";
    const firstName = (form.get("firstName") as string) || "";
    const lastName = (form.get("lastName") as string) || "";

    const peerId = CHAT_MAP[chatId];

    if (!peerId) {
      return NextResponse.json({ error: "unknown chat" }, { status: 400 });
    }

    let attachment: string | undefined;

    if (image && image.size > 0) {
      attachment = await uploadPhoto(image, peerId);
    }

    const message = `
      📦 Новая заявка

      👤 Пользователь: ${firstName} ${lastName}
      🔗 https://vk.com/id${userId}

      📝 Сообщение:
      ${text}
    `.trim();

    const params = new URLSearchParams({
      peer_id: String(peerId),
      message,
      random_id: String(Date.now()),
      access_token: TOKEN,
      v: V,
    });

    if (attachment) {
      params.set("attachment", attachment);
    }

    const sendRes = await fetch(`${API}/messages.send?${params}`);

    const sendData = await sendRes.json();

    if (sendData.error) {
      return NextResponse.json(
        { error: sendData.error.error_msg },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);

    return NextResponse.json({ error: "send failed" }, { status: 500 });
  }
}
