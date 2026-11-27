import { useContext, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform
} from 'react-native';
import { AppContext } from '../../src/store/AppContext';
import { BottomNavBar } from '../../src/components/Navigation';
import { DeviceFrame } from '../../src/components/DeviceFrame';
import { SimulatorControls } from '../../src/components/SimulatorControls';
import { useRouter } from 'expo-router';
import {
  User,
  Shield,
  Smartphone,
  Users,
  ChevronRight,
  X,
  LogOut,
  Edit2
} from 'lucide-react-native';
import { useAuth } from '../../src/hooks/useAuth';

export default function CoordinatorProfileRoute() {
  const context = useContext(AppContext);
  const { user, updateProfile, signOut } = useAuth();
  const router = useRouter();
  const [showTrustModal, setShowTrustModal] = useState(false);
  const [showDevicesModal, setShowDevicesModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states for profile editing
  const [editName, setEditName] = useState(user?.name || context?.coordinatorName || 'Coordinator');
  const [editPhone, setEditPhone] = useState(user?.phone || '+44 7123 456789');
  const [editCity, setEditCity] = useState(user?.city || 'London');
  const [editCountry, setEditCountry] = useState(user?.country || 'United Kingdom');
  const [editNotes, setEditNotes] = useState(user?.emergency_notes || '');

  if (!context) return null;

  const handleOpenEdit = () => {
    setEditName(user?.name || context.coordinatorName || 'Coordinator');
    setEditPhone(user?.phone || '+44 7123 456789');
    setEditCity(user?.city || 'London');
    setEditCountry(user?.country || 'United Kingdom');
    setEditNotes(user?.emergency_notes || '');
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      context.showToast('Name cannot be empty');
      return;
    }
    setIsSaving(true);
    try {
      const res = await updateProfile({
        name: editName.trim(),
        phone: editPhone.trim(),
        city: editCity.trim(),
        country: editCountry.trim(),
        emergency_notes: editNotes.trim()
      });
      if (res.success) {
        context.showToast('Profile updated & synchronized successfully!');
        setShowEditModal(false);
      } else {
        context.showToast(res.error || 'Profile updated locally (offline mode)');
        setShowEditModal(false);
      }
    } catch (e: any) {
      context.showToast(`Saved locally: ${e?.message || 'offline'}`);
      setShowEditModal(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DeviceFrame>
      <View className="flex-1 relative bg-[#f2f2f7]">
        {/* Header */}
        <View className="px-6 py-5 border-b border-neutral-100 bg-white">
          <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
            Configuration
          </Text>
          <Text className="text-2xl font-bold text-neutral-900 tracking-tight mt-0.5">
            Settings
          </Text>
        </View>

        <ScrollView className="flex-1 px-5 pt-4 space-y-4">
          {/* User Profile Card */}
          <View className="p-4 rounded-2xl border border-neutral-100 bg-white flex-row items-center justify-between shadow-sm">
            <View className="flex-row items-center gap-4 flex-1 pr-2">
              <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center">
                <User size={22} color="#007aff" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-neutral-900 leading-none">
                  {user?.name || context.coordinatorName || 'Coordinator'}
                </Text>
                <Text className="text-xs text-neutral-400 mt-1 font-semibold">
                  {user?.city || 'London'}, {user?.country || 'United Kingdom'} (
                  {user?.timezone || 'BST'})
                </Text>
                {user?.phone ? (
                  <Text className="text-[10px] text-neutral-400 font-medium mt-0.5">
                    📞 {user.phone}
                  </Text>
                ) : null}
              </View>
            </View>
            <TouchableOpacity
              onPress={handleOpenEdit}
              className="p-2.5 bg-blue-50 rounded-xl flex-row items-center gap-1 active:scale-95"
            >
              <Edit2 size={13} color="#007aff" />
              <Text className="text-xs font-bold text-[#007aff]">Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Switch Persona Box */}
          <View className="p-5 rounded-2xl border border-neutral-100 bg-white shadow-sm space-y-3.5">
            <View className="flex-row items-center gap-2">
              <Users size={18} color="#ff9500" />
              <Text className="text-sm font-bold text-neutral-900">Prototype Persona Switcher</Text>
            </View>
            <Text className="text-xs text-neutral-500 leading-normal">
              Test the two-sided product experiences. Switch to Parent Mode to see Ramesh's large
              high-contrast checklist in Chennai.
            </Text>
            <TouchableOpacity
              onPress={() => {
                context.setAppMode('parent');
                context.showToast(`Switched persona to ${context.primaryParentName} (Parent Mode)`);
                router.replace('/(parent)');
              }}
              activeOpacity={0.8}
              className="w-full bg-[#007aff] py-3 rounded-xl items-center justify-center"
            >
              <Text className="text-xs font-bold text-white">Switch to Parent Mode</Text>
            </TouchableOpacity>
          </View>

          {/* Settings Options Group */}
          <View className="border border-neutral-100 bg-white rounded-2xl divide-y divide-neutral-200/80 overflow-hidden shadow-sm">
            <TouchableOpacity
              onPress={() => router.push('/family')}
              className="p-4 flex-row items-center justify-between active:bg-neutral-50"
            >
              <View className="flex-row items-center gap-3">
                <Users size={16} color="#007aff" />
                <View>
                  <Text className="text-xs font-bold text-neutral-800">Family Coordination</Text>
                  <Text className="text-[10px] text-neutral-400 font-semibold mt-0.5">
                    Map responsibilities & family care assignments
                  </Text>
                </View>
              </View>
              <ChevronRight size={14} color="#8e8e93" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowTrustModal(true)}
              className="p-4 flex-row items-center justify-between active:bg-neutral-50"
            >
              <View className="flex-row items-center gap-3">
                <Shield size={16} color="#34c759" />
                <View>
                  <Text className="text-xs font-bold text-neutral-800">
                    Clinical Ingestion Trust Settings
                  </Text>
                  <Text className="text-[10px] text-neutral-400 font-semibold mt-0.5">
                    Fuzzy logic limits: Spikes flagging configured
                  </Text>
                </View>
              </View>
              <ChevronRight size={14} color="#8e8e93" />
            </TouchableOpacity>
          </View>

          {/* Sign Out Action */}
          <TouchableOpacity
            onPress={async () => {
              await signOut();
              context.showToast('Signed out of KinGuardian');
              router.replace(Platform.OS === 'web' ? '/(auth)/landing' : '/(auth)/sign-in');
            }}
            activeOpacity={0.8}
            className="w-full bg-red-50 border border-red-200 py-3.5 rounded-2xl flex-row items-center justify-center gap-2 shadow-xs"
          >
            <LogOut size={16} color="#ff3b30" />
            <Text className="text-xs font-bold text-[#ff3b30]">Sign Out of Account</Text>
          </TouchableOpacity>

          <View className="h-24" />
        </ScrollView>

        <BottomNavBar
          activeTab="profile"
          currentScreen="health_dashboard"
          onTabChange={(tab) => {
            if (tab === 'home') router.push('/(coordinator)');
            else if (tab === 'parents') router.push('/(coordinator)/parents');
            else if (tab === 'ask') context.setAskAIOpen(true);
            else if (tab === 'care') router.push('/(coordinator)/care');
          }}
          onOpenQuickActions={() => context.setQuickActionsOpen(true)}
          onOpenAskAI={() => context.setAskAIOpen(true)}
        />

        {/* Clinical Ingestion Trust Settings Modal */}
        <Modal
          visible={showTrustModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowTrustModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-[28px] p-6 pt-3 space-y-4 shadow-xl">
              {/* iOS Grabber Handle */}
              <View className="w-10 h-1.5 bg-neutral-200 rounded-full self-center mb-1.5" />

              <View className="flex-row justify-between items-center pb-2 border-b border-neutral-100">
                <View className="flex-row items-center gap-2">
                  <Shield size={18} color="#34c759" />
                  <Text className="text-lg font-bold text-neutral-900 tracking-tight">
                    Clinical Ingestion
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowTrustModal(false)}
                  className="p-1.5 bg-neutral-100 rounded-full"
                >
                  <X size={16} color="#8e8e93" />
                </TouchableOpacity>
              </View>

              <ScrollView className="space-y-4">
                <View className="bg-neutral-50 p-4 rounded-xl space-y-2 border border-neutral-100">
                  <Text className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Telemetry Spike Flagging
                  </Text>
                  <Text className="text-xs text-neutral-500 font-semibold leading-relaxed">
                    Fuzzy reasoning rules detect anomalies in blood pressure and steps streams.
                    Spikes trigger proactive alerts for the coordinator.
                  </Text>
                </View>

                <View className="bg-white border border-neutral-100 rounded-xl divide-y divide-neutral-200/80 overflow-hidden shadow-xs">
                  <View className="p-4 flex-row justify-between items-center">
                    <Text className="text-xs font-bold text-neutral-700">BP Spike Trigger</Text>
                    <Text className="text-xs font-bold text-[#ff3b30]">&gt;= 140/90 mmHg</Text>
                  </View>
                  <View className="p-4 flex-row justify-between items-center">
                    <Text className="text-xs font-bold text-neutral-700">Activity Drop Flag</Text>
                    <Text className="text-xs font-bold text-[#ff9500]">&gt;= 30% drop (5d)</Text>
                  </View>
                  <View className="p-4 flex-row justify-between items-center">
                    <Text className="text-xs font-bold text-neutral-700">Fuzzy Logic Ingest</Text>
                    <Text className="text-xs font-semibold text-neutral-500">
                      Active (Moderate)
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => setShowTrustModal(false)}
                  className="w-full bg-[#007aff] py-3.5 rounded-xl items-center justify-center mt-2 active:opacity-90"
                >
                  <Text className="text-white text-xs font-bold">Save &amp; Close</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Connected Devices Modal */}
        <Modal
          visible={showDevicesModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowDevicesModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-[28px] p-6 pt-3 space-y-4 shadow-xl">
              {/* iOS Grabber Handle */}
              <View className="w-10 h-1.5 bg-neutral-200 rounded-full self-center mb-1.5" />

              <View className="flex-row justify-between items-center pb-2 border-b border-neutral-100">
                <View className="flex-row items-center gap-2">
                  <Smartphone size={18} color="#af52de" />
                  <Text className="text-lg font-bold text-neutral-900 tracking-tight">
                    Connected Devices
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowDevicesModal(false)}
                  className="p-1.5 bg-neutral-100 rounded-full"
                >
                  <X size={16} color="#8e8e93" />
                </TouchableOpacity>
              </View>

              <ScrollView className="space-y-4">
                <View className="bg-neutral-50 p-4 rounded-xl space-y-2 border border-neutral-100">
                  <Text className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Device Pairings
                  </Text>
                  <Text className="text-xs text-neutral-500 font-semibold leading-relaxed">
                    Manage external telemetry sensors mapped to {context.primaryParentName} &amp;{' '}
                    {context.secondaryParentName}'s health profiles.
                  </Text>
                </View>

                <View className="bg-white border border-neutral-100 rounded-xl divide-y divide-neutral-200/80 overflow-hidden shadow-xs">
                  <View className="p-4 flex-row justify-between items-center">
                    <View>
                      <Text className="text-xs font-bold text-neutral-800">Omron BP Monitor</Text>
                      <Text className="text-[9px] text-neutral-400 font-semibold mt-0.5">
                        {context.primaryParentName} · Bluetooth Hub
                      </Text>
                    </View>
                    <Text className="text-xs font-bold text-[#34c759]">Connected</Text>
                  </View>

                  <View className="p-4 flex-row justify-between items-center">
                    <View>
                      <Text className="text-xs font-bold text-neutral-800">Dexcom G7 CGM</Text>
                      <Text className="text-[9px] text-neutral-400 font-semibold mt-0.5">
                        {context.secondaryParentName} · Dexcom Cloud Stream
                      </Text>
                    </View>
                    <Text className="text-xs font-bold text-[#34c759]">Connected</Text>
                  </View>

                  <View className="p-4 flex-row justify-between items-center">
                    <View>
                      <Text className="text-xs font-bold text-neutral-800">
                        Apple Health (Steps)
                      </Text>
                      <Text className="text-[9px] text-neutral-400 font-semibold mt-0.5">
                        {context.primaryParentName} &amp; {context.secondaryParentName} · Local Sync
                      </Text>
                    </View>
                    <Text className="text-xs font-bold text-[#34c759]">Connected</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => {
                    context.handleWearableSyncRefresh();
                    setShowDevicesModal(false);
                  }}
                  className="w-full bg-[#007aff] py-3.5 rounded-xl items-center justify-center mt-2 active:opacity-90"
                >
                  <Text className="text-white text-xs font-bold">Sync All Devices</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Edit Coordinator Profile Modal */}
        <Modal
          visible={showEditModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowEditModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-[28px] max-h-[85%] p-6 pt-3 space-y-4 shadow-xl">
              <View className="w-10 h-1.5 bg-neutral-200 rounded-full self-center mb-1.5" />

              <View className="flex-row justify-between items-center pb-2 border-b border-neutral-100">
                <View className="flex-row items-center gap-2">
                  <User size={18} color="#007aff" />
                  <Text className="text-lg font-bold text-neutral-900 tracking-tight">
                    Edit Profile
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
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
                    value={editName}
                    onChangeText={setEditName}
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
                    value={editPhone}
                    onChangeText={setEditPhone}
                    placeholder="+44 7123 456789"
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
                      value={editCity}
                      onChangeText={setEditCity}
                      placeholder="London"
                      placeholderTextColor="#8e8e93"
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:border-[#007aff]"
                    />
                  </View>
                  <View className="flex-1 space-y-1">
                    <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Country
                    </Text>
                    <TextInput
                      value={editCountry}
                      onChangeText={setEditCountry}
                      placeholder="United Kingdom"
                      placeholderTextColor="#8e8e93"
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:border-[#007aff]"
                    />
                  </View>
                </View>

                <View className="space-y-1">
                  <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Emergency &amp; Care Coordination Notes
                  </Text>
                  <TextInput
                    value={editNotes}
                    onChangeText={setEditNotes}
                    placeholder="Care coordination notes..."
                    placeholderTextColor="#8e8e93"
                    multiline
                    numberOfLines={3}
                    className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:border-[#007aff] h-20"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full bg-[#007aff] py-3.5 rounded-xl items-center justify-center mt-3 active:opacity-90 shadow-sm flex-row gap-2"
                >
                  {isSaving && <ActivityIndicator size="small" color="#ffffff" />}
                  <Text className="text-white text-xs font-bold">
                    {isSaving ? 'Persisting to Database...' : 'Save & Sync with PostgreSQL'}
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
