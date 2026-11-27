import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, Check, ChevronLeft } from 'lucide-react-native';

export default function PricingScreen() {
  const router = useRouter();

  const plans = [
    {
      name: 'Essential Care',
      price: '$19',
      period: '/month',
      inr: '(approx. ₹1,550/mo)',
      description: 'Ideal for families starting proactive monitoring for a single parent.',
      features: [
        '1 Parent Profile',
        'Continuous Wearable Vitals Sync',
        'Daily Morning WhatsApp Digest',
        'Automated Medication Reminders',
        'Sub-60s Anomaly & SOS Alerts',
        'Standard Email & Chat Support'
      ],
      popular: false,
      cta: 'Start Free 14-Day Trial'
    },
    {
      name: 'Family Shield',
      price: '$39',
      period: '/month',
      inr: '(approx. ₹3,200/mo)',
      description: 'Complete peace of mind for both parents with clinical AI summaries.',
      features: [
        'Both Parents Supported (Mom & Dad)',
        'All Essential Features Included',
        'AI Clinical Translation (Gemini 2.5)',
        '1-Click Doctor PDF Briefs',
        'Unlimited Family Group WhatsApp Sync',
        'Priority 24/7 Caregiver Alert Support',
        'Longitudinal Health Trend Analytics'
      ],
      popular: true,
      cta: 'Get Family Shield Free'
    },
    {
      name: 'Concierge NRI',
      price: '$89',
      period: '/month',
      inr: '(approx. ₹7,300/mo)',
      description: 'Dedicated human care concierge team on the ground in India.',
      features: [
        'All Family Shield Features',
        'Dedicated Care Manager in India',
        'Monthly At-Home Phlebotomist Lab Tests',
        'Doctor In-Person Appointment Accompaniment',
        'Emergency Ambulance Coordination On-Call',
        'Direct WhatsApp line to Care Doctor'
      ],
      popular: false,
      cta: 'Schedule Concierge Call'
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
        {/* Title */}
        <View
          style={{
            width: '100%',
            paddingVertical: 56,
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
            Simple, Transparent NRI Pricing
          </Text>
          <Text
            style={{
              fontSize: 36,
              fontWeight: '900',
              color: '#0f172a',
              textAlign: 'center',
              maxWidth: 700,
              letterSpacing: -0.5
            }}
          >
            Priceless peace of mind for less than the cost of a weekend dinner.
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: '#475569',
              textAlign: 'center',
              maxWidth: 540,
              marginTop: 14
            }}
          >
            Try any plan free for 14 days. Cancel anytime with a single click. No hidden hardware
            fees.
          </Text>
        </View>

        {/* Pricing Cards */}
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
            {plans.map((plan, idx) => (
              <View
                key={idx}
                style={{
                  width: '31%',
                  minWidth: 320,
                  borderRadius: 28,
                  padding: 32,
                  backgroundColor: plan.popular ? '#ffffff' : '#f8fafc',
                  borderWidth: plan.popular ? 2 : 1,
                  borderColor: plan.popular ? '#007aff' : '#e2e8f0',
                  position: 'relative',
                  shadowColor: plan.popular ? '#007aff' : '#000',
                  shadowOpacity: plan.popular ? 0.15 : 0.04,
                  shadowRadius: 20
                }}
              >
                {plan.popular && (
                  <View
                    style={{
                      position: 'absolute',
                      top: -14,
                      alignSelf: 'center',
                      backgroundColor: '#007aff',
                      paddingHorizontal: 16,
                      paddingVertical: 4,
                      borderRadius: 9999
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '800',
                        color: '#ffffff',
                        textTransform: 'uppercase'
                      }}
                    >
                      Most Popular NRI Choice
                    </Text>
                  </View>
                )}

                <Text style={{ fontSize: 20, fontWeight: '900', color: '#0f172a' }}>
                  {plan.name}
                </Text>
                <Text style={{ fontSize: 13, color: '#64748b', marginTop: 6, minHeight: 40 }}>
                  {plan.description}
                </Text>

                <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 20 }}>
                  <Text style={{ fontSize: 44, fontWeight: '900', color: '#0f172a' }}>
                    {plan.price}
                  </Text>
                  <Text
                    style={{ fontSize: 14, color: '#64748b', fontWeight: '600', marginLeft: 4 }}
                  >
                    {plan.period}
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '600', marginTop: 2 }}>
                  {plan.inr}
                </Text>

                <TouchableOpacity
                  onPress={() => router.push('/(auth)/sign-up')}
                  style={{
                    marginTop: 28,
                    paddingVertical: 14,
                    borderRadius: 14,
                    backgroundColor: plan.popular ? '#007aff' : '#ffffff',
                    borderWidth: plan.popular ? 0 : 1,
                    borderColor: '#cbd5e1',
                    alignItems: 'center'
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '800',
                      color: plan.popular ? '#ffffff' : '#0f172a'
                    }}
                  >
                    {plan.cta}
                  </Text>
                </TouchableOpacity>

                <View style={{ marginTop: 32, gap: 14 }}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '800',
                      color: '#94a3b8',
                      textTransform: 'uppercase'
                    }}
                  >
                    Everything Included:
                  </Text>
                  {plan.features.map((feat, fIdx) => (
                    <View
                      key={fIdx}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
                    >
                      <Check size={16} color="#16a34a" />
                      <Text style={{ fontSize: 13, color: '#334155', fontWeight: '500', flex: 1 }}>
                        {feat}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
