"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TestimonialForm } from "@/components/admin/TestimonialForm";
import { deleteTestimonial } from "@/lib/actions/testimonials";
import type { AdminTestimonial } from "@/lib/queries/admin";

export function TestimonialsManager({ testimonials }: { testimonials: AdminTestimonial[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminTestimonial | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminTestimonial | null>(null);

  async function handleDelete() {
    if (!deleteTarget) return;
    const result = await deleteTestimonial(deleteTarget.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Đã xóa đánh giá");
    setDeleteTarget(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      {!creating && (
        <Button type="button" variant="glass" onClick={() => setCreating(true)} className="self-start">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Thêm đánh giá
        </Button>
      )}
      {creating && <TestimonialForm onDone={() => setCreating(false)} />}

      <ul className="flex flex-col gap-3">
        {testimonials.map((testimonial) =>
          editing?.id === testimonial.id ? (
            <li key={testimonial.id}>
              <TestimonialForm testimonial={testimonial} onDone={() => setEditing(null)} />
            </li>
          ) : (
            <li
              key={testimonial.id}
              className="flex items-start justify-between gap-4 rounded-lg border border-ink-700 bg-ink-900 p-4"
            >
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-fg">{testimonial.name}</p>
                  {!testimonial.is_published && (
                    <span className="text-xs text-fg-subtle">(đang ẩn)</span>
                  )}
                </div>
                {testimonial.role && (
                  <p className="text-xs text-fg-subtle">{testimonial.role}</p>
                )}
                <div className="mt-1 flex items-center gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-neon-lime text-neon-lime" aria-hidden="true" />
                  ))}
                </div>
                <p className="mt-2 text-sm text-fg-muted">{testimonial.content}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(testimonial)}
                  aria-label={`Sửa ${testimonial.name}`}
                  className="text-fg-muted hover:text-fg"
                >
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(testimonial)}
                  aria-label={`Xóa ${testimonial.name}`}
                  className="text-fg-subtle hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ),
        )}
      </ul>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa đánh giá"
        description="Hành động này không thể hoàn tác."
        expectedText={deleteTarget?.name ?? ""}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
