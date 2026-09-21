import QRCode from "qrcode";
import { randomBytes } from "crypto";

export function generateTicketCode(): string {
  return randomBytes(5).toString("hex").toUpperCase();
}

export function generateConfirmationCode(): string {
  return `LEG-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export async function createQrDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 280,
    color: {
      dark: "#70110c",
      light: "#ffffff",
    },
  });
}
