import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { openWhatsApp, WhatsAppLinkOptions } from '../../utils/whatsapp';

export interface WhatsAppButtonProps extends WhatsAppLinkOptions {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'solid' | 'outline';
  className?: string;
  onPressCustom?: (url: string) => void;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phone,
  text,
  preferAppScheme,
  label = 'Chat on WhatsApp',
  size = 'md',
  variant = 'solid',
  className = '',
  onPressCustom
}) => {
  const handlePress = async () => {
    const res = await openWhatsApp({ phone, text, preferAppScheme });
    if (onPressCustom) {
      onPressCustom(res.url);
    }
  };

  const isSolid = variant === 'solid';
  const sizeClasses = size === 'sm' ? 'py-1.5 px-3' : size === 'lg' ? 'py-3.5 px-6' : 'py-2.5 px-4';
  const textClasses =
    size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base font-bold' : 'text-sm font-semibold';
  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 18;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      className={`flex-row items-center justify-center rounded-xl gap-2 ${
        isSolid ? 'bg-[#25D366]' : 'border border-[#25D366] bg-[#25D366]/10'
      } ${sizeClasses} ${className}`}
    >
      <MessageCircle size={iconSize} color={isSolid ? '#ffffff' : '#25D366'} />
      <Text className={`${textClasses} ${isSolid ? 'text-white' : 'text-[#128C7E]'}`}>{label}</Text>
    </TouchableOpacity>
  );
};
