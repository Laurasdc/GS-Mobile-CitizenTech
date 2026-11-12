import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />

      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: "#FFFFFF",
          },
          headerTintColor: "#183D35",
          headerTitleStyle: {
            fontWeight: "700",
          },
          headerShadowVisible: false,
          tabBarActiveTintColor: "#176B52",
          tabBarInactiveTintColor: "#52625D",
          tabBarStyle: {
            backgroundColor: "#FFFFFF",
            borderTopColor: "#DCE5DF",
          },
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: "600",
          },
          tabBarIcon: () => null,
          tabBarIconStyle: {
            display: "none",
          },
          sceneStyle: {
            backgroundColor: "#F4F7F4",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Bairro em Dia",
            tabBarLabel: "Início",
            tabBarAccessibilityLabel: "Abrir início",
          }}
        />

        <Tabs.Screen
          name="explore"
          options={{
            title: "Ocorrências",
            tabBarLabel: "Ocorrências",
            tabBarAccessibilityLabel: "Abrir ocorrências",
          }}
        />

        <Tabs.Screen
          name="ocorrencias/[id]"
          options={{
            title: "Detalhes da ocorrência",
            href: null,
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}
