/**
 * Claude-UI Generative UI Markup (GUIM) Parser
 * A streaming-safe, lightweight markup language parser for rendering components.
 */

// Helper to parse key-value attributes from tag body
function parseAttributes(attrString) {
  const attrs = {};
  if (!attrString) return attrs;
  
  // Regex to match attributes: key="value", key='value', or key=value
  const attrRegex = /([a-zA-Z0-9-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s/>]+))/g;
  let match;
  while ((match = attrRegex.exec(attrString)) !== null) {
    const key = match[1].toLowerCase();
    const value = match[2] || match[3] || match[4] || '';
    attrs[key] = value;
  }
  return attrs;
}

// Render individual component to DOM element
function renderComponent(tagName, attrs) {
  switch (tagName) {
    case 'card': {
      const card = document.createElement('div');
      card.className = 'gui-card';
      if (attrs.width === 'full') card.style.gridColumn = '1 / -1';
      
      if (attrs.title) {
        const header = document.createElement('div');
        header.className = 'gui-card-header';
        
        const titleSpan = document.createElement('span');
        titleSpan.className = 'gui-card-title';
        titleSpan.textContent = attrs.title;
        header.appendChild(titleSpan);
        
        card.appendChild(header);
      }
      return card;
    }
    
    case 'metric': {
      const metric = document.createElement('div');
      metric.className = 'gui-metric';
      
      const label = document.createElement('div');
      label.className = 'gui-metric-label';
      label.textContent = attrs.label || 'Metric';
      metric.appendChild(label);
      
      const value = document.createElement('div');
      value.className = 'gui-metric-value';
      value.textContent = attrs.value || '0';
      metric.appendChild(value);
      
      if (attrs.trend) {
        const trend = document.createElement('span');
        const isUp = attrs.trend.startsWith('+') || attrs.trend.toLowerCase() === 'up';
        trend.className = `gui-metric-trend ${isUp ? 'up' : 'down'}`;
        trend.textContent = attrs.trend;
        metric.appendChild(trend);
      }
      return metric;
    }
    
    case 'chart': {
      const container = document.createElement('div');
      container.className = 'gui-chart-container';
      
      if (attrs.label) {
        const label = document.createElement('div');
        label.className = 'gui-chart-label';
        label.textContent = attrs.label;
        container.appendChild(label);
      }
      
      const type = attrs.type || 'bar';
      const rawData = attrs.data || '50';
      
      if (type === 'bar') {
        const track = document.createElement('div');
        track.className = 'gui-chart-bar-track';
        
        const fill = document.createElement('div');
        fill.className = 'gui-chart-bar-fill';
        fill.style.width = '0%'; // Start at 0 for animation trigger
        track.appendChild(fill);
        container.appendChild(track);
        
        // Trigger reflow & animate fill
        setTimeout(() => {
          fill.style.width = `${parseFloat(rawData)}%`;
        }, 50);
      } else if (type === 'pie') {
        const pie = document.createElement('div');
        pie.className = 'gui-chart-pie';
        
        const pct = parseFloat(rawData) || 50;
        // Beautiful conic gradient following design styles
        pie.style.background = `conic-gradient(var(--accent-color) 0% ${pct}%, var(--bg-primary) ${pct}% 100%)`;
        container.appendChild(pie);
      }
      
      return container;
    }
    
    case 'grid': {
      const grid = document.createElement('div');
      grid.className = 'gui-grid';
      const cols = parseInt(attrs.columns) || 2;
      grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
      
      // Responsive fallback
      if (window.innerWidth < 600) {
        grid.style.gridTemplateColumns = '1fr';
      }
      return grid;
    }
    
    case 'button': {
      const btn = document.createElement('button');
      const variant = attrs.variant || 'primary';
      btn.className = `gui-btn gui-btn-${variant}`;
      btn.textContent = attrs.label || 'Action';
      if (attrs.onclick) {
        btn.setAttribute('onclick', attrs.onclick);
      }
      return btn;
    }
    
    case 'list': {
      const list = document.createElement('div');
      list.style.display = 'flex';
      list.style.flexDirection = 'column';
      list.style.gap = '0.5rem';
      list.style.width = '100%';
      return list;
    }
    
    case 'listitem': {
      const item = document.createElement('div');
      item.style.padding = '0.5rem 0.75rem';
      item.style.backgroundColor = 'var(--bg-secondary)';
      item.style.border = '1px solid var(--border-color)';
      item.style.borderRadius = '6px';
      item.style.fontSize = '0.85rem';
      item.textContent = attrs.text || '';
      return item;
    }
    
    case 'table': {
      const table = document.createElement('table');
      table.className = 'gui-table';
      
      // Header
      if (attrs.headers) {
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        attrs.headers.split(',').forEach(h => {
          const th = document.createElement('th');
          th.textContent = h.trim();
          tr.appendChild(th);
        });
        thead.appendChild(tr);
        table.appendChild(thead);
      }
      
      // Rows
      if (attrs.rows) {
        const tbody = document.createElement('tbody');
        attrs.rows.split(';').forEach(row => {
          const tr = document.createElement('tr');
          row.split(',').forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell.trim();
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });
        table.appendChild(tbody);
      }
      
      return table;
    }
    
    case 'tasktracker': {
      const tracker = document.createElement('div');
      tracker.className = 'gui-task-tracker';
      
      const tasks = attrs.tasks ? attrs.tasks.split(',') : ['Task 1', 'Task 2'];
      tasks.forEach((task, idx) => {
        const item = document.createElement('div');
        item.className = 'gui-task-item';
        
        const checkbox = document.createElement('div');
        checkbox.className = 'gui-task-checkbox';
        checkbox.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 6L9 17L4 12" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        
        const label = document.createElement('span');
        label.className = 'gui-task-text';
        label.textContent = task.trim();
        
        item.appendChild(checkbox);
        item.appendChild(label);
        
        item.addEventListener('click', () => {
          const isChecked = checkbox.classList.toggle('checked');
          label.classList.toggle('checked', isChecked);
        });
        
        tracker.appendChild(item);
      });
      
      return tracker;
    }
    
    case 'weather': {
      const card = document.createElement('div');
      card.className = 'gui-weather-card';
      
      const details = document.createElement('div');
      details.className = 'gui-weather-details';
      
      const city = document.createElement('div');
      city.className = 'gui-weather-city';
      city.textContent = attrs.city || 'Location';
      details.appendChild(city);
      
      const cond = document.createElement('div');
      cond.className = 'gui-weather-condition';
      cond.textContent = attrs.condition || 'Clear Sky';
      details.appendChild(cond);
      
      card.appendChild(details);
      
      const tempGroup = document.createElement('div');
      tempGroup.className = 'gui-weather-temp-group';
      
      const temp = document.createElement('span');
      temp.className = 'gui-weather-temp';
      temp.textContent = attrs.temp || '20';
      tempGroup.appendChild(temp);
      
      const unit = document.createElement('span');
      unit.className = 'gui-weather-unit';
      unit.textContent = '°C';
      tempGroup.appendChild(unit);
      
      card.appendChild(tempGroup);
      
      return card;
    }
    
    default:
      return null;
  }
}

/**
 * Main parser entry point. Compiles GUIM text to live DOM elements.
 */
function parseGUIM(markup) {
  const container = document.createElement('div');
  container.className = 'gui-rendered-wrapper scroller';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '1.25rem';
  container.style.width = '100%';

  const tagRegex = /\[(\/?[a-zA-Z]+)([^\]]*?)\]/g;
  let lastIndex = 0;
  let match;

  const stack = [container];

  while ((match = tagRegex.exec(markup)) !== null) {
    const textBetween = markup.substring(lastIndex, match.index).trim();
    if (textBetween && stack.length > 0) {
      const currentParent = stack[stack.length - 1];
      if (currentParent !== container) {
        const textSpan = document.createElement('span');
        textSpan.textContent = textBetween;
        currentParent.appendChild(textSpan);
      }
    }

    const fullTag = match[0];
    const tagNameRaw = match[1];
    const attrString = match[2];
    lastIndex = tagRegex.lastIndex;

    if (tagNameRaw.startsWith('/')) {
      const tagName = tagNameRaw.substring(1).toLowerCase();
      for (let i = stack.length - 1; i > 0; i--) {
        if (stack[i].dataset.tagType === tagName) {
          stack.splice(i);
          break;
        }
      }
    } else {
      const tagName = tagNameRaw.toLowerCase();
      const isSelfClosing = attrString.endsWith('/') || fullTag.endsWith('/]');
      const cleanAttrs = parseAttributes(attrString);

      const element = renderComponent(tagName, cleanAttrs);
      if (element) {
        element.dataset.tagType = tagName;
        const currentParent = stack[stack.length - 1];
        currentParent.appendChild(element);

        if (!isSelfClosing) {
          stack.push(element);
        }
      }
    }
  }

  const remainingText = markup.substring(lastIndex).trim();
  if (remainingText && stack.length > 0) {
    const currentParent = stack[stack.length - 1];
    if (currentParent !== container) {
      const textSpan = document.createElement('span');
      textSpan.textContent = remainingText;
      currentParent.appendChild(textSpan);
    }
  }

  return container;
}

/**
 * Transpiles GUIM to standard clean HTML/CSS string.
 */
function componentToHTML(markup) {
  // Convert BBCode-like markup to semantic HTML tags
  let html = markup
    .replace(/\[card\s*title="([^"]*)"[^\]]*\]/gi, '<div class="gui-card">\n  <div class="gui-card-header">\n    <span class="gui-card-title">$1</span>\n  </div>\n  <div class="gui-card-body">')
    .replace(/\[\/card\]/gi, '\n  </div>\n</div>')
    .replace(/\[grid\s*columns="([^"]*)"[^\]]*\]/gi, '<div class="gui-grid" style="grid-template-columns: repeat($1, 1fr);">')
    .replace(/\[\/grid\]/gi, '</div>')
    .replace(/\[metric\s*label="([^"]*)"\s*value="([^"]*)"\s*trend="([^"]*)"\s*\/\]/gi, '<div class="gui-metric">\n  <div class="gui-metric-label">$1</div>\n  <div class="gui-metric-value">$2</div>\n  <span class="gui-metric-trend">$3</span>\n</div>')
    .replace(/\[metric\s*label="([^"]*)"\s*value="([^"]*)"\s*\/\]/gi, '<div class="gui-metric">\n  <div class="gui-metric-label">$1</div>\n  <div class="gui-metric-value">$2</div>\n</div>')
    .replace(/\[chart\s*type="bar"\s*data="([^"]*)"\s*label="([^"]*)"\s*\/\]/gi, '<div class="gui-chart-container">\n  <div class="gui-chart-label">$2</div>\n  <div class="gui-chart-bar-track">\n    <div class="gui-chart-bar-fill" style="width: $1%;"></div>\n  </div>\n</div>')
    .replace(/\[chart\s*type="pie"\s*data="([^"]*)"\s*label="([^"]*)"\s*\/\]/gi, '<div class="gui-chart-container">\n  <div class="gui-chart-label">$2</div>\n  <div class="gui-chart-pie" style="background: conic-gradient(var(--accent-color) 0% $1%, var(--bg-primary) $1% 100%)"></div>\n</div>')
    .replace(/\[button\s*label="([^"]*)"\s*variant="([^"]*)"\s*\/\]/gi, '<button class="gui-btn gui-btn-$2">$1</button>')
    .replace(/\[list\]/gi, '<div class="gui-list">')
    .replace(/\[\/list\]/gi, '</div>')
    .replace(/\[listitem\s*text="([^"]*)"\s*\/\]/gi, '<div class="gui-list-item">$1</div>')
    .replace(/\[weather\s*city="([^"]*)"\s*temp="([^"]*)"\s*condition="([^"]*)"\s*\/\]/gi, '<div class="gui-weather-card">\n  <div class="gui-weather-details">\n    <div class="gui-weather-city">$1</div>\n    <div class="gui-weather-condition">$3</div>\n  </div>\n  <div class="gui-weather-temp-group">\n    <span class="gui-weather-temp">$2</span>\n    <span class="gui-weather-unit">°C</span>\n  </div>\n</div>');

  return html;
}

/**
 * Transpiles GUIM to standard React functional component string.
 */
function componentToReact(markup) {
  let reactStr = `import React from 'react';\nimport './styles.css';\n\nexport default function GeneratedComponent() {\n  return (\n    <div className="gui-rendered-wrapper">\n`;
  
  // Simplify tags conversion for preview
  let body = markup
    .replace(/\[card\s*title="([^"]*)"[^\]]*\]/gi, '      <Card title="$1">\n')
    .replace(/\[\/card\]/gi, '      </Card>\n')
    .replace(/\[grid\s*columns="([^"]*)"[^\]]*\]/gi, '        <Grid columns={$1}>\n')
    .replace(/\[\/grid\]/gi, '        </Grid>\n')
    .replace(/\[metric\s*label="([^"]*)"\s*value="([^"]*)"\s*trend="([^"]*)"\s*\/\]/gi, '          <Metric label="$1" value="$2" trend="$3" />\n')
    .replace(/\[metric\s*label="([^"]*)"\s*value="([^"]*)"\s*\/\]/gi, '          <Metric label="$1" value="$2" />\n')
    .replace(/\[chart\s*type="bar"\s*data="([^"]*)"\s*label="([^"]*)"\s*\/\]/gi, '          <Chart type="bar" data={$1} label="$2" />\n')
    .replace(/\[chart\s*type="pie"\s*data="([^"]*)"\s*label="([^"]*)"\s*\/\]/gi, '          <Chart type="pie" data={$1} label="$2" />\n')
    .replace(/\[button\s*label="([^"]*)"\s*variant="([^"]*)"\s*\/\]/gi, '          <Button label="$1" variant="$2" />\n')
    .replace(/\[list\]/gi, '          <List>\n')
    .replace(/\[\/list\]/gi, '          </List>\n')
    .replace(/\[listitem\s*text="([^"]*)"\s*\/\]/gi, '            <ListItem text="$1" />\n')
    .replace(/\[weather\s*city="([^"]*)"\s*temp="([^"]*)"\s*condition="([^"]*)"\s*\/\]/gi, '          <Weather city="$1" temp={$2} condition="$3" />\n');

  reactStr += body.split('\n').map(line => line ? '  ' + line : line).join('\n');
  reactStr += `    </div>\n  );\n}`;
  return reactStr;
}

// Export functions to window scope or module for testing
if (typeof window !== 'undefined') {
  window.ClaudeUIParser = {
    parseGUIM,
    componentToHTML,
    componentToReact
  };
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseAttributes,
    renderComponent,
    parseGUIM,
    componentToHTML,
    componentToReact
  };
}
