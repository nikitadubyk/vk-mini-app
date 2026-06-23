"use client";

import { useState } from "react";
import {
  Panel,
  PanelHeader,
  View,
  FormLayoutGroup,
  FormItem,
  Select,
  Textarea,
  File,
  Button,
} from "@vkontakte/vkui";

const chats = [
  { value: "ozon", label: "Ozon" },
  { value: "wb", label: "Wildberries" },
  { value: "cdek", label: "СДЭК" },
  { value: "yandex", label: "Яндекс Доставка" },
];

export default function Home() {
  const [chat, setChat] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState<globalThis.File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("chatId", chat);
      formData.append("text", text);
      if (image) formData.append("image", image);

      const res = await fetch("/api/send", { method: "POST", body: formData });
      if (!res.ok) throw new Error("send failed");
      alert("Отправлено");
    } catch {
      alert("Ошибка отправки");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View activePanel="main">
      <Panel id="main">
        <PanelHeader>Рассылка</PanelHeader>
        <FormLayoutGroup>
          <FormItem top="Куда отправить">
            <Select
              placeholder="Выберите чат"
              value={chat}
              onChange={(e) => setChat(e.target.value)}
              options={chats}
            />
          </FormItem>
          <FormItem top="Текст">
            <Textarea value={text} onChange={(e) => setText(e.target.value)} />
          </FormItem>
          <FormItem top="Изображение">
            <File
              accept="image/*"
              onChange={(e) => setImage(e.target.files?.[0] ?? null)}
            >
              Загрузить
            </File>
          </FormItem>
          <FormItem>
            <Button size="l" stretched loading={loading} onClick={handleSubmit}>
              Отправить
            </Button>
          </FormItem>
        </FormLayoutGroup>
      </Panel>
    </View>
  );
}
