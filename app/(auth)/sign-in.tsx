import { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, ArrowLeft, Eye, EyeOff, AlertCircle, Compass } from 'lucide-react-native';
import { useAuth } from '../../src/hooks/useAuth';
import { signInSchema } from '../../src/utils/validation';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, quickSignIn, error: authError, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
    setValidationError(null);
    clearError();

    const parseResult = signInSchema.safeParse({ email, password });
    if (!parseResult.success) {
      setValidationError(parseResult.error.errors[0]?.message || 'Please check your inputs');
      return;
    }

    setIsSubmitting(true);
    const result = await signIn(email, password);
    setIsSubmitting(false);

    if (result.success) {
      if (result.user?.role === 'parent') {
        router.replace('/(parent)');
      } else {
        router.replace('/(coordinator)');
      }
    }
  };

  const handleDemoSignIn = async (role: 'coordinator' | 'parent') => {
    setValidationError(null);
    clearError();
    setIsSubmitting(true);
    await quickSignIn(role);
    setIsSubmitting(false);

    if (role === 'coordinator') {
      router.replace('/(coordinator)');
    } else {
      router.replace('/(parent)');
    }
  };

  const displayError = validationError || authError;

  return (
    <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Top Bar */}
      <View className="px-6 py-4 flex-row items-center justify-between border-b border-neutral-100">
        <TouchableOpacity
          onPress={() => router.push('/(auth)/landing')}
          className="p-1.5 rounded-full active:bg-neutral-100 -ml-1.5"
        >
          <ArrowLeft size={20} color="#1c1c1e" />
        </TouchableOpacity>
        <View className="flex-row items-center gap-2">
          <View className="w-7 h-7 rounded-lg bg-[#007aff] items-center justify-center">
            <Heart size={16} color="#ffffff" />
          </View>
          <Text className="text-base font-extrabold text-neutral-900">KinGuardian</Text>
        </View>
        <View className="w-7" />
      </View>

      <View className="px-6 pt-8 pb-4">
        <Text className="text-2xl font-extrabold text-neutral-900 tracking-tight">
          Welcome back
        </Text>
        <Text className="text-xs text-neutral-400 mt-1">
          Sign in to coordinate health care for your aging family members.
        </Text>

        {/* Error Feedback Banner */}
        {displayError && (
          <View className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex-row items-center gap-2.5">
            <AlertCircle size={16} color="#ff3b30" />
            <Text className="text-xs text-red-600 font-semibold flex-1">{displayError}</Text>
          </View>
        )}

        {/* Form Fields */}
        <View className="mt-6 space-y-4">
          <View>
            <Text className="text-xs font-bold text-neutral-700 mb-1.5">Email Address</Text>
            <View className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3">
              <TextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (validationError) setValidationError(null);
                }}
                placeholder="anjali@kinguardian.com"
                placeholderTextColor="#a3a3a3"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                className="text-sm text-neutral-900"
              />
            </View>
          </View>

          <View>
            <Text className="text-xs font-bold text-neutral-700 mb-1.5">Password</Text>
            <View className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 flex-row items-center">
              <TextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (validationError) setValidationError(null);
                }}
                placeholder="Enter your password"
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

          <TouchableOpacity
            onPress={handleSignIn}
            disabled={isSubmitting}
            activeOpacity={0.85}
            className="w-full bg-[#007aff] py-3.5 rounded-xl items-center justify-center mt-2 shadow-sm"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text className="text-sm font-bold text-white">Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 1-Click Demo Login Panel */}
        <View className="mt-8 p-4 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-3">
          <Text className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider text-center">
            Quick 1-Click Demo Logins
          </Text>
          <View className="space-y-2">
            <TouchableOpacity
              onPress={() => handleDemoSignIn('coordinator')}
              className="p-3 bg-white border border-neutral-200 rounded-xl flex-row items-center justify-between active:bg-blue-50"
            >
              <View>
                <Text className="text-xs font-bold text-neutral-900">Anjali Sharma (London)</Text>
                <Text className="text-[10px] text-neutral-400">Coordinator · anjali@kinguardian.com</Text>
              </View>
              <Text className="text-xs font-bold text-[#007aff]">Sign In &rarr;</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleDemoSignIn('parent')}
              className="p-3 bg-white border border-neutral-200 rounded-xl flex-row items-center justify-between active:bg-orange-50"
            >
              <View>
                <Text className="text-xs font-bold text-neutral-900">Ramesh Sharma (Chennai)</Text>
                <Text className="text-[10px] text-neutral-400">Father · ramesh@kinguardian.com</Text>
              </View>
              <Text className="text-xs font-bold text-[#ff9500]">Sign In &rarr;</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Other Options / Interactive Onboarding Walkthrough */}
        <View className="mt-6 p-4 bg-blue-50/70 rounded-2xl border border-blue-200/80">
          <Text className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider text-center">
            Other Options
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/welcome')}
            activeOpacity={0.85}
            className="mt-3 p-3.5 bg-white border border-blue-200 rounded-xl flex-row items-center justify-between shadow-xs active:bg-blue-50"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-xl bg-blue-100 items-center justify-center">
                <Compass size={20} color="#007aff" />
              </View>
              <View>
                <Text className="text-xs font-bold text-neutral-900">
                  Interactive Setup Walkthrough
                </Text>
                <Text className="text-[10px] text-neutral-500">
                  Step-by-step onboarding (Next ➔ Next ➔ Connected)
                </Text>
              </View>
            </View>
            <View className="bg-blue-50 px-2.5 py-1 rounded-md">
              <Text className="text-xs font-bold text-[#007aff]">Start &rarr;</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Link to Sign Up */}
        <View className="mt-8 flex-row justify-center items-center gap-1.5">
          <Text className="text-xs text-neutral-500">Don't have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')}>
            <Text className="text-xs font-bold text-[#007aff]">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
