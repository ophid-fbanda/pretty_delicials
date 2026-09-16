import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { REJECT_REASONS, type Order } from "../store";
import { useApp } from "../state";
import { sansBold, type Theme } from "../theme";
import { Accept, Back, Bits, Field, Ghost, Muted, PageH, RejectBtn, Submit, Tick, WhoCard } from "../ui";

export function KitchenStage({ t }: { t: Theme }) {
  const { store, tick } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<"incoming" | "bench" | "out">("incoming");
  const [openId, setOpenId] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reasons, setReasons] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    store.listOrders().then(setOrders);
  }, [store, tick]);

  const incoming = orders.filter((o) => o.status === "incoming");
  const bench = orders.filter((o) => o.status === "processing");
  const out = orders.filter((o) => !["incoming", "processing"].includes(o.status));
  const open = orders.find((o) => o.id === openId);

  if (rejecting) {
    return (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
        <PageH t={t}>{`Reject ${rejecting}`}</PageH>
        <Muted t={t}>Tick why. Notes are optional.</Muted>
        {REJECT_REASONS.map((reason) => (
          <Tick
            key={reason}
            t={t}
            label={reason}
            on={reasons.includes(reason)}
            onToggle={() => setReasons((r) => (r.includes(reason) ? r.filter((x) => x !== reason) : [...r, reason]))}
          />
        ))}
        <Field t={t} label="Notes" value={notes} onChangeText={setNotes} placeholder="Anything the team should know" />
        {err ? <Text style={{ color: t.stop }}>{err}</Text> : null}
        <RejectBtn
          t={t}
          label="Confirm reject"
          onPress={async () => {
            if (!reasons.length) {
              setErr("Tick at least one reason.");
              return;
            }
            await store.reject(rejecting, reasons, notes.trim());
            setRejecting(null);
            setOpenId(null);
            setReasons([]);
            setNotes("");
            setTab("incoming");
          }}
        />
        <Ghost t={t} label="Close" onPress={() => setRejecting(null)} />
      </ScrollView>
    );
  }

  if (open) {
    const incomingOpen = open.status === "incoming";
    const onBench = open.status === "processing";
    return (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
        <Back t={t} onPress={() => setOpenId(null)} />
        <Text style={{ color: t.accent, fontSize: 26, fontFamily: sansBold }}>{open.id}</Text>
        <Muted t={t}>{`${open.mins} min`}</Muted>
        {open.lines.map((line) => (
          <View key={line.name} style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ color: t.ink, fontWeight: "700" }}>{line.name}</Text>
            <Text style={{ color: t.ink }}>{line.qty}</Text>
          </View>
        ))}
        {incomingOpen ? (
          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            <View style={{ flex: 1 }}>
              <Accept
                t={t}
                label="Accept"
                onPress={async () => {
                  await store.accept(open.id);
                  setOpenId(null);
                  setTab("bench");
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <RejectBtn t={t} label="Reject" onPress={() => setRejecting(open.id)} />
            </View>
          </View>
        ) : onBench ? (
          <Submit
            t={t}
            label="Ready"
            onPress={async () => {
              await store.ready(open.id);
              setOpenId(null);
              setTab("bench");
            }}
          />
        ) : (
          <Muted t={t}>Kitchen cannot change this now.</Muted>
        )}
      </ScrollView>
    );
  }

  const list = tab === "incoming" ? incoming : tab === "bench" ? bench : out;
  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
      <PageH t={t}>Kitchen</PageH>
      <View style={{ flexDirection: "row", backgroundColor: t.chip, borderRadius: 999, padding: 4, marginBottom: 14 }}>
        {(
          [
            ["incoming", "Incoming", incoming.length],
            ["bench", "Kitchen", bench.length],
            ["out", "Out", null],
          ] as const
        ).map(([id, label, n]) => (
          <Pressable key={id} onPress={() => setTab(id)} style={{ flex: 1, paddingVertical: 8, borderRadius: 999, backgroundColor: tab === id ? t.card : "transparent", alignItems: "center" }}>
            <Text style={{ color: t.ink, fontFamily: sansBold, fontSize: 13 }}>
              {label}
              {n == null ? "" : ` ${n}`}
            </Text>
          </Pressable>
        ))}
      </View>
      {list.length === 0 ? <Muted t={t}>{tab === "incoming" ? "No incoming orders." : tab === "bench" ? "Nothing on the bench." : "Nothing past the kitchen yet."}</Muted> : null}
      {list.map((order) => (
        <WhoCard key={order.id} t={t} fit onPress={() => setOpenId(order.id)}>
          <Text style={{ color: t.ink, fontWeight: "700" }}>{order.id}</Text>
          <Muted t={t}>{tab === "out" ? order.status : `${order.mins} min`}</Muted>
          <Bits t={t} lines={order.lines} />
        </WhoCard>
      ))}
    </ScrollView>
  );
}
