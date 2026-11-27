import { useContext, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { AppContext } from '../../src/store/AppContext';
import { BottomNavBar } from '../../src/components/Navigation';
import { DeviceFrame } from '../../src/components/DeviceFrame';
import { SimulatorControls } from '../../src/components/SimulatorControls';
import { useRouter } from 'expo-router';
import { formatAIResponse, generateIntelligentHealthcareAnswer } from '../../src/utils/aiFormatter';
import { CONFIG } from '../../src/constants/config';
import {
  Sparkles,
  Mic,
  Camera,
  Paperclip,
  Send,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from 'lucide-react-native';

interface ChatSource {
  title:
    'Medication history' | 'Blood pressure readings' | 'Appointment' | 'Uploaded reports' | string;
  detail: string;
}

interface ChatMessageItem {
  id: string;
  sender: 'user' | 'kinguardian';
  text: string;
  sources?: ChatSource[];
  suggestedActions?: string[];
}

export default function CoordinatorAskRoute() {
  const context = useContext(AppContext);
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'msg-welcome',
      sender: 'kinguardian',
      text: "Ask anything about Mom & Dad's health status, wearable sensors, daily checklists, or clinic reports."
    }
  ]);

  if (!context) return null;

  const handleAsk = async (customQuery?: string) => {
    const activeQuery = customQuery || query;
    if (!activeQuery.trim() || loading) return;

    const userMsg: ChatMessageItem = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: activeQuery
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customQuery) {
      setQuery('');
    }
    setLoading(true);

    const subjectName =
      context.people.find((p) => p.id === context.currentPersonId)?.name ||
      context.people[0]?.name ||
      'your parent';

    let rawResult: any = null;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(`${CONFIG.apiUrl}/api/v1/ai/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          query: activeQuery,
          patientName: subjectName,
          currentBP: context.currentBP || '120/80 mmHg'
        })
      });
      if (response.ok) {
        const jsonRes = await response.json();
        rawResult = jsonRes.data || jsonRes;
      }
    } catch {
      // Backend unreachable or timed out; fall back to local clinical engine
    } finally {
      clearTimeout(timeoutId);
    }

    if (!rawResult) {
      rawResult = generateIntelligentHealthcareAnswer(
        activeQuery,
        subjectName,
        context.currentBP
      );
    }

    const formatted = formatAIResponse(rawResult);
    const aiSources: ChatSource[] = formatted.citations.map((c) => ({
      title: 'Clinical Telemetry',
      detail: c
    }));

    const aiMsg: ChatMessageItem = {
      id: `msg-${Date.now()}-ai`,
      sender: 'kinguardian',
      text: formatted.answer,
      sources: aiSources,
      suggestedActions: formatted.suggestedFollowUps
    };

    setLoading(false);
    setMessages((prev) => [...prev, aiMsg]);
  };

  const quickPrompts = [
    'How is Dad doing?',
    'What changed this week?',
    'Did Dad take his evening medication?',
    "What happened at Dad's appointment?",
    'What should I ask the doctor?'
  ];

  return (
    <DeviceFrame>
      <View className="flex-1 relative bg-[#f2f2f7]">
        {/* Header Title */}
        <View className="px-6 py-5 border-b border-neutral-100 bg-white flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-bold text-neutral-900 tracking-tight">
              Ask KinGuardian
            </Text>
            <Text className="text-xs text-neutral-400 font-semibold mt-0.5">
              Ask anything about your family's health &amp; care
            </Text>
          </View>
          <Sparkles size={20} color="#af52de" fill="#af52de" />
        </View>

        <View className="px-5 pt-2">
          <Text className="text-[10px] text-neutral-400 font-semibold text-center">
            AI summaries use authorized family telemetry and are not a clinical diagnosis.
          </Text>
        </View>

        <ScrollView className="flex-1 px-5 pt-4 space-y-5">
          {/* Messages list */}
          <View className="space-y-4 pt-1">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              const isExpanded = expandedMessageId === msg.id;

              return (
                <View
                  key={msg.id}
                  className={`w-full flex-row ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <View
                    className={`max-w-[85%] rounded-2xl p-4 border ${
                      isUser
                        ? 'bg-[#007aff] border-[#007aff] rounded-br-none'
                        : 'bg-white border-neutral-100 rounded-bl-none shadow-sm space-y-2.5'
                    }`}
                  >
                    {!isUser && (
                      <View className="flex-row items-center gap-1.5 mb-0.5">
                        <Sparkles size={12} color="#af52de" fill="#af52de" />
                        <Text className="text-[9px] font-bold uppercase tracking-wider text-[#af52de]">
                          KinGuardian AI
                        </Text>
                      </View>
                    )}

                    <Text
                      className={`text-xs leading-relaxed ${isUser ? 'text-white font-semibold' : 'text-neutral-700 font-semibold'}`}
                    >
                      {isUser ? msg.text : formatAIResponse(msg.text).answer}
                    </Text>

                    {/* AI Expandable Sources Transparency */}
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <View className="pt-2 border-t border-neutral-100 space-y-2">
                        <TouchableOpacity
                          onPress={() => setExpandedMessageId(isExpanded ? null : msg.id)}
                          className="flex-row items-center justify-between"
                        >
                          <Text className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                            Based on
                          </Text>
                          <View className="flex-row items-center gap-1">
                            <Text className="text-[9px] font-bold text-[#af52de] uppercase">
                              {isExpanded ? 'Hide Sources' : `${msg.sources.length} Sources`}
                            </Text>
                            {isExpanded ? (
                              <ChevronUp size={11} color="#af52de" />
                            ) : (
                              <ChevronDown size={11} color="#af52de" />
                            )}
                          </View>
                        </TouchableOpacity>

                        {isExpanded && (
                          <View className="space-y-1.5 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100/50">
                            {msg.sources.map((src, sIdx) => (
                              <View key={sIdx} className="space-y-0.5">
                                <View className="flex-row items-center gap-1.5">
                                  <CheckCircle2 size={9} color="#34c759" />
                                  <Text className="text-[10px] font-bold text-neutral-800">
                                    {src.title}
                                  </Text>
                                </View>
                                <Text className="text-[9px] text-neutral-400 font-semibold pl-3.5">
                                  {src.detail}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    )}

                    {msg.suggestedActions && msg.suggestedActions.length > 0 ? (
                      <View className="pt-3 border-t border-neutral-100 flex-row flex-wrap gap-2">
                        {msg.suggestedActions.map((action, aIdx) => (
                          <TouchableOpacity
                            key={aIdx}
                            onPress={() => {
                              if (
                                action === 'Call Dad' ||
                                action === `Call ${context.primaryParentName}` ||
                                action
                                  .toLowerCase()
                                  .includes(context.primaryParentName.toLowerCase())
                              ) {
                                context.setCheckInOpen(true);
                              } else if (
                                action === 'View medication' ||
                                action === 'Review BP trend'
                              ) {
                                router.push('/care');
                              } else if (action === 'View parent profile') {
                                router.push('/parent/dad');
                              } else {
                                context.showToast(`Action triggered: "${action}"`);
                              }
                            }}
                            className="bg-blue-50/60 border border-blue-100/50 px-3 py-1.5 rounded-full active:scale-95"
                          >
                            <Text className="text-[9px] font-bold text-[#007aff] uppercase">
                              {action}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    ) : null}
                  </View>
                </View>
              );
            })}

            {loading && (
              <View className="w-full flex-row justify-start">
                <View className="bg-white border border-neutral-100 rounded-2xl rounded-bl-none p-4 shadow-sm flex-row items-center gap-2">
                  <Sparkles size={12} color="#af52de" />
                  <Text className="text-xs text-neutral-400 italic font-semibold">
                    Ingesting device telemetry...
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Quick Prompts List */}
          <View className="space-y-2">
            <Text className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider pl-1">
              Quick prompts
            </Text>
            <View className="space-y-2">
              {quickPrompts.map((prompt, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleAsk(prompt)}
                  className="bg-white border border-neutral-100 rounded-xl p-4 shadow-xs flex-row justify-between items-center active:scale-99"
                >
                  <Text className="text-xs font-bold text-neutral-700 flex-1">{prompt}</Text>
                  <Sparkles size={12} color="#8e8e93" />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Input Box and Actions Panel */}
          <View className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm space-y-4">
            <View className="flex-row items-center bg-neutral-100 border border-neutral-200/50 rounded-full px-4 py-0.5">
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Ask anything…"
                placeholderTextColor="#8e8e93"
                className="flex-1 py-3 text-xs text-neutral-800 font-semibold"
              />
              <TouchableOpacity
                onPress={() => handleAsk()}
                className="p-1.5 bg-[#007aff] rounded-full"
              >
                <Send size={11} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Bottom Actions grid */}
            <View className="flex-row justify-around gap-2.5 pt-1">
              <TouchableOpacity className="flex-row items-center gap-1.5 px-4 py-2.5 bg-neutral-50 border border-neutral-100 rounded-xl active:scale-95">
                <Mic size={14} color="#8e8e93" />
                <Text className="text-[10px] font-bold text-neutral-600 uppercase">Voice</Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center gap-1.5 px-4 py-2.5 bg-neutral-50 border border-neutral-100 rounded-xl active:scale-95">
                <Camera size={14} color="#8e8e93" />
                <Text className="text-[10px] font-bold text-neutral-600 uppercase">Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center gap-1.5 px-4 py-2.5 bg-neutral-50 border border-neutral-100 rounded-xl active:scale-95">
                <Paperclip size={14} color="#8e8e93" />
                <Text className="text-[10px] font-bold text-neutral-600 uppercase">Attach</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="h-28" />
        </ScrollView>

        <BottomNavBar
          activeTab="ask"
          currentScreen="doctor_consult"
          onTabChange={(tab) => {
            if (tab === 'home') router.push('/(coordinator)');
            else if (tab === 'parents') router.push('/(coordinator)/parents');
            else if (tab === 'care') router.push('/(coordinator)/care');
            else if (tab === 'profile') router.push('/(coordinator)/profile');
          }}
          onOpenQuickActions={() => context.setQuickActionsOpen(true)}
          onOpenAskAI={() => {}}
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
