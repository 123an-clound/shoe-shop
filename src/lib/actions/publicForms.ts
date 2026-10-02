"use server";

import { createClient } from "@/lib/supabase/server";
import { contactMessageInputSchema, newsletterInputSchema } from "@/lib/validation/publicForms";

export type PublicFormResult = { success: true } | { success: false; error: string };

export async function submitContactMessage(input: unknown): Promise<PublicFormResult> {
  const parsed = contactMessageInputSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Please check the form and try again." };
  if (parsed.data.website) return { success: true };

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("veloce_submit_contact_message", {
      p_name: parsed.data.name,
      p_email: parsed.data.email,
      p_phone: null,
      p_message: parsed.data.message,
      p_locale: parsed.data.locale,
    });
    if (error) {
      if (error.code === "P0001") {
        return { success: false, error: "Too many messages from this email. Please try again later." };
      }
      return { success: false, error: "We could not save your message. Please try again." };
    }
    return { success: true };
  } catch {
    return { success: false, error: "We could not connect to save your message. Please try again." };
  }
}

export async function subscribeToNewsletter(input: unknown): Promise<PublicFormResult> {
  const parsed = newsletterInputSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Please enter a valid email address." };

  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("veloce_subscribe_newsletter", {
      p_email: parsed.data.email,
      p_locale: parsed.data.locale,
    });
    if (error) return { success: false, error: "We could not save your email. Please try again." };
    return { success: true };
  } catch {
    return { success: false, error: "We could not connect to save your email. Please try again." };
  }
}
