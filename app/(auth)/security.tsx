import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, ShieldCheck, CheckCircle2, ChevronLeft } from 'lucide-react-native';

export default function SecurityScreen() {
  const router = useRouter();

  const securityPoints = [
    {
      title: 'End-to-End 256-bit Encryption',
      desc: 'All biometrics, vitals, and medical chat summaries are encrypted at rest with AES-256 and in transit via TLS 1.3.'
    },
    {
      title: 'HIPAA & India PDPB Compliance',
      desc: 'Architected strictly in accordance with international healthcare confidentiality standards and India’s Digital Personal Data Protection Act.'
    },
    {
      title: 'Dignified Parent Autonomy',
      desc: 'Parents in India can pause telemetry broadcasting at any time with a single tap. Monitoring never compromises dignity.'
    },
    {
      title: 'Zero Third-Party Data Selling',
      desc: 'Your family’s health records will never be rented, shared, or monetized for advertising or third-party insurance underwriting.'
    }
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff', width: '100%' }}>
      {/* Top Header */}
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

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/sign-in')}
            style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#1e293b' }}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/sign-up')}
            style={{ paddingHorizontal: 18, paddingVertical: 8, borderRadius: 10, backgroundColor: '#007aff' }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#ffffff' }}>Start Free Trial</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ paddingBottom: 80 }}>
        <View style={{ width: '100%', paddingVertical: 56, paddingHorizontal: 24, backgroundColor: '#f8fafc', alignItems: 'center' }}>
          <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <ShieldCheck size={32} color="#007aff" />
          </View>
          <Text style={{ fontSize: 36, fontWeight: '900', color: '#0f172a', textAlign: 'center', letterSpacing: -0.5 }}>
            Enterprise-Grade Health Security
          </Text>
          <Text style={{ fontSize: 16, color: '#475569', textAlign: 'center', maxWidth: 600, marginTop: 14, lineHeight: 26 }}>
            Because your parents' intimate health data deserves the strictest medical privacy safeguards on the planet.
          </Text>
        </View>

        <View style={{ width: '100%', maxWidth: 1000, alignSelf: 'center', paddingHorizontal: 24, paddingVertical: 64 }}>
          <View style={{ gap: 24 }}>
            {securityPoints.map((item, idx) => (
              <View
                key={idx}
                style={{
                  padding: 28,
                  borderRadius: 20,
                  backgroundColor: '#ffffff',
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
                  flexDirection: 'row',
                  gap: 20,
                  alignItems: 'flex-start'
                }}
              >
                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 size={24} color="#16a34a" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a' }}>{item.title}</Text>
                  <Text style={{ fontSize: 14, color: '#475569', marginTop: 6, lineHeight: 24 }}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
