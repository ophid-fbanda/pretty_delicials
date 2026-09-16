import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { DELIVERY_FARE, SHOP_CATEGORIES, type Order, type SavedLocation, type ShopProduct } from "../store";
import { useApp } from "../state";
import { money, sans, sansBold, type Theme } from "../theme";
import { FACE, Field, Ghost, Line, PageH, Muted, Submit } from "../ui";

export function ClientStage({ t, view }: { t: Theme; view: string }) {
  const { store, session, setView, tick } = useApp();
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [category, setCategory] = useState<(typeof SHOP_CATEGORIES)[number]>("All");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [payMethod, setPayMethod] = useState<"cash" | "ecocash">("cash");
  const [cash, setCash] = useState("");
  const [eco, setEco] = useState("");
  const [payError, setPayError] = useState("");
  const [locName, setLocName] = useState("");
  const [locDetail, setLocDetail] = useState("");
  const [selectedLoc, setSelectedLoc] = useState<string | null>(null);
  const [placedId, setPlacedId] = useState<string | null>(null);

  useEffect(() => {
    store.shopProducts().then(setProducts);
    store.listOrders().then((all) => setOrders(all.filter((o) => o.accountId === session.id)));
    store.listLocations(session.id).then(setLocations);
  }, [store, session.id, tick]);

  const lines = products.filter((p) => (cart[p.id] || 0) > 0).map((p) => ({ ...p, qty: cart[p.id] }));
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const loc = locations.find((l) => l.id === selectedLoc) ?? null;
  const fare = loc ? DELIVERY_FARE : 0;
  const total = subtotal + fare;

  function bump(id: string, dir: number) {
    setCart((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + dir) }));
  }

  if (view === "account") {
    return (
      <ScrollView contentContainerStyle={styles.pad}>
        <PageH t={t}>My Account</PageH>
        <Muted t={t}>{`${session.name}\n${session.phone}${session.email ? "\n" + session.email : ""}`}</Muted>
        <Text style={[styles.h3, { color: t.ink }]}>Locations</Text>
        {locations.length === 0 ? <Muted t={t}>None yet.</Muted> : locations.map((l) => <Line key={l.id} t={t} left={l.name} meta={l.detail} />)}
        <Field t={t} label="Location name" value={locName} onChangeText={setLocName} placeholder="Home, work…" />
        <Field t={t} label="Details" value={locDetail} onChangeText={setLocDetail} placeholder="Street, suburb" />
        <Submit
          t={t}
          label="Save location"
          onPress={async () => {
            if (!locName.trim()) return;
            const id = await store.addLocation(session.id, locName.trim(), locDetail.trim());
            if (!selectedLoc) setSelectedLoc(id);
            setLocName("");
            setLocDetail("");
          }}
        />
      </ScrollView>
    );
  }

  if (view === "history") {
    return (
      <ScrollView contentContainerStyle={styles.pad}>
        <PageH t={t}>My History</PageH>
        <Muted t={t}>Every order, including cancelled.</Muted>
        {orders.length === 0 ? <Muted t={t}>No orders yet.</Muted> : null}
        {orders.map((order) => (
          <Pressable
            key={order.id}
            onPress={() => {
              session.trackId = order.id;
              setView("track");
            }}
            style={[styles.hist, { backgroundColor: t.card, borderColor: t.hair }]}
          >
            <Text style={{ color: order.cancelled ? t.stop : t.accent, fontFamily: sansBold }}>{order.cancelled ? "Cancelled" : order.status}</Text>
            <Text style={{ color: t.ink, fontFamily: sansBold }}>{order.id}</Text>
            <Text style={{ color: t.muted }}>{order.lines.map((l) => l.name).join(", ")}</Text>
          </Pressable>
        ))}
      </ScrollView>
    );
  }

  if (view === "track") {
    const order = orders.find((o) => o.id === session.trackId);
    if (!order) {
      return (
        <ScrollView contentContainerStyle={styles.pad}>
          <PageH t={t}>Track</PageH>
          <Muted t={t}>No order.</Muted>
        </ScrollView>
      );
    }
    return (
      <ScrollView contentContainerStyle={styles.pad}>
        <PageH t={t}>Tracking</PageH>
        <Text style={{ color: order.cancelled ? t.stop : t.accent, fontFamily: sansBold, marginBottom: 12 }}>{order.cancelled ? "Cancelled" : order.id}</Text>
        {order.steps.map((step) => (
          <View key={step.name} style={{ paddingVertical: 8, borderBottomWidth: 1, borderColor: t.hair }}>
            <Text style={{ color: t.ink, fontFamily: sansBold }}>{step.name}</Text>
            <Text style={{ color: t.muted }}>{step.at ? new Date(step.at).toLocaleTimeString() : "waiting"}</Text>
          </View>
        ))}
        {!order.cancelled && order.status !== "delivered" ? (
          <Ghost t={t} label="Cancel order" onPress={() => store.cancelOrder(order.id)} />
        ) : null}
      </ScrollView>
    );
  }

  if (view === "confirm" && placedId) {
    return (
      <ScrollView contentContainerStyle={styles.pad}>
        <PageH t={t}>Order placed</PageH>
        <Muted t={t}>Tap the number to track this order.</Muted>
        <Pressable
          onPress={() => {
            session.trackId = placedId;
            setView("track");
          }}
        >
          <Text style={{ color: t.accent, fontSize: 26, fontFamily: sansBold, textDecorationLine: "underline" }}>{placedId}</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (view === "pay") {
    return (
      <ScrollView contentContainerStyle={styles.pad}>
        <PageH t={t}>Payment</PageH>
        <Muted t={t}>{`Total ${money(total)}`}</Muted>
        <Pressable onPress={() => setPayMethod("cash")} style={[styles.pay, { borderColor: payMethod === "cash" ? t.accent : t.hair, backgroundColor: t.card }]}>
          <Text style={{ color: t.ink, fontFamily: sansBold }}>Cash</Text>
        </Pressable>
        <Pressable onPress={() => setPayMethod("ecocash")} style={[styles.pay, { borderColor: payMethod === "ecocash" ? t.accent : t.hair, backgroundColor: t.card }]}>
          <Text style={{ color: t.ink, fontFamily: sansBold }}>EcoCash</Text>
        </Pressable>
        {payMethod === "cash" ? (
          <Field t={t} label="Amount you have" value={cash} onChangeText={setCash} keyboardType="decimal-pad" placeholder="So we prepare change" />
        ) : (
          <Field t={t} label="EcoCash number" value={eco} onChangeText={setEco} keyboardType="phone-pad" placeholder="Dummy EcoCash steps" />
        )}
        {payError ? <Text style={{ color: t.stop }}>{payError}</Text> : null}
        <Submit
          t={t}
          label="Proceed"
          onPress={async () => {
            setPayError("");
            if (payMethod === "cash") {
              const have = Number(cash);
              if (!cash || Number.isNaN(have)) {
                setPayError("Enter the amount you have.");
                return;
              }
              if (have < total) {
                setPayError("That is less than the total.");
                return;
              }
            } else if (!eco.trim()) {
              setPayError("Enter your EcoCash number.");
              return;
            }
            const id = await store.placeOrder({
              accountId: session.id,
              lines: lines.map((l) => ({ productId: l.id, qty: l.qty })),
              fare,
              locationName: loc?.name ?? null,
              pay: payMethod === "cash" ? `Cash. Change to prepare: ${money(Number(cash) - total)}` : `EcoCash dummy · ${eco.trim()}`,
            });
            setCart({});
            setPlacedId(id);
            session.trackId = id;
            setView("confirm");
          }}
        />
      </ScrollView>
    );
  }

  if (view === "cart") {
    return (
      <ScrollView contentContainerStyle={styles.pad}>
        <PageH t={t}>Cart</PageH>
        {lines.length === 0 ? <Muted t={t}>Nothing in the cart yet.</Muted> : null}
        {lines.map((line) => (
          <Line key={line.id} t={t} left={line.name} meta={`${line.qty} × ${money(line.price)}`} right={money(line.price * line.qty)} />
        ))}
        {locations.map((l) => (
          <Pressable key={l.id} onPress={() => setSelectedLoc(l.id)}>
            <Text style={{ color: selectedLoc === l.id ? t.go : t.ink, marginVertical: 6 }}>{l.name}</Text>
          </Pressable>
        ))}
        <Line t={t} left="Items" right={money(subtotal)} />
        <Line t={t} left="Delivery fare" right={loc ? money(fare) : "Add a location"} />
        <Line t={t} left="Total" right={money(total)} />
        {lines.length ? <Submit t={t} label="Finalize order" onPress={() => setView("pay")} /> : null}
      </ScrollView>
    );
  }

  if (view === "help") {
    return (
      <ScrollView contentContainerStyle={styles.pad}>
        <PageH t={t}>Help</PageH>
        <Muted t={t}>Tap an order number to track it.</Muted>
      </ScrollView>
    );
  }

  const shown = products.filter((p) => category === "All" || p.category === category);
  const count = Object.values(cart).reduce((s, n) => s + n, 0);
  const showDock = count > 0 && (view === "home" || view === "client");
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.pad}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {SHOP_CATEGORIES.map((name) => (
            <Pressable key={name} onPress={() => setCategory(name)} style={[styles.chip, { backgroundColor: t.chip, borderWidth: category === name ? 2 : 0, borderColor: t.ink }]}>
              <Text style={{ color: t.ink, fontFamily: sansBold }}>{name}</Text>
            </Pressable>
          ))}
        </ScrollView>
        {shown.map((item) => {
          const qty = cart[item.id] || 0;
          return (
            <View key={item.id} style={[styles.prow, { backgroundColor: t.card, borderColor: t.hair }]}>
              <Image source={FACE} style={styles.pic} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: t.ink, fontFamily: sansBold }}>{item.name}</Text>
                <Text style={{ color: t.muted }}>{item.category}</Text>
              </View>
              <View>
                <Text style={{ color: t.stop, fontFamily: sansBold }}>{money(item.price)}</Text>
                {qty ? <Text style={{ color: t.muted, fontSize: 12 }}>Total {money(item.price * qty)}</Text> : null}
              </View>
              <View style={{ alignItems: "center", gap: 4 }}>
                <Pressable onPress={() => bump(item.id, 1)} style={[styles.qty, { backgroundColor: t.go }]}>
                  <Text style={styles.qtyTxt}>+</Text>
                </Pressable>
                <Text style={{ color: t.ink, fontFamily: sansBold }}>{qty}</Text>
                <Pressable onPress={() => bump(item.id, -1)} style={[styles.qty, { backgroundColor: t.stop }]}>
                  <Text style={styles.qtyTxt}>−</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
      {showDock ? (
        <Pressable onPress={() => setView("cart")} style={[styles.dock, { backgroundColor: t.accent }]}>
          <View style={styles.badge}>
            <Text style={{ color: t.accent, fontFamily: sansBold }}>{count}</Text>
          </View>
          <Text style={{ fontFamily: sansBold, color: "#1a1106" }}>Cart</Text>
          <Text style={{ marginLeft: "auto", fontFamily: sansBold, color: "#1a1106" }}>{money(subtotal)}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function cartCount(cart: Record<string, number>) {
  return Object.values(cart).reduce((s, n) => s + n, 0);
}

const styles = StyleSheet.create({
  pad: { padding: 16, paddingBottom: 120, gap: 8 },
  chip: { borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, marginRight: 8 },
  prow: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 18, padding: 10, marginBottom: 8 },
  pic: { width: 72, height: 72, borderRadius: 14 },
  qty: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  qtyTxt: { color: "#fff", fontWeight: "800", fontSize: 16 },
  hist: { borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 8 },
  pay: { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 8 },
  h3: { fontFamily: sansBold, fontSize: 16, marginTop: 8 },
  dock: { position: "absolute", left: 14, right: 14, bottom: 16, flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 18, padding: 14 },
  badge: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#1a1106", alignItems: "center", justifyContent: "center" },
});
