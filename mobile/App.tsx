import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useFonts, Fraunces_600SemiBold } from "@expo-google-fonts/fraunces";
import { Karla_400Regular, Karla_600SemiBold, Karla_700Bold } from "@expo-google-fonts/karla";
import { openAppStore, type Session, type Store } from "./src/store";
import { AuthScreen } from "./src/AuthScreen";
import { Shell } from "./src/Shell";
import { AppCtx } from "./src/state";

export default function App() {
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    Karla_400Regular,
    Karla_600SemiBold,
    Karla_700Bold,
  });
  const [store, setStore] = useState<Store | null>(null);
  const [bootError, setBootError] = useState("");
  const [session, setSession] = useState<Session | null>(null);
  const [view, setView] = useState("home");
  const [tick, setTick] = useState(0);
  const { width } = useWindowDimensions();

  useEffect(() => {
    let alive = true;
    openAppStore()
      .then((next) => {
        if (!alive) return;
        setStore(next);
        next.subscribe(() => setTick((n) => n + 1));
      })
      .catch((err: Error) => setBootError(err.message || "Could not open the local store."));
    return () => {
      alive = false;
    };
  }, []);

  const ctx = useMemo(
    () => (store && session ? { store, session, setSession, view, setView, tick } : null),
    [store, session, view, tick]
  );

  const ready = fontsLoaded && store && !bootError;
  const phoneWidth = Math.min(width, 430);

  let body = (
    <View style={styles.boot}>
      <ActivityIndicator color="#e0a84a" />
      <Text style={styles.bootText}>Pretty's Delici-als</Text>
    </View>
  );
  if (bootError) {
    body = (
      <View style={styles.boot}>
        <Text style={styles.bootText}>{bootError}</Text>
      </View>
    );
  } else if (ready && store && !session) {
    body = (
      <AuthScreen
        store={store}
        onEnter={(next, landing) => {
          setSession(next);
          setView(landing);
        }}
      />
    );
  } else if (ready && ctx) {
    body = (
      <AppCtx.Provider value={ctx}>
        <Shell />
      </AppCtx.Provider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.frame}>
        <SafeAreaView style={[styles.phone, { width: phoneWidth }]} edges={["top", "bottom"]}>
          <StatusBar style={session ? "light" : "light"} />
          {body}
        </SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1, backgroundColor: "#050505", alignItems: "center" },
  phone: { flex: 1, maxWidth: 430, width: "100%" },
  boot: { flex: 1, backgroundColor: "#050505", alignItems: "center", justifyContent: "center", gap: 12 },
  bootText: { color: "#e0a84a", fontSize: 16 },
});
