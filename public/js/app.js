/**
 * Nexus CI/CD — Interactive Command Center Frontend Controller
 */

// State
const state = {
  pipelines: [],
  systemStatus: null,
  metrics: null,
  activeTab: 'pipelines',
  searchTerm: '',
  syncTimer: null,
  secondsSinceSync: 0,
};

// DOM Elements
const elements = {
  // Navigation
  navItems: document.querySelectorAll('.nav-item'),
  tabContents: document.querySelectorAll('.tab-content'),
  pageHeading: document.getElementById('page-heading'),
  
  // Stats
  statContainerStatus: document.getElementById('stat-container-status'),
  statSuccessRate: document.getElementById('stat-success-rate'),
  statUptime: document.getElementById('stat-uptime'),
  statMemory: document.getElementById('stat-memory'),
  statMemorySub: document.getElementById('stat-memory-sub'),
  
  // Active Pipeline Card
  currentBuildBadge: document.getElementById('current-build-badge'),
  currentBuildBranch: document.getElementById('current-build-branch'),
  currentBuildCommit: document.getElementById('current-build-commit'),
  currentBuildMsg: document.getElementById('current-build-msg'),
  currentBuildStatus: document.getElementById('current-build-status'),
  currentBuildStatusText: document.getElementById('current-build-status-text'),
  stagesContainer: document.getElementById('stages-container'),
  activePipesCount: document.getElementById('active-pipes-count'),
  
  // Tables & Filters
  pipelinesTableBody: document.getElementById('pipelines-table-body'),
  pipelineSearch: document.getElementById('pipeline-search'),
  
  // Metrics & Charts
  trafficBars: document.getElementById('traffic-bars'),
  doraFreq: document.getElementById('dora-freq'),
  doraMttr: document.getElementById('dora-mttr'),
  doraDuration: document.getElementById('dora-duration'),
  
  // Container Box
  boxContainerName: document.getElementById('box-container-name'),
  boxImageName: document.getElementById('box-image-name'),
  
  // Terminal
  liveTerminal: document.getElementById('live-terminal'),
  btnCopyLogs: document.getElementById('btn-copy-logs'),
  btnClearLogs: document.getElementById('btn-clear-logs'),
  
  // Modals & Triggers
  btnOpenTriggerModal: document.getElementById('btn-open-trigger-modal'),
  triggerModal: document.getElementById('trigger-modal'),
  btnCloseModal: document.getElementById('btn-close-modal'),
  btnCancelModal: document.getElementById('btn-cancel-modal'),
  triggerForm: document.getElementById('trigger-form'),
  modalBranch: document.getElementById('modal-branch'),
  modalCommitMsg: document.getElementById('modal-commit-msg'),
  
  // Sync
  lastSyncTime: document.getElementById('last-sync-time'),
  refreshIcon: document.getElementById('refresh-icon'),
  toastContainer: document.getElementById('toast-container'),
};

// Initial Setup
document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  initNavigation();
  initModals();
  initSearch();
  initTerminalActions();
  
  // Initial data fetch
  fetchAllData();
  
  // Real-time polling every 3 seconds
  setInterval(fetchAllData, 3000);
  
  // Second counter for sync display
  setInterval(() => {
    state.secondsSinceSync++;
    elements.lastSyncTime.textContent = `Synced ${state.secondsSinceSync}s ago`;
  }, 1000);
});

function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Tab Navigation
function initNavigation() {
  const headings = {
    pipelines: 'Pipeline Operations',
    metrics: 'Telemetry & DORA Metrics',
    containers: 'Docker Container Runtime',
    logs: 'Live Build & Deployment Stream',
    infra: 'Cloud Architecture & Topology',
  };

  elements.navItems.forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.getAttribute('data-tab');
      
      elements.navItems.forEach((n) => n.classList.remove('active'));
      elements.tabContents.forEach((c) => c.classList.remove('active'));
      
      item.classList.add('active');
      const targetContent = document.getElementById(`tab-${tab}`);
      if (targetContent) targetContent.classList.add('active');
      
      if (headings[tab]) elements.pageHeading.textContent = headings[tab];
      state.activeTab = tab;
      
      initIcons();
    });
  });
}

// Modals
function initModals() {
  elements.btnOpenTriggerModal.addEventListener('click', () => {
    elements.triggerModal.classList.add('open');
  });

  const closeModal = () => elements.triggerModal.classList.remove('open');
  elements.btnCloseModal.addEventListener('click', closeModal);
  elements.btnCancelModal.addEventListener('click', closeModal);

  elements.triggerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const branch = elements.modalBranch.value;
    const commitMsg = elements.modalCommitMsg.value;
    
    closeModal();
    showToast(`Triggering pipeline build on ${branch}...`);

    try {
      const res = await fetch('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch, commitMsg }),
      });
      
      if (res.ok) {
        showToast('Pipeline launched successfully! Watching live execution...');
        await fetchAllData();
      }
    } catch (err) {
      console.error('Trigger build failed', err);
      showToast('Failed to trigger pipeline', true);
    }
  });
}

// Search
function initSearch() {
  elements.pipelineSearch.addEventListener('input', (e) => {
    state.searchTerm = e.target.value.toLowerCase();
    renderPipelinesTable();
  });
}

// Terminal Actions
function initTerminalActions() {
  elements.btnCopyLogs.addEventListener('click', () => {
    if (elements.liveTerminal) {
      navigator.clipboard.writeText(elements.liveTerminal.innerText);
      showToast('Console logs copied to clipboard!');
    }
  });

  elements.btnClearLogs.addEventListener('click', () => {
    if (elements.liveTerminal) {
      elements.liveTerminal.innerHTML = '<div class="log-line system">[Console cleared]</div>';
    }
  });
}

// Fetch all Backend Telemetry
async function fetchAllData() {
  try {
    const [statusRes, pipesRes, metricsRes] = await Promise.all([
      fetch('/api/status').then((r) => r.json()),
      fetch('/api/pipelines').then((r) => r.json()),
      fetch('/api/metrics').then((r) => r.json()),
    ]);

    state.systemStatus = statusRes;
    state.pipelines = pipesRes;
    state.metrics = metricsRes;
    state.secondsSinceSync = 0;

    renderSystemStatus();
    renderActivePipeline();
    renderPipelinesTable();
    renderMetrics();
    renderTerminalLogs();
    
    initIcons();
  } catch (err) {
    console.error('Telemetry fetch error:', err);
  }
}

// Render System Stats
function renderSystemStatus() {
  const s = state.systemStatus;
  if (!s) return;

  elements.statContainerStatus.textContent = s.containerName || 'nestjs-app';
  elements.statUptime.textContent = s.formattedUptime || '0m';
  elements.statMemory.textContent = `${s.memory.usedMB} MB`;
  elements.statMemorySub.textContent = `${s.memory.usagePercent}% of host memory`;
  
  if (elements.boxContainerName) elements.boxContainerName.textContent = s.containerName;
  if (elements.boxImageName) elements.boxImageName.textContent = `${s.dockerImage}:latest`;
}

// Render Active Pipeline Visualizer
function renderActivePipeline() {
  if (!state.pipelines || state.pipelines.length === 0) return;
  const latest = state.pipelines[0];

  elements.currentBuildBadge.textContent = `BUILD #${latest.buildNumber}`;
  elements.currentBuildBranch.textContent = latest.branch;
  elements.currentBuildCommit.textContent = latest.commitHash;
  elements.currentBuildMsg.textContent = latest.commitMessage;

  // Status Badge
  elements.currentBuildStatusText.textContent = latest.status;
  elements.currentBuildStatus.className = `pipeline-status-badge ${latest.status}`;

  // Running count badge in sidebar
  const runningCount = state.pipelines.filter((p) => p.status === 'RUNNING').length;
  elements.activePipesCount.textContent = runningCount || state.pipelines.length;

  // Render Stages Flow
  elements.stagesContainer.innerHTML = '';
  latest.stages.forEach((stage, idx) => {
    const stageEl = document.createElement('div');
    stageEl.className = `stage-item ${stage.status}`;

    let iconName = 'check-circle';
    if (stage.status === 'RUNNING') iconName = 'loader-2';
    if (stage.status === 'PENDING') iconName = 'clock';
    if (stage.status === 'FAILED') iconName = 'alert-triangle';

    stageEl.innerHTML = `
      <div class="stage-top">
        <span class="stage-name">${idx + 1}. ${stage.name}</span>
        <i data-lucide="${iconName}" class="stage-icon"></i>
      </div>
      <span class="stage-time">${stage.duration}</span>
    `;

    elements.stagesContainer.appendChild(stageEl);

    // Connector arrow if not last stage
    if (idx < latest.stages.length - 1) {
      const arrow = document.createElement('div');
      arrow.className = 'stage-connector';
      arrow.innerHTML = '<i data-lucide="chevron-right"></i>';
      elements.stagesContainer.appendChild(arrow);
    }
  });
}

// Render Table
function renderPipelinesTable() {
  if (!state.pipelines) return;

  const filtered = state.pipelines.filter((p) => {
    return (
      p.branch.toLowerCase().includes(state.searchTerm) ||
      p.commitHash.toLowerCase().includes(state.searchTerm) ||
      p.commitMessage.toLowerCase().includes(state.searchTerm)
    );
  });

  elements.pipelinesTableBody.innerHTML = filtered
    .map((p) => {
      const badgeClass = p.status === 'SUCCESS' ? 'badge success' : p.status === 'RUNNING' ? 'badge running' : 'badge';
      return `
      <tr>
        <td><strong>#${p.buildNumber}</strong></td>
        <td><span class="${badgeClass}">${p.status}</span></td>
        <td>
          <div style="display: flex; flex-direction: column;">
            <span style="font-weight: 600;">${escapeHtml(p.branch)}</span>
            <span style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">${p.commitHash} &bull; ${escapeHtml(p.commitMessage.substring(0, 36))}...</span>
          </div>
        </td>
        <td><span style="font-family: var(--font-mono);">${p.duration}</span></td>
        <td>${p.author}</td>
        <td style="color: var(--text-muted); font-size: 0.8rem;">${new Date(p.startedAt).toLocaleTimeString()}</td>
        <td class="text-right">
          <button class="btn-icon-small" title="Re-run Build" onclick="triggerRerun('${p.branch}', 'rerun build #${p.buildNumber}')">
            <i data-lucide="rotate-cw"></i>
          </button>
        </td>
      </tr>
    `;
    })
    .join('');
}

// Render Metrics & Bar Chart
function renderMetrics() {
  const m = state.metrics;
  if (!m) return;

  elements.statSuccessRate.textContent = m.successRate;
  if (elements.doraFreq) elements.doraFreq.textContent = m.deploymentFrequency;
  if (elements.doraMttr) elements.doraMttr.textContent = m.mttr;
  if (elements.doraDuration) elements.doraDuration.textContent = m.avgBuildDuration;

  // Render Traffic Bar Chart
  if (elements.trafficBars && m.recentTraffic) {
    const maxReq = Math.max(...m.recentTraffic.map((t) => t.requests));
    elements.trafficBars.innerHTML = m.recentTraffic
      .map((t) => {
        const heightPercent = Math.round((t.requests / maxReq) * 100);
        return `
        <div class="chart-bar-item">
          <div class="bar-pill" style="height: ${heightPercent}%;" title="${t.requests} reqs (${t.latencyMs}ms)"></div>
          <span class="bar-label">${t.time}</span>
        </div>
      `;
      })
      .join('');
  }
}

// Render Logs in Terminal
function renderTerminalLogs() {
  if (!elements.liveTerminal || !state.pipelines || state.pipelines.length === 0) return;
  const latest = state.pipelines[0];
  if (!latest.logs) return;

  elements.liveTerminal.innerHTML = latest.logs
    .map((log) => {
      let cssClass = 'info';
      if (log.includes('SUCCESS') || log.includes('passed') || log.includes('successfully')) cssClass = 'success';
      if (log.includes('Jenkins') || log.includes('Agent')) cssClass = 'system';
      if (log.includes('warning') || log.includes('retry')) cssClass = 'warn';

      return `<div class="log-line ${cssClass}">${escapeHtml(log)}</div>`;
    })
    .join('');

  // Auto-scroll to bottom of terminal
  elements.liveTerminal.scrollTop = elements.liveTerminal.scrollHeight;
}

// Trigger Rerun Global Helper
window.triggerRerun = async function (branch, msg) {
  showToast(`Restarting build on ${branch}...`);
  try {
    await fetch('/api/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branch, commitMsg: msg }),
    });
    await fetchAllData();
  } catch (err) {
    console.error(err);
  }
};

// Toast Notifications
function showToast(message, isError = false) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <i data-lucide="${isError ? 'alert-circle' : 'check-circle'}" style="color: ${isError ? '#ef4444' : '#10b981'}"></i>
    <span>${message}</span>
  `;
  elements.toastContainer.appendChild(toast);
  initIcons();

  setTimeout(() => {
    toast.remove();
  }, 4000);
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
