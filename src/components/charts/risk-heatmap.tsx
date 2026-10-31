/**
 * 3x3 risk heatmap. `grid[row][col]` = number of issues,
 * rows = impact (High → Low), cols = likelihood (Low → High).
 */
const SEVERITY = ["#86efac", "#bef264", "#fde047", "#fdba74", "#f87171"];

export function RiskHeatmap({ grid }: { grid: number[][] }) {
  const impact = ["High", "Med", "Low"];
  const likelihood = ["Low", "Medium", "High"];
  return (
    <div>
      <div className="flex gap-2">
        <div className="flex flex-col justify-around text-xs text-muted">
          {impact.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
        <div className="grid flex-1 grid-cols-3 gap-1.5" role="table" aria-label="Risk heatmap">
          {grid.map((row, r) =>
            row.map((n, c) => (
              <div
                key={`${r}-${c}`}
                role="cell"
                aria-label={`Impact ${impact[r]}, likelihood ${likelihood[c]}: ${n} issues`}
                className="flex h-16 items-center justify-center rounded-lg font-bold text-sidebar"
                style={{ background: SEVERITY[2 - r + c] }}
              >
                {n}
              </div>
            )),
          )}
        </div>
      </div>
      <div className="mt-2 ml-9 grid grid-cols-3 text-center text-xs text-muted">
        {likelihood.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
      <p className="mt-1 text-center text-xs text-subtle">Likelihood → · Impact ↑</p>
    </div>
  );
}
