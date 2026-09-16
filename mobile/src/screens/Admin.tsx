import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { TEAM_ROLES, type ClientAccount, type StaffMember, type TeamRole } from "../store";
import { useApp } from "../state";
import type { Theme } from "../theme";
import { Back, ChoiceCard, ChoiceGrid, Field, Ghost, Muted, PageH, Submit, Tick, WhoCard } from "../ui";

export function AdminStage({ t, view }: { t: Theme; view: string }) {
  const { store, setView, tick, session, setSession } = useApp();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [clients, setClients] = useState<ClientAccount[]>([]);
  const [q, setQ] = useState("");
  const [drafts, setDrafts] = useState<Record<string, TeamRole[]>>({});

  useEffect(() => {
    store.listStaff().then(setStaff);
    store.listClients().then(setClients);
  }, [store, tick]);

  if (view === "staff") {
    const list = staff.filter((p) => [p.name, p.phone, p.email].join(" ").toLowerCase().includes(q.trim().toLowerCase()));
    return (
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 10 }}>
        <Back t={t} onPress={() => setView("admin")} />
        <PageH t={t}>Staff</PageH>
        <Field t={t} label="Search" value={q} onChangeText={setQ} placeholder="Name or phone" />
        {list.map((person) => {
          const selected = drafts[person.id] ?? person.roles;
          return (
            <WhoCard key={person.id} t={t} fit>
              <Text style={{ color: t.ink, fontWeight: "700", fontSize: 16 }}>{person.name}</Text>
              <Muted t={t}>{person.phone}</Muted>
              {TEAM_ROLES.map((role) => (
                <Tick
                  key={role}
                  t={t}
                  label={role}
                  on={selected.includes(role)}
                  onToggle={() =>
                    setDrafts((d) => ({
                      ...d,
                      [person.id]: selected.includes(role) ? selected.filter((r) => r !== role) : [...selected, role],
                    }))
                  }
                />
              ))}
              <Submit
                t={t}
                label="Save"
                onPress={async () => {
                  const roles = drafts[person.id] ?? person.roles;
                  await store.saveRoles(person.id, roles);
                  if (session.id === person.id) setSession({ ...session, roles });
                  if (roles.length === 0 && session.id === person.id) setView("home");
                }}
              />
            </WhoCard>
          );
        })}
      </ScrollView>
    );
  }

  if (view === "clients") {
    const list = clients.filter((p) => [p.name, p.phone, p.email].join(" ").toLowerCase().includes(q.trim().toLowerCase()));
    return (
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 10 }}>
        <Back t={t} onPress={() => setView("admin")} />
        <PageH t={t}>Clients</PageH>
        <Field t={t} label="Search" value={q} onChangeText={setQ} placeholder="Name or phone" />
        {list.map((person) => {
          const selected = drafts[person.id] ?? [];
          return (
            <WhoCard key={person.id} t={t} fit>
              <Text style={{ color: t.ink, fontWeight: "700", fontSize: 16 }}>{person.name}</Text>
              <Muted t={t}>{`${person.phone}${person.disabled ? " · Disabled" : " · Active"}`}</Muted>
              {TEAM_ROLES.map((role) => (
                <Tick
                  key={role}
                  t={t}
                  label={role}
                  on={selected.includes(role)}
                  onToggle={() =>
                    setDrafts((d) => ({
                      ...d,
                      [person.id]: selected.includes(role) ? selected.filter((r) => r !== role) : [...selected, role],
                    }))
                  }
                />
              ))}
              <Ghost t={t} label={person.disabled ? "Enable" : "Disable"} onPress={() => store.setDisabled(person.id, !person.disabled)} />
              <Submit
                t={t}
                label="Recruit"
                onPress={() => {
                  if (!selected.length) return;
                  store.recruit(person.id, selected);
                }}
              />
            </WhoCard>
          );
        })}
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <PageH t={t}>Administration</PageH>
      <Muted t={t}>Accounts only.</Muted>
      <ChoiceGrid>
        <ChoiceCard t={t} title="Staff" sub={`${staff.length} with roles`} onPress={() => setView("staff")} />
        <ChoiceCard t={t} title="Clients" sub={`${clients.length} with no role`} onPress={() => setView("clients")} />
      </ChoiceGrid>
    </ScrollView>
  );
}
