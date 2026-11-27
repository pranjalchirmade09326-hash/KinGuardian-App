import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Heart,
  Activity,
  MessageCircle,
  Sparkles,
  Zap,
  FileText,
  ShieldCheck,
  ArrowRight,
  ChevronLeft
} from 'lucide-react-native';

export default function FeaturesScreen() {
  const router = useRouter();

  const featuresList = [
    {
      icon: Activity,
      color: '#007aff',
      bg: '#eff6ff',
      title: 'Real-Time Wearable Telemetry',
      subtitle: 'Passive Continuous Monitoring with Zero Typing',
      desc: 'Seamlessly aggregates blood pressure, resting heart rate, SpO2, sleep stages, and walking cadence from Apple Watch, Garmin, Fitbit, Noise, and Bluetooth Omron monitors. Raw data syncs directly with clinical threshold bounds.'
    },
    {
      icon: MessageCircle,
      color: '#16a34a',
      bg: '#f0fdf4',
      title: 'WhatsApp Family Care Loops',
      subtitle: 'Friction-Free Engagement for Elderly Parents',
      desc: 'No confusing new apps for seniors in India. Parents receive courteous morning check-ins and medication reminders right inside WhatsApp. Family coordinators receive clean daily health digests.'
    },
    {
      icon: Sparkles,
      color: '#9333ea',
      bg: '#faf5ff',
      title: 'AI Clinical Translation (Gemini 2.5)',
      subtitle: 'Instant Medical Explanations Without Jargon',
      desc: 'Converts complex lab values, lipid profiles, HbA1c fluctuations, and ECG abnormalities into plain conversational English and Hindi summaries with clear doctor-approved next steps.'
    },
    {
      icon: Zap,
      color: '#dc2626',
      bg: '#fef2f2',
      title: 'Emergency SOS & Fall Triage',
      subtitle: 'Sub-60 Second Anomaly Alerts',
      desc: 'Multi-parameter threshold triggers notify NRI family members worldwide while immediately preparing emergency dispatch details for verified local ambulance and neighbor contacts in India.'
    },
    {
      icon: FileText,
      color: '#d97706',
      bg: '#fffbeb',
      title: '1-Click Doctor PDF Briefs',
      subtitle: 'Formatted Specifically for Indian Specialists',
      desc: 'Generate concise, physician-ready PDF clinical summaries structured for Indian cardiologists and physicians, eliminating guesswork during 15-minute outpatient appointments.'
    },
    {
      icon: ShieldCheck,
      color: '#007aff',
      bg: '#eff6ff',
      title: 'Dignified Privacy & Parent Consent',
      subtitle: 'Full Control Stays with Your Parents',
      desc: 'Parents retain complete autonomy with single-tap privacy toggles. Data is encrypted end-to-end with 256-bit encryption in accordance with HIPAA and India PDPB privacy frameworks.'
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
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              backgroundColor: '#007aff',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Heart size={18} color="#ffffff" />
          </View>
          <Text style={{ fontSize: 18, fontWeight: '900', color: '#0f172a' }}>KinGuardian</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/sign-in')}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: '#e2e8f0'
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#1e293b' }}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/sign-up')}
            style={{
              paddingHorizontal: 18,
              paddingVertical: 8,
              borderRadius: 10,
              backgroundColor: '#007aff'
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#ffffff' }}>
              Start Free Trial
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ paddingBottom: 80 }}>
        {/* Hero Section */}
        <View
          style={{
            width: '100%',
            paddingVertical: 64,
            paddingHorizontal: 24,
            backgroundColor: '#f8fafc',
            alignItems: 'center'
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '800',
              color: '#007aff',
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              marginBottom: 12
            }}
          >
            Platform Capabilities
          </Text>
          <Text
            style={{
              fontSize: 38,
              fontWeight: '900',
              color: '#0f172a',
              textAlign: 'center',
              maxWidth: 800,
              letterSpacing: -0.5
            }}
          >
            Purpose-built technology to care for aging parents from thousands of miles away.
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: '#475569',
              textAlign: 'center',
              maxWidth: 640,
              marginTop: 16,
              lineHeight: 26
            }}
          >
            Every tool in KinGuardian is designed specifically around the real challenges of
            distance, international time zones, and elder independence.
          </Text>
        </View>

        {/* Feature Cards Grid */}
        <View
          style={{
            width: '100%',
            maxWidth: 1280,
            alignSelf: 'center',
            paddingHorizontal: 24,
            paddingVertical: 64
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 24,
              justifyContent: 'space-between'
            }}
          >
            {featuresList.map((item, idx) => {
              const Icon = item.icon;
              return (
                <View
                  key={idx}
                  style={{
                    width: '48%',
                    minWidth: 320,
                    padding: 32,
                    borderRadius: 24,
                    backgroundColor: '#ffffff',
                    borderWidth: 1,
                    borderColor: '#e2e8f0',
                    shadowColor: '#0f172a',
                    shadowOpacity: 0.04,
                    shadowRadius: 16
                  }}
                >
                  <View
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      backgroundColor: item.bg,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 20
                    }}
                  >
                    <Icon size={26} color={item.color} />
                  </View>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: '#0f172a' }}>
                    {item.title}
                  </Text>
                  <Text
                    style={{ fontSize: 12, fontWeight: '700', color: item.color, marginTop: 4 }}
                  >
                    {item.subtitle}
                  </Text>
                  <Text style={{ fontSize: 14, color: '#475569', marginTop: 12, lineHeight: 24 }}>
                    {item.desc}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* CTA Bar */}
        <View style={{ width: '100%', maxWidth: 1280, alignSelf: 'center', paddingHorizontal: 24 }}>
          <View
            style={{
              backgroundColor: '#007aff',
              borderRadius: 28,
              padding: 48,
              alignItems: 'center'
            }}
          >
            <Text
              style={{ fontSize: 32, fontWeight: '900', color: '#ffffff', textAlign: 'center' }}
            >
              Ready to protect your parents’ health today?
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: '#dbeafe',
                marginTop: 12,
                textAlign: 'center',
                maxWidth: 600
              }}
            >
              Set up takes less than 5 minutes. No credit card required. Free 14-day trial for NRI
              families.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/sign-up')}
              style={{
                marginTop: 28,
                backgroundColor: '#ffffff',
                paddingHorizontal: 32,
                paddingVertical: 15,
                borderRadius: 14,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#007aff' }}>
                Start 14-Day Free Trial
              </Text>
              <ArrowRight size={18} color="#007aff" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
