import { useMemo, useState } from "react";

import { Card, MetricCard } from "@poupi-frontend/ui";

import { HealthBadge } from "@/components/HealthBadge";
import { PlaceholderCard } from "@/components/PlaceholderCard";
import { StatusChip } from "@/components/StatusChip";
import {
  deriveDomainHealth,
  deriveExplorerEntries,
  displayValue,
  phases,
  statusToOperationalStatus,
} from "@/lib/architecture-explorer";
import type { CapabilityEntry } from "@/lib/capability-catalog";
import type { CapabilityRegistryPayload } from "@/lib/contracts";

export type CapabilityRegistryWidgetProps = {
  data: CapabilityRegistryPayload | null;
  catalogEntries?: CapabilityEntry[];
  loading?: boolean;
  error?: string | null;
};

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function formatList(values: string[], empty = "Unknown") {
  return values.length > 0 ? values.join(", ") : empty;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-normal text-zinc-500">{label}</dt>
      <dd className="mt-1 break-words text-sm text-zinc-800">{value}</dd>
    </div>
  );
}

export function CapabilityRegistryWidget({ data, catalogEntries = [], loading, error }: CapabilityRegistryWidgetProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [phaseFilter, setPhaseFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [backendFilter, setBackendFilter] = useState("all");
  const [certificationFilter, setCertificationFilter] = useState("all");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [selectedCapabilityId, setSelectedCapabilityId] = useState<string | null>(null);

  const byKind = useMemo(() => {
    const groups: Record<string, CapabilityRegistryPayload["capabilities"]> = {};
    for (const cap of data?.capabilities ?? []) (groups[cap.kind] ??= []).push(cap);
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [data]);

  const explorerEntries = useMemo(() => deriveExplorerEntries(catalogEntries), [catalogEntries]);
  const domainHealth = useMemo(() => deriveDomainHealth(catalogEntries), [catalogEntries]);
  const selectedCapability = explorerEntries.find((entry) => entry.id === selectedCapabilityId) ?? null;
  const activeDomainEntries = selectedDomain === "all" ? explorerEntries : explorerEntries.filter((entry) => entry.domain === selectedDomain);

  const filteredEntries = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return explorerEntries
      .filter((entry) => selectedDomain === "all" || entry.domain === selectedDomain)
      .filter((entry) => statusFilter === "all" || entry.status === statusFilter)
      .filter((entry) => phaseFilter === "all" || String(entry.phase) === phaseFilter)
      .filter((entry) => domainFilter === "all" || entry.domain === domainFilter)
      .filter((entry) => ownerFilter === "all" || entry.owner === ownerFilter)
      .filter((entry) => backendFilter === "all" || entry.backend === backendFilter)
      .filter((entry) => certificationFilter === "all" || entry.certification === certificationFilter)
      .filter((entry) => {
        if (!needle) return true;
        return [entry.name, entry.id, entry.owner, entry.domain, entry.endpoint, entry.backend, entry.status, entry.sourceOfTruth]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(needle));
      })
      .sort((a, b) => a.phase - b.phase || a.domain.localeCompare(b.domain) || a.name.localeCompare(b.name));
  }, [
    backendFilter,
    certificationFilter,
    domainFilter,
    explorerEntries,
    ownerFilter,
    phaseFilter,
    query,
    selectedDomain,
    statusFilter,
  ]);

  const healthScore =
    catalogEntries.length === 0 ? 0 : Math.round((catalogEntries.filter((entry) => entry.certifiedRealData).length / catalogEntries.length) * 100);
  const filterClass = "h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900";

  if (error) {
    return (
      <Card>
        <p className="text-sm text-red-600">{error}</p>
      </Card>
    );
  }

  return (
    <>
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Capabilities no catalogo" value={String(catalogEntries.length)} detail="capability-catalog.ts" />
        <MetricCard label="Capabilities registradas" value={loading && !data ? "..." : String(data?.total ?? 0)} detail="hook useCapabilities" />
        <Card>
          <div className="text-sm text-zinc-500">Certificacao real</div>
          <HealthBadge score={healthScore} />
        </Card>
      </section>

      {data ? (
        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <div className="text-sm text-zinc-500">Kinds do registry</div>
            <div className="mt-2 text-sm text-zinc-700">
              {Object.entries(data.kinds)
                .map(([k, n]) => `${k}:${n}`)
                .join("  ") || "Unknown"}
            </div>
          </Card>
          <Card>
            <div className="text-sm text-zinc-500">Advisory-only</div>
            <div className="mt-2 text-sm font-medium">
              {data.advisoryOnly ? (
                <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700 ring-1 ring-emerald-200">100% advisory (enforced)</span>
              ) : (
                <span className="rounded bg-red-50 px-2 py-0.5 text-red-700 ring-1 ring-red-200">contem capability nao-advisory</span>
              )}
            </div>
          </Card>
          {data.notes.length > 0 ? (
            <Card className="md:col-span-2">
              <p className="text-sm text-amber-700">{data.notes.join(" | ")}</p>
            </Card>
          ) : null}
        </section>
      ) : (
        <Card>
          <p className="text-sm text-zinc-500">
            {loading ? "Carregando registry..." : "Capability Registry remoto indisponivel. Explorer local segue pelo catalogo."}
          </p>
        </Card>
      )}

      <section>
        <h2 className="mb-3 text-base font-semibold">Project Health</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {domainHealth.map((domain) => (
            <button
              key={domain.domain}
              type="button"
              onClick={() => setSelectedDomain(domain.domain)}
              className={`rounded-lg border bg-white p-4 text-left shadow-sm transition hover:border-zinc-400 ${
                selectedDomain === domain.domain ? "border-zinc-900 ring-2 ring-zinc-900" : "border-zinc-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{domain.domain}</div>
                  <div className="mt-1 text-xs text-zinc-500">{domain.total} capabilities</div>
                </div>
                <StatusChip status={domain.blocked > 0 ? "NOT_READY" : domain.live > 0 ? "READY" : "NO_DATA"} />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-zinc-600">
                <span>Live {domain.live}</span>
                <span>Blocked {domain.blocked}</span>
                <span>Planned {domain.planned}</span>
                <span>Certified {domain.certified}</span>
                <span className="col-span-2">Not audited {domain.notAudited}</span>
              </div>
              <div className="mt-3 flex h-2 overflow-hidden rounded bg-zinc-100">
                {phases().map((phase) => (
                  <span
                    key={phase}
                    title={`Fase ${phase}: ${domain.phaseCounts[phase]}`}
                    className="border-r border-white bg-zinc-300 last:border-r-0"
                    style={{ width: `${domain.total ? (domain.phaseCounts[phase] / domain.total) * 100 : 12.5}%` }}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Capability Explorer</h2>
          {selectedDomain !== "all" ? (
            <button type="button" onClick={() => setSelectedDomain("all")} className="text-sm font-medium text-zinc-700 underline">
              Limpar dominio
            </button>
          ) : null}
        </div>

        <Card>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <input
              className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900 md:col-span-2"
              placeholder="Buscar capability, owner, dominio, endpoint, backend ou status"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <select className={filterClass} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">Status: todos</option>
              {unique(catalogEntries.map((entry) => entry.status)).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <select className={filterClass} value={phaseFilter} onChange={(event) => setPhaseFilter(event.target.value)}>
              <option value="all">Fase: todas</option>
              {phases().map((phase) => (
                <option key={phase} value={String(phase)}>
                  Fase {phase}
                </option>
              ))}
            </select>
            <select className={filterClass} value={domainFilter} onChange={(event) => setDomainFilter(event.target.value)}>
              <option value="all">Dominio: todos</option>
              {unique(catalogEntries.map((entry) => entry.domain)).map((domain) => (
                <option key={domain} value={domain}>
                  {domain}
                </option>
              ))}
            </select>
            <select className={filterClass} value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>
              <option value="all">Owner: todos</option>
              {unique(catalogEntries.map((entry) => entry.owner)).map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
            <select className={filterClass} value={backendFilter} onChange={(event) => setBackendFilter(event.target.value)}>
              <option value="all">Backend: todos</option>
              {unique(catalogEntries.map((entry) => entry.project)).map((backend) => (
                <option key={backend} value={backend}>
                  {backend}
                </option>
              ))}
            </select>
            <select className={filterClass} value={certificationFilter} onChange={(event) => setCertificationFilter(event.target.value)}>
              <option value="all">Certification: todas</option>
              {unique(explorerEntries.map((entry) => entry.certification)).map((certification) => (
                <option key={certification} value={certification}>
                  {certification}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {filteredEntries.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-medium uppercase tracking-normal text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Capability</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Dominio</th>
                  <th className="px-4 py-3">Fase</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Certification</th>
                  <th className="px-4 py-3">Backend</th>
                  <th className="px-4 py-3">Endpoint</th>
                  <th className="px-4 py-3">Deps</th>
                  <th className="px-4 py-3">Consumers</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="cursor-pointer hover:bg-zinc-50"
                    onClick={() => setSelectedCapabilityId(entry.id)}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") setSelectedCapabilityId(entry.id);
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-zinc-900">{entry.name}</div>
                      <code className="text-xs text-zinc-500">{entry.id}</code>
                    </td>
                    <td className="px-4 py-3">{displayValue(entry.owner)}</td>
                    <td className="px-4 py-3">{displayValue(entry.domain)}</td>
                    <td className="px-4 py-3">Fase {entry.phase}</td>
                    <td className="px-4 py-3">
                      <StatusChip status={statusToOperationalStatus(entry.status)} label={entry.status} />
                    </td>
                    <td className="px-4 py-3">{entry.certification}</td>
                    <td className="px-4 py-3">{entry.backend}</td>
                    <td className="px-4 py-3">
                      <code className="text-xs">{displayValue(entry.endpoint, "Not Audited")}</code>
                    </td>
                    <td className="px-4 py-3">{formatList(entry.dependencies)}</td>
                    <td className="px-4 py-3">{formatList(entry.consumers)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <PlaceholderCard label="Capability Explorer" source="capability-catalog.ts" phase="No Data" />
        )}
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold">Domain Dashboard</h2>
        {selectedDomain === "all" ? (
          <Card>
            <p className="text-sm text-zinc-600">Selecione um dominio em Project Health para inspecionar capabilities, dependencias e blockers.</p>
          </Card>
        ) : activeDomainEntries.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {activeDomainEntries.map((entry) => (
              <Card key={entry.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{entry.name}</div>
                    <code className="text-xs text-zinc-500">{entry.id}</code>
                  </div>
                  <StatusChip status={statusToOperationalStatus(entry.status)} label={entry.status} />
                </div>
                <div className="mt-3 grid gap-2 text-sm text-zinc-600">
                  <span>Dependencies: {formatList(entry.dependencies)}</span>
                  <span>Blockers: {formatList(entry.blockers)}</span>
                  <span>Internal links: {formatList([entry.screen, entry.bffRoute].filter((value): value is string => Boolean(value)))}</span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <PlaceholderCard label={selectedDomain} source="capability-catalog.ts" phase="No Data" />
        )}
      </section>

      <section>
        <h2 className="mb-3 text-base font-semibold">Roadmap Inteligente</h2>
        <div className="grid gap-4 xl:grid-cols-4">
          {phases().map((phase) => {
            const phaseEntries = explorerEntries.filter((entry) => entry.phase === phase);
            return (
              <Card key={phase} className="min-h-48">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">Fase {phase}</h3>
                  <span className="text-xs text-zinc-500">{phaseEntries.length}</span>
                </div>
                <div className="grid gap-2">
                  {phaseEntries.length > 0 ? (
                    phaseEntries.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => setSelectedCapabilityId(entry.id)}
                        className="rounded-md border border-zinc-200 p-3 text-left hover:border-zinc-400"
                      >
                        <div className="text-sm font-medium">{entry.name}</div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <StatusChip status={statusToOperationalStatus(entry.status)} label={entry.status} />
                          <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">{entry.reuse}</span>
                        </div>
                        <div className="mt-2 text-xs text-zinc-500">
                          Owner: {displayValue(entry.owner)} | Deps: {formatList(entry.dependencies)}
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-400">Unknown</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {byKind.length > 0 ? (
        <section>
          <h2 className="mb-3 text-base font-semibold">Registry Projection</h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {byKind.map(([kind, caps]) => (
              <Card key={kind}>
                <h3 className="text-sm font-semibold capitalize">
                  {kind} <span className="text-zinc-400">({caps.length})</span>
                </h3>
                <div className="mt-3 grid gap-3">
                  {caps.map((cap) => (
                    <div key={cap.capabilityId} className="rounded-md border border-zinc-100 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-sm font-semibold">{cap.capabilityId}</code>
                        <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">{cap.sourcePlatform}</span>
                      </div>
                      <p className="mt-1 text-sm text-zinc-600">{cap.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                        <span>
                          owner: <b>{cap.owner}</b>
                        </span>
                        {cap.advisoryOnly ? <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700">advisory</span> : null}
                        {cap.dependencies.length > 0 ? <span>deps: {cap.dependencies.join(", ")}</span> : <span>sem dependencias</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      {selectedCapability ? (
        <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-xl flex-col border-l border-zinc-200 bg-white p-6 shadow-xl">
          <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-normal text-zinc-500">Capability detail</p>
              <h2 className="mt-1 text-lg font-semibold">{selectedCapability.name}</h2>
              <code className="text-xs text-zinc-500">{selectedCapability.id}</code>
            </div>
            <button type="button" onClick={() => setSelectedCapabilityId(null)} className="rounded-md px-3 py-2 text-sm hover:bg-zinc-100">
              Fechar
            </button>
          </div>
          <div className="grid flex-1 gap-5 overflow-y-auto py-5">
            <div>
              <h3 className="text-sm font-semibold">Resumo</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{displayValue(selectedCapability.notes)}</p>
            </div>
            <dl className="grid gap-4 md:grid-cols-2">
              <DetailRow label="Descricao" value={displayValue(selectedCapability.notes)} />
              <DetailRow label="Status" value={selectedCapability.status} />
              <DetailRow label="Fase" value={`Fase ${selectedCapability.phase}`} />
              <DetailRow label="Owner" value={displayValue(selectedCapability.owner)} />
              <DetailRow label="Backend" value={displayValue(selectedCapability.backend)} />
              <DetailRow label="Source of Truth" value={displayValue(selectedCapability.sourceOfTruth)} />
              <DetailRow label="Endpoint" value={displayValue(selectedCapability.endpoint, "Not Audited")} />
              <DetailRow label="Dependencias" value={formatList(selectedCapability.dependencies)} />
              <DetailRow label="Consumidores" value={formatList(selectedCapability.consumers)} />
              <DetailRow label="Blockers" value={formatList(selectedCapability.blockers)} />
              <DetailRow label="Observacoes" value={displayValue(selectedCapability.notes)} />
              <DetailRow label="Certification" value={selectedCapability.certification} />
            </dl>
          </div>
        </aside>
      ) : null}
    </>
  );
}
