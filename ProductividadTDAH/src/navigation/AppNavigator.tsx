import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../styles/theme';
import { useLanguage } from '../i18n/LanguageContext';
import {
  HomeScreen,
  TuAnoScreen,
  MetasScreen,
  AutoconocimientoScreen,
  ProyectosScreen,
  DiarioScreen,
  CasaScreen,
  DineroScreen,
  AutocuidadoScreen,
} from '../screens';
import { MasScreen } from '../screens/MasScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  TuAno: undefined;
  Proyectos: undefined;
  Autoconocimiento: undefined;
  Casa: undefined;
  Dinero: undefined;
  Autocuidado: undefined;
  Metas: undefined;
  Diario: undefined;
};

export type MainTabParamList = {
  Hoy: undefined;
  Mas: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// ADHD-Friendly: Only 2 tabs - reduces decision fatigue
const MainTabs = () => {
  const { t } = useLanguage();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          elevation: 20,
          height: 70,
          paddingBottom: 12,
          paddingTop: 12,
          ...shadows.lg,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Hoy') {
            iconName = focused ? 'sunny' : 'sunny-outline';
          } else if (route.name === 'Mas') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else {
            iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={26} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Hoy"
        component={HomeScreen}
        options={{ title: t('today') }}
      />
      <Tab.Screen
        name="Mas"
        component={MasScreen}
        options={{ title: t('more') }}
      />
    </Tab.Navigator>
  );
};

// Custom theme matching app colors
const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.backgroundLight,
    text: colors.text,
    border: colors.backgroundDark,
    notification: colors.accent,
  },
};

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer theme={AppTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 300,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{
            animation: 'fade',
          }}
        />
        {/* Secondary screens - accessed from "Más" tab */}
        <Stack.Screen name="TuAno" component={TuAnoScreen} />
        <Stack.Screen name="Proyectos" component={ProyectosScreen} />
        <Stack.Screen name="Autoconocimiento" component={AutoconocimientoScreen} />
        <Stack.Screen name="Casa" component={CasaScreen} />
        <Stack.Screen name="Dinero" component={DineroScreen} />
        <Stack.Screen name="Autocuidado" component={AutocuidadoScreen} />
        <Stack.Screen name="Metas" component={MetasScreen} />
        <Stack.Screen name="Diario" component={DiarioScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
