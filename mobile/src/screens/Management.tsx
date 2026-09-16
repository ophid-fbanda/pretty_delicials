import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import type { Branch, Catalog, Fare, MoneyRow, Order, StaffMember, Vehicle } from "../store";
import { useApp } from "../state";
import { money, type Theme } from "../theme";
import { Back, ChoiceCard, ChoiceGrid, Flag, Line, Muted, PageH, Submit, WhoCard } from "../ui";

export function MgmtStage({ t, view }: { t: Theme; view: string }) {
  const { store, setView, tick } = useApp();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [expenses, setExpenses] = useState<MoneyRow[]>([]);
  const [adjustments, setAdjustments] = useState<MoneyRow[]>([]);
  const [fares, setFares] = useState<Fare[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [vehicleId, setVehicleId] = useState<string | null>(null);

  useEffect(() => {
    store.listBranches().then(setBranches);
    store.catalog().then(setCatalog);
    store.listVehicles().then(setVehicles);
    store.listStaff().then(setStaff);
    store.listExpenses().then(setExpenses);
    store.listAdjustments().then(setAdjustments);
    store.listFares().then(setFares);
    store.listOrders().then(setOrders);
  }, [store, tick]);

  const stuck = orders.filter((o) => o.mins > 30 && !["delivered", "cancelled", "rejected"].includes(o.status)).length;

  if (view === "mgmt-branches") {
    return (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
        <Back t={t} onPress={() => setView("mgmt")} />
        <PageH t={t}>Branches</PageH>
        {branches.map((shop) => (
          <WhoCard key={shop.id} t={t} fit>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: t.ink, fontWeight: "700" }}>{shop.name}</Text>
              <Flag t={t} kind={shop.open ? "open" : "shut"} label={shop.open ? "Open" : "Closed"} />
            </View>
            <Muted t={t}>{shop.address}</Muted>
            <Submit t={t} label={shop.open ? "Close" : "Open"} onPress={() => store.setShopOpen(shop.id, !shop.open)} />
          </WhoCard>
        ))}
      </ScrollView>
    );
  }

  if (view === "mgmt-products") {
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Back t={t} onPress={() => setView("mgmt")} />
        <PageH t={t}>Products</PageH>
        <ChoiceGrid>
          <ChoiceCard t={t} title="Categories" sub={`${catalog?.categories.length ?? 0}`} onPress={() => setView("mgmt-categories")} />
          <ChoiceCard t={t} title="Sizes" sub={`${catalog?.sizes.length ?? 0}`} onPress={() => setView("mgmt-sizes")} />
          <ChoiceCard t={t} title="Flavours" sub={`${catalog?.flavours.length ?? 0}`} onPress={() => setView("mgmt-flavours")} />
          <ChoiceCard t={t} title="Items" sub={`${catalog?.items.length ?? 0} from the three`} onPress={() => setView("mgmt-items")} />
        </ChoiceGrid>
      </ScrollView>
    );
  }

  if (view === "mgmt-categories" || view === "mgmt-sizes" || view === "mgmt-flavours") {
    const kind = view === "mgmt-categories" ? "categories" : view === "mgmt-sizes" ? "sizes" : "flavours";
    const rows = catalog?.[kind] ?? [];
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Back t={t} onPress={() => setView("mgmt-products")} />
        <PageH t={t}>{kind[0].toUpperCase() + kind.slice(1)}</PageH>
        {rows.map((row) => (
          <Line key={row.id} t={t} left={row.name} />
        ))}
      </ScrollView>
    );
  }

  if (view === "mgmt-items") {
    return (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
        <Back t={t} onPress={() => setView("mgmt-products")} />
        <PageH t={t}>Items</PageH>
        <Muted t={t}>Each item is a category, size and flavour, with a price.</Muted>
        {catalog?.items.map((item) => (
          <WhoCard key={item.id} t={t} fit>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: t.ink, fontWeight: "700" }}>{`${item.flavour} ${item.category.toLowerCase()}`}</Text>
              <Flag t={t} kind={item.available ? "open" : "shut"} label={item.available ? "Available" : "Off"} />
            </View>
            <Muted t={t}>{`${item.size} · ${money(item.price)}`}</Muted>
            <Submit t={t} label={item.available ? "Make unavailable" : "Make available"} onPress={() => store.toggleItem(item.id)} />
          </WhoCard>
        ))}
      </ScrollView>
    );
  }

  if (view === "mgmt-vehicles") {
    return (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
        <Back t={t} onPress={() => setView("mgmt")} />
        <PageH t={t}>Vehicles</PageH>
        {vehicles.map((v) => (
          <WhoCard
            key={v.id}
            t={t}
            fit
            onPress={() => {
              setVehicleId(v.id);
              setView("mgmt-vehicle");
            }}
          >
            <Text style={{ color: t.ink, fontWeight: "700" }}>{v.plate}</Text>
            <Muted t={t}>{`${v.status} · fuel ${v.fuel}%`}</Muted>
          </WhoCard>
        ))}
      </ScrollView>
    );
  }

  if (view === "mgmt-vehicle") {
    const v = vehicles.find((item) => item.id === vehicleId);
    if (!v) return null;
    return (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
        <Back t={t} onPress={() => setView("mgmt-vehicles")} />
        <PageH t={t}>{v.plate}</PageH>
        <Muted t={t}>{`Fuel ${v.fuel}%`}</Muted>
        <Submit t={t} label="Return" onPress={() => store.returnVehicle(v.id)} />
      </ScrollView>
    );
  }

  if (view === "mgmt-staff") {
    return (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
        <Back t={t} onPress={() => setView("mgmt")} />
        <PageH t={t}>Staff</PageH>
        <Muted t={t}>On duty now. Clear a shift so they keep roles tomorrow. Uncleared staff lose roles for the next day.</Muted>
        {staff.map((person) => (
          <WhoCard key={person.id} t={t} fit>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ color: t.ink, fontWeight: "700" }}>{person.name}</Text>
              <Flag t={t} kind={person.onDuty ? "open" : "shut"} label={person.onDuty ? "On duty" : "Off"} />
            </View>
            <Muted t={t}>{person.roles.join(", ")}</Muted>
            <Muted t={t}>{person.cleared ? "Keeps roles tomorrow" : "Not cleared — no roles tomorrow"}</Muted>
            <Submit t={t} label={person.cleared ? "Cleared" : "Clear for next day"} disabled={person.cleared} onPress={() => store.clearDuty(person.id)} />
          </WhoCard>
        ))}
      </ScrollView>
    );
  }

  if (view === "mgmt-finance") {
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Back t={t} onPress={() => setView("mgmt")} />
        <PageH t={t}>Finance</PageH>
        <ChoiceGrid>
          <ChoiceCard t={t} title="Expenses" sub={`${expenses.length}`} onPress={() => setView("mgmt-expenses")} />
          <ChoiceCard t={t} title="Adjustments" sub={`${adjustments.length}`} onPress={() => setView("mgmt-adjustments")} />
          <ChoiceCard t={t} title="Reports" sub="today" onPress={() => setView("mgmt-reports")} />
        </ChoiceGrid>
      </ScrollView>
    );
  }

  if (view === "mgmt-expenses" || view === "mgmt-adjustments") {
    const rows = view === "mgmt-expenses" ? expenses : adjustments;
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Back t={t} onPress={() => setView("mgmt-finance")} />
        <PageH t={t}>{view === "mgmt-expenses" ? "Expenses" : "Adjustments"}</PageH>
        {rows.map((row) => (
          <Line key={row.id} t={t} left={row.note} right={money(row.amount)} />
        ))}
      </ScrollView>
    );
  }

  if (view === "mgmt-reports") {
    const spent = expenses.reduce((s, e) => s + e.amount, 0);
    const adj = adjustments.reduce((s, e) => s + e.amount, 0);
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Back t={t} onPress={() => setView("mgmt-finance")} />
        <PageH t={t}>Reports</PageH>
        <Line t={t} left="Today's orders" right={String(orders.length)} />
        <Line t={t} left="Expenses" right={money(spent)} />
        <Line t={t} left="Adjustments" right={money(adj)} />
      </ScrollView>
    );
  }

  if (view === "mgmt-kitchen") {
    const kitchen = staff.filter((p) => p.roles.includes("Kitchen") && p.onDuty);
    return (
      <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
        <Back t={t} onPress={() => setView("mgmt")} />
        <PageH t={t}>Kitchen</PageH>
        <Muted t={t}>Kitchen staff on duty</Muted>
        <Text style={{ color: t.ink }}>{kitchen.map((p) => p.name).join(", ") || "No kitchen staff on duty."}</Text>
        {orders.map((order) => {
          const isStuck = order.mins > 30 && !["delivered", "cancelled", "rejected"].includes(order.status);
          return (
            <WhoCard key={order.id} t={t} fit>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text style={{ color: t.ink, fontWeight: "700" }}>{order.id}</Text>
                <Flag t={t} kind={isStuck ? "stuck" : order.status === "in transit" ? "out" : "open"} label={isStuck ? "stuck >30min" : order.status} />
              </View>
              <Muted t={t}>{`${order.mins} min`}</Muted>
            </WhoCard>
          );
        })}
      </ScrollView>
    );
  }

  if (view === "mgmt-more") {
    return (
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Back t={t} onPress={() => setView("mgmt")} />
        <PageH t={t}>More</PageH>
        <Muted t={t}>Delivery fares. Not on Vehicles.</Muted>
        {fares.map((f) => (
          <Line key={f.id} t={t} left={f.area} right={money(f.amount)} />
        ))}
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <PageH t={t}>Management</PageH>
      <ChoiceGrid>
        <ChoiceCard t={t} title="Branches" sub={`${branches.filter((b) => b.open).length} open of ${branches.length}`} onPress={() => setView("mgmt-branches")} />
        <ChoiceCard t={t} title="Products" sub={`${catalog?.items.length ?? 0} items`} onPress={() => setView("mgmt-products")} />
        <ChoiceCard t={t} title="Vehicles" sub={`${vehicles.filter((v) => v.status === "out").length} out`} onPress={() => setView("mgmt-vehicles")} />
        <ChoiceCard t={t} title="Staff" sub={`${staff.filter((p) => p.onDuty).length} on duty`} onPress={() => setView("mgmt-staff")} />
        <ChoiceCard t={t} title="Finance" sub={`${expenses.length} expenses`} onPress={() => setView("mgmt-finance")} />
        <ChoiceCard t={t} title="Kitchen" sub={stuck ? `${stuck} stuck` : "today"} onPress={() => setView("mgmt-kitchen")} />
        <ChoiceCard t={t} title="More" sub={`${fares.length} fares`} onPress={() => setView("mgmt-more")} />
      </ChoiceGrid>
    </ScrollView>
  );
}
