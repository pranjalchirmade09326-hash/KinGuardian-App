import { useContext, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { AppContext } from '../../src/store/AppContext';
import { DeviceFrame } from '../../src/components/DeviceFrame';
import { SimulatorControls } from '../../src/components/SimulatorControls';
import { useRouter } from 'expo-router';
import { ArrowLeft, Send, Sparkles, FileText, Calendar, MessageCircle } from 'lucide-react-native';
import { WhatsAppCareHubModal } from '../../src/components/WhatsAppCareHubModal';

export default function FamilyCommunicationRoute() {
  const context = useContext(AppContext);
  const router = useRouter();

  const coordinatorName = context?.coordinatorName || 'Coordinator';
  const primaryParent = context?.primaryParentName || 'Dad';

  const [chatInput, setChatInput] = useState('');
  const [whatsAppHubOpen, setWhatsAppHubOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: coordinatorName,
      role: 'Primary Coordinator',
      avatarColor: '#007aff',
      message: `${primaryParent} has his cardiology appointment tomorrow.`,
      time: '10:15 AM'
    },
    {
      sender: 'Priya',
      role: 'Caregiver',
      avatarColor: '#34c759',
      message: "I'll take him.",
      time: '10:18 AM'
    },
    {
      sender: 'KinGuardian',
      role: 'System Copilot',
      avatarColor: '#af52de',
      message: `${primaryParent}'s latest medication and BP summary is ready.`,
      time: '10:20 AM',
      isSystem: true
    }
  ]);

  if (!context) return null;

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        sender: coordinatorName,
        role: 'Primary Coordinator',
        avatarColor: '#007aff',
        message: chatInput,
        time: 'Just now'
      }
    ]);
    setChatInput('');
    context.showToast('Message sent to Family Circle.');
  };

  return (
    <DeviceFrame>
      <View className="flex-1 relative bg-[#f2f2f7]">
        {/* Header with WhatsApp Care Hub Button */}
        <View className="px-6 py-4 border-b border-neutral-100 bg-white flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-1 bg-neutral-100 rounded-full active:scale-90"
            >
              <ArrowLeft size={18} color="#8e8e93" />
            </TouchableOpacity>
            <View>
              <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Care Circle Chat Log
              </Text>
              <Text className="text-xl font-bold text-neutral-900 tracking-tight mt-0.5">
                Family Chat
              </Text>
            </View>
          </View>

          {/* Direct WhatsApp Hub Trigger Button */}
          <TouchableOpacity
            onPress={() => setWhatsAppHubOpen(true)}
            activeOpacity={0.85}
            className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] active:opacity-90 shadow-sm"
          >
            <MessageCircle size={15} color="#ffffff" />
            <Text className="text-xs font-bold text-white">WhatsApp Hub</Text>
          </TouchableOpacity>
        </View>

        {/* Chat Feed */}
        <ScrollView className="flex-1 px-5 pt-4 space-y-4">
          <View className="space-y-4 pb-28">
            {/* WhatsApp Care Hub Quick Banner */}
            <TouchableOpacity
              onPress={() => setWhatsAppHubOpen(true)}
              activeOpacity={0.85}
              className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex-row items-center justify-between shadow-xs"
            >
              <View className="flex-row items-center gap-3 flex-1 mr-2">
                <View className="w-9 h-9 rounded-xl bg-[#25D366] items-center justify-center shadow-xs">
                  <MessageCircle size={18} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-bold text-emerald-950">
                    WhatsApp Care Hub
                  </Text>
                  <Text className="text-[11px] text-emerald-700 font-medium">
                    Send digests, vital alerts & pill reminders directly to Dad
                  </Text>
                </View>
              </View>
              <View className="px-2.5 py-1.5 rounded-xl bg-[#25D366]">
                <Text className="text-[10px] font-bold text-white uppercase">Open Hub</Text>
              </View>
            </TouchableOpacity>
            {messages.map((msg, idx) => {
              if (msg.isSystem) {
                return (
                  <View
                    key={idx}
                    className="bg-purple-50/70 border border-purple-100/50 rounded-2xl p-5 space-y-3 shadow-xs"
                  >
                    <View className="flex-row items-center gap-2">
                      <Sparkles size={14} color="#af52de" fill="#af52de" />
                      <Text className="text-[10px] font-bold text-[#af52de] uppercase tracking-wider">
                        KinGuardian Copilot
                      </Text>
                    </View>

                    <Text className="text-xs font-semibold text-neutral-700 leading-relaxed">
                      {msg.message}
                    </Text>

                    {/* Special In-bubble CTA Buttons */}
                    <View className="flex-row gap-2 pt-1">
                      <TouchableOpacity
                        onPress={() => router.push('/parent/dad/summary')}
                        className="flex-1 bg-white border border-neutral-200 py-2.5 rounded-xl flex-row items-center justify-center gap-1 active:opacity-90 shadow-xs"
                      >
                        <FileText size={10} color="#af52de" />
                        <Text className="text-[9px] font-bold text-[#af52de] uppercase">
                          View Summary
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => router.push('/parent/dad/prepare')}
                        className="flex-1 bg-white border border-neutral-200 py-2.5 rounded-xl flex-row items-center justify-center gap-1 active:opacity-90 shadow-xs"
                      >
                        <Calendar size={10} color="#af52de" />
                        <Text className="text-[9px] font-bold text-[#af52de] uppercase">
                          Prepare Appointment
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }

              const isMe = msg.sender === coordinatorName;
              return (
                <View
                  key={idx}
                  className={`flex-row gap-3 ${isMe ? 'flex-row-reverse' : ''} items-start`}
                >
                  {/* Avatar Circle */}
                  <View
                    style={{ backgroundColor: msg.avatarColor }}
                    className="w-8 h-8 rounded-full items-center justify-center shrink-0 shadow-xs"
                  >
                    <Text className="text-white text-xs font-bold">{msg.sender.charAt(0)}</Text>
                  </View>

                  <View className={`space-y-1 max-w-[75%] ${isMe ? 'items-end' : ''}`}>
                    <View className="flex-row items-center gap-1.5 px-0.5">
                      <Text className="text-[9px] font-bold text-neutral-800">{msg.sender}</Text>
                      <Text className="text-[8px] text-neutral-400 font-semibold">{msg.time}</Text>
                      {isMe && <Text className="text-[9px] text-[#007aff] font-bold">✓✓</Text>}
                    </View>
                    <View
                      className={`p-3.5 rounded-2xl ${
                        isMe
                          ? 'bg-[#007aff] rounded-tr-none'
                          : 'bg-white border border-neutral-100 rounded-tl-none'
                      }`}
                    >
                      <Text
                        className={`text-xs font-semibold leading-relaxed ${
                          isMe ? 'text-white' : 'text-neutral-700'
                        }`}
                      >
                        {msg.message}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Chat input box at the bottom */}
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-neutral-200/80 p-4 pb-6 flex-row items-center gap-2">
          <TextInput
            placeholder="Message Care circle..."
            placeholderTextColor="#8e8e93"
            value={chatInput}
            onChangeText={setChatInput}
            className="flex-1 bg-neutral-100 border border-neutral-200/50 rounded-full px-4 py-2.5 text-xs text-neutral-800 font-semibold"
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            className="w-9 h-9 rounded-full bg-[#007aff] items-center justify-center active:scale-95 shadow-sm"
          >
            <Send size={12} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <WhatsAppCareHubModal
          visible={whatsAppHubOpen}
          onClose={() => setWhatsAppHubOpen(false)}
          defaultRecipientName={context.primaryParentName}
          defaultPhone="9270756299"
          onSimulatedReply={(reply) => {
            setMessages((prev) => [
              ...prev,
              {
                sender: reply.senderName,
                role: 'WhatsApp Incoming',
                avatarColor: '#25D366',
                message: reply.messageText,
                time: reply.receivedAt
              }
            ]);
            context.showToast('WhatsApp reply received from Dad!');
          }}
        />
      </View>
      <SimulatorControls
        onTriggerNotification={context.handleTriggerSimulation}
        onRefreshData={context.handleWearableSyncRefresh}
        isSyncing={context.isSyncing}
        currentLoopStep={context.currentLoopStep}
        onAdvanceLoop={context.handleAdvanceLoop}
        onResetLoop={context.handleResetLoop}
      />
    </DeviceFrame>
  );
}
