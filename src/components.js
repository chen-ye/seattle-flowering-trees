import { LitElement, html, css } from "https://cdn.jsdelivr.net/npm/lit@3/+esm";
import { COLOR_LABEL, formatSciLabel, COLORS } from "./constants.js";

class AppUI extends LitElement {
  static properties = {
    currentFilter: { type: String },
    clustered: { type: Boolean },
    sources: { type: Array },
    loadedCount: { type: Number },
    failedCount: { type: Number },
    totalCherry: { type: Number },
    totalPrunus: { type: Number },
    features: { type: Array },
    statusHidden: { type: Boolean },
  };

  static styles = css`
    :host {
      display: block;
      pointer-events: none;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10;
    }

    * {
      pointer-events: auto;
    }

    #panel {
      position: absolute;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 255, 255, 0.96);
      border-radius: 12px;
      padding: 12px 18px;
      box-shadow: 0 2px 16px rgba(0, 0, 0, 0.14);
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      width: 90vw;
      max-width: 600px;
    }

    h1 {
      font-size: 15px;
      font-weight: 700;
      color: #2d1a2e;
      letter-spacing: -0.2px;
      margin: 0;
      white-space: nowrap;
    }

    .divider {
      width: 1px;
      height: 20px;
      background: #ddd;
      display: none;
    }

    @media (min-width: 480px) {
      .divider {
        display: block;
      }
      #panel {
        flex-wrap: nowrap;
        width: auto;
        max-width: none;
      }
    }

    .filter-group {
      display: flex;
      gap: 6px;
    }

    .filter-btn {
      padding: 6px 14px;
      border: 1.5px solid #e8b4c8;
      border-radius: 20px;
      background: white;
      cursor: pointer;
      font-size: 13px;
      color: #7a3a55;
      font-weight: 500;
      transition:
        background 0.15s,
        color 0.15s,
        border-color 0.15s;
      line-height: 1;
      white-space: nowrap;
    }

    .filter-btn:hover {
      background: #fff0f5;
    }
    .filter-btn.active {
      background: #e8436a;
      border-color: #e8436a;
      color: white;
    }

    #sources {
      position: absolute;
      top: 100px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
      justify-content: center;
      width: 95vw;
      max-width: 600px;
    }
    @media (min-width: 480px) {
      #sources {
        top: 62px;
        width: auto;
        max-width: 90vw;
      }
    }

    .source-badge {
      padding: 3px 9px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 500;
      color: white;
      opacity: 0.5;
      transition: opacity 0.3s;
      white-space: nowrap;
    }
    .source-badge.loaded {
      opacity: 1;
    }
    .source-badge.error {
      opacity: 0.4;
      text-decoration: line-through;
    }

    #status {
      position: absolute;
      bottom: 36px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 255, 255, 0.93);
      padding: 7px 18px;
      border-radius: 20px;
      font-size: 13px;
      color: #555;
      box-shadow: 0 1px 8px rgba(0, 0, 0, 0.12);
      pointer-events: none;
      transition: opacity 0.8s ease;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      max-width: 80vw;
      text-align: center;
    }
    #status.hidden {
      opacity: 0;
    }

    #legend {
      position: absolute;
      bottom: 80px;
      right: 12px;
      background: rgba(255, 255, 255, 0.93);
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 12px;
      color: #555;
      box-shadow: 0 1px 8px rgba(0, 0, 0, 0.12);
      line-height: 1.8;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      max-height: 40vh;
      overflow-y: auto;
      max-width: 150px;
    }
    @media (min-width: 480px) {
      #legend {
        bottom: 36px;
        max-height: 60vh;
        max-width: none;
      }
    }

    .legend-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .legend-cluster {
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      color: white;
      font-weight: bold;
      flex-shrink: 0;
    }
    .legend-section-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #999;
      margin: 6px 0 2px;
    }
  `;

  constructor() {
    super();
    this.currentFilter = "cherry";
    this.clustered = true;
    this.sources = [];
    this.loadedCount = 0;
    this.failedCount = 0;
    this.totalCherry = 0;
    this.totalPrunus = 0;
    this.features = [];
    this.statusHidden = false;
  }

  handleFilterClick(filter) {
    if (this.currentFilter === filter) return;
    this.currentFilter = filter;
    this.dispatchEvent(
      new CustomEvent("filter-changed", { detail: { filter } }),
    );
  }

  handleClusterToggle() {
    this.clustered = !this.clustered;
    this.dispatchEvent(
      new CustomEvent("cluster-toggled", {
        detail: { clustered: this.clustered },
      }),
    );
  }

  renderLegend() {
    const activeFeatures =
      this.currentFilter === "cherry"
        ? this.features.filter((f) => f.properties._is_cherry)
        : this.features;

    const counts = new Map();
    for (const f of activeFeatures) {
      const p = f.properties;
      const color = p._flower_color || COLORS.single;
      const isUnk = !p._flower_color;
      if (counts.has(color)) {
        counts.get(color).count++;
      } else {
        const label = isUnk
          ? "Other Prunus"
          : COLOR_LABEL[color] || formatSciLabel(p._scientific);
        counts.set(color, { label, color, count: 1, isUnk });
      }
    }

    const species = [...counts.values()]
      .sort((a, b) => a.isUnk - b.isUnk || b.count - a.count)
      .slice(0, 10);

    return html`
      <div id="legend">
        <div class="legend-section-label">Cluster size</div>
        <div class="legend-row">
          <div
            class="legend-cluster"
            style="background:#d63579;width:16px;height:16px"
          >
            50
          </div>
          <span>50–200 trees</span>
        </div>
        <div class="legend-row">
          <div
            class="legend-cluster"
            style="background:#a0195a;width:22px;height:22px"
          >
            200
          </div>
          <span>200+ trees</span>
        </div>
        ${species.length > 0
          ? html`
              <div class="legend-section-label">Flower color</div>
              ${species.map(
                (s) => html`
                  <div class="legend-row">
                    <div
                      class="legend-dot"
                      style="background:${s.color};border:1.5px solid rgba(0,0,0,0.12)"
                    ></div>
                    <span>${s.label}</span>
                  </div>
                `,
              )}
            `
          : ""}
      </div>
    `;
  }

  render() {
    let statusText = "";
    if (this.loadedCount + this.failedCount < this.sources.length) {
      statusText = `Connecting to ${this.sources.length} data sources…`;
      if (this.loadedCount > 0) {
        statusText = `${this.loadedCount + this.failedCount}/${this.sources.length} sources · ${this.totalCherry.toLocaleString()} cherry trees · ${this.totalPrunus.toLocaleString()} Prunus`;
      }
    } else {
      const srcNote =
        this.failedCount > 0
          ? ` (${this.failedCount} source${this.failedCount > 1 ? "s" : ""} unavailable)`
          : "";
      statusText = `${this.totalCherry.toLocaleString()} flowering cherry trees · ${this.totalPrunus.toLocaleString()} total Prunus trees${srcNote}`;
    }

    return html`
      <div>
        <div id="panel">
          <h1>🌸 Seattle Flowering Trees</h1>
          <div class="divider"></div>
          <div class="filter-group" role="group" aria-label="Tree filter">
            <button
              class="filter-btn ${this.currentFilter === "cherry"
                ? "active"
                : ""}"
              @click=${() => this.handleFilterClick("cherry")}
            >
              Flowering Cherry
            </button>
            <button
              class="filter-btn ${this.currentFilter === "all" ? "active" : ""}"
              @click=${() => this.handleFilterClick("all")}
            >
              All Prunus
            </button>
          </div>
          <div class="divider"></div>
          <button
            class="filter-btn ${this.clustered ? "active" : ""}"
            title="Toggle clustering"
            @click=${this.handleClusterToggle}
          >
            Clusters
          </button>
        </div>

        <div id="sources">
          ${this.sources.map(
            (src) => html`
              <div
                class="source-badge ${src.status}"
                style="background: ${src.color}"
              >
                ${src.label}
              </div>
            `,
          )}
        </div>

        <div id="status" class="${this.statusHidden ? "hidden" : ""}">
          ${statusText}
        </div>

        ${this.renderLegend()}
      </div>
    `;
  }
}

customElements.define("app-ui", AppUI);
