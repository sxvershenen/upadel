"use client";
import { useDocumentInfo } from "@payloadcms/ui";
import { useState } from "react";
export function LeadNotificationRetry() {
  const { id } = useDocumentInfo();
  const [state, setState] = useState("");
  if (!id) return null;
  const retry = async () => {
    if (!confirm("Повторить отправку уведомлений для этого обращения?")) return;
    setState("Отправляем…");
    try {
      const r = await fetch(`/api/admin/leads/${id}/retry-notifications`, {
        method: "POST",
      });
      const d = await r.json();
      setState(
        r.ok ? `Результат: ${d.status}` : "Не удалось повторить отправку.",
      );
    } catch {
      setState("Не удалось связаться с сервером.");
    }
  };
  return (
    <div>
      <button
        type="button"
        className="btn btn--style-secondary btn--size-small"
        onClick={() => void retry()}
      >
        Повторить уведомления
      </button>
      {state && <p>{state}</p>}
    </div>
  );
}
