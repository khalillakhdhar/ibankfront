import { InjectionToken } from '@angular/core';
import { toDataURL } from 'qrcode';

/** Turns text into a QR data URL entirely in the browser (no network call). */
export type QrRenderer = (text: string) => Promise<string>;

export const QR_RENDERER = new InjectionToken<QrRenderer>('QR_RENDERER', {
  providedIn: 'root',
  factory: () => (text: string) => toDataURL(text, { margin: 1, width: 200 }),
});
