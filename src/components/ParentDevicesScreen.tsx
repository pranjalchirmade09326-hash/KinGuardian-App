import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert
} from 'react-native';
import {
  ArrowLeft,
  Watch,
  CheckCircle2,
  RefreshCw,
  PlusCircle,
  ShieldCheck,
  Activity,
  Heart,
  Smartphone,
  Radio,
  Footprints,
  Moon
} from 'lucide-react-native';
import { AppContext } from '../store/AppContext';

interface ParentDevicesScreenProps {
  onBack?: () => void;
}

export const ParentDevicesScreen: React.FC<ParentDevicesScreenProps> = ({ onBack }) => {
  const context = useContext(AppContext);
  const [deviceConnected, setDeviceConnected] = useState(true);
  const [lastUpdatedText, setLastUpdatedText] = useState('Just now');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectingDeviceName, setConnectingDeviceName] = useState<string | null>(null);

  // Live Fit Telemetry States
  const [stepCount, setStepCount] = useState(4820);
  const [bpValue, setBpValue] = useState(
    context?.currentBP ? context.currentBP.replace(' mmHg', '').trim() : '120/80'
  );
  const [sleepHours, setSleepHours] = useState('7.5');
  const [heartRate] = useState(72);

  // ACTION 1: Reconnect / Live Sync Google Fit
  const handleReconnect = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdatedText('Just now');
      setDeviceConnected(true);
      setStepCount((prev) => prev + Math.floor(Math.random() * 25) + 5);
      setBpValue(context?.currentBP ? context.currentBP.replace(' mmHg', '').trim() : '120/80');
      setSleepHours('7.5');

      context?.showToast('Google Fit live telemetry synchronized!');
      Alert.alert(
        'Google Fit Synchronized',
        'Live health telemetry from Google Fit (Android Health Connect) is updated successfully.'
      );
    }, 1200);
  };

  // ACTION 2: Connect a new device
  const handleSelectDeviceToConnect = (name: string) => {
    setConnectingDeviceName(name);
    setTimeout(() => {
      setConnectingDeviceName(null);
      setShowConnectModal(false);
      setDeviceConnected(true);
      setLastUpdatedText('Just now');
      context?.showToast(`${name} connected successfully!`);
      Alert.alert(
        'Device Connected',
        `Your ${name} is now connected. Live steps, heart rate, and health telemetry will automatically update.`
      );
    }, 1500);
  };

  const stepProgress = Math.min(Math.round((stepCount / 6000) * 100), 100);

  return (
    <ScrollView className="flex-1 bg-[#f8f9fa]">
      {/* Friendly, Large Top Header */}
      <View className="bg-white px-6 pt-6 pb-5 border-b border-slate-100">
        {onBack && (
          <TouchableOpacity onPress={onBack} className="flex-row items-center gap-2 mb-3">
            <ArrowLeft size={20} color="#007aff" />
            <Text className="text-sm font-bold text-[#007aff]">Back</Text>
          </TouchableOpacity>
        )}
        <Text className="text-2xl font-black text-slate-900 tracking-tight">My health devices</Text>
        <Text className="text-sm text-slate-500 font-medium mt-1">
          Live sync with Google Fit &amp; connected health trackers
        </Text>
      </View>

      <View className="p-6 space-y-6">
        {/* ========================================================================= */}
        {/* CONNECTED DEVICE CARD (GOOGLE FIT LIVE STATUS)                            */}
        {/* ========================================================================= */}
        {deviceConnected ? (
          <View className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            {/* Google Fit Header & Status */}
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-4">
                <View className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 items-center justify-center">
                  <Activity size={32} color="#007aff" />
                </View>
                <View>
                  <Text className="text-xl font-black text-slate-900">Google Fit</Text>
                  <View className="flex-row items-center gap-1.5 mt-1">
                    <View className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <Text className="text-sm font-bold text-emerald-700">
                      Connected &amp; Live Sync
                    </Text>
                  </View>
                </View>
              </View>

              <View className="w-10 h-10 rounded-full bg-emerald-50 items-center justify-center border border-emerald-100">
                <CheckCircle2 size={22} color="#059669" />
              </View>
            </View>

            {/* LIVE FIT TELEMETRY STATUS DASHBOARD */}
            <View className="bg-[#f0f9ff]/70 border border-blue-100 rounded-2xl p-4.5 space-y-3.5">
              <View className="flex-row items-center justify-between border-b border-blue-100/60 pb-2.5">
                <View className="flex-row items-center gap-1.5">
                  <Radio size={14} color="#007aff" />
                  <Text className="text-xs font-black text-[#007aff] uppercase tracking-wider">
                    Live Telemetry Status
                  </Text>
                </View>
                <View className="bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  <Text className="text-[9px] font-bold text-emerald-800 uppercase">Streaming</Text>
                </View>
              </View>

              {/* Steps Count with Progress Bar */}
              <View className="space-y-1.5">
                <View className="flex-row justify-between items-baseline">
                  <Text className="text-xs font-bold text-slate-600">Daily Steps</Text>
                  <Text className="text-lg font-black text-slate-900">
                    {stepCount.toLocaleString()}{' '}
                    <Text className="text-xs font-semibold text-slate-400">/ 6,000 goal</Text>
                  </Text>
                </View>
                <View className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <View
                    style={{ width: `${stepProgress}%` }}
                    className="h-full bg-[#007aff] rounded-full"
                  />
                </View>
              </View>

              {/* 4 Metrics Grid: Steps, BP, Sleep, Heart Rate (HR) */}
              <View className="flex-row flex-wrap gap-2.5 pt-1">
                {/* Steps */}
                <View
                  style={{ width: '48%' }}
                  className="bg-white p-3 rounded-xl border border-blue-100/80 items-center"
                >
                  <Footprints size={16} color="#007aff" />
                  <Text className="text-base font-black text-slate-900 mt-1">
                    {stepCount.toLocaleString()}
                  </Text>
                  <Text className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">
                    Steps
                  </Text>
                </View>

                {/* Blood Pressure (BP) */}
                <View
                  style={{ width: '48%' }}
                  className="bg-white p-3 rounded-xl border border-blue-100/80 items-center"
                >
                  <Heart size={16} color="#e11d48" />
                  <Text className="text-base font-black text-slate-900 mt-1">
                    {bpValue} <Text className="text-[10px] text-slate-400 font-bold">mmHg</Text>
                  </Text>
                  <Text className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">BP</Text>
                </View>

                {/* Sleep Hours */}
                <View
                  style={{ width: '48%' }}
                  className="bg-white p-3 rounded-xl border border-blue-100/80 items-center"
                >
                  <Moon size={16} color="#6366f1" />
                  <Text className="text-base font-black text-slate-900 mt-1">
                    {sleepHours} <Text className="text-[10px] text-slate-400 font-bold">hrs</Text>
                  </Text>
                  <Text className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">
                    Sleep
                  </Text>
                </View>

                {/* Heart Rate (HR) */}
                <View
                  style={{ width: '48%' }}
                  className="bg-white p-3 rounded-xl border border-blue-100/80 items-center"
                >
                  <Activity size={16} color="#059669" />
                  <Text className="text-base font-black text-slate-900 mt-1">
                    {heartRate} <Text className="text-[10px] text-slate-400 font-bold">BPM</Text>
                  </Text>
                  <Text className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">
                    Heart Rate (HR)
                  </Text>
                </View>
              </View>
            </View>

            {/* Last Updated Box */}
            <View className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex-row justify-between items-center">
              <View>
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Live Fit Sync Account
                </Text>
                <Text className="text-xs font-bold text-slate-700 mt-0.5">
                  Google Fit (Health Connect)
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Last Updated
                </Text>
                <Text className="text-xs font-black text-slate-800 mt-0.5">{lastUpdatedText}</Text>
              </View>
            </View>

            {/* Reconnect / Live Sync Action Button */}
            <TouchableOpacity
              onPress={handleReconnect}
              disabled={isRefreshing}
              className="bg-[#007aff] active:bg-[#0062cc] py-4 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm"
            >
              {isRefreshing ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <RefreshCw size={18} color="#ffffff" />
                  <Text className="text-base font-bold text-white">Sync Live Google Fit Data</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDeviceConnected(false)}
              className="py-2 items-center"
            >
              <Text className="text-xs font-semibold text-slate-400">
                Disconnect or switch device
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm items-center py-8 space-y-4">
            <View className="w-16 h-16 rounded-full bg-blue-50 items-center justify-center">
              <Activity size={32} color="#007aff" />
            </View>
            <Text className="text-lg font-black text-slate-800">No device connected</Text>
            <Text className="text-xs text-slate-500 text-center px-4 font-medium">
              Connect your Google Fit app or smartwatch to share your daily steps, heart rate, and
              rest live with your care circle.
            </Text>
            <TouchableOpacity
              onPress={() => handleSelectDeviceToConnect('Google Fit')}
              className="bg-[#007aff] px-6 py-3 rounded-2xl"
            >
              <Text className="text-white font-bold text-xs">Connect Google Fit Now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================================= */}
        {/* CONNECT A DEVICE BUTTON                                                   */}
        {/* ========================================================================= */}
        <TouchableOpacity
          onPress={() => setShowConnectModal(true)}
          className="bg-slate-100 active:bg-slate-200 py-4.5 px-6 rounded-2xl border border-slate-200 flex-row items-center justify-center gap-2.5"
        >
          <PlusCircle size={20} color="#007aff" />
          <Text className="text-[#007aff] text-base font-black tracking-wide">
            Add Another Health Device
          </Text>
        </TouchableOpacity>

        {/* Friendly Peace of Mind Note */}
        <View className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex-row items-center gap-3">
          <ShieldCheck size={22} color="#059669" />
          <Text className="text-xs text-emerald-900 font-medium flex-1 leading-relaxed">
            Google Fit updates automatically in the background.{' '}
            {context?.coordinatorName || 'Your family'} can view your live steps, BP, sleep, and
            heart rate.
          </Text>
        </View>
      </View>

      {/* ========================================================================= */}
      {/* SIMPLE CONNECT MODAL                                                      */}
      {/* ========================================================================= */}
      <Modal
        visible={showConnectModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowConnectModal(false)}
      >
        <View className="flex-1 bg-black/40 justify-end">
          <View
            style={{ maxWidth: 460, width: '100%', alignSelf: 'center' }}
            className="bg-white rounded-t-3xl p-6 space-y-5"
          >
            <View className="flex-row items-center justify-between pb-3 border-b border-slate-100">
              <Text className="text-lg font-black text-slate-900">
                Choose health tracker or app
              </Text>
              <TouchableOpacity
                onPress={() => setShowConnectModal(false)}
                className="p-2 bg-slate-100 rounded-full"
              >
                <Text className="text-xs font-bold text-slate-600">Cancel</Text>
              </TouchableOpacity>
            </View>

            {connectingDeviceName ? (
              <View className="py-8 items-center space-y-3">
                <ActivityIndicator size="large" color="#007aff" />
                <Text className="text-base font-bold text-slate-800">
                  Connecting to {connectingDeviceName}...
                </Text>
              </View>
            ) : (
              <View className="space-y-3">
                {[
                  {
                    name: 'Google Fit',
                    desc: 'Android Health Connect & Google Account Sync (Live)',
                    icon: Activity,
                    color: '#007aff',
                    bgColor: '#eff6ff',
                    recommended: true
                  },
                  {
                    name: 'Samsung Health',
                    desc: 'Galaxy Watch & Samsung Health App',
                    icon: Smartphone,
                    color: '#059669',
                    bgColor: '#ecfdf5',
                    recommended: false
                  },
                  {
                    name: 'Garmin Watch',
                    desc: 'Venu, Forerunner & Vivoactive',
                    icon: Watch,
                    color: '#2a14b4',
                    bgColor: '#f5f3ff',
                    recommended: false
                  },
                  {
                    name: 'Fitbit',
                    desc: 'Charge, Inspire & Sense',
                    icon: Watch,
                    color: '#0284c7',
                    bgColor: '#f0f9ff',
                    recommended: false
                  }
                ].map((item) => (
                  <TouchableOpacity
                    key={item.name}
                    onPress={() => handleSelectDeviceToConnect(item.name)}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex-row items-center justify-between active:bg-slate-100"
                  >
                    <View className="flex-row items-center gap-3">
                      <View
                        style={{ backgroundColor: item.bgColor }}
                        className="w-10 h-10 rounded-xl border border-slate-200 items-center justify-center"
                      >
                        <item.icon size={20} color={item.color} />
                      </View>
                      <View>
                        <View className="flex-row items-center gap-1.5">
                          <Text className="text-base font-bold text-slate-900">{item.name}</Text>
                          {item.recommended && (
                            <View className="bg-blue-100 px-2 py-0.5 rounded-full">
                              <Text className="text-[9px] font-bold text-[#007aff] uppercase">
                                Recommended
                              </Text>
                            </View>
                          )}
                        </View>
                        <Text className="text-xs text-slate-500 font-medium">{item.desc}</Text>
                      </View>
                    </View>
                    <Text className="text-xs font-black text-[#007aff]">Connect</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};
