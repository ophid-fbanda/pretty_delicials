import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { BASE, type Order } from "../store";
import { useApp } from "../state";
import { sansBold, type Theme } from "../theme";
import { Accept, Bits, Flag, Ghost, Muted, PageH, RejectBtn, WhoCard } from "../ui";

export function DeliveryStage({ t }: { t: Theme }) {
  const { store, tick } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<"collect" | "loaded" | "map" | "today">("collect");
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const [choiceId, setChoiceId] = useState<string | null>(null);
  const [deliverId, setDeliverId] = useState<string | null>(null);

  useEffect(() => {
    store.listOrders().then(setOrders);
  }, [store, tick]);

  const ready = orders.filter((o) => o.status === "ready");
  const loaded = orders.filter((o) => o.status === "loaded");
  const pickedN = Object.values(picked).filter(Boolean).length;

  if (deliverId) {
    const order = orders.find((o) => o.id === deliverId);
    return (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
        <PageH t={t}>{`Delivery ${deliverId}`}</PageH>
        <Muted t={t}>{order?.address ?? ""}</Muted>
        <Accept
          t={t}
          label="Delivered"
          onPress={async () => {
            await store.delivered(deliverId);
            setDeliverId(null);
          }}
        />
        <RejectBtn
          t={t}
          label="Failed"
          onPress={async () => {
            await store.failed(deliverId);
            setDeliverId(null);
          }}
        />
        <Ghost t={t} label="Close" onPress={() => setDeliverId(null)} />
      </ScrollView>
    );
  }

  if (choiceId) {
    const order = orders.find((o) => o.id === choiceId);
    return (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
        <PageH t={t}>{choiceId}</PageH>
        <Muted t={t}>{order?.address ?? ""}</Muted>
        <SubmitMap t={t} onPress={() => { setChoiceId(null); setTab("map"); }} />
        <Accept t={t} label="Delivery" onPress={() => { setDeliverId(choiceId); setChoiceId(null); }} />
        <Ghost t={t} label="Close" onPress={() => setChoiceId(null)} />
      </ScrollView>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        {tab === "collect" ? (
          <>
            <Text style={{ color: t.stop, fontFamily: sansBold, letterSpacing: 1.5, fontSize: 12 }}>READY FOR COLLECTION</Text>
            <PageH t={t}>What goes on the van</PageH>
            {ready.length === 0 ? <Muted t={t}>Nothing waiting.</Muted> : null}
            {ready.map((o) => (
              <Pressable key={o.id} onPress={() => setPicked((p) => ({ ...p, [o.id]: !p[o.id] }))} style={{ marginBottom: 10 }}>
                <WhoCard t={t} fit>
                  <Text style={{ color: t.ink, fontWeight: "700" }}>{o.id}</Text>
                  <Muted t={t}>{o.address ?? ""}</Muted>
                  <Bits t={t} lines={o.lines} />
                  <Text style={{ color: picked[o.id] ? t.go : t.muted }}>{picked[o.id] ? "Ticked" : "Tick to load"}</Text>
                </WhoCard>
              </Pressable>
            ))}
          </>
        ) : null}
        {tab === "loaded" ? (
          <>
            <Text style={{ color: t.stop, fontFamily: sansBold, letterSpacing: 1.5, fontSize: 12 }}>ON THE VAN</Text>
            <PageH t={t}>Loaded</PageH>
            {loaded.length === 0 ? <Muted t={t}>Van is empty. Tick ready orders and Load.</Muted> : null}
            {loaded.map((o) => (
              <WhoCard key={o.id} t={t} fit>
                <Text style={{ color: t.ink, fontWeight: "700" }}>{o.id}</Text>
                <Muted t={t}>{o.address ?? ""}</Muted>
                <Bits t={t} lines={o.lines} />
                <Ghost t={t} label="Remove" onPress={() => store.unload(o.id)} />
              </WhoCard>
            ))}
          </>
        ) : null}
        {tab === "map" ? (
          <>
            <Text style={{ color: t.stop, fontFamily: sansBold, letterSpacing: 1.5, fontSize: 12 }}>RUN MAP</Text>
            <Muted t={t}>{`Base ${BASE.address}. Every stop on the run.`}</Muted>
            {orders.map((o) => (
              <WhoCard key={o.id} t={t} fit onPress={() => (o.status === "in transit" ? setChoiceId(o.id) : undefined)}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: t.ink, fontWeight: "700" }}>{o.id}</Text>
                  <Flag t={t} kind={o.status === "delivered" || o.status === "ready" ? "open" : o.status === "failed" ? "shut" : "out"} label={o.status} />
                </View>
                <Muted t={t}>{o.address ?? ""}</Muted>
              </WhoCard>
            ))}
          </>
        ) : null}
        {tab === "today" ? (
          <>
            <Text style={{ color: t.stop, fontFamily: sansBold, letterSpacing: 1.5, fontSize: 12 }}>TODAY'S LOADS</Text>
            <PageH t={t}>By order</PageH>
            {orders.map((o, i) => (
              <WhoCard key={o.id} t={t} fit onPress={() => (o.status === "in transit" ? setChoiceId(o.id) : undefined)}>
                <Text style={{ color: t.ink }}>{`${i + 1}. ${o.id}`}</Text>
                <Muted t={t}>{o.address ?? ""}</Muted>
                <Flag t={t} kind={o.status === "delivered" || o.status === "ready" ? "open" : o.status === "failed" ? "shut" : "out"} label={o.status} />
              </WhoCard>
            ))}
          </>
        ) : null}
      </ScrollView>
      {tab === "collect" && pickedN ? (
        <Pressable
          onPress={async () => {
            await store.load(Object.keys(picked).filter((id) => picked[id]));
            setPicked({});
            setTab("loaded");
          }}
          style={{ position: "absolute", left: 14, right: 14, bottom: 72, backgroundColor: t.accent, borderRadius: 18, padding: 14, alignItems: "center" }}
        >
          <Text style={{ fontFamily: sansBold, color: "#1a1106" }}>{`${pickedN}  Load`}</Text>
        </Pressable>
      ) : null}
      {tab === "loaded" && loaded.length ? (
        <Pressable
          onPress={async () => {
            await store.transitLoaded();
            setTab("map");
          }}
          style={{ position: "absolute", left: 14, right: 14, bottom: 72, backgroundColor: "#1a120c", borderRadius: 18, padding: 14, alignItems: "center" }}
        >
          <Text style={{ fontFamily: sansBold, color: "#f3e2c8" }}>Transit</Text>
        </Pressable>
      ) : null}
      <View style={{ position: "absolute", left: 12, right: 12, bottom: 12, flexDirection: "row", backgroundColor: "#1a120c", borderRadius: 20, padding: 4 }}>
        {(["collect", "loaded", "map", "today"] as const).map((id) => (
          <Pressable key={id} onPress={() => setTab(id)} style={{ flex: 1, paddingVertical: 10, borderRadius: 16, backgroundColor: tab === id ? "#c4892e" : "transparent", alignItems: "center" }}>
            <Text style={{ color: tab === id ? "#1a120c" : "#f6e6d2", fontFamily: sansBold, fontSize: 12 }}>{id[0].toUpperCase() + id.slice(1)}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function SubmitMap({ t, onPress }: { t: Theme; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ backgroundColor: t.accent, borderRadius: 18, paddingVertical: 16, alignItems: "center" }}>
      <Text style={{ fontFamily: sansBold, color: "#1a1106" }}>Map</Text>
    </Pressable>
  );
}
