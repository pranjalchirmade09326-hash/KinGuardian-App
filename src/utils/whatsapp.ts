import { Linking, Platform } from 'react-native';

export interface WhatsAppLinkOptions {
  phone?: string;
  text?: string;
  preferAppScheme?: boolean;
}

/**
 * Sanitizes phone number into international numeric format without leading '+' or symbols.
 * If 10 digits are provided, prepends the defaultCountryCode (default '91').
 */
export function cleanPhoneNumber(phone?: string, defaultCountryCode: string = '91'): string {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10 && defaultCountryCode) {
    cleaned = defaultCountryCode + cleaned;
  }
  return cleaned;
}

/**
 * Builds universal HTTPS wa.me direct messaging link.
 * Example: https://wa.me/919876543210?text=Hello
 */
export function buildWhatsAppWebLink(phone?: string, text?: string): string {
  const cleanPhone = cleanPhoneNumber(phone);
  const encodedText = text ? encodeURIComponent(text) : '';
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}${encodedText ? `?text=${encodedText}` : ''}`;
  }
  return `https://wa.me/${encodedText ? `?text=${encodedText}` : ''}`;
}

/**
 * Builds native whatsapp:// protocol deep-link for device app launching.
 * Example: whatsapp://send?phone=919876543210&text=Hello
 */
export function buildWhatsAppDeepLink(phone?: string, text?: string): string {
  const cleanPhone = cleanPhoneNumber(phone);
  const encodedText = text ? encodeURIComponent(text) : '';
  const queryParts: string[] = [];
  if (cleanPhone) queryParts.push(`phone=${cleanPhone}`);
  if (encodedText) queryParts.push(`text=${encodedText}`);
  return `whatsapp://send${queryParts.length > 0 ? `?${queryParts.join('&')}` : ''}`;
}

/**
 * Resolves the appropriate WhatsApp URL based on options and platform preference.
 */
export function buildWhatsAppUrl({ phone, text, preferAppScheme }: WhatsAppLinkOptions): string {
  if (preferAppScheme && Platform.OS !== 'web') {
    return buildWhatsAppDeepLink(phone, text);
  }
  return buildWhatsAppWebLink(phone, text);
}

/**
 * Opens WhatsApp conversation via native deep-link or universal web link with fallback.
 */
export async function openWhatsApp(
  options: WhatsAppLinkOptions
): Promise<{ success: boolean; url: string; error?: string }> {
  const url = buildWhatsAppUrl(options);
  const webUrl = buildWhatsAppWebLink(options.phone, options.text);

  try {
    if (Platform.OS !== 'web' && options.preferAppScheme) {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return { success: true, url };
      }
      // Fallback to universal web link
      await Linking.openURL(webUrl);
      return { success: true, url: webUrl };
    }

    await Linking.openURL(url);
    return { success: true, url };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to open WhatsApp link';
    // Final fallback attempt on error
    try {
      await Linking.openURL(webUrl);
      return { success: true, url: webUrl };
    } catch {
      return { success: false, url, error: errorMsg };
    }
  }
}

/**
 * KinGuardian domain-specific pre-populated care templates.
 */
export const WhatsAppTemplates = {
  parentInvite: (parentName: string, coordinatorName: string = 'Anjali') =>
    `Hi ${parentName}, ${coordinatorName} has invited you to connect on KinGuardian to stay safely connected with your family health care: https://kinguardian.app`,
  medicationReminder: (parentName: string, medName: string, dose: string, time: string) =>
    `Hi ${parentName}, reminder from KinGuardian: please take your ${medName} (${dose}) scheduled for ${time}.`,
  caregiverTask: (caregiverName: string, taskTitle: string, time: string) =>
    `Hi ${caregiverName}, regarding task "${taskTitle}" scheduled for ${time}: please update status in KinGuardian when completed. Thank you!`,
  checkInRequest: (parentName: string) =>
    `Hi ${parentName}, hope you are doing well today! How are you feeling? Please let me know or tap check-in on KinGuardian.`,
  emergencyAlert: (parentName: string, metric: string, value: string) =>
    `ALERT from KinGuardian: Abnormal ${metric} (${value}) detected for ${parentName}. Please check in immediately.`
};
