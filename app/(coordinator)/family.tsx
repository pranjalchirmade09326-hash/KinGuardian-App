import { useContext, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  ActivityIndicator,
  Switch
} from 'react-native';
import { AppContext } from '../../src/store/AppContext';
import { AuthContext } from '../../src/store/AuthContext';
import { BottomNavBar } from '../../src/components/Navigation';
import { DeviceFrame } from '../../src/components/DeviceFrame';
import { SimulatorControls } from '../../src/components/SimulatorControls';
import { useRouter } from 'expo-router';
import {
  ChevronRight,
  ArrowLeft,
  MapPin,
  Calendar,
  Pill,
  Clipboard,
  Phone,
  Mail,
  Plus,
  Trash2,
  X,
  Shield,
  Star
} from 'lucide-react-native';
import { ANJALI_USER_ID, RAMESH_USER_ID } from '../../src/store/AuthProvider';

export default function FamilyCoordinationRoute() {
  const context = useContext(AppContext);
  const auth = useContext(AuthContext);
  const authUser = auth?.user;
  const router = useRouter();

  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Invite Parent Form fields
  const [contactName, setContactName] = useState('');
  const [contactRelationship, setContactRelationship] = useState('Father');
  const [contactCity, setContactCity] = useState('Chennai');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPriority, setContactPriority] = useState('1');
  const [contactIsPrimary, setContactIsPrimary] = useState(false);

  if (!context) return null;

  const isDemoAccount =
    !authUser ||
    authUser.id === ANJALI_USER_ID ||
    authUser.id === RAMESH_USER_ID ||
    authUser.email?.toLowerCase() === 'anjali@kinguardian.com' ||
    authUser.email?.toLowerCase() === 'ramesh@kinguardian.com';

  const handleInviteParent = async () => {
    const cleanName = contactName.replace(/\\/g, '').trim();
    if (!cleanName || !contactPhone.trim()) {
      context.showToast('Parent name and phone number are required');
      return;
    }
    setIsSaving(true);
    try {
      await context.addParent({
        name: cleanName,
        relationship: contactRelationship.trim() || 'Parent',
        city: contactCity.trim() || 'India',
        phone: contactPhone.trim()
      });
      await context.addEmergencyContact(authUser?.id || RAMESH_USER_ID, {
        name: cleanName,
        relationship: contactRelationship.trim() || 'Parent',
        phone: contactPhone.trim(),
        email: contactEmail.trim() || null,
        is_primary: contactIsPrimary,
        priority: parseInt(contactPriority, 10) || context.emergencyContacts.length + 1
      });
      setShowAddModal(false);
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      setContactPriority('1');
      setContactIsPrimary(false);
    } catch (err: any) {
      context.showToast(`Error inviting parent: ${err?.message || 'offline'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteContact = async (id: string, name: string) => {
    setDeletingId(id);
    try {
      await context.deleteEmergencyContact(id);
      context.showToast(`Emergency contact ${name} removed`);
    } catch (err: any) {
      context.showToast(`Error deleting: ${err?.message || 'offline'}`);
    } finally {
      setDeletingId(null);
    }
  };

  const coordinatorName = context?.coordinatorName || 'Coordinator';
  const coordinatorLocation =
    authUser?.city && authUser?.country
      ? `${authUser.city}, ${authUser.country}`
      : authUser?.city || 'Your Location';

  const familyMembers = isDemoAccount
    ? [
        {
          name: coordinatorName,
          location: 'London, UK',
          role: 'Primary Coordinator',
          avatar:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBjb58pDYmLPOvRb2C93qIwVmN3Z3qZ__ljM1T9ZSdVoVI9ovH8x3UkvVX2km1jcc-lJDB8XKVXGhKX0bZL8qDi2s9jgC8eOKs1TubpaykQObp6xTg11e7t9fDFBiO9G_knt_Iu91RQ6oYuQGrd_EwUBKvQprl0XXO1mrgZ2LripRVXQ9ztlZOQr21ScUbgnP5iva9lVWOYFTQ4E6180FpDmnFn1lhIDcG8awhKsT88RjoTEgkPxtmV',
          linkId: 'coordinator'
        },
        {
          name: 'Rahul Sharma',
          location: 'Dubai, UAE',
          role: 'Sibling Sponsoring',
          avatar:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
          linkId: 'rahul'
        },
        {
          name: 'Priya',
          location: 'Bengaluru, India',
          role: 'Local Caregiver',
          avatar:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
          linkId: 'priya'
        }
      ]
    : [
        {
          name: coordinatorName,
          location: coordinatorLocation,
          role: 'Primary Coordinator',
          avatar:
            authUser?.avatarUrl ||
            'https://lh3.googleusercontent.com/aida-public/AB6AXuBjb58pDYmLPOvRb2C93qIwVmN3Z3qZ__ljM1T9ZSdVoVI9ovH8x3UkvVX2km1jcc-lJDB8XKVXGhKX0bZL8qDi2s9jgC8eOKs1TubpaykQObp6xTg11e7t9fDFBiO9G_knt_Iu91RQ6oYuQGrd_EwUBKvQprl0XXO1mrgZ2LripRVXQ9ztlZOQr21ScUbgnP5iva9lVWOYFTQ4E6180FpDmnFn1lhIDcG8awhKsT88RjoTEgkPxtmV',
          linkId: 'coordinator'
        },
        ...context.familyMembers.map((p) => ({
          name: p.name,
          location: p.city ? `${p.city}, India` : 'India',
          role: p.relationship || p.relation || 'Parent',
          avatar:
            p.avatarUrl ||
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256',
          linkId: p.id
        })),
        {
          name: 'Priya',
          location: 'Bengaluru, India',
          role: 'Local Caregiver',
          avatar:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=256',
          linkId: 'priya'
        }
      ];

  const assignments = isDemoAccount
    ? [
        {
          task: "Dad's appointment",
          assignee: 'Priya',
          icon: Calendar,
          color: '#ff3b30',
          bgColor: '#fff5f5'
        },
        {
          task: 'Medication coordination',
          assignee: coordinatorName,
          icon: Pill,
          color: '#007aff',
          bgColor: '#eff6ff'
        },
        {
          task: 'Lab report pickup',
          assignee: 'Rahul Sharma',
          icon: Clipboard,
          color: '#ff9500',
          bgColor: '#fff9e6'
        }
      ]
    : [
        {
          task: 'Caregiver check-in & visits',
          assignee: 'Priya',
          icon: Calendar,
          color: '#ff3b30',
          bgColor: '#fff5f5'
        },
        {
          task: 'Medication coordination',
          assignee: coordinatorName,
          icon: Pill,
          color: '#007aff',
          bgColor: '#eff6ff'
        },
        {
          task: 'Vitals & check-in monitoring',
          assignee: coordinatorName,
          icon: Clipboard,
          color: '#34c759',
          bgColor: '#eefdf4'
        }
      ];

  return (
    <DeviceFrame>
      <View className="flex-1 relative bg-[#f2f2f7]">
        {/* Header */}
        <View className="px-6 py-5 border-b border-neutral-100 bg-white flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-1 bg-neutral-100 rounded-full active:scale-90"
            >
              <ArrowLeft size={18} color="#8e8e93" />
            </TouchableOpacity>
            <View>
              <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                Care Circle &amp; Contacts
              </Text>
              <Text className="text-xl font-bold text-neutral-900 tracking-tight mt-0.5">
                Family Coordination
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.8}
            className="flex-row items-center gap-1 bg-[#007aff] px-3 py-1.5 rounded-xl shadow-xs"
          >
            <Plus size={14} color="#ffffff" strokeWidth={2.5} />
            <Text className="text-white text-xs font-bold">Invite Parent</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-5 pt-4 space-y-5">
          {/* Emergency Contacts Section (Wired to Backend PostgreSQL) */}
          <View className="space-y-2">
            <View className="flex-row items-center justify-between pl-1 pr-1">
              <Text className="text-xs font-bold uppercase text-neutral-400 tracking-wider">
                Emergency Contacts (PostgreSQL Synced)
              </Text>
              <View className="flex-row items-center gap-1">
                <Shield size={12} color="#34c759" />
                <Text className="text-[10px] font-bold text-[#34c759]">Priority Dispatch</Text>
              </View>
            </View>

            <View className="bg-white border border-neutral-100 rounded-2xl shadow-sm divide-y divide-neutral-200/80 overflow-hidden">
              {context.emergencyContacts.length === 0 ? (
                <View className="p-4 items-center">
                  <Text className="text-xs text-neutral-400 font-semibold">
                    No contacts registered.
                  </Text>
                </View>
              ) : (
                context.emergencyContacts.map((contact) => {
                  const isDeleting = deletingId === contact.id;
                  return (
                    <View
                      key={contact.id}
                      className="p-4 flex-row items-center justify-between active:bg-neutral-50"
                    >
                      <View className="flex-1 pr-2">
                        <View className="flex-row items-center gap-2">
                          <Text className="text-xs font-bold text-neutral-900">{contact.name}</Text>
                          {contact.is_primary && (
                            <View className="bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md flex-row items-center gap-0.5">
                              <Star size={9} color="#d97706" />
                              <Text className="text-[8px] font-bold text-[#d97706] uppercase">
                                Primary
                              </Text>
                            </View>
                          )}
                          <View className="bg-blue-50 px-1.5 py-0.5 rounded-md">
                            <Text className="text-[8px] font-bold text-[#007aff]">
                              Priority #{contact.priority}
                            </Text>
                          </View>
                        </View>

                        <Text className="text-[10px] text-neutral-400 font-semibold mt-0.5">
                          {contact.relationship}
                        </Text>

                        <View className="flex-row items-center gap-3 mt-1.5">
                          <View className="flex-row items-center gap-1">
                            <Phone size={10} color="#007aff" />
                            <Text className="text-[10px] text-neutral-600 font-medium">
                              {contact.phone}
                            </Text>
                          </View>
                          {contact.email ? (
                            <View className="flex-row items-center gap-1">
                              <Mail size={10} color="#8e8e93" />
                              <Text className="text-[10px] text-neutral-500 font-medium">
                                {contact.email}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      </View>

                      <TouchableOpacity
                        onPress={() => handleDeleteContact(contact.id, contact.name)}
                        disabled={isDeleting}
                        className="p-2 bg-red-50 rounded-xl active:scale-95"
                      >
                        {isDeleting ? (
                          <ActivityIndicator size="small" color="#ff3b30" />
                        ) : (
                          <Trash2 size={14} color="#ff3b30" />
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </View>
          </View>

          {/* Members List Inset Grouped */}
          <View className="space-y-2">
            <Text className="text-xs font-bold uppercase text-neutral-400 tracking-wider pl-1">
              Care Circle Network
            </Text>

            <View className="bg-white border border-neutral-100 rounded-2xl shadow-sm divide-y divide-neutral-200/80 overflow-hidden">
              {familyMembers.map((member) => (
                <TouchableOpacity
                  key={member.name}
                  onPress={() => router.push(`/caregiver/${member.linkId}`)}
                  className="p-4 flex-row items-center justify-between active:bg-neutral-50"
                >
                  <View className="flex-row items-center gap-3">
                    <Image source={{ uri: member.avatar }} className="w-10 h-10 rounded-full" />
                    <View>
                      <Text className="text-xs font-bold text-neutral-800">{member.name}</Text>
                      <View className="flex-row items-center gap-1 mt-0.5">
                        <MapPin size={10} color="#8e8e93" />
                        <Text className="text-[10px] text-neutral-400 font-semibold">
                          {member.location}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <View className="bg-blue-50 px-2.5 py-0.5 rounded-full">
                      <Text className="text-[8px] font-bold text-[#007aff] uppercase">
                        {member.role}
                      </Text>
                    </View>
                    <ChevronRight size={14} color="#8e8e93" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Responsibility matrix Inset Grouped */}
          <View className="space-y-2 mt-5">
            <Text className="text-xs font-bold uppercase text-neutral-400 tracking-wider pl-1">
              Responsibility Mapping
            </Text>

            <View className="bg-white border border-neutral-100 rounded-2xl shadow-sm divide-y divide-neutral-200/80 overflow-hidden">
              {assignments.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <View key={idx} className="p-4 flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3">
                      <View
                        className="w-8 h-8 rounded-full items-center justify-center"
                        style={{ backgroundColor: item.bgColor }}
                      >
                        <IconComponent size={14} color={item.color} />
                      </View>
                      <Text className="text-xs font-bold text-neutral-800">{item.task}</Text>
                    </View>
                    <View className="bg-neutral-100 px-3 py-1 rounded-full">
                      <Text className="text-[9px] font-bold text-neutral-600">
                        &rarr; {item.assignee}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Chat Launcher CTA */}
          <TouchableOpacity
            onPress={() => router.push('/family-chat')}
            className="w-full bg-[#007aff] py-3.5 rounded-xl flex-row items-center justify-center gap-2 active:opacity-90 shadow-sm mt-3"
          >
            <Text className="text-white font-bold text-sm">Open Family Chat</Text>
          </TouchableOpacity>

          <View className="h-28" />
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

        {/* Add Emergency Contact Modal */}
        <Modal
          visible={showAddModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowAddModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/60 px-6">
            <View className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-neutral-100 space-y-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center gap-2">
                  <Shield size={18} color="#007aff" />
                  <Text className="text-base font-bold text-neutral-900">
                    Invite Parent
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowAddModal(false)}
                  className="w-7 h-7 rounded-full bg-neutral-100 items-center justify-center"
                >
                  <X size={14} color="#64748b" />
                </TouchableOpacity>
              </View>

              <View className="space-y-3">
                <View className="space-y-1">
                  <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Parent Full Name
                  </Text>
                  <TextInput
                    value={contactName}
                    onChangeText={setContactName}
                    placeholder="e.g. Vandana Atale"
                    placeholderTextColor="#8e8e93"
                    className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:border-[#007aff]"
                  />
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1 space-y-1">
                    <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      Relationship
                    </Text>
                    <TextInput
                      value={contactRelationship}
                      onChangeText={setContactRelationship}
                      placeholder="Father / Mother"
                      placeholderTextColor="#8e8e93"
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:border-[#007aff]"
                    />
                  </View>

                  <View className="flex-1 space-y-1">
                    <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                      City (India)
                    </Text>
                    <TextInput
                      value={contactCity}
                      onChangeText={setContactCity}
                      placeholder="Pune / Chennai"
                      placeholderTextColor="#8e8e93"
                      className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:border-[#007aff]"
                    />
                  </View>
                </View>

                <View className="space-y-1">
                  <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Phone Number
                  </Text>
                  <TextInput
                    value={contactPhone}
                    onChangeText={setContactPhone}
                    placeholder="+91 98400 12345"
                    placeholderTextColor="#8e8e93"
                    keyboardType="phone-pad"
                    className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:border-[#007aff]"
                  />
                </View>

                <View className="space-y-1">
                  <Text className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    Email (Optional)
                  </Text>
                  <TextInput
                    value={contactEmail}
                    onChangeText={setContactEmail}
                    placeholder="contact@email.com"
                    placeholderTextColor="#8e8e93"
                    keyboardType="email-address"
                    className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 focus:border-[#007aff]"
                  />
                </View>

                <View className="flex-row items-center justify-between pt-1">
                  <View className="flex-1 pr-3">
                    <Text className="text-xs font-bold text-neutral-800">Primary Contact</Text>
                    <Text className="text-[10px] text-neutral-400 font-semibold">
                      First responder in SOS events
                    </Text>
                  </View>
                  <Switch
                    value={contactIsPrimary}
                    onValueChange={setContactIsPrimary}
                    trackColor={{ false: '#d1d1d6', true: '#34c759' }}
                    thumbColor="#ffffff"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleInviteParent}
                  disabled={isSaving}
                  className="w-full bg-[#007aff] py-3 rounded-xl items-center justify-center mt-2 active:scale-95 shadow-sm flex-row gap-2"
                >
                  {isSaving && <ActivityIndicator size="small" color="#ffffff" />}
                  <Text className="text-white font-bold text-xs">
                    {isSaving ? 'Inviting Parent...' : 'Send Parent Invite'}
                  </Text>
                </TouchableOpacity>
              </View>
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
