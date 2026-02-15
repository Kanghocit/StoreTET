"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Option = { id: string; name: string };

export function SearchableSelect({
  name,
  options,
  defaultValue = "",
  placeholder = "Chọn...",
  className,
  allowEmpty = true,
  form,
}: {
  name: string;
  options: Option[];
  defaultValue?: string;
  placeholder?: string;
  className?: string;
  allowEmpty?: boolean;
  form?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(defaultValue);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedId(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (!isOpen) return;
    const onOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [isOpen]);

  const selectedOption = useMemo(
    () => options.find((o) => o.id === selectedId),
    [options, selectedId],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.name.toLowerCase().includes(q));
  }, [options, search]);

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={selectedId} form={form} />
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen((v) => !v)}
        className={cn("min-w-32 justify-between font-normal", className)}
      >
        {selectedOption ? selectedOption.name : placeholder}
      </Button>
      {isOpen && (
        <div className="border-border bg-popover text-popover-foreground absolute left-0 top-full z-20 mt-1 min-w-48 rounded-md border shadow-md">
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm..."
            className="border-0 border-b rounded-none focus-visible:ring-0"
            autoFocus
          />
          <ul className="max-h-48 overflow-auto py-1">
            {allowEmpty && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId("");
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                    !selectedId && "bg-accent text-accent-foreground",
                  )}
                >
                  {placeholder}
                </button>
              </li>
            )}
            {filtered.map((o) => (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedId(o.id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground",
                    selectedId === o.id && "bg-accent text-accent-foreground",
                  )}
                >
                  {o.name}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-muted-foreground">Không có kết quả</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
