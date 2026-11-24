import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Heart,
  Sparkles,
  ArrowRight,
  Star,
  MessageCircle,
  Zap,
  Watch,
  Users,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon
} from 'lucide-react-native';
import { useTheme } from '../../src/hooks/useTheme';

export default function LandingScreen() {
  const router = useRouter();
  const { isDark, toggleTheme, colors } = useTheme();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const features = [
    {
      icon: Watch,
      color: '#007aff',
      bg: isDark ? '#172554' : '#eff6ff',
      tag: 'Passive Telemetry',
      title: 'Wearable Auto-Sync',
      desc: 'Syncs heart rate, BP, and sleep from Garmin, Apple Watch, and Omron with zero effort.'
    },
    {
      icon: MessageCircle,
      color: '#16a34a',
      bg: isDark ? '#14532d' : '#f0fdf4',
      tag: 'Zero App Friction',
      title: 'WhatsApp Care Loop',
      desc: 'Morning health digests and pill reminders sent right to your family WhatsApp chat.'
    },
    {
      icon: Sparkles,
      color: '#9333ea',
      bg: isDark ? '#3b0764' : '#faf5ff',
      tag: 'Gemini 2.5 AI',
      title: 'Clinical AI Insights',
      desc: 'Complex vitals and lab numbers translated into plain, actionable explanations.'
    },
    {
      icon: Zap,
      color: '#dc2626',
      bg: isDark ? '#450a0a' : '#fef2f2',
      tag: '24/7 Safety',
      title: 'Instant Emergency SOS',
      desc: 'Sub-60s notifications to overseas coordinators with local Indian ambulance routing.'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Pair Wearable',
      desc: 'Connect Garmin, Apple Watch, or Omron in under 2 minutes.'
    },
    {
      step: '02',
      title: 'Add WhatsApp Group',
      desc: 'Invite parents and siblings to receive automated daily updates.'
    },
    {
      step: '03',
      title: 'Enjoy Peace of Mind',
      desc: 'Wake up to verified morning vitals from anywhere in the world.'
    }
  ];

  const reviews = [
    {
      quote: 'KinGuardian replaced my morning anxiety with pure relief. I know Mom is okay before I even start work in Seattle.',
      author: 'Priya S.',
      role: 'Tech Lead • Seattle',
      rating: 5
    },
    {
      quote: 'The doctor summary PDF saved our cardiologist visit in Delhi. The vitals timeline was spot on.',
      author: 'Dr. Amit K.',
      role: 'Physician • London',
      rating: 5
    },
    {
      quote: 'My 82-year-old father uses it effortlessly because it just works through WhatsApp.',
      author: 'Rohan M.',
      role: 'Director • Singapore',
      rating: 5
    }
  ];

  const faqs = [
    {
      q: 'Do parents in India need to learn a new app?',
      a: 'No. Parents can receive daily morning check-ins and medication reminders purely via WhatsApp without opening any app.'
    },
    {
      q: 'Which devices and smartwatches are supported?',
      a: 'Apple Watch, Garmin, Fitbit, Noise, Boat, and Bluetooth-enabled Omron BP monitors sync automatically.'
    },
    {
      q: 'Is my parents’ health data protected?',
      a: 'Yes. All data is end-to-end encrypted (AES-256) and strictly complies with HIPAA and Indian PDPB privacy guidelines.'
    },
    {
      q: 'Can our doctor in India view these reports?',
      a: 'Yes. You can generate a clean 1-click clinical PDF formatted specifically for Indian physicians and cardiologists.'
    }
  ];

  return (
    <View style={{ flex: 1, width: '100%', minHeight: '100%', backgroundColor: colors.background }}>
      {/* 1. Header (Clean, Minimal, Edge-to-Edge with Theme Switcher) */}
      <View
        style={{
          width: '100%',
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.borderSubtle,
          zIndex: 100
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 1440,
            alignSelf: 'center',
            paddingHorizontal: 32,
            paddingVertical: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Logo */}
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/landing')}
            activeOpacity={0.9}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: '#007aff',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#007aff',
                shadowOpacity: 0.25,
                shadowRadius: 8
              }}
            >
              <Heart size={20} color="#ffffff" />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text, letterSpacing: -0.5 }}>
              KinGuardian
            </Text>
          </TouchableOpacity>

          {/* Navigation Links */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 32 }}>
            <TouchableOpacity onPress={() => router.push('/(auth)/features')}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary }}>Features</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(auth)/pricing')}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary }}>Pricing</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(auth)/security')}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary }}>Security</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(auth)/about')}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary }}>About</Text>
            </TouchableOpacity>
          </View>

          {/* Right Action Buttons + Theme Toggle */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {/* Theme Toggle Button */}
            <TouchableOpacity
              onPress={toggleTheme}
              activeOpacity={0.8}
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: isDark ? colors.card : colors.cardSecondary,
                alignItems: 'center',
                justifyContent: 'center'
              }}
              accessibilityLabel="Toggle Dark/Light Mode"
            >
              {isDark ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#64748b" />}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/sign-in')}
              activeOpacity={0.8}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: isDark ? colors.card : '#ffffff'
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/sign-up')}
              activeOpacity={0.88}
              style={{
                paddingHorizontal: 18,
                paddingVertical: 9,
                borderRadius: 10,
                backgroundColor: '#007aff',
                shadowColor: '#007aff',
                shadowOpacity: 0.3,
                shadowRadius: 8
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#ffffff' }}>Start Free Trial</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Body */}
      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{ width: '100%', flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Hero Section (Clean, Punchy, Minimal Text) */}
        <View
          style={{
            width: '100%',
            backgroundColor: isDark ? '#0b101d' : '#fafcff',
            borderBottomWidth: 1,
            borderBottomColor: colors.borderSubtle,
            paddingVertical: 64
          }}
        >
          <View
            style={{
              width: '100%',
              maxWidth: 1440,
              alignSelf: 'center',
              paddingHorizontal: 32,
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 48
            }}
          >
            {/* Left Column: Short Punchy Copy */}
            <View style={{ flex: 1.1, minWidth: 340 }}>
              {/* Pill Badge */}
              <View
                style={{
                  backgroundColor: isDark ? '#172554' : '#eff6ff',
                  borderColor: isDark ? '#1e3a8a' : '#bfdbfe',
                  borderWidth: 1,
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 9999,
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'flex-start',
                  gap: 6,
                  marginBottom: 18
                }}
              >
                <Sparkles size={13} color="#007aff" />
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#007aff' }}>
                  AI-Native Elder Care for NRI Families
                </Text>
              </View>

              {/* Headline */}
              <Text
                style={{
                  fontSize: 50,
                  fontWeight: '900',
                  color: colors.text,
                  lineHeight: 58,
                  letterSpacing: -1.2
                }}
              >
                Care for your parents in India.{'\n'}
                <Text style={{ color: '#007aff' }}>From anywhere in the world.</Text>
              </Text>

              {/* Subtitle (1 Clean Sentence) */}
              <Text
                style={{
                  fontSize: 18,
                  color: colors.textSecondary,
                  marginTop: 18,
                  lineHeight: 28,
                  maxWidth: 580
                }}
              >
                Continuous wearable telemetry, automated emergency alerts, and daily morning WhatsApp digests for your family.
              </Text>

              {/* Primary CTA */}
              <View style={{ marginTop: 32 }}>
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/sign-up')}
                  activeOpacity={0.88}
                  style={{
                    backgroundColor: '#007aff',
                    paddingVertical: 16,
                    paddingHorizontal: 36,
                    borderRadius: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    alignSelf: 'flex-start',
                    gap: 10,
                    shadowColor: '#007aff',
                    shadowOpacity: 0.35,
                    shadowRadius: 14
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#ffffff' }}>
                    Start 14-Day Free Trial
                  </Text>
                  <ArrowRight size={18} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Right Column: Visual Live Telemetry Dashboard */}
            <View style={{ flex: 0.9, minWidth: 340, maxWidth: 520 }}>
              <View
                style={{
                  borderRadius: 24,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  padding: 24,
                  shadowColor: '#000',
                  shadowOpacity: isDark ? 0.3 : 0.08,
                  shadowRadius: 20
                }}
              >
                {/* Patient Header */}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingBottom: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.borderSubtle
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        backgroundColor: isDark ? '#172554' : '#eff6ff',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Heart size={20} color="#007aff" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
                        Dad Ramesh
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textSecondary }}>Chennai • Garmin Venu 3</Text>
                    </View>
                  </View>
                </View>

                {/* 3 Vital Cards */}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
                  <View style={{ flex: 1, padding: 12, backgroundColor: colors.cardSecondary, borderRadius: 14 }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' }}>BP</Text>
                    <Text style={{ fontSize: 19, fontWeight: '900', color: colors.text, marginTop: 2 }}>122/80</Text>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#16a34a', marginTop: 2 }}>Optimal</Text>
                  </View>

                  <View style={{ flex: 1, padding: 12, backgroundColor: colors.cardSecondary, borderRadius: 14 }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' }}>Heart Rate</Text>
                    <Text style={{ fontSize: 19, fontWeight: '900', color: colors.text, marginTop: 2 }}>72 <Text style={{ fontSize: 11, fontWeight: '500' }}>BPM</Text></Text>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#16a34a', marginTop: 2 }}>Normal</Text>
                  </View>

                  <View style={{ flex: 1, padding: 12, backgroundColor: colors.cardSecondary, borderRadius: 14 }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' }}>Sleep</Text>
                    <Text style={{ fontSize: 19, fontWeight: '900', color: colors.text, marginTop: 2 }}>7h 24m</Text>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#007aff', marginTop: 2 }}>Restful</Text>
                  </View>
                </View>

                {/* WhatsApp Toast */}
                <View
                  style={{
                    marginTop: 14,
                    padding: 12,
                    borderRadius: 14,
                    backgroundColor: isDark ? '#052e16' : '#f0fdf4',
                    borderWidth: 1,
                    borderColor: isDark ? '#14532d' : '#bbf7d0',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      backgroundColor: '#25D366',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <MessageCircle size={18} color="#ffffff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, fontWeight: '800', color: colors.text }}>
                      WhatsApp Morning Digest
                    </Text>
                    <Text style={{ fontSize: 11, color: isDark ? '#86efac' : '#334155', marginTop: 2 }}>
                      "Vitals stable. Morning BP 122/80. Medicine taken."
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 3. High-Trust Metrics & Compatibility Strip (Dynamic Light/Dark Theme) */}
        <View
          style={{
            width: '100%',
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderSubtle,
            paddingVertical: 32,
            paddingHorizontal: 32
          }}
        >
          <View
            style={{
              width: '100%',
              maxWidth: 1440,
              alignSelf: 'center'
            }}
          >
            {/* 4 Stats Cards */}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 16
              }}
            >
              {/* Stat 1 */}
              <View
                style={{
                  flex: 1,
                  minWidth: 220,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: colors.cardSecondary,
                  borderWidth: 1,
                  borderColor: colors.borderSubtle
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: isDark ? '#172554' : '#eff6ff',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Users size={22} color="#007aff" />
                </View>
                <View>
                  <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text }}>5,000+</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginTop: 1 }}>
                    NRI Families Protected
                  </Text>
                </View>
              </View>

              {/* Stat 2 */}
              <View
                style={{
                  flex: 1,
                  minWidth: 220,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: colors.cardSecondary,
                  borderWidth: 1,
                  borderColor: colors.borderSubtle
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: isDark ? '#450a0a' : '#fef2f2',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Zap size={22} color="#dc2626" />
                </View>
                <View>
                  <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text }}>&lt; 60s</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginTop: 1 }}>
                    Emergency SOS Alert
                  </Text>
                </View>
              </View>

              {/* Stat 3 */}
              <View
                style={{
                  flex: 1,
                  minWidth: 220,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: colors.cardSecondary,
                  borderWidth: 1,
                  borderColor: colors.borderSubtle
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: isDark ? '#14532d' : '#f0fdf4',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <ShieldCheck size={22} color="#16a34a" />
                </View>
                <View>
                  <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text }}>99.9%</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginTop: 1 }}>
                    Vitals Telemetry Uptime
                  </Text>
                </View>
              </View>

              {/* Stat 4 */}
              <View
                style={{
                  flex: 1,
                  minWidth: 220,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: colors.cardSecondary,
                  borderWidth: 1,
                  borderColor: colors.borderSubtle
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    backgroundColor: isDark ? '#451a03' : '#fffbeb',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Star size={22} color="#f59e0b" fill="#f59e0b" />
                </View>
                <View>
                  <Text style={{ fontSize: 24, fontWeight: '900', color: colors.text }}>4.9 ★</Text>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginTop: 1 }}>
                    App Store & Play Store
                  </Text>
                </View>
              </View>
            </View>

            {/* Compatible Devices Row */}
            <View
              style={{
                marginTop: 20,
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Zero Hardware Lock-In • Ready With:
              </Text>
              {['Garmin', 'Apple Watch', 'Omron BP', 'Fitbit', 'Google Health Connect'].map((dev, i) => (
                <View
                  key={i}
                  style={{
                    backgroundColor: colors.cardSecondary,
                    borderWidth: 1,
                    borderColor: colors.borderSubtle,
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                    borderRadius: 8
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary }}>{dev}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 4. Core Capabilities (4 Minimalist Cards, Zero Essay Text) */}
        <View
          style={{
            width: '100%',
            backgroundColor: isDark ? '#0b101d' : '#ffffff',
            paddingVertical: 72,
            paddingHorizontal: 32
          }}
        >
          <View style={{ width: '100%', maxWidth: 1440, alignSelf: 'center' }}>
            <View style={{ alignItems: 'center', marginBottom: 44 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#007aff', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
                Core Capabilities
              </Text>
              <Text style={{ fontSize: 32, fontWeight: '900', color: colors.text, textAlign: 'center', letterSpacing: -0.5 }}>
                Everything you need to stay connected.
              </Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between' }}>
              {features.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <View
                    key={idx}
                    style={{
                      width: '23.5%',
                      minWidth: 260,
                      padding: 24,
                      borderRadius: 20,
                      backgroundColor: colors.card,
                      borderWidth: 1,
                      borderColor: colors.border
                    }}
                  >
                    <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: item.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                      <Icon size={22} color={item.color} />
                    </View>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: item.color, textTransform: 'uppercase' }}>
                      {item.tag}
                    </Text>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 4 }}>
                      {item.title}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 8, lineHeight: 20 }}>
                      {item.desc}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* 5. How It Works (3 Steps) */}
        <View
          style={{
            width: '100%',
            backgroundColor: isDark ? '#090d16' : '#fafcff',
            paddingVertical: 64,
            paddingHorizontal: 32,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: colors.borderSubtle
          }}
        >
          <View style={{ width: '100%', maxWidth: 1440, alignSelf: 'center' }}>
            <View style={{ alignItems: 'center', marginBottom: 40 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#007aff', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
                Simple Setup
              </Text>
              <Text style={{ fontSize: 28, fontWeight: '900', color: colors.text, textAlign: 'center' }}>
                Up and running in 3 easy steps.
              </Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 24, justifyContent: 'space-between' }}>
              {steps.map((st, sIdx) => (
                <View
                  key={sIdx}
                  style={{
                    flex: 1,
                    minWidth: 260,
                    padding: 24,
                    backgroundColor: colors.card,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '900', color: '#007aff' }}>{st.step}</Text>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text, marginTop: 8 }}>{st.title}</Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 6, lineHeight: 20 }}>{st.desc}</Text>
                </View>
              ))}
            </View>

            {/* Link to Interactive Setup Walkthrough */}
            <View style={{ marginTop: 28, alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/welcome')}
                activeOpacity={0.85}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#007aff',
                  backgroundColor: isDark ? '#172554' : '#eff6ff',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#007aff' }}>
                  Launch Interactive Setup Walkthrough &rarr;
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 6. Testimonials (Short & Punchy) */}
        <View
          style={{
            width: '100%',
            backgroundColor: isDark ? '#0b101d' : '#ffffff',
            paddingVertical: 64,
            paddingHorizontal: 32
          }}
        >
          <View style={{ width: '100%', maxWidth: 1440, alignSelf: 'center' }}>
            <View style={{ alignItems: 'center', marginBottom: 40 }}>
              <Text style={{ fontSize: 28, fontWeight: '900', color: colors.text, textAlign: 'center' }}>
                Trusted by NRI families worldwide.
              </Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20, justifyContent: 'space-between' }}>
              {reviews.map((rev, rIdx) => (
                <View
                  key={rIdx}
                  style={{
                    flex: 1,
                    minWidth: 280,
                    padding: 24,
                    borderRadius: 20,
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                >
                  <View style={{ flexDirection: 'row', gap: 3, marginBottom: 12 }}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={14} color="#f59e0b" fill="#f59e0b" />
                    ))}
                  </View>
                  <Text style={{ fontSize: 13, color: isDark ? '#cbd5e1' : '#334155', lineHeight: 22, fontStyle: 'italic' }}>
                    "{rev.quote}"
                  </Text>
                  <View style={{ marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.borderSubtle }}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: colors.text }}>{rev.author}</Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>{rev.role}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 7. FAQ (Clean Accordion) */}
        <View
          style={{
            width: '100%',
            backgroundColor: isDark ? '#090d16' : '#fafcff',
            paddingVertical: 64,
            paddingHorizontal: 32,
            borderTopWidth: 1,
            borderColor: colors.borderSubtle
          }}
        >
          <View style={{ width: '100%', maxWidth: 880, alignSelf: 'center' }}>
            <View style={{ alignItems: 'center', marginBottom: 36 }}>
              <Text style={{ fontSize: 28, fontWeight: '900', color: colors.text, textAlign: 'center' }}>
                Frequently Asked Questions
              </Text>
            </View>

            <View style={{ gap: 12 }}>
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setOpenFaq(isOpen ? null : idx)}
                    activeOpacity={0.85}
                    style={{
                      padding: 18,
                      borderRadius: 16,
                      backgroundColor: colors.card,
                      borderWidth: 1,
                      borderColor: colors.border
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 14, fontWeight: '800', color: colors.text, flex: 1, paddingRight: 16 }}>
                        {faq.q}
                      </Text>
                      {isOpen ? <ChevronUp size={18} color="#007aff" /> : <ChevronDown size={18} color={colors.textSecondary} />}
                    </View>
                    {isOpen && (
                      <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.borderSubtle, lineHeight: 20 }}>
                        {faq.a}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* 8. Conversion Banner */}
        <View style={{ width: '100%', paddingHorizontal: 32, paddingVertical: 48, backgroundColor: colors.background }}>
          <View
            style={{
              width: '100%',
              maxWidth: 1440,
              alignSelf: 'center',
              borderRadius: 24,
              backgroundColor: '#007aff',
              paddingVertical: 48,
              paddingHorizontal: 32,
              alignItems: 'center',
              shadowColor: '#007aff',
              shadowOpacity: 0.3,
              shadowRadius: 20
            }}
          >
            <Text style={{ fontSize: 32, fontWeight: '900', color: '#ffffff', textAlign: 'center', letterSpacing: -0.5 }}>
              Give your parents the proactive care they deserve.
            </Text>
            <Text style={{ fontSize: 15, color: '#dbeafe', marginTop: 8, textAlign: 'center' }}>
              Set up in 5 minutes with zero hardware lock-in.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/sign-up')}
              activeOpacity={0.9}
              style={{
                marginTop: 24,
                backgroundColor: '#ffffff',
                paddingVertical: 14,
                paddingHorizontal: 32,
                borderRadius: 12,
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 8
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#007aff' }}>Start Free 14-Day Trial</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 9. Minimal Clean Footer */}
        <View
          style={{
            width: '100%',
            backgroundColor: isDark ? '#050811' : '#0f172a',
            paddingTop: 48,
            paddingBottom: 32,
            paddingHorizontal: 32,
            borderTopWidth: 1,
            borderTopColor: isDark ? '#111827' : '#1e293b'
          }}
        >
          <View style={{ width: '100%', maxWidth: 1440, alignSelf: 'center' }}>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                gap: 32,
                paddingBottom: 32,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? '#111827' : '#1e293b'
              }}
            >
              <View style={{ width: '30%', minWidth: 240 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: '#007aff', alignItems: 'center', justifyContent: 'center' }}>
                    <Heart size={16} color="#ffffff" />
                  </View>
                  <Text style={{ fontSize: 17, fontWeight: '900', color: '#ffffff' }}>KinGuardian</Text>
                </View>
                <Text style={{ fontSize: 13, color: '#94a3b8', marginTop: 12, lineHeight: 20 }}>
                  Remote elder care coordination for global Indian families.
                </Text>
              </View>

              <View style={{ gap: 10 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#ffffff', textTransform: 'uppercase' }}>Platform</Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/features')}>
                  <Text style={{ fontSize: 13, color: '#94a3b8' }}>Features</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/(auth)/pricing')}>
                  <Text style={{ fontSize: 13, color: '#94a3b8' }}>Pricing</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/(auth)/security')}>
                  <Text style={{ fontSize: 13, color: '#94a3b8' }}>Security</Text>
                </TouchableOpacity>
              </View>

              <View style={{ gap: 10 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#ffffff', textTransform: 'uppercase' }}>Company</Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/about')}>
                  <Text style={{ fontSize: 13, color: '#94a3b8' }}>About</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
                  <Text style={{ fontSize: 13, color: '#94a3b8' }}>Start Free Trial</Text>
                </TouchableOpacity>
              </View>

              <View style={{ gap: 10 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#ffffff', textTransform: 'uppercase' }}>Legal</Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/privacy')}>
                  <Text style={{ fontSize: 13, color: '#94a3b8' }}>Privacy Policy</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/(auth)/terms')}>
                  <Text style={{ fontSize: 13, color: '#94a3b8' }}>Terms of Service</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <Text style={{ fontSize: 11, color: '#64748b' }}>
                © {new Date().getFullYear()} KinGuardian Technologies. All rights reserved.
              </Text>
              <Text style={{ fontSize: 11, color: '#64748b' }}>
                Built for NRI Families in 🇺🇸 USA • 🇬🇧 UK • 🇨🇦 Canada • 🇦🇺 Australia • 🇮🇳 India
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
