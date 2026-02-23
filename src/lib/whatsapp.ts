import type { CartStoreBreakdown } from "@/types";

export function generateWhatsAppLink(
  phoneNumber: string,
  message: string
): string {
  const cleaned = phoneNumber.replace(/\D/g, "");
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleaned}?text=${encoded}`;
}

export function generateCartMessage(
  storeName: string,
  items: CartStoreBreakdown["items"],
  total: number
): string {
  let message = `🛒 *MaDe Market Order*\n\n`;
  message += `Store: ${storeName}\n\n`;

  items.forEach((item) => {
    message += `• ${item.productName} x${item.quantity} — $${(item.price * item.quantity).toFixed(2)}\n`;
  });

  message += `\n*Total: $${total.toFixed(2)}*\n`;
  message += `\nSent via MaDe Market`;

  return message;
}

export function generateInquiryLink(
  phoneNumber: string,
  productName: string,
  storeName: string
): string {
  const message = `Hi ${storeName}, I'm interested in "${productName}" listed on MaDe Market. Is it available?`;
  return generateWhatsAppLink(phoneNumber, message);
}
