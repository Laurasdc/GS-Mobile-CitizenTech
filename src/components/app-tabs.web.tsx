import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";

import { Colors } from "@/constants/theme";

export default function AppTabs() {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? "dark" : "light";
  const colors = Colors[theme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.background,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Bairro em Dia",
          tabBarLabel: "Início",
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: "Ocorrências",
          tabBarLabel: "Ocorrências",
        }}
      />
    </Tabs>
  );
}
