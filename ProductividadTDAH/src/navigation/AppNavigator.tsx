import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../styles/theme';
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
  Home: undefined;
  TuAno: undefined;
  Metas: undefined;
  Autoconocimiento: undefined;
  Priorizacion: undefined;
  Proyectos: undefined;
  Diario: undefined;
  Casa: undefined;
  Dinero: undefined;
  Autocuidado: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

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
          animationDuration: 250,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen name="TuAno" component={TuAnoScreen} />
        <Stack.Screen name="Metas" component={MetasScreen} />
        <Stack.Screen name="Autoconocimiento" component={AutoconocimientoScreen} />
        <Stack.Screen name="Priorizacion" component={PriorizacionScreen} />
        <Stack.Screen name="Proyectos" component={ProyectosScreen} />
        <Stack.Screen name="Diario" component={DiarioScreen} />
        <Stack.Screen name="Casa" component={CasaScreen} />
        <Stack.Screen name="Dinero" component={DineroScreen} />
        <Stack.Screen name="Autocuidado" component={AutocuidadoScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
