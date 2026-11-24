import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';

export default function IndexRoute() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/landing" />;
  }

  if (user?.role === 'parent') {
    return <Redirect href="/(parent)" />;
  }

  return <Redirect href="/(coordinator)" />;
}
