import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, spacing, fontSize } from '../styles/theme';
import {
  HomeScreen,
  TuAnoScreen,
  MetasScreen,
  AutoconocimientoScreen,
  PriorizacionScreen,
  ProyectosScreen,
  DiarioScreen,
  CasaScreen,
  DineroScreen,
  AutocuidadoScreen,
} from '../screens';

export type RootStackParamList = {
  MainTabs: undefined;
  TuAno: undefined;
  Proyectos: undefined;
  Autoconocimiento: undefined; // Moved out of tabs to keep tabs clean (4 items) or maybe put in tabs? User request: "Easy to navigate". 
  Casa: undefined;
  Dinero: undefined;
  Autocuidado: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Diario: undefined;
  Metas: undefined;
  Priorizacion: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 0,
          elevation: 20,
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
          ...shadows.lg,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Diario') {
            iconName = focused ? 'today' : 'today-outline';
          } else if (route.name === 'Metas') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Priorizacion') {
            iconName = focused ? 'layers' : 'layers-outline';
          } else {
            iconName = 'ellipse';
          }

          // Add a subtle bounce or glow if focused? For now just color.
          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Inicio' }}
      />
      <Tab.Screen 
        name="Diario" 
        component={DiarioScreen} 
        options={{ title: 'Agenda' }}
      />
      <Tab.Screen 
        name="Metas" 
        component={MetasScreen} 
        options={{ title: 'Metas' }}
      />
      <Tab.Screen 
        name="Priorizacion" 
        component={PriorizacionScreen} 
        options={{ title: 'Priorizar' }}
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
        {/* Other screens that open on top of tabs */}
        <Stack.Screen name="TuAno" component={TuAnoScreen} />
        <Stack.Screen name="Proyectos" component={ProyectosScreen} />
        <Stack.Screen name="Autoconocimiento" component={AutoconocimientoScreen} />
        <Stack.Screen name="Casa" component={CasaScreen} />
        <Stack.Screen name="Dinero" component={DineroScreen} />
        <Stack.Screen name="Autocuidado" component={AutocuidadoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
