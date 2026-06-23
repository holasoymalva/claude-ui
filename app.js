/**
 * Claude-UI Core Application Controller
 * Handles view routing, chat interface, real-time streaming simulations,
 * artifacts management, and settings connector and schema databases.
 */

// Initial state and databases
let currentView = 'chat';
let currentSettingsTab = 'connectors';
let activeDetailArtifact = null;
let activeDetailTab = 'preview';

// Mock schema registry for components
let componentSchemas = [
  {
    id: 'metric',
    name: 'Metric Card',
    desc: 'Displays a single primary numeric value with a secondary descriptive label and positive/negative trend indicator.',
    schema: `{\n  "label": "string",\n  "value": "string",\n  "trend": "string (optional, e.g. +12% or -4%)"\n}`
  },
  {
    id: 'chart',
    name: 'Interactive Chart',
    desc: 'Renders progress metrics. Can be a bar track with horizontal filling, or a circle segment conic visualization.',
    schema: `{\n  "type": "'bar' | 'pie'",\n  "data": "number (0-100)",\n  "label": "string"\n}`
  },
  {
    id: 'tasktracker',
    name: 'Interactive Task Checklist',
    desc: 'Provides a clean checklist item list where users can tick boxes and see items cross out.',
    schema: `{\n  "tasks": "comma-separated strings (e.g. Task A, Task B, Task C)"\n}`
  }
];

// Mock connectors database matching design mocks (Slide 1/2)
let connectors = [
  { id: 'github', name: 'GitHub Integration', type: 'Web', connected: true },
  { id: 'gmail', name: 'Gmail', type: 'Web', connected: false },
  { id: 'calendar', name: 'Google Calendar', type: 'Web', connected: false },
  { id: 'drive', name: 'Google Drive', type: 'Web', connected: false }
];

// Mock historical artifacts matching design styles (Slide 4/5)
const defaultArtifacts = [
  {
    id: 'art-philosophy',
    title: 'Art, Math & Philosophy Card',
    date: 'Edited 2 weeks ago',
    status: 'Private',
    markup: `[card title="Art, Math & Philosophy"]
[metric label="Aesthetics Index" value="9.8/10" trend="+0.4" /]
[chart type="pie" data="80" label="Core Balance (Art vs Math)" /]
[button label="Explore Deep Concepts" variant="secondary" /]
[/card]`
  },
  {
    id: ' Substacks-essay',
    title: 'Essay Prompt Generator for Substack',
    date: 'Edited 3 weeks ago',
    status: 'Private',
    markup: `[card title="Substack Essay Generator"]
[list]
[listitem text="Topic: The paradox of choice in web interfaces" /]
[listitem text="Audience: Tech workers & designers" /]
[listitem text="Tone: Intellectual, slightly skeptical" /]
[/list]
[button label="Regenerate Prompts" variant="primary" /]
[/card]`
  },
  {
    id: 'content-plan',
    title: 'Educational Content Plan: Phase 1',
    date: 'Edited 2 months ago',
    status: 'Private',
    markup: `[card title="Educational Plan: Phase 1"]
[tasktracker tasks="Define learning outcomes, Build structural templates, Draft lesson transcripts, Code verification suite" /]
[/card]`
  },
  {
    id: 'silent-thinkers',
    title: 'The Duel of Silent Thinkers Dialog',
    date: 'Edited 2 months ago',
    status: 'Private',
    markup: `[card title="Silent Thinkers Metrics"]
[grid columns="2"]
[metric label="Active Participants" value="142" trend="up" /]
[metric label="Avg Silence Duration" value="4.5m" trend="down" /]
[/grid]
[chart type="bar" data="65" label="Agreement Progress Index" /]
[/card]`
  },
  {
    id: 'weather-tokyo',
    title: 'Tokyo Live Climate Forecast',
    date: 'Edited 1 day ago',
    status: 'Private',
    markup: `[card title="Tokyo Weather Forecast"]
[weather city="Tokyo, JP" temp="26" condition="Partly Cloudy" /]
[/card]`
  }
];

// Retrieve or initialize artifacts
function getArtifacts() {
  const stored = localStorage.getItem('claude_ui_artifacts');
  if (!stored) {
    localStorage.setItem('claude_ui_artifacts', JSON.stringify(defaultArtifacts));
    return defaultArtifacts;
  }
  return JSON.parse(stored);
}

function saveArtifacts(artifacts) {
  localStorage.setItem('claude_ui_artifacts', JSON.stringify(artifacts));
}

// Main initialization
document.addEventListener('DOMContentLoaded', () => {
  initRouting();
  initSettings();
  initChat();
  renderArtifactsGrid();
  renderRecentItemsList();
  
  // Close details pane clicking close button or background overlay
  document.querySelector('.detail-close-btn').addEventListener('click', closeDetailsPane);
  
  // Detail pane tab clicks
  document.querySelectorAll('.detail-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      switchDetailTab(e.target.dataset.detailTab);
    });
  });

  // Copy code trigger
  document.querySelector('.code-copy-btn').addEventListener('click', () => {
    const codeContent = document.getElementById('detail-code-content').textContent;
    navigator.clipboard.writeText(codeContent).then(() => {
      const btn = document.querySelector('.code-copy-btn');
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
    });
  });
});

// Switch Main view
function switchView(viewName) {
  currentView = viewName;
  
  // Toggle active view panel
  document.querySelectorAll('.view-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `${viewName}-view`);
  });
  
  // Toggle active menu button
  document.querySelectorAll('.sidebar-menu .menu-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });
  
  // Render updates
  if (viewName === 'artifacts') {
    renderArtifactsGrid();
  }
  
  // Auto-close detail pane on routing if open
  closeDetailsPane();
}

// Router & Side Menu triggers
function initRouting() {
  document.querySelectorAll('.sidebar-menu .menu-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchView(btn.dataset.view);
    });
  });
}

// Connectors & Schema controller
function initSettings() {
  // Tab triggers
  document.querySelectorAll('.settings-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.settingsTab;
      currentSettingsTab = tabName;
      
      document.querySelectorAll('.settings-tab-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.settingsTab === tabName);
      });
      
      document.querySelectorAll('.settings-section').forEach(sect => {
        sect.classList.toggle('active', sect.id === `settings-${tabName}`);
      });
    });
  });
  
  renderConnectorsTable();
  renderSchemasList();
  
  // Schema creation form submit
  const schemaForm = document.getElementById('new-schema-form');
  if (schemaForm) {
    schemaForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('schema-name').value;
      const desc = document.getElementById('schema-desc').value;
      const code = document.getElementById('schema-code').value;
      const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      if (name && desc && code) {
        componentSchemas.push({ id, name, desc, schema: code });
        renderSchemasList();
        schemaForm.reset();
        
        // Notify user
        alert('Component schema successfully registered to standard!');
      }
    });
  }
}

// Render connectors matching Slide 1 & 2 layout
function renderConnectorsTable() {
  const tableBody = document.querySelector('.connectors-table tbody');
  if (!tableBody) return;
  
  tableBody.innerHTML = '';
  
  connectors.forEach(c => {
    const tr = document.createElement('tr');
    
    // Icon mapping
    let iconSvg = '';
    if (c.id === 'github') {
      iconSvg = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>`;
    } else if (c.id === 'gmail') {
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M22 6l-10 7L2 6"/></svg>`;
    } else if (c.id === 'calendar') {
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
    } else {
      iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;
    }
    
    tr.innerHTML = `
      <td>
        <div class="connector-info-cell">
          <div class="connector-icon">${iconSvg}</div>
          <span class="connector-name">${c.name}</span>
        </div>
      </td>
      <td style="color: var(--text-secondary);">${c.type}</td>
      <td>
        ${c.connected ? `
          <span style="color: #10b981; font-weight: 500; display: flex; align-items: center; gap: 0.25rem;">
            <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17L4 12" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Connected
          </span>
        ` : `
          <button class="btn-connect" onclick="connectService('${c.id}')">Connect</button>
        `}
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

// Expose connect method
window.connectService = function(serviceId) {
  const service = connectors.find(c => c.id === serviceId);
  if (service) {
    service.connected = true;
    renderConnectorsTable();
  }
};

// Render schemas list
function renderSchemasList() {
  const container = document.querySelector('.schema-list-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  componentSchemas.forEach(s => {
    const div = document.createElement('div');
    div.className = 'schema-item';
    div.innerHTML = `
      <div class="schema-item-header">
        <span class="schema-item-name">${s.name} <span class="schema-badge">[${s.id}]</span></span>
        <button class="gui-btn gui-btn-secondary" style="font-size: 0.7rem; padding: 0.2rem 0.5rem;" onclick="copySchemaPrompt('${s.id}')">Copy Context</button>
      </div>
      <div class="schema-item-desc">${s.desc}</div>
      <pre class="schema-item-code"><code>${s.schema}</code></pre>
    `;
    container.appendChild(div);
  });
}

// Expose copy context action
window.copySchemaPrompt = function(schemaId) {
  const item = componentSchemas.find(s => s.id === schemaId);
  if (item) {
    const promptContext = `Component: ${item.name}\nTag: [${item.id}]\nDescription: ${item.desc}\nSchema Structure:\n${item.schema}`;
    navigator.clipboard.writeText(promptContext).then(() => {
      alert(`AI System prompt context for ${item.name} copied to clipboard!`);
    });
  }
};

// Render recent generated list on sidebar
function renderRecentItemsList() {
  const listContainer = document.querySelector('.sidebar-recents');
  if (!listContainer) return;
  
  listContainer.innerHTML = '';
  const artifacts = getArtifacts();
  
  // Show last 5
  artifacts.slice(-5).reverse().forEach((art, idx) => {
    const div = document.createElement('div');
    div.className = 'recent-item';
    div.innerHTML = `
      <span class="recent-dot ${idx === 0 ? 'active' : ''}"></span>
      <span style="overflow:hidden; text-overflow:ellipsis;">${art.title}</span>
    `;
    div.addEventListener('click', () => {
      openDetailsPane(art);
    });
    listContainer.appendChild(div);
  });
}

// Render grid in Artifacts section
function renderArtifactsGrid() {
  const grid = document.querySelector('.artifacts-grid');
  if (!grid) return;
  
  grid.innerHTML = '';
  const artifacts = getArtifacts();
  
  // Search filtering
  const query = (document.querySelector('.artifacts-search-input')?.value || '').toLowerCase();
  
  const filtered = artifacts.filter(art => {
    return art.title.toLowerCase().includes(query) || art.markup.toLowerCase().includes(query);
  });
  
  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; padding: 3rem; text-align: center; color: var(--text-muted);">No artifacts found matching "${query}"</div>`;
    return;
  }
  
  filtered.reverse().forEach(art => {
    const card = document.createElement('div');
    card.className = 'artifact-card';
    
    // Clean preview string
    const cleanPreview = art.markup.replace(/[\[\]]/g, ' ').substring(0, 150) + '...';
    
    card.innerHTML = `
      <h3 class="artifact-card-title">${art.title}</h3>
      <div class="artifact-card-preview">${cleanPreview}</div>
      <div class="artifact-card-footer">
        <span>${art.date}</span>
        <span class="artifact-card-status">
          <svg style="width:12px; height:12px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
          ${art.status}
        </span>
      </div>
    `;
    card.addEventListener('click', () => {
      openDetailsPane(art);
    });
    grid.appendChild(card);
  });
}

// Handle real-time filtering in Artifacts gallery
window.filterArtifacts = function() {
  renderArtifactsGrid();
};

// Chat and Simulators
function initChat() {
  const input = document.querySelector('.chat-input-field');
  const sendBtn = document.querySelector('.send-button');
  
  if (!input || !sendBtn) return;
  
  // Auto grow input height
  input.addEventListener('input', () => {
    input.style.height = '48px';
    input.style.height = Math.min(input.scrollHeight, 200) + 'px';
  });
  
  // Trigger Send on button click
  sendBtn.addEventListener('click', () => {
    triggerUserSubmit();
  });
  
  // Trigger Send on Enter key (without shift)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      triggerUserSubmit();
    }
  });
}

// User submit trigger
function triggerUserSubmit() {
  const input = document.querySelector('.chat-input-field');
  const prompt = input.value.trim();
  if (!prompt) return;
  
  // Clear input
  input.value = '';
  input.style.height = '48px';
  
  // Remove welcome screen if exists
  const welcome = document.querySelector('.welcome-screen');
  if (welcome) {
    welcome.style.display = 'none';
  }
  
  // Append User message bubble
  appendChatBubble('user', prompt);
  
  // Simulate Assistant Response & Streaming
  setTimeout(() => {
    simulateUISystemStream(prompt);
  }, 600);
}

// Triggers suggestion card click
window.selectSuggestion = function(title, prompt) {
  const welcome = document.querySelector('.welcome-screen');
  if (welcome) {
    welcome.style.display = 'none';
  }
  appendChatBubble('user', prompt);
  setTimeout(() => {
    simulateUISystemStream(prompt);
  }, 600);
};

const CLAUDE_LOGOMARK = `<svg viewBox="0 0 100 100" width="20" height="20" fill="currentColor" aria-hidden="true">
  <g transform="translate(50,50)">
    <rect x="-6.5" y="-42" width="13" height="26" rx="6.5" transform="rotate(0)"/>
    <rect x="-6.5" y="-42" width="13" height="26" rx="6.5" transform="rotate(45)"/>
    <rect x="-6.5" y="-42" width="13" height="26" rx="6.5" transform="rotate(90)"/>
    <rect x="-6.5" y="-42" width="13" height="26" rx="6.5" transform="rotate(135)"/>
    <rect x="-6.5" y="-42" width="13" height="26" rx="6.5" transform="rotate(180)"/>
    <rect x="-6.5" y="-42" width="13" height="26" rx="6.5" transform="rotate(225)"/>
    <rect x="-6.5" y="-42" width="13" height="26" rx="6.5" transform="rotate(270)"/>
    <rect x="-6.5" y="-42" width="13" height="26" rx="6.5" transform="rotate(315)"/>
  </g>
</svg>`;

// Append message bubble to chat feed
function appendChatBubble(role, content, embeddedMarkup = null) {
  const feed = document.getElementById('chat-messages');
  if (!feed) return;

  const bubble = document.createElement('div');
  bubble.className = `message-bubble ${role}`;

  const isUser = role === 'user';

  if (isUser) {
    bubble.innerHTML = `
      <div class="message-user-pill">
        <div class="message-body"><p>${content}</p></div>
      </div>
    `;
  } else {
    bubble.innerHTML = `
      <div class="message-avatar assistant">${CLAUDE_LOGOMARK}</div>
      <div class="message-content-wrapper">
        <div class="message-body">
          <p>${content}</p>
          ${embeddedMarkup ? `
            <div class="embedded-component-container">
              <div class="embedded-header">
                <span class="embedded-title">
                  <svg style="width: 14px; height: 14px; color: var(--accent-color)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                  Generative UI Card
                  <span class="embedded-badge">GUIM</span>
                </span>
                <span class="embedded-view-btn">View Details</span>
              </div>
              <div class="embedded-body"></div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
  
  feed.appendChild(bubble);
  
  // If we have an embedded component, parse it inside the bubble
  if (embeddedMarkup) {
    const bodyContainer = bubble.querySelector('.embedded-body');
    const compiledNode = window.ClaudeUIParser.parseGUIM(embeddedMarkup);
    bodyContainer.appendChild(compiledNode);
    
    // Store reference to this latest artifact for "View Details" click
    const latestArt = {
      id: 'gen-' + Date.now(),
      title: 'Generative UI Card',
      date: 'Generated just now',
      status: 'Private',
      markup: embeddedMarkup
    };
    
    bubble.querySelector('.embedded-view-btn').onclick = () => {
      openDetailsPane(latestArt);
    };
  }
  
  // Auto scroll to bottom
  feed.scrollTop = feed.scrollHeight;
}

// Simulates the incremental streaming of GUIM tokens
function simulateUISystemStream(prompt) {
  const feed = document.getElementById('chat-messages');
  if (!feed) return;
  
  // Determine appropriate component mockup based on prompt keywords
  let simulatedMarkup = `[card title="Task Progress Summary"]
[grid columns="2"]
[metric label="Tasks Done" value="12/15" trend="+20%" /]
[metric label="Efficiency" value="89%" trend="up" /]
[/grid]
[chart type="bar" data="80" label="Project Completion" /]
[button label="Review Completed Tasks" variant="primary" /]
[/card]`;

  if (prompt.toLowerCase().includes('weather') || prompt.toLowerCase().includes('climate') || prompt.toLowerCase().includes('temp')) {
    simulatedMarkup = `[card title="Live Climate Monitor"]
[weather city="Berlin, DE" temp="19" condition="Rainy showers" /]
[grid columns="2"]
[metric label="Humidity" value="74%" /]
[metric label="Wind" value="18 km/h" /]
[/grid]
[/card]`;
  } else if (prompt.toLowerCase().includes('sales') || prompt.toLowerCase().includes('revenue') || prompt.toLowerCase().includes('financial')) {
    simulatedMarkup = `[card title="Sales & Revenue Report"]
[grid columns="3"]
[metric label="Q3 Revenue" value="$42,850" trend="+15.3%" /]
[metric label="New Customers" value="382" trend="+8%" /]
[metric label="Churn Rate" value="1.2%" trend="down" /]
[/grid]
[chart type="pie" data="70" label="Sales Target Accomplished" /]
[table headers="Quarter, Revenue, Growth" rows="Q1, $32K, +4%; Q2, $37K, +6%; Q3, $42K, +15%" /]
[/card]`;
  }
  
  // Create Assistant streaming placeholder
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble assistant';

  bubble.innerHTML = `
    <div class="message-avatar assistant">${CLAUDE_LOGOMARK}</div>
    <div class="message-content-wrapper">
      <div class="message-body" style="display:flex; flex-direction:column; gap: 0.75rem;">
        <span class="streaming-indicator">
          <span class="streaming-dot"></span>
          <span class="streaming-dot"></span>
          <span class="streaming-dot"></span>
          Streaming Tokens...
        </span>
        <pre class="streaming-code"><code id="streaming-code-target"></code></pre>
        <div id="streaming-live-preview" style="border: 1px dashed var(--accent-color); border-radius: 8px; padding: 1rem; background-color: var(--bg-secondary); min-height: 50px;">
          <div style="font-size: 0.75rem; color: var(--accent-color); margin-bottom: 0.5rem; font-weight: 500;">Live Increment Parser:</div>
          <div class="preview-target"></div>
        </div>
      </div>
    </div>
  `;
  
  feed.appendChild(bubble);
  feed.scrollTop = feed.scrollHeight;
  
  const codeTarget = bubble.querySelector('#streaming-code-target');
  const previewTarget = bubble.querySelector('.preview-target');
  
  let currentLength = 0;
  const speed = 15; // ms per character
  
  function streamStep() {
    if (currentLength < simulatedMarkup.length) {
      // Append chunk of text
      const nextChunk = Math.min(simulatedMarkup.length - currentLength, Math.floor(Math.random() * 4) + 1);
      currentLength += nextChunk;
      const currentText = simulatedMarkup.substring(0, currentLength);
      
      codeTarget.textContent = currentText;
      
      // Real-time incremental rendering
      previewTarget.innerHTML = '';
      const parsedDOM = window.ClaudeUIParser.parseGUIM(currentText);
      previewTarget.appendChild(parsedDOM);
      
      feed.scrollTop = feed.scrollHeight;
      setTimeout(streamStep, speed);
    } else {
      // Finish streaming, replace bubble with final clean message
      bubble.remove();
      
      // Save new artifact to database
      const artifacts = getArtifacts();
      const newId = 'gen-' + Date.now();
      const newArt = {
        id: newId,
        title: prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt,
        date: 'Generated just now',
        status: 'Private',
        markup: simulatedMarkup
      };
      artifacts.push(newArt);
      saveArtifacts(artifacts);
      
      // Re-render recent items sidebar and gallery grid if active
      renderRecentItemsList();
      if (currentView === 'artifacts') {
        renderArtifactsGrid();
      }
      
      // Append final bubble
      appendChatBubble('assistant', 'Here is the Generative UI component compiled from your request:', simulatedMarkup);
    }
  }
  
  setTimeout(streamStep, 200);
}

// Details Sliding sheet controller
function openDetailsPane(artifact) {
  activeDetailArtifact = artifact;
  
  const pane = document.getElementById('artifact-detail-pane');
  pane.classList.add('open');
  
  // Set title
  document.getElementById('detail-title').textContent = artifact.title;
  
  // Auto-switch to preview tab first
  switchDetailTab('preview');
}

function closeDetailsPane() {
  const pane = document.getElementById('artifact-detail-pane');
  pane.classList.remove('open');
  activeDetailArtifact = null;
}

function switchDetailTab(tabName) {
  activeDetailTab = tabName;
  
  // Update tab headers
  document.querySelectorAll('.detail-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.detailTab === tabName);
  });
  
  // Update panels display
  document.querySelectorAll('.detail-tab-content').forEach(panel => {
    panel.classList.toggle('active', panel.id === `detail-tab-${tabName}`);
  });
  
  if (!activeDetailArtifact) return;
  
  const previewPanel = document.getElementById('detail-preview-content');
  const codePanel = document.getElementById('detail-code-content');
  
  if (tabName === 'preview') {
    previewPanel.innerHTML = '';
    const compiled = window.ClaudeUIParser.parseGUIM(activeDetailArtifact.markup);
    previewPanel.appendChild(compiled);
  } else {
    let codeStr = '';
    if (tabName === 'markup') {
      codeStr = activeDetailArtifact.markup;
    } else if (tabName === 'react') {
      codeStr = window.ClaudeUIParser.componentToReact(activeDetailArtifact.markup);
    } else if (tabName === 'html') {
      codeStr = window.ClaudeUIParser.componentToHTML(activeDetailArtifact.markup);
    }
    codePanel.textContent = codeStr;
  }
}
