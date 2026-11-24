import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, ChevronLeft } from 'lucide-react-native';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff', width: '100%' }}>
      <View
        style={{
          width: '100%',
          backgroundColor: '#ffffff',
          borderBottomWidth: 1,
          borderBottomColor: '#f1f5f9',
          paddingHorizontal: 24,
          paddingVertical: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/landing')}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
        >
          <ChevronLeft size={20} color="#007aff" />
          <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#007aff', alignItems: 'center', justifyContent: 'center' }}>
            <Heart size={18} color="#ffffff" />
          </View>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#0f172a' }}>KinGuardian</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={{ width: '100%', maxWidth: 860, alignSelf: 'center', paddingHorizontal: 24, paddingVertical: 48 }}>
          <Text style={{ fontSize: 32, fontWeight: '900', color: '#0f172a', marginBottom: 8 }}>Terms of Service</Text>
          <Text style={{ fontSize: 13, color: '#94a3b8', marginBottom: 28 }}>Last updated: November 2026</Text>

          <View style={{ gap: 24 }}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 8 }}>1. Non-Diagnostic Decision Support</Text>
              <Text style={{ fontSize: 14, color: '#475569', lineHeight: 24 }}>
                KinGuardian is an AI-assisted health coordination and remote care platform designed to support early awareness of abnormal physiological patterns. KinGuardian does not provide official medical diagnoses or emergency medical services. Always consult qualified healthcare professionals in emergency situations.
              </Text>
            </View>

            <View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 8 }}>2. Service Availability</Text>
              <Text style={{ fontSize: 14, color: '#475569', lineHeight: 24 }}>
                While we strive for 99.9% uptime, internet connectivity issues, cellular network outages in India, or wearable device disconnection may affect real-time sync. KinGuardian provides best-effort alert routing and redundancy.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
