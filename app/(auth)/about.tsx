import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, ChevronLeft, Users, Globe, Award } from 'lucide-react-native';

export default function AboutScreen() {
  const router = useRouter();

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
          <Text style={{ fontSize: 12, fontWeight: '800', color: '#007aff', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 12 }}>
            Our Mission
          </Text>
          <Text style={{ fontSize: 36, fontWeight: '900', color: '#0f172a', textAlign: 'center', maxWidth: 800, letterSpacing: -0.5 }}>
            Bridging oceans of distance with compassionate technology for aging parents.
          </Text>
          <Text style={{ fontSize: 16, color: '#475569', textAlign: 'center', maxWidth: 640, marginTop: 16, lineHeight: 26 }}>
            Founded by NRI engineers and Indian clinicians who experienced firsthand the persistent anxiety of caring for elderly parents from thousands of miles away.
          </Text>
        </View>

        <View style={{ width: '100%', maxWidth: 1000, alignSelf: 'center', paddingHorizontal: 24, paddingVertical: 64 }}>
          <View style={{ gap: 40 }}>
            <View>
              <Text style={{ fontSize: 24, fontWeight: '900', color: '#0f172a', marginBottom: 12 }}>
                Why We Built KinGuardian
              </Text>
              <Text style={{ fontSize: 15, color: '#475569', lineHeight: 28 }}>
                Over 32 million Indians live abroad in the United States, United Kingdom, Canada, Australia, and the Gulf. When aging parents back home develop chronic conditions like hypertension, diabetes, or mobility challenges, overseas children are left feeling helpless between brief international phone calls.
              </Text>
              <Text style={{ fontSize: 15, color: '#475569', lineHeight: 28, marginTop: 12 }}>
                We built KinGuardian to bridge this gap: not with invasive surveillance cameras or complicated medical software, but with graceful wearable telemetry and conversational WhatsApp care loops that respect senior dignity.
              </Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24 }}>
              <View style={{ flex: 1, minWidth: 260, padding: 24, borderRadius: 20, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' }}>
                <Users size={28} color="#007aff" />
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a', marginTop: 12 }}>5,000+ Families</Text>
                <Text style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Across North America, UK, Europe, and Asia Pacific.</Text>
              </View>

              <View style={{ flex: 1, minWidth: 260, padding: 24, borderRadius: 20, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' }}>
                <Globe size={28} color="#16a34a" />
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a', marginTop: 12 }}>40+ Indian Cities</Text>
                <Text style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>From Tier-1 metros to tier-2 and tier-3 hometowns.</Text>
              </View>

              <View style={{ flex: 1, minWidth: 260, padding: 24, borderRadius: 20, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0' }}>
                <Award size={28} color="#9333ea" />
                <Text style={{ fontSize: 18, fontWeight: '800', color: '#0f172a', marginTop: 12 }}>Clinical Advisory</Text>
                <Text style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Guided by senior cardiologists and geriatricians in India.</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
