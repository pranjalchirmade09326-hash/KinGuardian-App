import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
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
  Moon,
  Activity,
  CheckCircle2,
  FileText,
  Check
} from 'lucide-react-native';
import { useTheme } from '../../src/hooks/useTheme';

export default function LandingScreen() {
  const router = useRouter();
  const { isDark, toggleTheme, colors } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeTab, setActiveTab] = useState<'telemetry' | 'whatsapp' | 'sos' | 'doctor'>('telemetry');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const stats = [
    {
      icon: Users,
      value: '5,000+',
      label: 'NRI Families Protected',
      sublabel: 'USA • UK • Canada • UAE • Singapore',
      accent: '#007aff',
      bg: isDark ? 'rgba(0, 122, 255, 0.15)' : '#eff6ff'
    },
    {
      icon: Zap,
      value: '< 60s',
      label: 'Emergency SOS Response',
      sublabel: 'Ambulance dispatch + family call tree',
      accent: '#dc2626',
      bg: isDark ? 'rgba(220, 38, 38, 0.15)' : '#fef2f2'
    },
    {
      icon: ShieldCheck,
      value: '99.98%',
      label: 'Telemetry Reliability',
      sublabel: 'Continuous background wearable sync',
      accent: '#16a34a',
      bg: isDark ? 'rgba(22, 163, 74, 0.15)' : '#f0fdf4'
    },
    {
      icon: Star,
      value: '4.9 / 5',
      label: 'Cardiologist & Family Rating',
      sublabel: 'Reviewed across 1,200+ doctors in India',
      accent: '#f59e0b',
      bg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb'
    }
  ];

  const brandLogos = [
    'GOOGLE',
    'MICROSOFT',
    'AMAZON',
    'META',
    'APPLE',
    'SALESFORCE',
    'NVIDIA',
    'MCKINSEY'
  ];

  const bentoFeatures = [
    {
      title: 'WhatsApp Native Daily Loop',
      tag: 'Zero Learning Curve',
      desc: 'Elderly parents never need to open an app. Every morning at 7:30 AM IST, verified vitals and medicine check-ins arrive directly inside your family WhatsApp group.',
      icon: MessageCircle,
      accent: '#16a34a',
      highlight: 'Parents just reply "Done" to take medicines'
    },
    {
      title: 'Continuous Wearable Ingestion',
      tag: 'Passive Background Sync',
      desc: 'Syncs heart rate, blood pressure, ECG, and sleep from Apple Watch, Garmin, Omron, and Fitbit with zero manual entry required from your parents.',
      icon: Watch,
      accent: '#007aff',
      highlight: 'Background polling every 15 minutes'
    },
    {
      title: 'Gemini 2.5 Clinical AI Triage',
      tag: 'Instant Translation',
      desc: 'Complex biometric trends and lab values are automatically summarized into clear, non-alarmist health explanations for overseas daughters and sons.',
      icon: Sparkles,
      accent: '#9333ea',
      highlight: 'Detects silent hypertension trends early'
    },
    {
      title: 'Pan-India 24/7 SOS Escrow',
      tag: 'Sub-60s Local Dispatch',
      desc: 'Sudden fall or critical spike triggers automated emergency calls to family while instantly dispatching the nearest private ambulance with GPS coordinates in India.',
      icon: Zap,
      accent: '#dc2626',
      highlight: 'Tied to 1,200+ accredited Indian hospitals'
    }
  ];

  const pricingPlans = [
    {
      name: 'Essential Care',
      tagline: 'Proactive wearable monitoring for a single parent',
      monthlyPrice: '$19',
      annualPrice: '$15',
      inr: 'approx. ₹1,550/mo',
      popular: false,
      features: [
        '1 Parent Profile Monitored',
        'Continuous Wearable Vitals Sync',
        'Daily Morning WhatsApp Digest',
        'Automated Medication Reminders',
        'Sub-60s Anomaly & SOS Alerts',
        'Standard Email & Chat Support'
      ]
    },
    {
      name: 'Family Shield',
      tagline: 'Complete clinical protection for both parents with Gemini AI',
      monthlyPrice: '$39',
      annualPrice: '$31',
      inr: 'approx. ₹3,200/mo',
      popular: true,
      features: [
        'Both Parents Supported (Mom & Dad)',
        'All Essential Features Included',
        'AI Clinical Translation (Gemini 2.5)',
        '1-Click Doctor PDF Briefs (Apollo/Max)',
        'Unlimited Family Group WhatsApp Sync',
        'Priority 24/7 Caregiver Alert Support',
        'Longitudinal Health Trend Analytics'
      ]
    },
    {
      name: 'Concierge NRI',
      tagline: 'Dedicated human care concierge team on the ground in India',
      monthlyPrice: '$89',
      annualPrice: '$71',
      inr: 'approx. ₹7,300/mo',
      popular: false,
      features: [
        'All Family Shield Features',
        'Dedicated Care Manager in India',
        'Monthly At-Home Phlebotomist Lab Tests',
        'Doctor In-Person Appointment Accompaniment',
        'Emergency Ambulance Coordination On-Call',
        'Direct WhatsApp Line to Care Doctor'
      ]
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Connect Existing Wearable',
      desc: 'Pair Apple Watch, Garmin, Omron BP monitor, or Google Health Connect in under 2 minutes.',
      icon: Watch,
      badge: 'Zero Hardware Lock-In'
    },
    {
      step: '02',
      title: 'Invite WhatsApp Care Bot',
      desc: 'Add parents in India and siblings abroad to the verified KinGuardian Bot loop. Parents never need a new app.',
      icon: MessageCircle,
      badge: '100% WhatsApp Ready'
    },
    {
      step: '03',
      title: 'Enjoy 24/7 Peace of Mind',
      desc: 'Wake up to verified daily morning telemetry, Gemini AI triage, and automated 24/7 emergency dispatch protection.',
      icon: ShieldCheck,
      badge: 'Sub-60s Local SOS'
    }
  ];

  const reviews = [
    {
      quote:
        'Being in Seattle with aging parents in Delhi was constant low-grade dread. KinGuardian changed everything. Every morning I see my father’s BP and morning walk count before my first standup.',
      author: 'Priya Sundaram',
      role: 'Staff Engineer • Seattle, WA',
      parent: 'Father (74y), New Delhi',
      rating: 5
    },
    {
      quote:
        'My mother’s cardiologist in Bangalore specifically praised the 30-day vitals PDF. It showed her blood pressure dipping abnormally at night, which led to a medication tweak before any stroke risk occurred.',
      author: 'Dr. Amit V. Kulkarni',
      role: 'Consultant Physician • London, UK',
      parent: 'Mother (71y), Bangalore',
      rating: 5
    },
    {
      quote:
        'The WhatsApp integration is genius. My 82-year-old father never opens apps, but he taps WhatsApp all day. He simply replies "Done" to the morning pill reminder.',
      author: 'Rohan Mehra',
      role: 'Finance VP • Singapore',
      parent: 'Parents (82y & 78y), Mumbai',
      rating: 5
    }
  ];

  const faqs = [
    {
      q: 'Which wearables and BP monitors are compatible?',
      a: 'KinGuardian integrates directly with Apple Watch (Series 4+), Garmin (Venu, Forerunner, Vivoactive), Fitbit, Samsung Galaxy Watch, Noise, Boat, and Bluetooth-enabled Omron BP cuffs (HEM-7156T, Evolv). You can also sync via Google Health Connect.'
    },
    {
      q: 'How does the emergency SOS ambulance escalation work?',
      a: 'If a critical event occurs (e.g. extreme vitals threshold or SOS trigger), our cloud engine initiates an automated multi-channel protocol: automated phone calls to family coordinators worldwide, simultaneous alerts to local emergency contacts in India, and dispatch routing to the nearest accredited emergency ambulance partner.'
    },
    {
      q: 'How is our family medical data secured?',
      a: 'All telemetry packets and medical data are encrypted in transit and at rest using enterprise-grade AES-256 and TLS 1.3 encryption with strict patient privacy protections and granular parental consent controls.'
    },
    {
      q: 'Can our family doctor in India access these records?',
      a: 'Yes. With one tap, you can generate a clinically structured PDF health report designed specifically for Indian physicians and cardiologists, detailing BP variance, resting heart rate curves, and medication adherence logs.'
    }
  ];

  return (
    <View style={{ flex: 1, width: '100%', minHeight: '100%', backgroundColor: colors.background }}>
      {/* 1. Header (Floating Modern Glass Navbar) */}
      <View
        style={{
          width: '100%',
          backgroundColor: isDark ? 'rgba(9, 13, 22, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          borderBottomWidth: 1,
          borderBottomColor: colors.borderSubtle,
          position: 'sticky' as any,
          top: 0,
          zIndex: 100
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 1560,
            alignSelf: 'center',
            paddingHorizontal: isMobile ? 16 : 36,
            paddingVertical: isMobile ? 12 : 16,
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
                borderRadius: 11,
                backgroundColor: '#007aff',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#007aff',
                shadowOpacity: 0.4,
                shadowRadius: 10
              }}
            >
              <Heart size={20} color="#ffffff" fill="#ffffff" />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: '900',
                  color: colors.text,
                  letterSpacing: -0.6
                }}
              >
                KinGuardian
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '700',
                  color: '#007aff',
                  letterSpacing: 0.5,
                  textTransform: 'uppercase'
                }}
              >
                NRI Elder Care Platform
              </Text>
            </View>
          </TouchableOpacity>

          {/* Navigation Links (Desktop/Tablet Only) */}
          {!isMobile && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 28 }}>
              <TouchableOpacity onPress={() => router.push('/(auth)/features')}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary }}>
                  Capabilities
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/(auth)/pricing')}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary }}>
                  Pricing
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/(auth)/security')}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary }}>
                  Security
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/(auth)/about')}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textSecondary }}>
                  How It Works
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Right Action Buttons + Theme Toggle */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: isMobile ? 8 : 10 }}>
            {/* Theme Toggle Button */}
            <TouchableOpacity
              onPress={toggleTheme}
              activeOpacity={0.8}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: isDark ? colors.card : colors.cardSecondary,
                alignItems: 'center',
                justifyContent: 'center'
              }}
              accessibilityLabel="Toggle Dark/Light Mode"
            >
              {isDark ? <Sun size={17} color="#fbbf24" /> : <Moon size={17} color="#64748b" />}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(auth)/sign-in')}
              activeOpacity={0.8}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8.5,
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
                shadowOpacity: 0.35,
                shadowRadius: 8
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '800', color: '#ffffff' }}>
                Start Free Trial
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{ width: '100%', flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 2. Hero Section (Centered High-Impact Marketing Layout) */}
        <View
          style={{
            width: '100%',
            backgroundColor: isDark ? '#080c14' : '#fafcff',
            borderBottomWidth: 1,
            borderBottomColor: colors.borderSubtle,
            paddingTop: isMobile ? 36 : 56,
            paddingBottom: isMobile ? 48 : 72,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Subtle Ambient Radial Lighting */}
          <View
            style={{
              position: 'absolute',
              top: -80,
              left: '50%',
              transform: [{ translateX: -450 }],
              width: 900,
              height: 500,
              opacity: isDark ? 0.2 : 0.08,
              pointerEvents: 'none'
            }}
          >
            <Svg width="900" height="500" viewBox="0 0 900 500">
              <Defs>
                <LinearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#007aff" stopOpacity="0.9" />
                  <Stop offset="50%" stopColor="#38bdf8" stopOpacity="0.4" />
                  <Stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </LinearGradient>
              </Defs>
              <Circle cx="450" cy="200" r="320" fill="url(#heroGradient)" />
            </Svg>
          </View>

          {/* Centered Hero Header */}
          <View style={{ width: '100%', maxWidth: 1280, alignSelf: 'center', paddingHorizontal: isMobile ? 16 : 32, alignItems: 'center' }}>
            {/* Pill Badge */}
            <View
              style={{
                backgroundColor: isDark ? 'rgba(0, 122, 255, 0.12)' : '#eff6ff',
                borderColor: isDark ? 'rgba(0, 122, 255, 0.35)' : '#bfdbfe',
                borderWidth: 1,
                paddingHorizontal: 16,
                paddingVertical: 7,
                borderRadius: 9999,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginBottom: 22
              }}
            >
              <Sparkles size={15} color="#007aff" />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '800',
                  color: '#007aff',
                  letterSpacing: 0.3
                }}
              >
                TELEMETRY ENGINE 2.0 • FOR OVERSEAS INDIAN FAMILIES
              </Text>
            </View>

            {/* Big Headline */}
            <Text
              style={{
                fontSize: isMobile ? 36 : isTablet ? 48 : 60,
                fontWeight: '900',
                color: colors.text,
                lineHeight: isMobile ? 44 : isTablet ? 56 : 68,
                textAlign: 'center',
                letterSpacing: isMobile ? -1 : -2
              }}
            >
              Care for your parents in India.{'\n'}
              <Text style={{ color: '#007aff' }}>From 8,000 miles away.</Text>
            </Text>

            {/* Subtitle */}
            <Text
              style={{
                fontSize: isMobile ? 15.5 : 19,
                color: colors.textSecondary,
                marginTop: 16,
                lineHeight: isMobile ? 24 : 30,
                textAlign: 'center',
                maxWidth: 820
              }}
            >
              Continuous wearable telemetry, automated morning WhatsApp check-ins, and sub-60s
              emergency ambulance routing. No app for parents to learn. Pure peace of mind for you.
            </Text>

            {/* Dual Action Buttons */}
            <View
              style={{
                marginTop: 32,
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: 'center',
                width: isMobile ? '100%' : 'auto',
                justifyContent: 'center',
                gap: 14
              }}
            >
              <TouchableOpacity
                onPress={() => router.push('/(auth)/sign-up')}
                activeOpacity={0.88}
                style={{
                  backgroundColor: '#007aff',
                  paddingVertical: 15,
                  paddingHorizontal: isMobile ? 24 : 38,
                  borderRadius: 12,
                  width: isMobile ? '100%' : 'auto',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  shadowColor: '#007aff',
                  shadowOpacity: 0.4,
                  shadowRadius: 16
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#ffffff' }}>
                  Start 14-Day Free Trial
                </Text>
                <ArrowRight size={18} color="#ffffff" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/(auth)/welcome')}
                activeOpacity={0.85}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: isMobile ? 24 : 26,
                  borderRadius: 12,
                  width: isMobile ? '100%' : 'auto',
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: isDark ? colors.card : '#ffffff',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                <Activity size={18} color="#007aff" />
                <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>
                  Explore Interactive Tour
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 3. Interactive Product Showcase Mockup (Expansive Full-Width Console) */}
          <View style={{ width: '100%', maxWidth: 1560, alignSelf: 'center', marginTop: isMobile ? 32 : 48, paddingHorizontal: isMobile ? 12 : 32 }}>
            {/* Browser / Console Window Chrome */}
            <View
              style={{
                borderRadius: isMobile ? 16 : 20,
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: isDark ? '#1e293b' : '#e2e8f0',
                shadowColor: '#000',
                shadowOpacity: isDark ? 0.5 : 0.1,
                shadowRadius: 30,
                shadowOffset: { width: 0, height: 12 },
                overflow: 'hidden'
              }}
            >
              {/* Top Window Bar with 3 Dots & Navigation Tabs */}
              <View
                style={{
                  backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                  borderBottomWidth: 1,
                  borderBottomColor: colors.borderSubtle,
                  paddingHorizontal: isMobile ? 14 : 18,
                  paddingVertical: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12
                }}
              >
                {/* Window Dots */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: '#ef4444' }} />
                  <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: '#f59e0b' }} />
                  <View style={{ width: 11, height: 11, borderRadius: 6, backgroundColor: '#10b981' }} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMuted, marginLeft: 8 }}>
                    kinguardian-telemetry-console.cloud
                  </Text>
                </View>

                {/* 4 Interactive Feature Switcher Tabs */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ maxWidth: '100%' }}
                  contentContainerStyle={{
                    flexDirection: 'row',
                    backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                    borderRadius: 8,
                    padding: 3,
                    gap: 2
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setActiveTab('telemetry')}
                    activeOpacity={0.8}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 6,
                      backgroundColor: activeTab === 'telemetry' ? (isDark ? '#007aff' : '#ffffff') : 'transparent'
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: activeTab === 'telemetry' ? (isDark ? '#ffffff' : '#007aff') : colors.textSecondary
                      }}
                    >
                      Wearable Telemetry
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setActiveTab('whatsapp')}
                    activeOpacity={0.8}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 6,
                      backgroundColor: activeTab === 'whatsapp' ? (isDark ? '#007aff' : '#ffffff') : 'transparent'
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: activeTab === 'whatsapp' ? (isDark ? '#ffffff' : '#007aff') : colors.textSecondary
                      }}
                    >
                      WhatsApp Care Loop
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setActiveTab('sos')}
                    activeOpacity={0.8}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 6,
                      backgroundColor: activeTab === 'sos' ? (isDark ? '#007aff' : '#ffffff') : 'transparent'
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: activeTab === 'sos' ? (isDark ? '#ffffff' : '#007aff') : colors.textSecondary
                      }}
                    >
                      Emergency SOS Escrow
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setActiveTab('doctor')}
                    activeOpacity={0.8}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 6,
                      backgroundColor: activeTab === 'doctor' ? (isDark ? '#007aff' : '#ffffff') : 'transparent'
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '700',
                        color: activeTab === 'doctor' ? (isDark ? '#ffffff' : '#007aff') : colors.textSecondary
                      }}
                    >
                      Doctor PDF Export
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              {/* Tab Content Display Area */}
              <View style={{ padding: isMobile ? 16 : 24 }}>
                {activeTab === 'telemetry' && (
                  <View>
                    {/* Patient Bar */}
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingBottom: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.borderSubtle,
                        flexWrap: 'wrap',
                        gap: 12
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            backgroundColor: '#007aff',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Text style={{ fontSize: 16, fontWeight: '900', color: '#ffffff' }}>RK</Text>
                        </View>
                        <View>
                          <Text style={{ fontSize: 17, fontWeight: '800', color: colors.text }}>
                            Ramesh K. (Father, 76y)
                          </Text>
                          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                            Chennai, Tamil Nadu • Connected to Garmin Venu 3 (Battery 96% ⚡)
                          </Text>
                        </View>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View
                          style={{
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 8,
                            backgroundColor: isDark ? 'rgba(22, 163, 74, 0.15)' : '#f0fdf4',
                            borderWidth: 1,
                            borderColor: isDark ? 'rgba(22, 163, 74, 0.3)' : '#bbf7d0'
                          }}
                        >
                          <Text style={{ fontSize: 11, fontWeight: '800', color: '#16a34a' }}>
                            ● ALL VITALS IN SAFE ZONE
                          </Text>
                        </View>
                        <Text style={{ fontSize: 11, color: colors.textMuted }}>Synced 2m ago</Text>
                      </View>
                    </View>

                    {/* 4 Live Vitals Cards: Steps, BP, Sleep, HR */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: isMobile ? 10 : 14, marginTop: 16 }}>
                      {/* 1. Steps Card */}
                      <View
                        style={{
                          flex: 1,
                          minWidth: isMobile ? '46%' : 220,
                          padding: isMobile ? 14 : 16,
                          borderRadius: 14,
                          backgroundColor: colors.cardSecondary,
                          borderWidth: 1,
                          borderColor: colors.borderSubtle
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase' }}>
                          Daily Steps
                        </Text>
                        <Text style={{ fontSize: isMobile ? 22 : 28, fontWeight: '900', color: colors.text, marginTop: 4 }}>
                          6,420 <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textMuted }}>Steps</Text>
                        </Text>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#16a34a', marginTop: 4 }}>
                          2.4 km • 80% of Daily Goal
                        </Text>
                      </View>

                      {/* 2. BP Card */}
                      <View
                        style={{
                          flex: 1,
                          minWidth: isMobile ? '46%' : 220,
                          padding: isMobile ? 14 : 16,
                          borderRadius: 14,
                          backgroundColor: colors.cardSecondary,
                          borderWidth: 1,
                          borderColor: colors.borderSubtle
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase' }}>
                          Blood Pressure
                        </Text>
                        <Text style={{ fontSize: isMobile ? 22 : 28, fontWeight: '900', color: colors.text, marginTop: 4 }}>
                          122/80 <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textMuted }}>mmHg</Text>
                        </Text>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#16a34a', marginTop: 4 }}>
                          Optimal Range (Omron Evolv)
                        </Text>
                      </View>

                      {/* 3. Sleep Card */}
                      <View
                        style={{
                          flex: 1,
                          minWidth: isMobile ? '46%' : 220,
                          padding: isMobile ? 14 : 16,
                          borderRadius: 14,
                          backgroundColor: colors.cardSecondary,
                          borderWidth: 1,
                          borderColor: colors.borderSubtle
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase' }}>
                          Sleep
                        </Text>
                        <Text style={{ fontSize: isMobile ? 22 : 28, fontWeight: '900', color: colors.text, marginTop: 4 }}>
                          7h 24m <Text style={{ fontSize: 12, fontWeight: '700', color: '#16a34a' }}>(92%)</Text>
                        </Text>
                        <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 4 }}>
                          Deep: 1h 45m • REM: 1h 50m
                        </Text>
                      </View>

                      {/* 4. Heart Rate (HR) Card */}
                      <View
                        style={{
                          flex: 1,
                          minWidth: isMobile ? '46%' : 220,
                          padding: isMobile ? 14 : 16,
                          borderRadius: 14,
                          backgroundColor: colors.cardSecondary,
                          borderWidth: 1,
                          borderColor: colors.borderSubtle
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase' }}>
                          Heart Rate (HR)
                        </Text>
                        <Text style={{ fontSize: isMobile ? 22 : 28, fontWeight: '900', color: colors.text, marginTop: 4 }}>
                          72 <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textMuted }}>BPM</Text>
                        </Text>
                        <View style={{ height: 18, marginTop: 6, justifyContent: 'center' }}>
                          <Svg width="100%" height="18" viewBox="0 0 140 18">
                            <Path
                              d="M0 9 L35 9 L42 2 L49 16 L56 9 L63 9 L68 5 L73 13 L78 9 L140 9"
                              fill="none"
                              stroke="#007aff"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </Svg>
                        </View>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#007aff', marginTop: 4 }}>
                          Sinus Rhythm (Resting 64 BPM)
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {activeTab === 'whatsapp' && (
                  <View style={{ gap: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#25D366', alignItems: 'center', justifyContent: 'center' }}>
                          <MessageCircle size={18} color="#ffffff" />
                        </View>
                        <View>
                          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
                            WhatsApp Family Group: "Sharma Family Care Loop"
                          </Text>
                          <Text style={{ fontSize: 11.5, color: colors.textSecondary }}>
                            Priya (Seattle) • Rohan (London) • Papa (Delhi) • KinGuardian Verified Bot
                          </Text>
                        </View>
                      </View>
                      <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: '#dcfce7' }}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#16a34a' }}>VERIFIED CARE BOT</Text>
                      </View>
                    </View>

                    {/* Chat Bubble 1: Morning Digest */}
                    <View style={{ padding: 16, borderRadius: 14, backgroundColor: isDark ? '#14251e' : '#f0fdf4', borderWidth: 1, borderColor: isDark ? '#166534' : '#bbf7d0', maxWidth: 640 }}>
                      <Text style={{ fontSize: 11, fontWeight: '800', color: '#16a34a', marginBottom: 4 }}>
                        KinGuardian Bot • 07:30 AM IST
                      </Text>
                      <Text style={{ fontSize: 13.5, color: colors.text, lineHeight: 22 }}>
                        🌅 <Text style={{ fontWeight: '800' }}>Morning Health Digest:</Text>{'\n'}
                        • Papa woke up at 6:40 AM after 7h 24m restful sleep.{'\n'}
                        • Morning BP checked via Omron: <Text style={{ fontWeight: '800', color: '#16a34a' }}>122/80 mmHg (Optimal)</Text>.{'\n'}
                        • Morning walk: 2,420 steps in garden. Resting HR: 68 BPM.
                      </Text>
                    </View>

                    {/* Chat Bubble 2: Medicine Confirmation */}
                    <View style={{ padding: 14, borderRadius: 14, backgroundColor: isDark ? '#1e293b' : '#f1f5f9', alignSelf: 'flex-start', maxWidth: 480 }}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textMuted, marginBottom: 2 }}>
                        Papa Ramesh • 08:15 AM IST
                      </Text>
                      <Text style={{ fontSize: 13.5, color: colors.text }}>
                        "Done beta. Took morning Telmisartan 40mg after breakfast." 👍
                      </Text>
                    </View>
                  </View>
                )}

                {activeTab === 'sos' && (
                  <View style={{ gap: 16 }}>
                    <View style={{ padding: 18, borderRadius: 14, backgroundColor: isDark ? '#2e1215' : '#fef2f2', borderWidth: 1, borderColor: '#fecaca', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#dc2626', alignItems: 'center', justifyContent: 'center' }}>
                          <Zap size={22} color="#ffffff" />
                        </View>
                        <View>
                          <Text style={{ fontSize: 16, fontWeight: '800', color: '#b91c1c' }}>
                            Sub-60s Automated Emergency Protocol (Standby)
                          </Text>
                          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                            Multi-channel escalation: Overseas Family + Local Indian Contacts + Nearest Private Ambulance
                          </Text>
                        </View>
                      </View>
                      <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: '#dc2626' }}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#ffffff' }}>24/7 ACTIVE ESCROW</Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
                      <View style={{ flex: 1, minWidth: 240, padding: 14, borderRadius: 12, backgroundColor: colors.cardSecondary, borderWidth: 1, borderColor: colors.borderSubtle }}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#dc2626', textTransform: 'uppercase' }}>
                          Tier 1: Overseas IVR Call
                        </Text>
                        <Text style={{ fontSize: 13.5, fontWeight: '700', color: colors.text, marginTop: 4 }}>
                          Direct phone call to Priya (Seattle, +1-206) & Rohan (London)
                        </Text>
                        <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>Trigger time: Instant (&lt; 15 seconds)</Text>
                      </View>

                      <View style={{ flex: 1, minWidth: 240, padding: 14, borderRadius: 12, backgroundColor: colors.cardSecondary, borderWidth: 1, borderColor: colors.borderSubtle }}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#007aff', textTransform: 'uppercase' }}>
                          Tier 2: Local India Emergency Contact
                        </Text>
                        <Text style={{ fontSize: 13.5, fontWeight: '700', color: colors.text, marginTop: 4 }}>
                          Suresh K. (Brother in Chennai, 5 km away)
                        </Text>
                        <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>Simultaneous SMS & automated call</Text>
                      </View>

                      <View style={{ flex: 1, minWidth: 240, padding: 14, borderRadius: 12, backgroundColor: colors.cardSecondary, borderWidth: 1, borderColor: colors.borderSubtle }}>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#16a34a', textTransform: 'uppercase' }}>
                          Tier 3: Ambulance Dispatch
                        </Text>
                        <Text style={{ fontSize: 13.5, fontWeight: '700', color: colors.text, marginTop: 4 }}>
                          Apollo Hospitals Emergency (Greams Rd, 3.8 km)
                        </Text>
                        <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>GPS dispatched directly to residence</Text>
                      </View>
                    </View>
                  </View>
                )}

                {activeTab === 'doctor' && (
                  <View style={{ gap: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#9333ea', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={18} color="#ffffff" />
                        </View>
                        <View>
                          <Text style={{ fontSize: 16, fontWeight: '800', color: colors.text }}>
                            1-Click Clinical Doctor PDF Generator
                          </Text>
                          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                            Formatted for Indian Cardiologists & Geriatricians (Max, Apollo, Fortis)
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => router.push('/(auth)/welcome')}
                        activeOpacity={0.8}
                        style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, backgroundColor: '#007aff' }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '800', color: '#ffffff' }}>Download Sample PDF</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={{ padding: 16, borderRadius: 14, backgroundColor: colors.cardSecondary, borderWidth: 1, borderColor: colors.borderSubtle }}>
                      <Text style={{ fontSize: 12.5, fontWeight: '700', color: colors.text }}>
                        Included in 30-Day Clinical Summary:
                      </Text>
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 10 }}>
                        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: isDark ? '#1e293b' : '#ffffff', borderWidth: 1, borderColor: colors.border }}>
                          <Text style={{ fontSize: 11, color: colors.text }}>✓ 30-Day Mean Arterial Pressure (MAP)</Text>
                        </View>
                        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: isDark ? '#1e293b' : '#ffffff', borderWidth: 1, borderColor: colors.border }}>
                          <Text style={{ fontSize: 11, color: colors.text }}>✓ Nocturnal Blood Pressure Dips</Text>
                        </View>
                        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: isDark ? '#1e293b' : '#ffffff', borderWidth: 1, borderColor: colors.border }}>
                          <Text style={{ fontSize: 11, color: colors.text }}>✓ Resting Heart Rate Trend Curves</Text>
                        </View>
                        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, backgroundColor: isDark ? '#1e293b' : '#ffffff', borderWidth: 1, borderColor: colors.border }}>
                          <Text style={{ fontSize: 11, color: colors.text }}>✓ 98.4% Medication Adherence Rate</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* 4. Social Proof & Enterprise Tech Brand Strip */}
        <View
          style={{
            width: '100%',
            backgroundColor: isDark ? '#0b101d' : '#f8fafc',
            borderBottomWidth: 1,
            borderBottomColor: colors.borderSubtle,
            paddingVertical: isMobile ? 24 : 32,
            paddingHorizontal: isMobile ? 16 : 36
          }}
        >
          <View style={{ width: '100%', maxWidth: 1560, alignSelf: 'center', alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: '800',
                color: colors.textMuted,
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                marginBottom: 16,
                textAlign: 'center'
              }}
            >
              TRUSTED BY OVERSEAS INDIAN LEADERS & ENGINEERS AT
            </Text>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                gap: isMobile ? 18 : 36
              }}
            >
              {brandLogos.map((brand, bIdx) => (
                <Text
                  key={bIdx}
                  style={{
                    fontSize: isMobile ? 13 : 14.5,
                    fontWeight: '900',
                    color: isDark ? '#475569' : '#94a3b8',
                    letterSpacing: 2
                  }}
                >
                  {brand}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* 5. Metrics Strip */}
        <View
          style={{
            width: '100%',
            backgroundColor: colors.background,
            borderBottomWidth: 1,
            borderBottomColor: colors.borderSubtle,
            paddingVertical: isMobile ? 28 : 36,
            paddingHorizontal: isMobile ? 16 : 36
          }}
        >
          <View style={{ width: '100%', maxWidth: 1560, alignSelf: 'center' }}>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: isMobile ? 12 : 16
              }}
            >
              {stats.map((st, i) => {
                const Icon = st.icon;
                return (
                  <View
                    key={i}
                    style={{
                      flex: 1,
                      minWidth: isMobile ? '100%' : 240,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 16,
                      padding: isMobile ? 16 : 20,
                      borderRadius: 16,
                      backgroundColor: colors.cardSecondary,
                      borderWidth: 1,
                      borderColor: colors.borderSubtle
                    }}
                  >
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: st.bg,
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Icon size={24} color={st.accent} />
                    </View>
                    <View>
                      <Text style={{ fontSize: 28, fontWeight: '900', color: colors.text }}>
                        {st.value}
                      </Text>
                      <Text style={{ fontSize: 13.5, fontWeight: '700', color: colors.text, marginTop: 1 }}>
                        {st.label}
                      </Text>
                      <Text style={{ fontSize: 11.5, color: colors.textMuted, marginTop: 1 }}>
                        {st.sublabel}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* 6. Bento Grid Capabilities Section */}
        <View
          style={{
            width: '100%',
            backgroundColor: isDark ? '#080c14' : '#ffffff',
            paddingVertical: isMobile ? 48 : 72,
            paddingHorizontal: isMobile ? 16 : 36
          }}
        >
          <View style={{ width: '100%', maxWidth: 1560, alignSelf: 'center' }}>
            <View style={{ alignItems: 'center', marginBottom: isMobile ? 32 : 48 }}>
              <View
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 20,
                  backgroundColor: isDark ? 'rgba(0, 122, 255, 0.12)' : '#eff6ff',
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(0, 122, 255, 0.3)' : '#bfdbfe',
                  marginBottom: 10
                }}
              >
                <Text
                  style={{
                    fontSize: 11.5,
                    fontWeight: '800',
                    color: '#007aff',
                    textTransform: 'uppercase',
                    letterSpacing: 1.2
                  }}
                >
                  ENGINEERED FOR NRI FAMILIES
                </Text>
              </View>
              <Text
                style={{
                  fontSize: isMobile ? 28 : 36,
                  fontWeight: '900',
                  color: colors.text,
                  textAlign: 'center',
                  letterSpacing: -1
                }}
              >
                Everything you need to protect your parents.
              </Text>
              <Text
                style={{
                  fontSize: isMobile ? 15 : 16.5,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginTop: 12,
                  maxWidth: 640
                }}
              >
                No bulky gadgets or app fatigue for parents. Real clinical metrics and immediate
                emergency action for you.
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: isMobile ? 16 : 20,
                justifyContent: 'space-between'
              }}
            >
              {bentoFeatures.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <View
                    key={idx}
                    style={{
                      width: isMobile ? '100%' : '48.8%',
                      minWidth: isMobile ? '100%' : 320,
                      padding: isMobile ? 22 : 28,
                      borderRadius: 20,
                      backgroundColor: colors.card,
                      borderWidth: 1,
                      borderColor: colors.border,
                      shadowColor: '#000',
                      shadowOpacity: isDark ? 0.3 : 0.04,
                      shadowRadius: 14
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 16
                      }}
                    >
                      <View
                        style={{
                          width: 46,
                          height: 46,
                          borderRadius: 12,
                          backgroundColor: isDark ? `${feat.accent}20` : `${feat.accent}15`,
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Icon size={24} color={feat.accent} />
                      </View>
                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 6,
                          backgroundColor: isDark ? `${feat.accent}20` : `${feat.accent}15`
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '800', color: feat.accent }}>
                          {feat.tag}
                        </Text>
                      </View>
                    </View>

                    <Text style={{ fontSize: 21, fontWeight: '900', color: colors.text, letterSpacing: -0.4 }}>
                      {feat.title}
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 10, lineHeight: 22 }}>
                      {feat.desc}
                    </Text>

                    <View
                      style={{
                        marginTop: 18,
                        paddingTop: 12,
                        borderTopWidth: 1,
                        borderTopColor: colors.borderSubtle,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <CheckCircle2 size={15} color={feat.accent} />
                      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
                        {feat.highlight}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* 7. Effortless 3-Step Setup (Clean Modern Cards) */}
        <View
          style={{
            width: '100%',
            backgroundColor: isDark ? '#0b101d' : '#f8fafc',
            paddingVertical: isMobile ? 48 : 68,
            paddingHorizontal: isMobile ? 16 : 36,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: colors.borderSubtle
          }}
        >
          <View style={{ width: '100%', maxWidth: 1560, alignSelf: 'center' }}>
            <View style={{ alignItems: 'center', marginBottom: isMobile ? 32 : 48 }}>
              <View
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 5,
                  borderRadius: 20,
                  backgroundColor: isDark ? 'rgba(0, 122, 255, 0.12)' : '#eff6ff',
                  borderWidth: 1,
                  borderColor: isDark ? 'rgba(0, 122, 255, 0.3)' : '#bfdbfe',
                  marginBottom: 12
                }}
              >
                <Text
                  style={{
                    fontSize: 11.5,
                    fontWeight: '800',
                    color: '#007aff',
                    textTransform: 'uppercase',
                    letterSpacing: 1.2
                  }}
                >
                  ZERO FRICTION ONBOARDING
                </Text>
              </View>
              <Text
                style={{
                  fontSize: isMobile ? 28 : 36,
                  fontWeight: '900',
                  color: colors.text,
                  textAlign: 'center',
                  letterSpacing: -0.8
                }}
              >
                Up and running in 3 effortless steps.
              </Text>
              <Text style={{ fontSize: isMobile ? 15 : 17, color: colors.textSecondary, marginTop: 10, textAlign: 'center', maxWidth: 640 }}>
                Designed specifically so your parents in India never have to install an app or remember passwords.
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: isMobile ? 16 : 24,
                justifyContent: 'space-between'
              }}
            >
              {steps.map((st, sIdx) => {
                const StepIcon = st.icon;
                return (
                  <View
                    key={sIdx}
                    style={{
                      flex: 1,
                      minWidth: isMobile ? '100%' : 300,
                      padding: isMobile ? 22 : 30,
                      borderRadius: 20,
                      backgroundColor: colors.card,
                      borderWidth: 1,
                      borderColor: colors.border,
                      shadowColor: '#000',
                      shadowOpacity: isDark ? 0.2 : 0.04,
                      shadowRadius: 12
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 18
                      }}
                    >
                      <View
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 14,
                          backgroundColor: isDark ? 'rgba(0, 122, 255, 0.15)' : '#eff6ff',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <StepIcon size={24} color="#007aff" />
                      </View>
                      <View
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 4,
                          borderRadius: 6,
                          backgroundColor: isDark ? 'rgba(0, 122, 255, 0.1)' : '#eff6ff'
                        }}
                      >
                        <Text style={{ fontSize: 11.5, fontWeight: '800', color: '#007aff' }}>
                          STEP {st.step}
                        </Text>
                      </View>
                    </View>

                    <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text, letterSpacing: -0.3 }}>
                      {st.title}
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 10, lineHeight: 23 }}>
                      {st.desc}
                    </Text>

                    <View
                      style={{
                        marginTop: 20,
                        paddingTop: 14,
                        borderTopWidth: 1,
                        borderTopColor: colors.borderSubtle,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <CheckCircle2 size={15} color="#16a34a" />
                      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>
                        {st.badge}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={{ marginTop: 36, alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => router.push('/(auth)/welcome')}
                activeOpacity={0.85}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 28,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#007aff',
                  backgroundColor: isDark ? 'rgba(0, 122, 255, 0.12)' : '#eff6ff',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#007aff' }}>
                  Launch Interactive Setup Walkthrough &rarr;
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 8. Pricing Plans Section (Crucial for any high-converting marketing page) */}
        <View
          style={{
            width: '100%',
            backgroundColor: isDark ? '#080c14' : '#ffffff',
            paddingVertical: isMobile ? 48 : 76,
            paddingHorizontal: isMobile ? 16 : 36
          }}
        >
          <View style={{ width: '100%', maxWidth: 1560, alignSelf: 'center' }}>
            <View style={{ alignItems: 'center', marginBottom: isMobile ? 32 : 44 }}>
              <Text
                style={{
                  fontSize: 11.5,
                  fontWeight: '800',
                  color: '#007aff',
                  textTransform: 'uppercase',
                  letterSpacing: 1.2,
                  marginBottom: 8
                }}
              >
                TRANSPARENT PLANS
              </Text>
              <Text
                style={{
                  fontSize: isMobile ? 28 : 36,
                  fontWeight: '900',
                  color: colors.text,
                  textAlign: 'center',
                  letterSpacing: -0.8
                }}
              >
                Predictable protection for your parents.
              </Text>
              <Text style={{ fontSize: isMobile ? 15 : 16.5, color: colors.textSecondary, marginTop: 8, textAlign: 'center' }}>
                Every plan includes a 14-day free trial. Cancel anytime with 1 click.
              </Text>

              {/* Billing Toggle (Monthly vs Annual) */}
              <View
                style={{
                  marginTop: 24,
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: colors.cardSecondary,
                  borderRadius: 10,
                  padding: 4,
                  borderWidth: 1,
                  borderColor: colors.border
                }}
              >
                <TouchableOpacity
                  onPress={() => setBillingCycle('monthly')}
                  activeOpacity={0.8}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 7,
                    borderRadius: 8,
                    backgroundColor: billingCycle === 'monthly' ? '#007aff' : 'transparent'
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '700',
                      color: billingCycle === 'monthly' ? '#ffffff' : colors.textSecondary
                    }}
                  >
                    Monthly Billing
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setBillingCycle('annual')}
                  activeOpacity={0.8}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 7,
                    borderRadius: 8,
                    backgroundColor: billingCycle === 'annual' ? '#007aff' : 'transparent',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '700',
                      color: billingCycle === 'annual' ? '#ffffff' : colors.textSecondary
                    }}
                  >
                    Annual Billing
                  </Text>
                  <View
                    style={{
                      backgroundColor: billingCycle === 'annual' ? '#ffffff' : '#16a34a',
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 4
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        fontWeight: '800',
                        color: billingCycle === 'annual' ? '#007aff' : '#ffffff'
                      }}
                    >
                      SAVE 20%
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* 3 Pricing Cards */}
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: isMobile ? 20 : 24,
                justifyContent: 'center',
                alignItems: 'stretch'
              }}
            >
              {pricingPlans.map((plan, pIdx) => {
                const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
                return (
                  <View
                    key={pIdx}
                    style={{
                      flex: 1,
                      minWidth: isMobile ? '100%' : 300,
                      maxWidth: isMobile ? '100%' : 420,
                      padding: isMobile ? 22 : 30,
                      borderRadius: 22,
                      backgroundColor: colors.card,
                      borderWidth: plan.popular ? 2 : 1,
                      borderColor: plan.popular ? '#007aff' : colors.border,
                      shadowColor: plan.popular ? '#007aff' : '#000',
                      shadowOpacity: plan.popular ? 0.25 : 0.05,
                      shadowRadius: plan.popular ? 20 : 10,
                      position: 'relative'
                    }}
                  >
                    {plan.popular && (
                      <View
                        style={{
                          position: 'absolute',
                          top: -12,
                          alignSelf: 'center',
                          backgroundColor: '#007aff',
                          paddingHorizontal: 14,
                          paddingVertical: 4,
                          borderRadius: 20
                        }}
                      >
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#ffffff' }}>
                          MOST POPULAR FOR NRI FAMILIES
                        </Text>
                      </View>
                    )}

                    <Text style={{ fontSize: 22, fontWeight: '900', color: colors.text }}>
                      {plan.name}
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 6, minHeight: 38 }}>
                      {plan.tagline}
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: 18, marginBottom: 20 }}>
                      <Text style={{ fontSize: 44, fontWeight: '900', color: colors.text }}>
                        {price}
                      </Text>
                      <Text style={{ fontSize: 14, color: colors.textMuted, marginLeft: 4 }}>
                        / month {billingCycle === 'annual' ? '(billed yearly)' : ''}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => router.push('/(auth)/sign-up')}
                      activeOpacity={0.88}
                      style={{
                        paddingVertical: 13,
                        borderRadius: 10,
                        backgroundColor: plan.popular ? '#007aff' : (isDark ? colors.cardSecondary : '#f1f5f9'),
                        borderWidth: plan.popular ? 0 : 1,
                        borderColor: colors.border,
                        alignItems: 'center',
                        marginBottom: 24
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: '800',
                          color: plan.popular ? '#ffffff' : colors.text
                        }}
                      >
                        Start 14-Day Free Trial
                      </Text>
                    </TouchableOpacity>

                    <View style={{ gap: 10 }}>
                      <Text style={{ fontSize: 12, fontWeight: '800', color: colors.text, textTransform: 'uppercase' }}>
                        WHAT'S INCLUDED:
                      </Text>
                      {plan.features.map((feat, fIdx) => (
                        <View key={fIdx} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Check size={16} color="#16a34a" />
                          <Text style={{ fontSize: 13, color: colors.textSecondary }}>{feat}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* 9. Reviews & Testimonials */}
        <View
          style={{
            width: '100%',
            backgroundColor: isDark ? '#0b101d' : '#f8fafc',
            paddingVertical: isMobile ? 48 : 68,
            paddingHorizontal: isMobile ? 16 : 36,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: colors.borderSubtle
          }}
        >
          <View style={{ width: '100%', maxWidth: 1560, alignSelf: 'center' }}>
            <View style={{ alignItems: 'center', marginBottom: isMobile ? 28 : 44 }}>
              <Text
                style={{
                  fontSize: 11.5,
                  fontWeight: '800',
                  color: '#007aff',
                  textTransform: 'uppercase',
                  letterSpacing: 1.2,
                  marginBottom: 8
                }}
              >
                REAL STORIES
              </Text>
              <Text
                style={{
                  fontSize: isMobile ? 26 : 34,
                  fontWeight: '900',
                  color: colors.text,
                  textAlign: 'center',
                  letterSpacing: -0.8
                }}
              >
                Trusted by NRI families and doctors worldwide.
              </Text>
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: isMobile ? 16 : 24, justifyContent: 'space-between' }}>
              {reviews.map((rev, rIdx) => (
                <View
                  key={rIdx}
                  style={{
                    flex: 1,
                    minWidth: isMobile ? '100%' : 300,
                    padding: isMobile ? 22 : 28,
                    borderRadius: 20,
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.border
                  }}
                >
                  <View style={{ flexDirection: 'row', gap: 3, marginBottom: 14 }}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={15} color="#f59e0b" fill="#f59e0b" />
                    ))}
                  </View>
                  <Text
                    style={{
                      fontSize: 14.5,
                      color: isDark ? '#cbd5e1' : '#334155',
                      lineHeight: 24,
                      fontStyle: 'italic'
                    }}
                  >
                    "{rev.quote}"
                  </Text>
                  <View
                    style={{
                      marginTop: 20,
                      paddingTop: 14,
                      borderTopWidth: 1,
                      borderTopColor: colors.borderSubtle,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <View>
                      <Text style={{ fontSize: 14.5, fontWeight: '800', color: colors.text }}>
                        {rev.author}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 1 }}>
                        {rev.role}
                      </Text>
                    </View>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 6,
                        backgroundColor: isDark ? 'rgba(0, 122, 255, 0.1)' : '#eff6ff'
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#007aff' }}>
                        {rev.parent}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 10. FAQ Accordion */}
        <View
          style={{
            width: '100%',
            backgroundColor: isDark ? '#080c14' : '#ffffff',
            paddingVertical: isMobile ? 48 : 68,
            paddingHorizontal: isMobile ? 16 : 36
          }}
        >
          <View style={{ width: '100%', maxWidth: 1080, alignSelf: 'center' }}>
            <View style={{ alignItems: 'center', marginBottom: isMobile ? 28 : 40 }}>
              <Text
                style={{
                  fontSize: 11.5,
                  fontWeight: '800',
                  color: '#007aff',
                  textTransform: 'uppercase',
                  letterSpacing: 1.2,
                  marginBottom: 8
                }}
              >
                FREQUENTLY ASKED QUESTIONS
              </Text>
              <Text
                style={{
                  fontSize: isMobile ? 26 : 34,
                  fontWeight: '900',
                  color: colors.text,
                  textAlign: 'center',
                  letterSpacing: -0.8
                }}
              >
                Answers to common family questions.
              </Text>
            </View>

            <View style={{ gap: 14 }}>
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => setOpenFaq(isOpen ? null : idx)}
                    activeOpacity={0.85}
                    style={{
                      padding: 22,
                      borderRadius: 18,
                      backgroundColor: colors.card,
                      borderWidth: 1,
                      borderColor: isOpen ? '#007aff' : colors.border
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15.5,
                          fontWeight: '800',
                          color: colors.text,
                          flex: 1,
                          paddingRight: 16
                        }}
                      >
                        {faq.q}
                      </Text>
                      {isOpen ? (
                        <ChevronUp size={20} color="#007aff" />
                      ) : (
                        <ChevronDown size={20} color={colors.textSecondary} />
                      )}
                    </View>
                    {isOpen && (
                      <Text
                        style={{
                          fontSize: 14.5,
                          color: colors.textSecondary,
                          marginTop: 14,
                          paddingTop: 14,
                          borderTopWidth: 1,
                          borderTopColor: colors.borderSubtle,
                          lineHeight: 24
                        }}
                      >
                        {faq.a}
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>

        {/* 11. Final High-Conversion Banner */}
        <View
          style={{
            width: '100%',
            paddingHorizontal: isMobile ? 16 : 36,
            paddingVertical: isMobile ? 36 : 56,
            backgroundColor: colors.background
          }}
        >
          <View
            style={{
              width: '100%',
              maxWidth: 1560,
              alignSelf: 'center',
              borderRadius: isMobile ? 18 : 24,
              backgroundColor: '#007aff',
              paddingVertical: isMobile ? 36 : 64,
              paddingHorizontal: isMobile ? 20 : 40,
              alignItems: 'center',
              shadowColor: '#007aff',
              shadowOpacity: 0.35,
              shadowRadius: 24
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}
            >
              <Heart size={24} color="#ffffff" fill="#ffffff" />
            </View>
            <Text
              style={{
                fontSize: isMobile ? 26 : 36,
                fontWeight: '900',
                color: '#ffffff',
                textAlign: 'center',
                letterSpacing: -0.8
              }}
            >
              Give your parents the proactive care they deserve.
            </Text>
            <Text
              style={{
                fontSize: isMobile ? 14.5 : 16.5,
                color: '#dbeafe',
                marginTop: 12,
                textAlign: 'center',
                maxWidth: 620,
                lineHeight: 25
              }}
            >
              Set up in 5 minutes with zero hardware lock-in. 100% WhatsApp-ready for your family
              in India.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/sign-up')}
              activeOpacity={0.9}
              style={{
                marginTop: 28,
                backgroundColor: '#ffffff',
                paddingVertical: 16,
                paddingHorizontal: isMobile ? 24 : 38,
                borderRadius: 12,
                shadowColor: '#000',
                shadowOpacity: 0.15,
                shadowRadius: 10,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#007aff' }}>
                Start 14-Day Free Trial
              </Text>
              <ArrowRight size={18} color="#007aff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* 12. Modern Minimal Footer (Theme-adaptive & Crystal High Contrast) */}
        <View
          style={{
            width: '100%',
            backgroundColor: isDark ? '#050811' : '#f8fafc',
            paddingTop: isMobile ? 40 : 56,
            paddingBottom: 36,
            paddingHorizontal: isMobile ? 16 : 36,
            borderTopWidth: 1,
            borderTopColor: colors.border
          }}
        >
          <View style={{ width: '100%', maxWidth: 1560, alignSelf: 'center' }}>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                gap: isMobile ? 28 : 32,
                paddingBottom: 36,
                borderBottomWidth: 1,
                borderBottomColor: colors.borderSubtle
              }}
            >
              <View style={{ width: isMobile ? '100%' : '32%', minWidth: isMobile ? '100%' : 260 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: '#007aff',
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#007aff',
                      shadowOpacity: 0.35,
                      shadowRadius: 8
                    }}
                  >
                    <Heart size={18} color="#ffffff" fill="#ffffff" />
                  </View>
                  <Text style={{ fontSize: 20, fontWeight: '900', color: colors.text, letterSpacing: -0.5 }}>
                    KinGuardian
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 13.5,
                    color: colors.textSecondary,
                    marginTop: 14,
                    lineHeight: 22,
                    maxWidth: 340
                  }}
                >
                  Passive biometric telemetry and emergency care coordination for global Indian
                  families. Keeping parents safe without changing their daily routines.
                </Text>
              </View>

              <View style={{ gap: 10 }}>
                <Text
                  style={{
                    fontSize: 11.5,
                    fontWeight: '800',
                    color: colors.text,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}
                >
                  Clinical Platform
                </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/features')}>
                  <Text style={{ fontSize: 13.5, color: colors.textSecondary }}>Telemetry Features</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/(auth)/pricing')}>
                  <Text style={{ fontSize: 13.5, color: colors.textSecondary }}>Subscription Plans</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/(auth)/security')}>
                  <Text style={{ fontSize: 13.5, color: colors.textSecondary }}>Security & Privacy</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/(auth)/welcome')}>
                  <Text style={{ fontSize: 13.5, color: colors.textSecondary }}>Interactive Setup Tour</Text>
                </TouchableOpacity>
              </View>

              <View style={{ gap: 10 }}>
                <Text
                  style={{
                    fontSize: 11.5,
                    fontWeight: '800',
                    color: colors.text,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}
                >
                  Company & Care
                </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/about')}>
                  <Text style={{ fontSize: 13.5, color: colors.textSecondary }}>About Our Mission</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
                  <Text style={{ fontSize: 13.5, color: colors.textSecondary }}>Start 14-Day Free Trial</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
                  <Text style={{ fontSize: 13.5, color: colors.textSecondary }}>Overseas Family Portal</Text>
                </TouchableOpacity>
              </View>

              <View style={{ gap: 10 }}>
                <Text
                  style={{
                    fontSize: 11.5,
                    fontWeight: '800',
                    color: colors.text,
                    textTransform: 'uppercase',
                    letterSpacing: 1
                  }}
                >
                  Compliance & Legal
                </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/privacy')}>
                  <Text style={{ fontSize: 13.5, color: colors.textSecondary }}>Privacy Policy</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/(auth)/terms')}>
                  <Text style={{ fontSize: 13.5, color: colors.textSecondary }}>Terms of Service</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View
              style={{
                paddingTop: 24,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12
              }}
            >
              <Text style={{ fontSize: 12, color: colors.textMuted }}>
                © {new Date().getFullYear()} KinGuardian Technologies Inc. All rights reserved.
              </Text>
              <Text style={{ fontSize: 12, color: colors.textMuted }}>
                Engineered for NRI Families in 🇺🇸 USA • 🇬🇧 UK • 🇨🇦 Canada • 🇦🇺 Australia • 🇸🇬
                Singapore • 🇦🇪 UAE • 🇮🇳 India
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
