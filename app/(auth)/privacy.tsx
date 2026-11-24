import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, ChevronLeft } from 'lucide-react-native';

export default function PrivacyScreen() {
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
          <Text style={{ fontSize: 32, fontWeight: '900', color: '#0f172a', marginBottom: 8 }}>Privacy Policy</Text>
          <Text style={{ fontSize: 13, color: '#94a3b8', marginBottom: 28 }}>Last updated: November 2026</Text>

          <View style={{ gap: 24 }}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 8 }}>1. Information We Collect</Text>
              <Text style={{ fontSize: 14, color: '#475569', lineHeight: 24 }}>
                We collect biometric telemetry (heart rate, blood pressure, sleep metrics) strictly with explicit consent from enrolled users and parents via paired wearables (Garmin, Apple Watch, Omron) and WhatsApp check-ins.
              </Text>
            </View>

            <View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 8 }}>2. How We Use Data</Text>
              <Text style={{ fontSize: 14, color: '#475569', lineHeight: 24 }}>
                Health information is utilized exclusively for generating automated family digests, clinical summaries, and anomaly alert notifications. We never sell, lease, or distribute private medical data to advertisers or third parties.
              </Text>
            </View>

            <View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a', marginBottom: 8 }}>3. User Rights & Data Deletion</Text>
              <Text style={{ fontSize: 14, color: '#475569', lineHeight: 24 }}>
                Users have the right to request deletion of their records or pause real-time telemetry streaming at any moment directly via the app or by messaging our WhatsApp support agent.
              </Text>
            </View>

            <View style={{ marginTop: 12, padding: 16, backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#0f172a', marginBottom: 4 }}>Contact Us</Text>
              <Text style={{ fontSize: 13, color: '#64748b', lineHeight: 20 }}>
                For privacy inquiries or deletion requests, email: support@kinguardian.com
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
