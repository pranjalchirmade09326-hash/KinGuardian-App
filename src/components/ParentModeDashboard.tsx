import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  MessageSquare,
  Volume2,
  Bell,
  Activity,
  CheckCircle2,
  Radio,
  Heart,
  RefreshCw,
  Footprints,
  Moon
} from 'lucide-react-native';

import { HealthRecordItem } from '../types';
import { t } from '../i18n';
import { AppContext } from '../store/AppContext';
import { RAMESH_USER_ID } from '../store/AuthProvider';
import { healthConnectService } from '../services/HealthConnectService';

interface ParentModeDashboardProps {
  onSwitchMode: () => void;
  medications: HealthRecordItem[];
  onConfirmMedication: (id: string, name: string, taken: boolean) => void;
  onCheckIn: (status: 'Good' | 'Tired' | 'Unwell') => void;
  onOpenVoice: () => void;
  dadStatus: string;
  isAtorvastatinTaken: boolean;
  onOpenNotifications: () => void;
  unreadCount: number;
}

export const ParentModeDashboard: React.FC<ParentModeDashboardProps> = ({
  onSwitchMode,
  medications,
  onConfirmMedication,
  onCheckIn,
  onOpenVoice,
  isAtorvastatinTaken,
  onOpenNotifications,
  unreadCount
}) => {
  const router = useRouter();
  const context = useContext(AppContext);

  // Check-in state variables
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [feeling, setFeeling] = useState<'Good' | 'Tired' | 'Unwell' | null>(null);
  const [typedNote, setTypedNote] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  // Google Fit Live Telemetry States
  const [fitStepCount, setFitStepCount] = useState(4891);
  const [fitBP, setFitBP] = useState(
    context?.currentBP ? context.currentBP.replace(' mmHg', '').trim() : '120/80'
  );
  const [fitSleepHours, setFitSleepHours] = useState('7.5');
  const [fitHeartRate, setFitHeartRate] = useState(72);
  const [isFitSyncing, setIsFitSyncing] = useState(false);
  const [fitLastUpdated, setFitLastUpdated] = useState('Just now');

  const handleSyncFitData = async () => {
    setIsFitSyncing(true);
    try {
      const targetSubject =
        context?.people.find((p) => p.id === context.currentPersonId) || context?.people[0];
      const snapshot = await healthConnectService.syncLiveTelemetry({
        subjectId: targetSubject?.backendSubjectId,
        currentSteps: fitStepCount,
        currentBP: fitBP,
        currentSleepHours: fitSleepHours,
        currentHeartRate: fitHeartRate,
        provider: 'Google Fit (Health Connect)'
      });
      setFitStepCount(snapshot.steps);
      setFitBP(snapshot.bp);
      setFitSleepHours(snapshot.sleepHours);
      setFitHeartRate(snapshot.heartRate);
      setFitLastUpdated('Just now');
      context?.showToast(
        snapshot.nativeHealthConnectUsed
          ? 'Live Google Fit / Health Connect data synced!'
          : 'Google Fit live telemetry synchronized!'
      );
    } finally {
      setIsFitSyncing(false);
    }
  };

  const fitStepProgress = Math.min(Math.round((fitStepCount / 6000) * 100), 100);

  const handleSelectFeeling = (sel: 'Good' | 'Tired' | 'Unwell') => {
    setFeeling(sel);
    setStep(2);
  };

  const handleFinalizeCheckIn = (customNote?: string) => {
    const finalNote = customNote || typedNote;
    if (feeling) {
      onCheckIn(feeling);
      if (
        feeling === 'Unwell' ||
        finalNote.toLowerCase().includes('chest') ||
        finalNote.toLowerCase().includes('uncomfortable')
      ) {
        setIsUrgent(true);
        context
          ?.createAlert({
            userId: RAMESH_USER_ID,
            type: 'general_emergency',
            severity: 'critical',
            description: finalNote
              ? `Parent check-in: ${finalNote}`
              : 'Parent Ramesh reported feeling Unwell.'
          })
          .catch((err) => console.warn('ParentModeDashboard: createAlert failed:', err));
      } else {
        setIsUrgent(false);
      }
    }
    setStep(3);
  };

  const hasCheckInRequest = context?.notifications.some(
    (n) => n.recipient === 'parent' && n.category === 'kinguardian_request' && !n.read
  );

  return (
    <ScrollView className="flex-1 bg-[#f2f2f7]">
      {/* iOS Native Style Header Bar */}
      <View className="bg-white pt-6 pb-5 px-6 flex-row justify-between items-center border-b border-neutral-100">
        <View>
          <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            {t('parentHome.syncReassurance')}
          </Text>
          <Text className="text-2xl font-bold text-neutral-900 tracking-tight mt-0.5">
            {t('parentHome.greeting')}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={onOpenNotifications}
            className="w-9 h-9 bg-neutral-100 rounded-full items-center justify-center relative active:scale-95"
          >
            <Bell size={18} color="#007aff" />
            {unreadCount > 0 && (
              <View className="absolute -top-1 -right-1 bg-[#ff3b30] w-4.5 h-4.5 rounded-full items-center justify-center border border-white">
                <Text className="text-white text-[8px] font-bold">{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSwitchMode}
            className="bg-neutral-100 px-3 py-2 rounded-xl active:scale-95"
          >
            <Text className="text-[#007aff] font-bold text-xs">
              {context?.coordinatorName?.split(' ')[0] || 'Family'}'s View
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="p-5 space-y-6">
        {context?.currentScenario === 'upcoming-appointment' && (
          <TouchableOpacity
            onPress={() => router.push('/appointments')}
            className="bg-white rounded-2xl p-5 shadow-sm shadow-neutral-100 space-y-2 border-l-4 border-[#007aff] active:scale-98"
          >
            <Text className="text-sm font-bold text-neutral-900 tracking-tight">
              Your appointment is tomorrow at 4 PM
            </Text>
            <Text className="text-xs text-neutral-500 leading-normal">
              Dr. Sharma Cardiology telehealth consult is booked. Tap to view preparations.
            </Text>
          </TouchableOpacity>
        )}

        {/* Section 1: How are you feeling? */}
        <View className="bg-white rounded-2xl p-5 shadow-sm shadow-neutral-100 space-y-4">
          {hasCheckInRequest && (
            <View className="bg-blue-50/50 p-4 rounded-xl flex-row items-center gap-3">
              <Text className="text-xs font-semibold text-[#007aff] flex-1 leading-relaxed">
                📢 {context?.coordinatorName?.split(' ')[0] || 'Family'} sent you a check-in
                request. Let them know how you are feeling today.
              </Text>
            </View>
          )}

          {step === 1 && (
            <View className="space-y-4">
              <Text className="text-sm font-semibold text-neutral-500 text-center uppercase tracking-wider">
                {t('parentHome.howAreYouFeeling')}
              </Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => handleSelectFeeling('Good')}
                  className="flex-1 py-6 rounded-2xl items-center justify-center bg-neutral-50 border border-neutral-100 active:scale-95"
                >
                  <Text className="text-3xl">😊</Text>
                  <Text className="text-xs font-bold mt-2 text-neutral-700">
                    {t('parentHome.feelingGood')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleSelectFeeling('Tired')}
                  className="flex-1 py-6 rounded-2xl items-center justify-center bg-neutral-50 border border-neutral-100 active:scale-95"
                >
                  <Text className="text-3xl">😐</Text>
                  <Text className="text-xs font-bold mt-2 text-neutral-700">
                    {t('parentHome.feelingOkay')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleSelectFeeling('Unwell')}
                  className="flex-1 py-6 rounded-2xl items-center justify-center bg-neutral-50 border border-neutral-100 active:scale-95"
                >
                  <Text className="text-3xl">😟</Text>
                  <Text className="text-xs font-bold mt-2 text-neutral-700">
                    {t('parentHome.feelingNotWell')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {step === 2 && (
            <View className="space-y-4">
              <Text className="text-sm font-semibold text-neutral-500 text-center uppercase tracking-wider">
                Anything bothering you?
              </Text>

              {!isTyping ? (
                <View className="flex-row gap-2.5">
                  <TouchableOpacity
                    onPress={() => {
                      onOpenVoice();
                      handleFinalizeCheckIn('Voice note logged');
                    }}
                    className="flex-1 bg-neutral-50 border border-neutral-100 py-3.5 rounded-xl flex-row items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Volume2 size={16} color="#007aff" />
                    <Text className="text-xs font-bold text-neutral-700">Speak</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setIsTyping(true)}
                    className="flex-1 bg-neutral-50 border border-neutral-100 py-3.5 rounded-xl flex-row items-center justify-center gap-1.5 active:scale-95"
                  >
                    <MessageSquare size={16} color="#8e8e93" />
                    <Text className="text-xs font-bold text-neutral-700">Type</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleFinalizeCheckIn()}
                    className="flex-1 bg-neutral-100 py-3.5 rounded-xl items-center justify-center active:scale-95"
                  >
                    <Text className="text-xs font-bold text-neutral-400">Skip</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="space-y-3">
                  <TextInput
                    value={typedNote}
                    onChangeText={setTypedNote}
                    placeholder="Describe how you feel..."
                    placeholderTextColor="#8e8e93"
                    multiline
                    className="w-full bg-neutral-55 border border-neutral-100 rounded-2xl p-4 text-xs text-neutral-800 font-semibold h-20"
                  />

                  {context?.currentScenario === 'parent-feeling-unwell' && (
                    <TouchableOpacity
                      onPress={() => {
                        setTypedNote('My chest feels uncomfortable.');
                        handleFinalizeCheckIn('My chest feels uncomfortable.');
                      }}
                      className="bg-red-50/50 p-3 rounded-2xl active:scale-95"
                    >
                      <Text className="text-[#ff3b30] text-[10px] font-bold text-center">
                        📢 Tap to speak/type: "My chest feels uncomfortable."
                      </Text>
                    </TouchableOpacity>
                  )}
                  <View className="flex-row gap-2">
                    <TouchableOpacity
                      onPress={() => setIsTyping(false)}
                      className="flex-1 bg-neutral-100 py-3 rounded-xl items-center justify-center"
                    >
                      <Text className="text-xs font-semibold text-neutral-500">Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleFinalizeCheckIn(typedNote)}
                      className="flex-1 bg-[#007aff] py-3 rounded-xl items-center justify-center"
                    >
                      <Text className="text-white text-xs font-bold">Submit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}

          {step === 3 && (
            <View className="items-center py-2 space-y-4">
              {isUrgent ? (
                <View className="w-full bg-red-50/40 rounded-2xl p-5 space-y-3.5 items-center border border-red-150">
                  <Text className="text-xs font-bold text-[#ff3b30] text-center uppercase tracking-wide">
                    Safety Notification
                  </Text>
                  <Text className="text-base font-bold text-neutral-900 text-center leading-normal px-1">
                    This could require urgent medical attention. Please seek appropriate local
                    medical help now.
                  </Text>
                  <Text className="text-[10px] text-neutral-400 font-semibold text-center leading-normal">
                    Please call emergency responders or go to the nearest hospital immediately.
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      context
                        ?.createAlert({
                          userId: RAMESH_USER_ID,
                          type: 'sos_panic',
                          severity: 'critical',
                          description: 'Emergency SOS (108) triggered by parent in Chennai',
                          location_name: 'Chennai, India'
                        })
                        .catch((err) => console.warn('createAlert SOS error:', err));
                      context?.showToast('Emergency SOS recorded & dispatched to Care Circle!');
                      alert('Dialing India Emergency Response: 108');
                    }}
                    className="w-full bg-[#ff3b30] py-3 rounded-2xl items-center justify-center active:scale-95 shadow-sm mt-1"
                  >
                    <Text className="text-white text-xs font-bold">📞 Call Emergency (108)</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <Text className="text-base font-bold text-[#34c759] text-center leading-relaxed">
                  Thanks! {context?.coordinatorName?.split(' ')[0] || 'Family'} has been updated.
                </Text>
              )}

              <TouchableOpacity
                onPress={() => {
                  setStep(1);
                  setFeeling(null);
                  setTypedNote('');
                  setIsTyping(false);
                  setIsUrgent(false);
                }}
                className="bg-neutral-100 px-4 py-2.5 rounded-full"
              >
                <Text className="text-[10px] font-bold text-neutral-500 uppercase">
                  Check-in again
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Medication Confirmation Prompt */}
        {!isAtorvastatinTaken && (
          <View className="bg-white rounded-2xl p-5 shadow-sm shadow-neutral-100 space-y-4 border-l-4 border-[#ff3b30]">
            <View className="space-y-1">
              <Text className="text-[9px] font-bold text-[#ff3b30] uppercase tracking-wider">
                Pending Dose
              </Text>
              <Text className="text-lg font-bold text-neutral-900 leading-tight">
                Did you take your evening medicine?
              </Text>
              <Text className="text-xs font-semibold text-neutral-400 mt-0.5">
                Atorvastatin 20mg (cholesterol support) scheduled at 8:00 PM.
              </Text>
            </View>
            <View className="flex-row gap-3 pt-1">
              <TouchableOpacity
                onPress={() => onConfirmMedication('rec-5', 'Atorvastatin 20mg', true)}
                className="flex-1 py-3 bg-[#34c759] rounded-2xl items-center justify-center active:scale-95 shadow-sm"
              >
                <Text className="text-white font-bold text-xs">Yes, I took it</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  alert(
                    `Please take it before sleep. Alert synced with ${context?.coordinatorName || 'Family'}.`
                  )
                }
                className="w-1/3 py-3 bg-neutral-100 rounded-2xl items-center justify-center active:scale-95"
              >
                <Text className="text-neutral-500 font-bold text-xs">Not yet</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Section 2: Today's medicines */}
        <View className="space-y-2">
          <View className="flex-row justify-between items-center px-1">
            <Text className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Today's medicines
            </Text>
            <TouchableOpacity onPress={() => router.push('/(parent)/medicines')}>
              <Text className="text-xs font-bold text-[#007aff]">See all &rarr;</Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-2">
            {medications.slice(0, 2).map((med) => {
              const isTaken = med.status?.includes('Taken');
              return (
                <TouchableOpacity
                  key={med.id}
                  onPress={() => router.push('/(parent)/medicines')}
                  className={`bg-white rounded-2xl p-4 flex-row items-center justify-between shadow-sm shadow-neutral-100 active:scale-98 border-l-4 ${
                    isTaken ? 'border-[#34c759]' : 'border-[#ff9500]'
                  }`}
                >
                  <View className="flex-grow space-y-0.5">
                    <Text className="text-sm font-bold text-neutral-900">{med.title}</Text>
                    <Text className="text-xs text-neutral-400 font-semibold leading-relaxed">
                      {med.subtitle}
                    </Text>
                  </View>
                  <View
                    className={`px-2.5 py-0.5 rounded-full ${isTaken ? 'bg-emerald-50' : 'bg-orange-50'}`}
                  >
                    <Text
                      className={`text-[8px] font-bold uppercase ${isTaken ? 'text-[#34c759]' : 'text-[#ff9500]'}`}
                    >
                      {isTaken ? 'Taken' : 'Pending'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section: My health devices */}
        <View className="space-y-3">
          <View className="flex-row justify-between items-center px-1">
            <View>
              <Text className="text-xl font-black text-neutral-900 tracking-tight">
                My health devices
              </Text>
              <Text className="text-xs text-neutral-500 font-medium mt-0.5">
                Live sync with Google Fit &amp; connected health trackers
              </Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(parent)/devices')}>
              <Text className="text-xs font-bold text-[#007aff]">Manage &rarr;</Text>
            </TouchableOpacity>
          </View>

          {/* Connected Device Card (Google Fit Live Telemetry) */}
          <View className="bg-white rounded-3xl p-5 border border-neutral-100 shadow-sm space-y-4">
            {/* Google Fit Header & Status */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-3.5">
                <View className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 items-center justify-center">
                  <Activity size={28} color="#007aff" />
                </View>
                <View>
                  <Text className="text-lg font-black text-neutral-900">Google Fit</Text>
                  <View className="flex-row items-center gap-1.5 mt-0.5">
                    <View className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <Text className="text-xs font-bold text-emerald-700">
                      Connected &amp; Live Sync
                    </Text>
                  </View>
                </View>
              </View>

              <View className="w-9 h-9 rounded-full bg-emerald-50 items-center justify-center border border-emerald-100">
                <CheckCircle2 size={20} color="#059669" />
              </View>
            </View>

            {/* LIVE FIT TELEMETRY STATUS DASHBOARD */}
            <View className="bg-[#f0f9ff]/70 border border-blue-100 rounded-2xl p-4 space-y-3">
              <View className="flex-row items-center justify-between border-b border-blue-100/60 pb-2">
                <View className="flex-row items-center gap-1.5">
                  <Radio size={13} color="#007aff" />
                  <Text className="text-[11px] font-black text-[#007aff] uppercase tracking-wider">
                    Live Telemetry Status
                  </Text>
                </View>
                <View className="bg-emerald-100 px-2 py-0.5 rounded-full">
                  <Text className="text-[9px] font-bold text-emerald-800 uppercase">Streaming</Text>
                </View>
              </View>

              {/* Steps Count with Progress Bar */}
              <View className="space-y-1">
                <View className="flex-row justify-between items-baseline">
                  <Text className="text-xs font-bold text-neutral-600">Daily Steps</Text>
                  <Text className="text-base font-black text-neutral-900">
                    {fitStepCount.toLocaleString()}{' '}
                    <Text className="text-xs font-semibold text-neutral-400">/ 6,000 goal</Text>
                  </Text>
                </View>
                <View className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                  <View
                    style={{ width: `${fitStepProgress}%` }}
                    className="h-full bg-[#007aff] rounded-full"
                  />
                </View>
              </View>

              {/* 4 Metrics Grid: Steps, BP, Sleep, Heart Rate (HR) */}
              <View className="flex-row flex-wrap gap-2 pt-1">
                {/* Steps */}
                <View
                  style={{ width: '48%' }}
                  className="bg-white p-2.5 rounded-xl border border-blue-100/80 items-center"
                >
                  <Footprints size={15} color="#007aff" />
                  <Text className="text-sm font-black text-neutral-900 mt-1">
                    {fitStepCount.toLocaleString()}
                  </Text>
                  <Text className="text-[8px] font-bold text-neutral-500 uppercase mt-0.5">
                    Steps
                  </Text>
                </View>

                {/* Blood Pressure (BP) */}
                <View
                  style={{ width: '48%' }}
                  className="bg-white p-2.5 rounded-xl border border-blue-100/80 items-center"
                >
                  <Heart size={15} color="#e11d48" />
                  <Text className="text-sm font-black text-neutral-900 mt-1">
                    {fitBP} <Text className="text-[9px] text-neutral-400 font-bold">mmHg</Text>
                  </Text>
                  <Text className="text-[8px] font-bold text-neutral-500 uppercase mt-0.5">BP</Text>
                </View>

                {/* Sleep Hours */}
                <View
                  style={{ width: '48%' }}
                  className="bg-white p-2.5 rounded-xl border border-blue-100/80 items-center"
                >
                  <Moon size={15} color="#6366f1" />
                  <Text className="text-sm font-black text-neutral-900 mt-1">
                    {fitSleepHours}{' '}
                    <Text className="text-[9px] text-neutral-400 font-bold">hrs</Text>
                  </Text>
                  <Text className="text-[8px] font-bold text-neutral-500 uppercase mt-0.5">
                    Sleep
                  </Text>
                </View>

                {/* Heart Rate (HR) */}
                <View
                  style={{ width: '48%' }}
                  className="bg-white p-2.5 rounded-xl border border-blue-100/80 items-center"
                >
                  <Activity size={15} color="#059669" />
                  <Text className="text-sm font-black text-neutral-900 mt-1">
                    {fitHeartRate}{' '}
                    <Text className="text-[9px] text-neutral-400 font-bold">BPM</Text>
                  </Text>
                  <Text className="text-[8px] font-bold text-neutral-500 uppercase mt-0.5">
                    Heart Rate (HR)
                  </Text>
                </View>
              </View>
            </View>

            {/* Last Updated Box */}
            <View className="bg-neutral-50 rounded-2xl p-3 border border-neutral-100 flex-row justify-between items-center">
              <View>
                <Text className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                  Live Fit Sync Account
                </Text>
                <Text className="text-xs font-bold text-neutral-700 mt-0.5">
                  Google Fit (Health Connect)
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
                  Last Updated
                </Text>
                <Text className="text-xs font-black text-neutral-800 mt-0.5">{fitLastUpdated}</Text>
              </View>
            </View>

            {/* Reconnect / Live Sync Action Button */}
            <TouchableOpacity
              onPress={handleSyncFitData}
              disabled={isFitSyncing}
              className="bg-[#007aff] active:bg-[#0062cc] py-3.5 rounded-2xl flex-row items-center justify-center gap-2 shadow-xs"
            >
              {isFitSyncing ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <RefreshCw size={16} color="#ffffff" />
                  <Text className="text-sm font-bold text-white">Sync Live Google Fit Data</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(parent)/devices')}
              className="py-1 items-center"
            >
              <Text className="text-xs font-semibold text-neutral-400">
                Disconnect or switch device
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="h-28" />
      </View>
    </ScrollView>
  );
};
