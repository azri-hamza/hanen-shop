import Constants from 'expo-constants';

export const BASE_URL: string =
  (Constants.expoConfig?.extra as Record<string, string>)?.apiBaseUrl ?? 'http://localhost:3000';
