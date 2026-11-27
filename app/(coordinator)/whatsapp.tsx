import { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  MessageCircle,
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  Pill,
  Sun,
  UserCheck,
  Phone
} from 'lucide-react-native';
import { AppContext } from '../../src/store/AppContext';
import { AuthContext } from '../../src/store/AuthContext';
import { DeviceFrame } from '../../src/components/DeviceFrame';
import { BottomNavBar } from '../../src/components/Navigation';
import { openWhatsApp } from '../../src/utils/whatsapp';
import {
  whatsAppCloudService,
  type IncomingWhatsAppReply
} from '../../src/services/WhatsAppCloudService';

export default function WhatsAppHubPage() {
  const context = useContext(AppContext);
  const auth = useContext(AuthContext);
  const router = useRouter();
  const [containerWidth, setContainerWidth] = useState(0);
  const isWide = containerWidth >= 680;

  const parents = context?.familyMembers || [];
  const [selectedParentId, setSelectedParentId] = useState<string>(
    context?.currentPersonId || parents[0]?.id || ''
  );
  const selectedParent =
    parents.find((p) => p.id === selectedParentId) || parents[0] || null;

  const [recipientPhone, setRecipientPhone] = useState(
    (selectedParent as any)?.phone || '9270756299'
  );
  const [selectedTemplate, setSelectedTemplate] = useState<
    'digest' | 'alert' | 'medication' | 'checkin'
  >('digest');
  const [customMessage, setCustomMessage] = useState<string | null>(null);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [incomingReplies, setIncomingReplies] = useState<IncomingWhatsAppReply[]>([]);

  useEffect(() => {
    if (selectedParent) {
      const pPhone = (selectedParent as any)?.phone;
      if (pPhone) setRecipientPhone(String(pPhone).replace(/^\+91\s*/, ''));
    }
  }, [selectedParentId, selectedParent]);

  if (!context) return null;

  const recipientName = selectedParent?.name || context.primaryParentName || 'Parent';
  const coordFirstName =
    auth?.user?.name?.split(' ')[0] || context.coordinatorName?.split(' ')[0] || 'Beta';
  const coordCity = auth?.user?.city || 'abroad';
  const currentBP = context.currentBP || '122/80 mmHg';

  const getTemplateMessage = () => {
    switch (selectedTemplate) {
      case 'digest':
        return (
          `🌅 KinGuardian Morning Health Digest\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `👤 Patient: ${recipientName}\n` +
          `❤️ Blood Pressure: ${currentBP} (Optimal)\n` +
          `💓 Resting Heart Rate: 72 BPM\n` +
          `🚶 Morning Activity: 4,200 steps\n` +
          `💊 Medication: Morning dose logged\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `Synced via KinGuardian. Have a wonderful day! 💙`
        );
      case 'alert':
        return (
          `🚨 KinGuardian Urgent Vital Alert\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `⚠️ Patient: ${recipientName}\n` +
          `📊 Detected Reading: Blood Pressure ${currentBP}\n` +
          `🩺 Recommendation: Please rest for 15 minutes, drink a glass of water, and re-test.\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `Family notified in ${coordCity}.`
        );
      case 'medication':
        return (
          `💊 KinGuardian Medication Reminder\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `Namaste ${recipientName},\n` +
          `Time for your scheduled medicine dose after your meal.\n` +
          `⏰ Please reply "HAAN" or "DONE" once taken! 🙏`
        );
      case 'checkin':
      default:
        return (
          `☀️ KinGuardian Daily Family Check-In\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `Namaste ${recipientName}! Hope you are having a peaceful day.\n` +
          `How are you feeling today? Everything good?\n` +
          `Thinking of you from ${coordCity}! 💙`
        );
    }
  };

  const messageText = customMessage !== null ? customMessage : getTemplateMessage();

  const handleSelectTemplate = (tplId: 'digest' | 'alert' | 'medication' | 'checkin') => {
    setSelectedTemplate(tplId);
    setCustomMessage(null);
  };

  const handleSendWhatsApp = async () => {
    if (!recipientPhone.trim()) {
      context.showToast('Please enter a WhatsApp phone number');
      return;
    }
    setSentSuccess(false);
    const result = await openWhatsApp({
      phone: recipientPhone.trim(),
      text: messageText
    });
    if (result.success) {
      setSentSuccess(true);
      context.showToast(`WhatsApp opened for ${recipientName}`);
      setTimeout(() => setSentSuccess(false), 4000);
    }
  };

  const handleSimulateReply = () => {
    const replyText =
      selectedTemplate === 'alert'
        ? `Haan ${coordFirstName}, maine 1 glass paani pi liya hai aur rest kar raha hoon. Sab theek hai.`
        : `Haan ${coordFirstName}, medicine le li hai aur tabiyat bilkul theek hai!`;

    const reply = whatsAppCloudService.parseIncomingReply(recipientPhone, replyText);
    setIncomingReplies((prev) => [
      { ...reply, senderName: recipientName },
      ...prev
    ]);
    context.showToast(`WhatsApp reply received from ${recipientName}`);
  };

  const templates = [
    { id: 'digest', label: 'Morning Digest', icon: Sun, color: '#f59e0b' },
    { id: 'alert', label: 'BP Anomaly Alert', icon: AlertTriangle, color: '#dc2626' },
    { id: 'medication', label: 'Pill Reminder', icon: Pill, color: '#007aff' },
    { id: 'checkin', label: 'Daily Check-In', icon: Sparkles, color: '#9333ea' }
  ] as const;

  return (
    <DeviceFrame>
      <View
        className="flex-1 bg-[#f2f2f7]"
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        {/* Top Navigation Header */}
        <View className="bg-[#128C7E] px-4 py-3.5 flex-row items-center justify-between gap-2">
          <View className="flex-row items-center gap-2.5 flex-1 min-w-0">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-8 h-8 rounded-full bg-white/15 items-center justify-center shrink-0 active:bg-white/25"
            >
              <ArrowLeft size={16} color="#ffffff" />
            </TouchableOpacity>
            <View className="flex-1 min-w-0">
              <Text className="text-[9px] font-bold text-emerald-100 uppercase tracking-wider">
                Cross-Border Dispatch
              </Text>
              <Text className="text-base font-black text-white tracking-tight" numberOfLines={1}>
                WhatsApp Care Hub
              </Text>
            </View>
          </View>
          <View className="bg-white/20 px-2.5 py-1 rounded-full flex-row items-center gap-1 shrink-0">
            <MessageCircle size={12} color="#ffffff" />
            <Text className="text-[10px] font-bold text-white">Ready</Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 110,
            maxWidth: 1120,
            width: '100%',
            alignSelf: 'center'
          }}
        >
          <View
            style={{
              flexDirection: isWide ? 'row' : 'column',
              gap: isWide ? 20 : 16,
              alignItems: 'flex-start'
            }}
          >
            {/* Left Column: Recipient + Templates + Webhook Simulator */}
            <View style={{ flex: isWide ? 1 : undefined, width: isWide ? undefined : '100%', gap: 16 }}>
              {/* Parent Selector (if parents added) */}
              {parents.length > 0 && (
                <View className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs">
                  <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
                    Select Parent
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {parents.map((p) => {
                      const active = (selectedParent?.id || '') === p.id;
                      return (
                        <TouchableOpacity
                          key={p.id}
                          onPress={() => {
                            setSelectedParentId(p.id);
                            setCustomMessage(null);
                          }}
                          className={`px-3.5 py-2 rounded-xl border ${
                            active
                              ? 'bg-emerald-50 border-[#128C7E]'
                              : 'bg-neutral-50 border-neutral-200'
                          }`}
                        >
                          <Text
                            className={`text-xs font-bold ${
                              active ? 'text-[#128C7E]' : 'text-neutral-700'
                            }`}
                          >
                            {p.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Recipient Contact Card */}
              <View className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs">
                <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
                  Recipient WhatsApp Number
                </Text>
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center shrink-0">
                    <UserCheck size={20} color="#128C7E" />
                  </View>
                  <View className="flex-1 min-w-0">
                    <Text className="text-xs font-bold text-neutral-900" numberOfLines={1}>
                      {recipientName}
                    </Text>
                    <View className="flex-row items-center gap-1.5 mt-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2">
                      <Phone size={12} color="#128C7E" />
                      <Text className="text-xs font-semibold text-neutral-500">+91</Text>
                      <TextInput
                        value={recipientPhone}
                        onChangeText={setRecipientPhone}
                        placeholder="9270756299"
                        placeholderTextColor="#a3a3a3"
                        keyboardType="phone-pad"
                        className="flex-1 min-w-0 text-xs font-bold text-neutral-800 p-0 m-0"
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Template Selector */}
              <View className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs">
                <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2.5">
                  Select Care Template
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {templates.map((tpl) => {
                    const Icon = tpl.icon;
                    const active = selectedTemplate === tpl.id;
                    return (
                      <TouchableOpacity
                        key={tpl.id}
                        onPress={() => handleSelectTemplate(tpl.id)}
                        className={`flex-row items-center gap-1.5 px-3 py-2.5 rounded-xl border ${
                          active ? 'bg-emerald-50 border-[#128C7E]' : 'bg-neutral-50 border-neutral-200'
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

              {/* Simulate Parent Reply Card */}
              <View className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs flex-row items-center justify-between gap-3">
                <View className="flex-1">
                  <Text className="text-xs font-bold text-neutral-800">Simulate Parent Reply</Text>
                  <Text className="text-[10px] text-neutral-400 mt-0.5">
                    Test KinGuardian incoming WhatsApp webhook
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={handleSimulateReply}
                  className="bg-purple-50 border border-purple-200 px-3.5 py-2 rounded-xl active:bg-purple-100"
                >
                  <Text className="text-[11px] font-bold text-[#9333ea]">
                    Receive "HAAN" Reply
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Right Column: Live WhatsApp Preview & Send */}
            <View style={{ flex: isWide ? 1.15 : undefined, width: isWide ? undefined : '100%', gap: 16 }}>
              <View className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs space-y-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Live Message Preview (Editable)
                  </Text>
                  {customMessage !== null && (
                    <TouchableOpacity onPress={() => setCustomMessage(null)}>
                      <Text className="text-[10px] font-bold text-[#007aff]">Reset Template</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View className="bg-[#E5DDD5] p-4 rounded-2xl border border-neutral-300">
                  <View className="bg-[#DCF8C6] p-3.5 rounded-2xl rounded-tr-none border border-emerald-200/70 self-end w-full">
                    <TextInput
                      value={messageText}
                      onChangeText={setCustomMessage}
                      multiline
                      className="text-xs text-neutral-800 leading-relaxed font-normal"
                      style={{ minHeight: 150, textAlignVertical: 'top' }}
                    />
                    <View className="flex-row items-center justify-end gap-1 mt-2">
                      <Text className="text-[9px] text-neutral-500">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      <Text className="text-[10px] text-[#34B7F1] font-bold">✓✓</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleSendWhatsApp}
                  activeOpacity={0.88}
                  className="w-full bg-[#25D366] py-3.5 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm active:opacity-95"
                >
                  <Send size={17} color="#ffffff" />
                  <Text className="text-sm font-black text-white">Open &amp; Send via WhatsApp</Text>
                </TouchableOpacity>

                {sentSuccess && (
                  <View className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex-row items-center gap-2">
                    <CheckCircle2 size={16} color="#16a34a" />
                    <Text className="text-xs font-bold text-emerald-800">
                      WhatsApp opened with pre-filled message for {recipientName}!
                    </Text>
                  </View>
                )}
              </View>

              {/* Incoming Replies Log */}
              {incomingReplies.length > 0 && (
                <View className="bg-white rounded-2xl p-4 border border-neutral-200/80 shadow-xs space-y-2.5">
                  <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Recent Parent WhatsApp Replies
                  </Text>
                  {incomingReplies.map((r, idx) => (
                    <View
                      key={idx}
                      className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 space-y-1"
                    >
                      <View className="flex-row items-center justify-between">
                        <Text className="text-xs font-bold text-emerald-950">{r.senderName}</Text>
                        <Text className="text-[10px] font-semibold text-emerald-700">
                          {r.receivedAt}
                        </Text>
                      </View>
                      <Text className="text-xs text-neutral-800">{r.messageText}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <BottomNavBar
          activeTab="care"
          currentScreen="health_dashboard"
          onTabChange={(tab) => {
            if (tab === 'home') router.push('/(coordinator)');
            else if (tab === 'parents') router.push('/(coordinator)/parents');
            else if (tab === 'ask') context.setAskAIOpen(true);
            else if (tab === 'care') router.push('/(coordinator)/care');
            else if (tab === 'profile') router.push('/(coordinator)/profile');
          }}
          onOpenQuickActions={() => context.setQuickActionsOpen(true)}
          onOpenAskAI={() => context.setAskAIOpen(true)}
        />
      </View>
    </DeviceFrame>
  );
}
