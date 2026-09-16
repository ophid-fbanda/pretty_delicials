import { Image, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from "react-native";
import type { Theme } from "./theme";
import { sans, sansBold, sansSemi, serif } from "./theme";

export const FACE = require("../assets/face.jpg");

export function PageH({ t, children }: { t: Theme; children: string }) {
  return <Text style={[ui.pageH, { color: t.ink, fontFamily: serif }]}>{children}</Text>;
}

export function Muted({ t, children }: { t: Theme; children: string }) {
  return <Text style={[ui.muted, { color: t.muted }]}>{children}</Text>;
}

export function Ghost({ t, label, onPress, disabled }: { t: Theme; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[ui.ghost, { borderColor: t.accent, opacity: disabled ? 0.45 : 1 }]}>
      <Text style={[ui.btnText, { color: t.ink, fontFamily: sansBold }]}>{label}</Text>
    </Pressable>
  );
}

export function Submit({ t, label, onPress, disabled }: { t: Theme; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[ui.submit, { backgroundColor: t.accent, opacity: disabled ? 0.45 : 1 }]}>
      <Text style={[ui.btnText, { color: "#1a1106", fontFamily: sansBold }]}>{label}</Text>
    </Pressable>
  );
}

export function Accept({ t, label, onPress }: { t: Theme; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[ui.submit, { backgroundColor: t.go }]}>
      <Text style={[ui.btnText, { color: "#f7f4ea", fontFamily: sansBold }]}>{label}</Text>
    </Pressable>
  );
}

export function RejectBtn({ t, label, onPress }: { t: Theme; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[ui.submit, { backgroundColor: t.stop }]}>
      <Text style={[ui.btnText, { color: "#fff6e8", fontFamily: sansBold }]}>{label}</Text>
    </Pressable>
  );
}

export function ChoiceCard({ t, title, sub, onPress }: { t: Theme; title: string; sub: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[ui.choice, { backgroundColor: t.card, borderColor: t.hair }]}>
      <View style={[ui.choiceHair, { backgroundColor: t.accent }]} />
      <Text style={[ui.choiceTitle, { color: t.ink, fontFamily: serif }]}>{title}</Text>
      <Text style={[ui.choiceSub, { color: t.muted }]}>{sub}</Text>
    </Pressable>
  );
}

export function WhoCard({ t, children, onPress, fit }: { t: Theme; children: React.ReactNode; onPress?: () => void; fit?: boolean }) {
  const body = (
    <View style={[ui.who, { backgroundColor: t.card, borderColor: t.hair, minHeight: fit ? 0 : 180 }, !onPress && ui.whoPad]}>{children}</View>
  );
  if (!onPress) return body;
  return (
    <Pressable onPress={onPress} style={[ui.who, { backgroundColor: t.card, borderColor: t.hair }]}>
      {children}
    </Pressable>
  );
}

export function Flag({ t, kind, label }: { t: Theme; kind: "open" | "shut" | "stuck" | "out"; label: string }) {
  const color = kind === "open" ? t.go : kind === "out" ? "#1a5f8a" : t.stop;
  return <Text style={[ui.flag, { color }]}>{label}</Text>;
}

export function Field({
  t,
  label,
  optional,
  dark,
  ...input
}: { t: Theme; label: string; optional?: boolean; dark?: boolean } & TextInputProps) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={[ui.fieldLabel, { color: dark ? "#c9bba8" : t.muted }]}>
        {label}
        {optional ? <Text style={{ textTransform: "none", letterSpacing: 0, opacity: 0.75 }}> (optional)</Text> : null}
      </Text>
      <TextInput
        placeholderTextColor={dark ? "#7d7266" : t.muted}
        style={[
          ui.input,
          dark
            ? { backgroundColor: "#121212", color: "#fff8f0", borderColor: "rgba(255,248,240,0.12)" }
            : { backgroundColor: t.card, color: t.ink, borderColor: t.hair },
        ]}
        {...input}
      />
    </View>
  );
}

export function Line({ t, left, right, meta }: { t: Theme; left: string; right?: string; meta?: string }) {
  return (
    <View style={[ui.line, { borderColor: t.hair }]}>
      <View style={{ flex: 1 }}>
        <Text style={[ui.lineStrong, { color: t.ink, fontFamily: sansSemi }]}>{left}</Text>
        {meta ? <Text style={{ color: t.muted, fontSize: 14 }}>{meta}</Text> : null}
      </View>
      {right ? <Text style={[ui.lineStrong, { color: t.ink, fontFamily: sansBold }]}>{right}</Text> : null}
    </View>
  );
}

export function Bits({ t, lines }: { t: Theme; lines: { name: string; qty: number }[] }) {
  return (
    <View style={ui.bits}>
      {lines.map((line) => (
        <Text key={line.name + line.qty} style={[ui.bit, { backgroundColor: t.chip, color: t.ink }]}>
          {line.qty} {line.name}
        </Text>
      ))}
    </View>
  );
}

export function Tick({ t, label, on, onToggle }: { t: Theme; label: string; on: boolean; onToggle: () => void }) {
  return (
    <Pressable onPress={onToggle} style={ui.tick}>
      <View style={[ui.box, { borderColor: t.accent, backgroundColor: on ? t.go : t.card }]} />
      <Text style={{ color: t.ink, fontFamily: sans, fontSize: 16 }}>{label}</Text>
    </Pressable>
  );
}

export function Back({ t, onPress }: { t: Theme; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[ui.back, { borderColor: t.accent }]}>
      <Text style={{ color: t.ink, fontFamily: sansBold }}>Back</Text>
    </Pressable>
  );
}

export function Face({ size, ring }: { size: number; ring?: boolean }) {
  const img = <Image source={FACE} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  if (!ring) return img;
  return (
    <View
      style={{
        width: size + 10,
        height: size + 10,
        borderRadius: (size + 10) / 2,
        padding: 5,
        backgroundColor: "#e0a84a",
        shadowColor: "#000",
        shadowOpacity: 0.45,
        shadowRadius: 18,
      }}
    >
      {img}
    </View>
  );
}

export function ChoiceGrid({ children }: { children: React.ReactNode }) {
  return <View style={ui.choiceGrid}>{children}</View>;
}

export const ui = StyleSheet.create({
  pageH: { fontSize: 26, marginBottom: 12, letterSpacing: -0.3 },
  muted: { lineHeight: 22, fontSize: 15, fontFamily: sans, marginBottom: 10 },
  ghost: { borderWidth: 1, borderRadius: 18, paddingVertical: 14, paddingHorizontal: 16, alignItems: "center" },
  submit: { marginTop: 8, borderRadius: 18, paddingVertical: 16, alignItems: "center" },
  btnText: { fontSize: 16 },
  choiceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 11 },
  choice: {
    width: "48%",
    flexGrow: 1,
    minHeight: 110,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  choiceHair: { position: "absolute", top: 0, left: 0, right: 0, height: 3 },
  choiceTitle: { fontSize: 18 },
  choiceSub: { fontSize: 13, marginTop: 4 },
  who: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 6 },
  whoPad: {},
  flag: { fontSize: 12, fontWeight: "800", letterSpacing: 0.6, textTransform: "uppercase" },
  fieldLabel: { fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase", fontFamily: sansSemi },
  input: { borderWidth: 1, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 14, fontSize: 16, fontFamily: sans },
  line: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, gap: 8 },
  lineStrong: { fontSize: 16 },
  bits: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  bit: { borderRadius: 999, paddingVertical: 4, paddingHorizontal: 8, fontSize: 13, overflow: "hidden" },
  tick: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
  box: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5 },
  back: { alignSelf: "flex-start", borderWidth: 1, borderRadius: 18, paddingVertical: 8, paddingHorizontal: 14, marginBottom: 10 },
});
