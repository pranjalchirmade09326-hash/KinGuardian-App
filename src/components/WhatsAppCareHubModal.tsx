import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal } from 'react-native';
import {
  X,
  MessageCircle,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  Pill,
  Sun,
  UserCheck
} from 'lucide-react-native';
import { openWhatsApp } from '../utils/whatsapp';
import { whatsAppCloudService, type IncomingWhatsAppReply } from '../services/WhatsAppCloudService';

interface WhatsAppCareHubModalProps {
  visible: boolean;
  onClose: () => void;
  defaultPhone?: string;
  defaultRecipientName?: string;
  onSimulatedReply?: (reply: IncomingWhatsAppReply) => void;
}

export const WhatsAppCareHubModal: React.FC<WhatsAppCareHubModalProps> = ({
  visible,
  onClose,
  defaultPhone = '9270756299',
  defaultRecipientName = 'Dad Ramesh',
  onSimulatedReply
}) => {
  const [recipientPhone, setRecipientPhone] = useState(defaultPhone);
  const recipientName = defaultRecipientName;
  const [selectedTemplate, setSelectedTemplate] = useState<
    'digest' | 'alert' | 'medication' | 'checkin'
  >('digest');
  const [sentSuccess, setSentSuccess] = useState(false);
  const [incomingReplies, setIncomingReplies] = useState<IncomingWhatsAppReply[]>([]);

  // Generates live message text based on active template selection
  const getMessageContent = () => {
    switch (selectedTemplate) {
      case 'digest':
        return (
          `🌅 *KinGuardian Morning Health Digest*\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `👤 *Patient:* ${recipientName}\n` +
          `❤️ *Blood Pressure:* 122/80 mmHg (Optimal)\n` +
          `💓 *Resting Heart Rate:* 72 BPM\n` +
          `🚶 *Morning Activity:* 4,200 steps\n` +
          `💊 *Medication:* Amlodipine 5mg (Taken at 07:30 AM)\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `_Synced via Garmin Venu 3._ Have a wonderful day! 💙`
        );
      case 'alert':
        return (
          `🚨 *KinGuardian Urgent Vital Alert*\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `⚠️ *Patient:* ${recipientName}\n` +
          `📊 *Detected Anomaly:* Blood Pressure 142/92 mmHg\n` +
          `🩺 *Clinical Recommendation:* Elevated reading detected. Please have him rest for 15 minutes, drink a glass of water, and re-test.\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `Coordinators notified in London. Tap to confirm: https://kinguardian.app`
        );
      case 'medication':
        return (
          `💊 *KinGuardian Medication Reminder*\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `Namaste ${recipientName},\n` +
          `Time for your morning dose:\n` +
          `👉 *Amlodipine 5mg* (1 Tablet after breakfast)\n` +
          `⏰ *Scheduled:* 08:30 AM IST\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `Please reply *"HAAN"* or tap check-in once taken! 🙏`
        );
      case 'checkin':
      default:
        return (
          `☀️ *KinGuardian Daily Family Check-In*\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `Namaste ${recipientName}! Hope you are having a peaceful morning.\n` +
          `How are you feeling today? Everything good with morning walk & tea?\n` +
          `Thinking of you from London! 💙`
        );
    }
  };

  const messageText = getMessageContent();

  const handleSendWhatsApp = async () => {
    setSentSuccess(false);
    const result = await openWhatsApp({
      phone: recipientPhone,
      text: messageText
    });

    if (result.success) {
      setSentSuccess(true);
      setTimeout(() => setSentSuccess(false), 4000);
    }
  };

  const handleSimulateReply = () => {
    let replyText = 'Haan Anjali beta, medicine le li hai aur BP bhi 120/80 normal hai. Sab theek!';
    if (selectedTemplate === 'alert') {
      replyText = 'Haan beta, maine 1 glass paani pi liya hai aur baitha hoon. Refresh ho rha hai.';
    }

    const reply = whatsAppCloudService.parseIncomingReply(recipientPhone, replyText);
    setIncomingReplies((prev) => [reply, ...prev]);
    if (onSimulatedReply) {
      onSimulatedReply(reply);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 items-center justify-center p-4">
        <View className="w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-100 max-h-[92%]">
          {/* Top Modal Header */}
          <View className="bg-[#128C7E] px-6 py-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-xl bg-white/20 items-center justify-center">
                <MessageCircle size={22} color="#ffffff" />
              </View>
              <View>
                <Text className="text-base font-black text-white">WhatsApp Family Care Hub</Text>
                <Text className="text-[11px] text-emerald-100 font-medium">
                  Direct Cross-Border Dispatch & Sync
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 rounded-full bg-white/10 items-center justify-center active:bg-white/20"
            >
              <X size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-6" contentContainerStyle={{ paddingBottom: 24 }}>
            {/* Recipient Contact Card */}
            <View className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200">
              <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Recipient Contact (India Mobile)
              </Text>
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center">
                  <UserCheck size={20} color="#128C7E" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-neutral-900">{recipientName}</Text>
                  <View className="flex-row items-center gap-1 mt-0.5">
                    <Text className="text-[11px] font-semibold text-neutral-500">+91</Text>
                    <TextInput
                      value={recipientPhone}
                      onChangeText={setRecipientPhone}
                      placeholder="9270756299"
                      keyboardType="phone-pad"
                      className="text-xs font-bold text-neutral-800 p-0 m-0"
                    />
                  </View>
                </View>
                <View className="bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <Text className="text-[10px] font-bold text-[#128C7E]">WhatsApp Ready</Text>
                </View>
              </View>
            </View>

            {/* Template Selector Pills */}
            <View className="mt-5">
              <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
                Select Care Template
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {[
                  { id: 'digest', label: 'Morning Digest', icon: Sun, color: '#f59e0b' },
                  { id: 'alert', label: 'BP Anomaly Alert', icon: AlertTriangle, color: '#dc2626' },
                  { id: 'medication', label: 'Pill Reminder', icon: Pill, color: '#007aff' },
                  { id: 'checkin', label: 'Daily Check-In', icon: Sparkles, color: '#9333ea' }
                ].map((tpl) => {
                  const Icon = tpl.icon;
                  const active = selectedTemplate === tpl.id;
                  return (
                    <TouchableOpacity
                      key={tpl.id}
                      onPress={() => setSelectedTemplate(tpl.id as any)}
                      className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border ${
                        active ? 'bg-emerald-50 border-[#128C7E]' : 'bg-white border-neutral-200'
                      }`}
                    >
                      <Icon size={14} color={active ? '#128C7E' : tpl.color} />
                      <Text
                        className={`text-xs font-bold ${
                          active ? 'text-[#128C7E]' : 'text-neutral-700'
                        }`}
                      >
                        {tpl.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Live WhatsApp Chat Bubble Preview */}
            <View className="mt-5">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  Live Message Preview
                </Text>
                <Text className="text-[10px] text-neutral-400">Formatted for WhatsApp</Text>
              </View>

              <View className="bg-[#E5DDD5] p-4 rounded-2xl border border-neutral-300 shadow-inner">
                {/* Simulated Green WhatsApp Bubble */}
                <View className="bg-[#DCF8C6] p-3.5 rounded-2xl rounded-tr-none shadow-xs border border-emerald-200/60 self-end max-w-[95%]">
                  <Text className="text-xs text-neutral-800 leading-relaxed font-normal whitespace-pre-wrap">
                    {messageText}
                  </Text>
                  <View className="flex-row items-center justify-end gap-1 mt-2">
                    <Text className="text-[9px] text-neutral-400">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                    <Text className="text-[10px] text-[#34B7F1] font-bold">✓✓</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Primary Action Button */}
            <TouchableOpacity
              onPress={handleSendWhatsApp}
              activeOpacity={0.88}
              className="mt-6 w-full bg-[#25D366] py-3.5 rounded-2xl flex-row items-center justify-center gap-2 shadow-md shadow-emerald-500/20 active:opacity-95"
            >
              <Send size={18} color="#ffffff" />
              <Text className="text-sm font-black text-white">Open & Send via WhatsApp</Text>
            </TouchableOpacity>

            {sentSuccess && (
              <View className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex-row items-center gap-2">
                <CheckCircle2 size={16} color="#16a34a" />
                <Text className="text-xs font-bold text-emerald-800">
                  WhatsApp opened with pre-filled message!
                </Text>
              </View>
            )}

            {/* Secondary Simulation & Testing Tool */}
            <View className="mt-5 pt-4 border-t border-neutral-200 flex-row items-center justify-between">
              <View>
                <Text className="text-xs font-bold text-neutral-800">Simulate Parent Reply</Text>
                <Text className="text-[10px] text-neutral-400">
                  Test KinGuardian's incoming webhook loop
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleSimulateReply}
                className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 active:bg-purple-100"
              >
                <Text className="text-xs font-bold text-purple-700">Receive "HAAN" Reply</Text>
              </TouchableOpacity>
            </View>

            {/* Display Simulated Incoming Messages */}
            {incomingReplies.length > 0 && (
              <View className="mt-3 space-y-2">
                {incomingReplies.map((reply, i) => (
                  <View
                    key={i}
                    className="p-3 bg-neutral-100 rounded-xl border border-neutral-200 flex-row items-start gap-2.5"
                  >
                    <View className="w-6 h-6 rounded-full bg-emerald-600 items-center justify-center mt-0.5">
                      <Text className="text-white text-[10px] font-bold">R</Text>
                    </View>
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-[10px] font-bold text-neutral-800">
                          {reply.senderName}
                        </Text>
                        <Text className="text-[9px] text-neutral-400">{reply.receivedAt}</Text>
                      </View>
                      <Text className="text-xs text-neutral-700 mt-0.5">{reply.messageText}</Text>
                      {reply.intent === 'medication_confirmed' && (
                        <View className="mt-1.5 inline-block bg-emerald-100 px-2 py-0.5 rounded-md self-start">
                          <Text className="text-[9px] font-bold text-emerald-800">
                            ✓ Medicine Status Updated to Taken
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
