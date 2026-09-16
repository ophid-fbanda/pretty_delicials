import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { isAdminView, isDeliveryView, isKitchenView, isMgmtView, themeForView, sans, sansBold, serif } from "./theme";
import { FACE } from "./ui";
import { Image } from "react-native";
import { useApp } from "./state";
import { ClientStage } from "./screens/Client";
import { AdminStage } from "./screens/Admin";
import { MgmtStage } from "./screens/Management";
import { KitchenStage } from "./screens/Kitchen";
import { DeliveryStage } from "./screens/Delivery";

export function Shell() {
  const { session, setSession, view, setView } = useApp();
  const t = themeForView(view);
  const [drawer, setDrawer] = useState(false);
  const [menu, setMenu] = useState(false);
  const team = session.roles;
  const showBurger = team.length > 0;

  const roles = [
    ...(team.length ? [{ label: "Shopping", view: "home" }] : []),
    ...(team.includes("Admin") ? [{ label: "Administration", view: "admin" }] : []),
    ...(team.includes("Management") ? [{ label: "Management", view: "mgmt" }] : []),
    ...team.filter((role) => role !== "Admin" && role !== "Management").map((role) => ({ label: role, view: role.toLowerCase() })),
  ];

  function go(next: string) {
    setDrawer(false);
    setMenu(false);
    setView(next);
  }

  return (
    <View style={[styles.phone, { backgroundColor: t.bg }]}>
      <View style={[styles.bar, { backgroundColor: t.barBg }]}>
        {showBurger ? (
          <Pressable onPress={() => { setMenu(false); setDrawer((d) => !d); }} style={styles.burger} accessibilityLabel="Open roles">
            <View style={[styles.barLine, { backgroundColor: t.barInk }]} />
            <View style={[styles.barLine, { backgroundColor: t.barInk }]} />
            <View style={[styles.barLine, { backgroundColor: t.barInk }]} />
          </Pressable>
        ) : (
          <View style={styles.burger} />
        )}
        <View style={styles.title}>
          <Image source={FACE} style={styles.face} />
          <Text style={[styles.titleText, { color: t.barInk }]}>{t.title}</Text>
        </View>
        <Pressable
          onPress={() => {
            setDrawer(false);
            setMenu((m) => !m);
          }}
          style={styles.avatar}
        >
          <Text style={styles.avatarTxt}>{(session.name || "P").slice(0, 1).toUpperCase()}</Text>
        </Pressable>
      </View>

      {menu ? (
        <View style={[styles.menu, { backgroundColor: t.card, borderColor: t.hair }]}>
          {[
            ["home", "Home"],
            ["account", "My Account"],
            ["history", "My History"],
            ["help", "Help"],
            ["logout", "Logout"],
          ].map(([id, label]) => (
            <Pressable
              key={id}
              onPress={() => {
                if (id === "logout") {
                  setSession(null);
                  return;
                }
                go(id);
              }}
              style={styles.menuItem}
            >
              <Text style={{ color: t.ink, fontFamily: sans }}>{label}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {drawer ? (
        <>
          <Pressable style={styles.backdrop} onPress={() => setDrawer(false)} />
          <View style={[styles.drawer, { backgroundColor: t.card, borderColor: t.hair }]}>
            <Text style={{ color: t.muted, fontSize: 12, letterSpacing: 2, marginBottom: 10 }}>YOUR ROLES</Text>
            {roles.map((item) => {
              const on =
                (item.view === "home" && !isAdminView(view) && !isMgmtView(view) && !isKitchenView(view) && !isDeliveryView(view)) ||
                (item.view === "admin" && isAdminView(view)) ||
                (item.view === "mgmt" && isMgmtView(view)) ||
                (item.view === "kitchen" && isKitchenView(view)) ||
                (item.view === "delivery" && isDeliveryView(view));
              return (
                <Pressable key={item.view} onPress={() => go(item.view)} style={[styles.role, on && { backgroundColor: t.chip }]}>
                  <Text style={{ color: t.ink, fontFamily: sansBold }}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      <View style={styles.stage}>
        {isAdminView(view) ? <AdminStage t={t} view={view} /> : null}
        {isMgmtView(view) ? <MgmtStage t={t} view={view} /> : null}
        {isKitchenView(view) ? <KitchenStage t={t} /> : null}
        {isDeliveryView(view) ? <DeliveryStage t={t} /> : null}
        {!isAdminView(view) && !isMgmtView(view) && !isKitchenView(view) && !isDeliveryView(view) ? <ClientStage t={t} view={view} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  phone: { flex: 1 },
  bar: { height: 58, flexDirection: "row", alignItems: "center", paddingHorizontal: 8, zIndex: 5 },
  burger: { width: 42, height: 42, justifyContent: "center", gap: 5, paddingLeft: 6 },
  barLine: { width: 18, height: 2, borderRadius: 2 },
  title: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  titleText: { fontFamily: serif, fontSize: 18 },
  face: { width: 26, height: 26, borderRadius: 13 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#e0a84a", alignItems: "center", justifyContent: "center" },
  avatarTxt: { fontFamily: sansBold, color: "#1a1106" },
  menu: { position: "absolute", top: 54, right: 10, width: 180, borderRadius: 16, borderWidth: 1, zIndex: 8, overflow: "hidden" },
  menuItem: { paddingVertical: 12, paddingHorizontal: 14 },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 6 },
  drawer: { position: "absolute", top: 58, bottom: 0, left: 0, width: "78%", maxWidth: 280, zIndex: 7, padding: 16, borderRightWidth: 1 },
  role: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 14, marginBottom: 4 },
  stage: { flex: 1 },
});
