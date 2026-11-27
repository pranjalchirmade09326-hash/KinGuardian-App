import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Heart,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  UserCheck
} from 'lucide-react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { signUpSchema } from '../../src/utils/validation';
import { UserRole } from '../../src/types/auth';

export default function SignUpScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;
  const isSmallMobile = width < 400;
  const { signUp, error: authError, clearError } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('coordinator');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [phone, setPhone] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async () => {
    setValidationError(null);
    clearError();

    const parseResult = signUpSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
      role,
      city,
      country,
      phone: phone || undefined
    });

    if (!parseResult.success) {
      setValidationError(parseResult.error.errors[0]?.message || 'Please check your inputs');
      return;
    }

    setIsSubmitting(true);
    const result = await signUp({
      name,
      email,
      password,
      role,
      city,
      country,
      phone: phone || undefined
    });
    setIsSubmitting(false);

    if (result.success) {
      if (role === 'coordinator') {
        router.replace('/(coordinator)');
      } else {
        router.replace('/(parent)');
      }
    }
  };

  const displayError = validationError || authError;
  const isWeb = Platform.OS === 'web';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDesktop ? '#f8fafc' : '#ffffff' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={{ flex: 1, backgroundColor: isDesktop ? '#f8fafc' : '#ffffff' }}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 50,
            ...(isDesktop
              ? {
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 40,
                  paddingHorizontal: 24
                }
              : {})
          }}
        >
      <View
        style={{
          width: '100%',
          ...(isDesktop
            ? {
                maxWidth: 540,
                backgroundColor: '#ffffff',
                borderRadius: 24,
                borderWidth: 1,
                borderColor: '#e2e8f0',
                shadowColor: '#000',
                shadowOpacity: 0.06,
                shadowRadius: 24,
                shadowOffset: { width: 0, height: 10 },
                overflow: 'hidden'
              }
            : {})
        }}
      >
        {/* Top Bar */}
        <View
          style={{ paddingHorizontal: isSmallMobile ? 16 : 24, paddingVertical: 16 }}
          className="flex-row items-center justify-between border-b border-neutral-100"
        >
          {isWeb ? (
            <TouchableOpacity
              onPress={() => router.push('/(auth)/landing')}
              className="p-1.5 rounded-full active:bg-neutral-100 -ml-1.5"
            >
              <ArrowLeft size={20} color="#1c1c1e" />
            </TouchableOpacity>
          ) : (
            <View className="w-7" />
          )}
          <View className="flex-row items-center gap-2">
            <View className="w-7 h-7 rounded-lg bg-[#007aff] items-center justify-center">
              <Heart size={16} color="#ffffff" />
            </View>
            <Text className="text-base font-extrabold text-neutral-900">KinGuardian</Text>
          </View>
          <View className="w-7" />
        </View>

        <View style={{ paddingHorizontal: isSmallMobile ? 16 : 24, paddingTop: 20, paddingBottom: isDesktop ? 28 : 16 }}>
        {/* Mobile/Web Auth Mode Switcher */}
        <View className="flex-row bg-neutral-100 p-1 rounded-xl mb-5">
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/sign-in')}
            activeOpacity={0.8}
            className="flex-1 py-2 rounded-lg items-center"
          >
            <Text className="text-xs font-semibold text-neutral-500">Sign In</Text>
          </TouchableOpacity>
          <View className="flex-1 bg-white py-2 rounded-lg items-center shadow-xs">
            <Text className="text-xs font-bold text-[#007aff]">Sign Up</Text>
          </View>
        </View>
        <Text className="text-2xl font-extrabold text-neutral-900 tracking-tight">
          Create Family Account
        </Text>
        <Text className="text-xs text-neutral-400 mt-1">
          Join KinGuardian to protect and coordinate health care for your loved ones.
        </Text>

        {/* Error Feedback Banner */}
        {displayError && (
          <View className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex-row items-center gap-2.5">
            <AlertCircle size={16} color="#ff3b30" />
            <Text className="text-xs text-red-600 font-semibold flex-1">{displayError}</Text>
          </View>
        )}

        {/* Role Selector Cards */}
        <View className="mt-6 space-y-2">
          <Text className="text-xs font-bold text-neutral-700">Select Your Role</Text>
          <View style={{ flexDirection: isSmallMobile ? 'column' : 'row', gap: 12 }}>
            <TouchableOpacity
              onPress={() => setRole('coordinator')}
              className={`flex-1 p-3.5 rounded-2xl border ${
                role === 'coordinator'
                  ? 'border-[#007aff] bg-blue-50/40'
                  : 'border-neutral-200 bg-neutral-50'
              }`}
            >
              <View className="flex-row justify-between items-center mb-1.5">
                <UserCheck size={18} color={role === 'coordinator' ? '#007aff' : '#8e8e93'} />
                {role === 'coordinator' && <CheckCircle2 size={16} color="#007aff" />}
              </View>
              <Text className="text-xs font-bold text-neutral-900">Coordinator</Text>
              <Text className="text-[10px] text-neutral-400 mt-0.5 leading-snug">
                Managing care from diaspora / abroad
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setRole('parent')}
              className={`flex-1 p-3.5 rounded-2xl border ${
                role === 'parent'
                  ? 'border-[#ff9500] bg-orange-50/40'
                  : 'border-neutral-200 bg-neutral-50'
              }`}
            >
              <View className="flex-row justify-between items-center mb-1.5">
                <UserCheck size={18} color={role === 'parent' ? '#ff9500' : '#8e8e93'} />
                {role === 'parent' && <CheckCircle2 size={16} color="#ff9500" />}
              </View>
              <Text className="text-xs font-bold text-neutral-900">Parent</Text>
              <Text className="text-[10px] text-neutral-400 mt-0.5 leading-snug">
                Elderly parent living in India
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form Fields */}
        <View className="mt-5 space-y-3.5">
          <View>
            <Text className="text-xs font-bold text-neutral-700 mb-1">Full Name</Text>
            <View className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Priya Sharma"
                placeholderTextColor="#a3a3a3"
                className="text-sm text-neutral-900"
              />
            </View>
          </View>

          <View>
            <Text className="text-xs font-bold text-neutral-700 mb-1">Email Address</Text>
            <View className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5">
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="priya@example.com"
                placeholderTextColor="#a3a3a3"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="text-sm text-neutral-900"
              />
            </View>
          </View>

          <View style={{ flexDirection: isSmallMobile ? 'column' : 'row', gap: 12 }}>
            <View className="flex-1">
              <Text className="text-xs font-bold text-neutral-700 mb-1">City</Text>
              <View className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5">
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder={role === 'coordinator' ? 'London' : 'Chennai'}
                  placeholderTextColor="#a3a3a3"
                  className="text-sm text-neutral-900"
                />
              </View>
            </View>

            <View className="flex-1">
              <Text className="text-xs font-bold text-neutral-700 mb-1">Country</Text>
              <View className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5">
                <TextInput
                  value={country}
                  onChangeText={setCountry}
                  placeholder={role === 'coordinator' ? 'United Kingdom' : 'India'}
                  placeholderTextColor="#a3a3a3"
                  className="text-sm text-neutral-900"
                />
              </View>
            </View>
          </View>

          <View>
            <Text className="text-xs font-bold text-neutral-700 mb-1">
              Phone Number (WhatsApp alerts)
            </Text>
            <View className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5">
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 92707 56299"
                placeholderTextColor="#a3a3a3"
                keyboardType="phone-pad"
                className="text-sm text-neutral-900"
              />
            </View>
          </View>

          <View>
            <Text className="text-xs font-bold text-neutral-700 mb-1">Password</Text>
            <View className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 flex-row items-center">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="At least 6 characters"
                placeholderTextColor="#a3a3a3"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1 text-sm text-neutral-900 mr-2"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {showPassword ? (
                  <EyeOff size={18} color="#8e8e93" />
                ) : (
                  <Eye size={18} color="#8e8e93" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View>
            <Text className="text-xs font-bold text-neutral-700 mb-1">Confirm Password</Text>
            <View className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5">
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter your password"
                placeholderTextColor="#a3a3a3"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                className="text-sm text-neutral-900"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSignUp}
            disabled={isSubmitting}
            activeOpacity={0.85}
            className="w-full bg-[#007aff] py-3.5 rounded-xl items-center justify-center mt-3 shadow-sm"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text className="text-sm font-bold text-white">Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Link to Sign In */}
        <View className="mt-8 flex-row justify-center items-center gap-1.5">
          <Text className="text-xs text-neutral-500">Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
            <Text className="text-xs font-bold text-[#007aff]">Sign In</Text>
          </TouchableOpacity>
        </View>
        </View>
      </View>
    </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
