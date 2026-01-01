import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
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
