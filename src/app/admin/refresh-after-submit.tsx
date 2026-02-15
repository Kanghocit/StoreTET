"use client";

import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { useEffect, useRef } from "react";

/** Đặt trong form; khi submit xong (pending -> false) gọi router.refresh() để cập nhật data không reload trang. */
export function RefreshAfterSubmit() {
  const router = useRouter();
  const { pending } = useFormStatus();
  const prev = useRef(false);

  useEffect(() => {
    if (prev.current && !pending) router.refresh();
    prev.current = pending;
  }, [pending, router]);

  return null;
}
