import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Store, Session } from "./store";
import { loginTheme, sans, sansBold, serif } from "./theme";
import { Face, Field } from "./ui";

const loginFields = {
  muted: loginTheme.muted,
  card: "#121212",
  ink: loginTheme.paper,
  hair: loginTheme.line,
};

export function AuthScreen({
  store,
  onEnter,
}: {
  store: Store;
  onEnter: (session: Session, view: string) => void;
}) {
  const [mode, setMode] = useState<"login" | "create">("login");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");

  async function submit() {
    setError("");
    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }
    if (mode === "create" && !name.trim()) {
      setError("Preferred name is required.");
      return;
    }
    if (email.trim() && !email.includes("@")) {
      setError("Enter a real email, or leave it blank.");
      return;
    }
    if (!secret) {
      setError("Secret is required.");
      return;
    }
    try {
      const result =
        mode === "create"
          ? await store.createAccount(phone.trim(), name.trim(), email.trim(), secret)
          : await store.login(phone.trim(), secret, name.trim(), email.trim());
      setSecret("");
      onEnter(result.session, result.view);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not enter.");
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#050505" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <Face size={158} ring />
          <Text style={styles.brandName}>Pretty's Delici-als</Text>
        </View>
        <View style={styles.mode}>
          <Pressable onPress={() => setMode("login")} style={[styles.modeBtn, mode === "login" && styles.modeOn]}>
            <Text style={[styles.modeText, mode === "login" && styles.modeTextOn]}>Login</Text>
          </Pressable>
          <Pressable onPress={() => setMode("create")} style={[styles.modeBtn, mode === "create" && styles.modeOn]}>
            <Text style={[styles.modeText, mode === "create" && styles.modeTextOn]}>Create account</Text>
          </Pressable>
        </View>
        <Text style={styles.hint}>{mode === "login" ? "Phone number and your secret." : "Phone, preferred name, secret. Email is optional."}</Text>
        <Field t={loginFields} dark label="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="e.g. 077 000 0000" />
        {mode === "create" ? (
          <>
            <Field t={loginFields} dark label="Preferred name" value={name} onChangeText={setName} placeholder="What should we call you?" />
            <Field t={loginFields} dark label="Email" optional value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@email.com" />
          </>
        ) : null}
        <Field t={loginFields} dark label="Secret" value={secret} onChangeText={setSecret} secureTextEntry placeholder="Your secret" />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable onPress={submit} style={styles.submit}>
          <Text style={styles.submitText}>{mode === "login" ? "Login" : "Create account"}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flexGrow: 1, backgroundColor: "#050505", paddingHorizontal: 22, paddingTop: 48, paddingBottom: 32, gap: 14 },
  brand: { alignItems: "center", marginBottom: 8 },
  brandName: { marginTop: 14, color: loginTheme.gold, fontFamily: serif, fontSize: 17, letterSpacing: 2 },
  mode: { flexDirection: "row", backgroundColor: loginTheme.panel, borderRadius: 999, padding: 4, borderWidth: 1, borderColor: loginTheme.line },
  modeBtn: { flex: 1, paddingVertical: 12, borderRadius: 999, alignItems: "center" },
  modeOn: { backgroundColor: loginTheme.paper },
  modeText: { color: loginTheme.muted, fontFamily: sansBold, fontSize: 15 },
  modeTextOn: { color: loginTheme.ink },
  hint: { color: loginTheme.muted, fontFamily: sans, marginTop: 8 },
  error: { color: loginTheme.danger, fontFamily: sans },
  submit: { marginTop: 8, backgroundColor: loginTheme.gold, borderRadius: 18, paddingVertical: 16, alignItems: "center" },
  submitText: { color: "#1a1106", fontFamily: sansBold, fontSize: 17 },
});
