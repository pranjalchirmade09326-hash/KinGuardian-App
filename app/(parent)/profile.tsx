import { useContext, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Switch,
  TextInput,
  ActivityIndicator,
  Platform
} from 'react-native';
import { AppContext } from '../../src/store/AppContext';
import { ParentBottomNavBar } from '../../src/components/Navigation';
import { DeviceFrame } from '../../src/components/DeviceFrame';
import { SimulatorControls } from '../../src/components/SimulatorControls';
import { useRouter } from 'expo-router';
import {
  User,
  PhoneCall,
  Globe,
  KeyRound,
  Users,
  Stethoscope,
  Shield,
  X,
  ChevronRight,
  LogOut
} from 'lucide-react-native';
import { useAuth } from '../../src/hooks/useAuth';

export default function ParentProfileRoute() {
  const context = useContext(AppContext);
  const { user, updateProfile, signOut } = useAuth();
  const router = useRouter();
  const [showPrivacyModal, setShowPrivacyModal] = useState<boolean>(false);
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Parent profile form fields
  const [parentName, setParentName] = useState(
    user?.name || context?.primaryParentName || 'Parent'
  );
  const [parentPhone, setParentPhone] = useState(user?.phone || '919270756299');
  const [parentCity, setParentCity] = useState(user?.city || 'Chennai');
  const [parentCountry, setParentCountry] = useState(user?.country || 'India');
  const [parentBloodGroup, setParentBloodGroup] = useState(user?.blood_group || 'B+');
  const [parentNotes, setParentNotes] = useState(
    user?.emergency_notes || 'Hypertension history; on Amlodipine 5mg and Atorvastatin 20mg.'
  );

  if (!context) return null;

  const handleOpenInfo = () => {
    setParentName(user?.name || context.primaryParentName || 'Parent');
    setParentPhone(user?.phone || '919270756299');
    setParentCity(user?.city || 'Chennai');
    setParentCountry(user?.country || 'India');
    setParentBloodGroup(user?.blood_group || 'B+');
    setParentNotes(
      user?.emergency_notes || 'Hypertension history; on Amlodipine 5mg and Atorvastatin 20mg.'
    );
    setShowInfoModal(true);
  };

  const handleSaveParentProfile = async () => {
    if (!parentName.trim()) {
      context.showToast('Name is required');
      return;
    }
    setIsSaving(true);
    try {
      const res = await updateProfile({
        name: parentName.trim(),
        phone: parentPhone.trim(),
        city: parentCity.trim(),
        country: parentCountry.trim(),
        blood_group: parentBloodGroup.trim(),
        emergency_notes: parentNotes.trim()
      });
      if (res.success) {
        context.showToast('Parent profile saved & synced with database!');
        setShowInfoModal(false);
      } else {
        context.showToast(res.error || 'Profile updated in offline cache');
        setShowInfoModal(false);
      }
    } catch (e: any) {
      context.showToast(`Saved locally: ${e?.message || 'offline'}`);
      setShowInfoModal(false);
    } finally {
      setIsSaving(false);
    }
  };

  const profileOptions = [
    {
      title: 'My information',
      description: `${user?.name || context.primaryParentName} · Age 68 · ${user?.city || 'Chennai'}, ${user?.country || 'India'}`,
      icon: User,
      color: '#ff9500',
      bgColor: '#fff9e6'
    },
    {
      title: 'My doctors',
      description: 'Dr. Sharma · Cardiology · Apollo Hospital',
      icon: Stethoscope,
      color: '#34c759',
      bgColor: '#eefdf4'
    },
    {
      title: 'My family',
      description: `${context.coordinatorName} · Family Care Circle`,
      icon: Users,
      color: '#007aff',
      bgColor: '#eff6ff'
    },
    {
      title: 'Privacy settings',
      description: context.consentApproved
        ? 'Active consent sharing enabled'
        : 'Access paused (Telemetry blocked)',
      icon: KeyRound,
      color: '#af52de',
      bgColor: '#fbf5ff'
    },
    {
      title: 'Language',
      description: 'English (US) · Tamil (தமிழ்)',
      icon: Globe,
      color: '#007aff',
      bgColor: '#eff6ff'
    },
    {
      title: 'Help & support',
      description: `Call ${context.coordinatorName} or message caregiver Priya`,
      icon: PhoneCall,
      color: '#ff3b30',
      bgColor: '#fff5f5'
    }
  ];

  return (
    <DeviceFrame>
      <View className="flex-1 relative bg-[#f2f2f7]">
        {/* Header */}
        <View className="bg-white pt-6 pb-5 px-6 border-b border-neutral-100 space-y-1">
          <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Settings Console
          </Text>
          <Text className="text-2xl font-bold text-neutral-900 tracking-tight">My Profile</Text>
        </View>

        <ScrollView className="flex-1 p-5 space-y-5">
          {/* Options List Inset Grouped */}
          <View className="bg-white border border-neutral-100 rounded-2xl shadow-sm divide-y divide-neutral-200/80 overflow-hidden">
            {profileOptions.map((opt, idx) => {
              const IconComponent = opt.icon;
              return (
                <TouchableOpacity
                  key={idx}
                  onPress={() => {
                    if (opt.title.includes('Privacy')) {
                      setShowPrivacyModal(true);
                    } else if (opt.title === 'My information') {
                      handleOpenInfo();
                    } else {
                      context.showToast(`Opening ${opt.title}...`);
                    }
                  }}
                  className="p-4 flex-row items-center justify-between active:bg-neutral-55"
                >
                  <View className="flex-row items-center gap-4">
                    <View
                      className="w-10 h-10 rounded-xl items-center justify-center shrink-0"
                      style={{ backgroundColor: opt.bgColor }}
                    >
                      <IconComponent size={18} color={opt.color} />
                    </View>
                    <View>
                      <Text className="text-sm font-bold text-neutral-800 leading-tight">
                        {opt.title}
                      </Text>
                      <Text className="text-xs text-neutral-400 font-semibold mt-1 leading-snug">
                        {opt.description}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={14} color="#8e8e93" />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Prototype Persona Switcher */}
          <View className="bg-white border border-neutral-100 rounded-2xl p-5 space-y-3.5 shadow-sm">
            <View className="flex-row items-center gap-2">
              <Users size={18} color="#007aff" />
              <Text className="text-sm font-bold text-neutral-900">Prototype Persona Switcher</Text>
            </View>
            <Text className="text-xs text-neutral-500 leading-normal">
              Test the two-sided product experiences. Switch to Coordinator Mode to see Anjali's
              remote care monitoring dashboard in London.
            </Text>
            <TouchableOpacity
              onPress={() => {
                context.setAppMode('coordinator');
                context.showToast('Switched view to Anjali (Coordinator Mode)');
                router.replace('/(coordinator)');
              }}
              activeOpacity={0.8}
              className="w-full bg-[#007aff] py-3.5 rounded-xl items-center justify-center active:opacity-95 shadow-xs"
            >
              <Text className="text-white text-xs font-bold">Switch to Anjali's View</Text>
            </TouchableOpacity>
          </View>

          {/* Sign Out CTA */}
          <TouchableOpacity
            onPress={async () => {
              await signOut();
              context.showToast('Signed out of KinGuardian');
              router.replace(Platform.OS === 'web' ? '/(auth)/landing' : '/(auth)/sign-in');
            }}
            className="w-full bg-red-50 border border-red-200 py-3.5 rounded-2xl flex-row items-center justify-center gap-2 active:opacity-95 shadow-xs"
          >
            <LogOut size={16} color="#ff3b30" />
            <Text className="text-xs font-bold text-[#ff3b30]">Sign Out of Account</Text>
          </TouchableOpacity>

          <View className="h-28" />
        </ScrollView>

        <ParentBottomNavBar
          activeTab="profile"
          onTabChange={(tab) => {
            if (tab === 'home') router.push('/(parent)');
            else if (tab === 'medicines') router.push('/(parent)/medicines');
            else if (tab === 'ask') router.push('/(parent)/ask');
          }}
        />

        {/* Explicit Privacy & Consent Modal */}
        <Modal
          visible={showPrivacyModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowPrivacyModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-[28px] max-h-[85%] p-6 pt-3 space-y-4 shadow-xl">
              {/* iOS Grabber Handle */}
              <View className="w-10 h-1.5 bg-neutral-200 rounded-full self-center mb-1.5" />

              {/* Header */}
              <View className="flex-row justify-between items-center pb-2 border-b border-neutral-100">
                <View className="flex-row items-center gap-2">
                  <Shield size={18} color="#af52de" />
                  <Text className="text-lg font-bold text-neutral-900 tracking-tight">
                    Privacy &amp; Access
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowPrivacyModal(false)}
                  className="p-1.5 bg-neutral-100 rounded-full"
                >
                  <X size={16} color="#8e8e93" />
                </TouchableOpacity>
              </View>

              <ScrollView className="space-y-4">
                {/* Permissions Explanation */}
                <View className="bg-neutral-50 border border-neutral-200/50 p-4 rounded-2xl space-y-2">
                  <Text className="text-xs font-bold text-neutral-800 uppercase tracking-wide">
                    Simple permissions explanation
                  </Text>
                  <Text className="text-xs text-neutral-500 font-semibold leading-relaxed">
                    Sharing lets {context.coordinatorName} look out for your health from London, and
                    allows Priya to check off your daily medication logs in Chennai. We encrypt all
                    documents and telemetry. You are always in control of who sees what.
                  </Text>
                </View>

                {/* Explicit Toggle */}
                <View className="border border-neutral-100 bg-neutral-50 rounded-2xl p-4.5 flex-row justify-between items-center">
                  <View className="flex-1 pr-4 space-y-1">
                    <Text className="text-sm font-bold text-neutral-800">Consent Status</Text>
                    <Text className="text-xs text-neutral-400 font-semibold leading-snug">
                      I consent to sharing my daily vitals and check-in logs with my Care circle
                    </Text>
                  </View>
                  <Switch
                    value={context.consentApproved}
                    onValueChange={(val) => {
                      context.setConsentApproved(val);
                      context.showToast(
                        val
                          ? 'Sharing permissions granted.'
                          : 'Sharing paused. Telemetry sync is blocked.'
                      );
                    }}
                    trackColor={{ false: '#d1d1d6', true: '#34c759' }}
                    thumbColor="#ffffff"
                  />
                </View>

                {/* Access Levels Matrix */}
                <View className="space-y-3 pt-2">
                  <Text className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                    Active Access List
                  </Text>

                  {/* Coordinator */}
                  <View className="bg-white border border-neutral-100 rounded-xl p-4 flex-row justify-between items-center">
                    <View className="space-y-0.5">
                      <Text className="text-xs font-bold text-neutral-800">
                        {context.coordinatorName} (Coordinator)
                      </Text>
                      <Text className="text-[10px] text-neutral-400 font-semibold">
                        Primary Coordinator · London
                      </Text>
                    </View>
                    <View className="bg-blue-50 px-3 py-1 rounded-full">
                      <Text className="text-[10px] font-bold text-[#007aff] uppercase">
                        Full Access
                      </Text>
                    </View>
                  </View>

                  {/* Rahul */}
                  <View className="bg-white border border-neutral-100 rounded-xl p-4 flex-row justify-between items-center">
                    <View className="space-y-0.5">
                      <Text className="text-xs font-bold text-neutral-800">Rahul (Son)</Text>
                      <Text className="text-[10px] text-neutral-400 font-semibold">
                        Sibling Coordinator · Dubai
                      </Text>
                    </View>
                    <View className="bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                      <Text className="text-[10px] font-bold text-[#34c759] uppercase">
                        Health Summary
                      </Text>
                    </View>
                  </View>

                  {/* Priya */}
                  <View className="bg-white border border-neutral-100 rounded-xl p-4 flex-row justify-between items-center">
                    <View className="space-y-0.5">
                      <Text className="text-xs font-bold text-neutral-800">Priya (Caregiver)</Text>
                      <Text className="text-[10px] text-neutral-400 font-semibold">
                        Care Companion · Bengaluru
                      </Text>
                    </View>
                    <View className="bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                      <Text className="text-[10px] font-bold text-[#ff9500] uppercase">
                        Care + Meds
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => setShowPrivacyModal(false)}
                  className="w-full bg-[#007aff] py-3.5 rounded-xl items-center justify-center mt-3 active:opacity-90"
                >
                  <Text className="text-white text-xs font-bold">Close Permissions</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Parent Information Edit & View Modal */}
        <Modal
          visible={showInfoModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowInfoModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-[28px] max-h-[85%] p-6 pt-3 space-y-4 shadow-xl">
              <View className="w-10 h-1.5 bg-neutral-200 rounded-full self-center mb-1.5" />

              <View className="flex-row justify-between items-center pb-2 border-b border-neutral-100">
                <View className="flex-row items-center gap-2">
                  <User size={18} color="#ff9500" />
                  <Text className="text-lg font-bold text-neutral-900 tracking-tight">
                    My Information
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowInfoModal(false)}
                  className="p-1.5 bg-neutral-100 rounded-full"
                >
                  <X size={16} color="#8e8e93" />
                </TouchableOpacity>
              </View>

              <ScrollView className="space-y-3 pb-4">
                <View className="space-y-1">
                  <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Full Name
                  </Text>
                  <TextInput
                    value={parentName}
                    onChangeText={setParentName}
                    placeholder="Full name"
                    placeholderTextColor="#8e8e93"
                    className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:border-[#007aff]"
                  />
                </View>

                <View className="space-y-1">
                  <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Phone Number
                  </Text>
                  <TextInput
                    value={parentPhone}
                    onChangeText={setParentPhone}
                    placeholder="Phone number"
                    placeholderTextColor="#8e8e93"
                    keyboardType="phone-pad"
                    className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:border-[#007aff]"
                  />
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1 space-y-1">
                    <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      City
                    </Text>
                    <TextInput
                      value={parentCity}
                      onChangeText={setParentCity}
                      placeholder="City"
                      placeholderTextColor="#8e8e93"
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:border-[#007aff]"
                    />
                  </View>
                  <View className="flex-1 space-y-1">
                    <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Country
                    </Text>
                    <TextInput
                      value={parentCountry}
                      onChangeText={setParentCountry}
                      placeholder="Country"
                      placeholderTextColor="#8e8e93"
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:border-[#007aff]"
                    />
                  </View>
                  <View className="w-20 space-y-1">
                    <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Blood
                    </Text>
                    <TextInput
                      value={parentBloodGroup}
                      onChangeText={setParentBloodGroup}
                      placeholder="B+"
                      placeholderTextColor="#8e8e93"
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:border-[#007aff]"
                    />
                  </View>
                </View>

                <View className="space-y-1">
                  <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Medical &amp; Emergency Notes
                  </Text>
                  <TextInput
                    value={parentNotes}
                    onChangeText={setParentNotes}
                    placeholder="Medical history, allergies, notes..."
                    placeholderTextColor="#8e8e93"
                    multiline
                    numberOfLines={3}
                    className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:border-[#007aff] h-20"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSaveParentProfile}
                  disabled={isSaving}
                  className="w-full bg-[#007aff] py-3.5 rounded-xl items-center justify-center mt-3 active:opacity-90 shadow-sm flex-row gap-2"
                >
                  {isSaving && <ActivityIndicator size="small" color="#ffffff" />}
                  <Text className="text-white text-xs font-bold">
                    {isSaving ? 'Syncing with Database...' : 'Save & Sync with Database'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
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
