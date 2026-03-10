import { React, html } from "./lib/react.js";
import {
  CommandPanel,
  Header,
  HopInspector,
  MapPanel,
  SummaryStrip
} from "./components.js";
import {
  DEMO_HOSTS,
  buildTraceFromManualInput,
  buildTraceMetrics,
  getDefaultTrace,
  runTraceSimulation
} from "./trace-service.js";

export function App() {
  const [target, setTarget] = React.useState("openai.com");
  const [manualInput, setManualInput] = React.useState("");
  const [trace, setTrace] = React.useState(() => getDefaultTrace());
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [activeHopId, setActiveHopId] = React.useState(() => getDefaultTrace().hops[0]?.id ?? null);

  const activeHop = trace.hops.find((hop) => hop.id === activeHopId) ?? trace.hops[0] ?? null;
  const metrics = buildTraceMetrics(trace);

  React.useEffect(() => {
    if (!trace.hops.some((hop) => hop.id === activeHopId)) {
      setActiveHopId(trace.hops[0]?.id ?? null);
    }
  }, [trace, activeHopId]);

  const handleRunTrace = async () => {
    setLoading(true);
    setError("");

    try {
      const nextTrace = await runTraceSimulation(target);
      setTrace(nextTrace);
      setActiveHopId(nextTrace.hops[0]?.id ?? null);
    } catch (runError) {
      setError(runError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualTrace = () => {
    try {
      const nextTrace = buildTraceFromManualInput(manualInput, target);
      setTrace(nextTrace);
      setActiveHopId(nextTrace.hops[0]?.id ?? null);
      setError("");
    } catch (parseError) {
      setError(parseError.message);
    }
  };

  return html`
    <div className="app-shell">
      <div className="ambient ambient-left"></div>
      <div className="ambient ambient-right"></div>

      <${Header} trace=${trace} metrics=${metrics} />
      <${SummaryStrip} trace=${trace} metrics=${metrics} />

      <main className="workspace-grid">
        <${CommandPanel}
          target=${target}
          setTarget=${setTarget}
          manualInput=${manualInput}
          setManualInput=${setManualInput}
          demoHosts=${DEMO_HOSTS}
          trace=${trace}
          loading=${loading}
          error=${error}
          onRunTrace=${handleRunTrace}
          onParseManual=${handleManualTrace}
        />

        <${MapPanel}
          trace=${trace}
          activeHopId=${activeHopId}
          onSelectHop=${setActiveHopId}
        />

        <${HopInspector}
          trace=${trace}
          activeHop=${activeHop}
          metrics=${metrics}
          onSelectHop=${setActiveHopId}
        />
      </main>
    </div>
  `;
}
