function renderTopbar(current, total) {
  return `
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">N</div>
        <div class="brand-text">
          <p class="brand-title">Neuro Exam</p>
          <p class="brand-meta">${current} / ${total}</p>
        </div>
      </div>
      <div class="topbar-actions">
        <span class="connection-chip ${connectionState.online ? "online" : "offline"} ${connectionState.offlineReady ? "ready" : ""}">
          ${connectionLabel()}
        </span>
        <button class="icon-button" data-action="reset" aria-label="Reset exam" title="Reset exam">R</button>
      </div>
    </header>
  `;
}

function renderProgress(progress) {
  return `
    <div class="progress-shell">
      <div class="progress-row">
        <span>Stepwise exam</span>
        <span>${progress}%</span>
      </div>
      <div class="progress-track" aria-hidden="true"><div class="progress-fill" style="width:${progress}%"></div></div>
    </div>
  `;
}

function renderSections(activeSection) {
  return `
    <nav class="section-strip" aria-label="Exam sections">
      ${sections
        .map(
          (section) => `
            <button class="section-chip ${section === activeSection ? "is-active" : ""}" data-action="jump-section" data-section="${escapeAttr(section)}">
              ${escapeHtml(section)}
            </button>
          `
        )
        .join("")}
    </nav>
  `;
}

function renderStepBody(step) {
  if (step.type === "strength") return renderStrengthStep(step);
  if (step.type === "reflexes") return renderReflexesStep(step);
  return renderGenericStep(step);
}

function renderGenericStep(step) {
  const stepState = getStepState(step.id);
  return step.items
    .map((finding) => {
      const rendered = renderFinding(step, finding, stepState.items[finding.id]);
      if (step.childrenFor === finding.id && stepState.items[finding.id].status === "abnormal") {
        return `${rendered}<div class="conditional-panel">${step.children
          .map((child) => renderFinding(step, child, stepState.children[child.id], "child"))
          .join("")}</div>`;
      }
      return rendered;
    })
    .join("");
}

function renderFinding(step, finding, findingState, scope = "item") {
  const action = scope === "child" ? "set-child-status" : "set-status";
  const status = findingState.status;
  return `
    <div class="finding-row">
      <div class="finding-head">
        <div>
          <span class="field-label">${escapeHtml(finding.label)}</span>
        </div>
        <span class="status-pill ${escapeAttr(status)}">${statusLabel(status)}</span>
      </div>
      <div class="status-grid">
        ${STATUSES.map(
          (choice) => `
            <button
              class="status-button ${status === choice.value ? "is-active" : ""}"
              data-action="${action}"
              data-step="${escapeAttr(step.id)}"
              data-item="${escapeAttr(finding.id)}"
              data-status="${choice.value}"
              aria-pressed="${status === choice.value}"
            >${choice.label}</button>
          `
        ).join("")}
      </div>
      ${
        status === "abnormal"
          ? `<textarea class="note-input" data-role="note" data-scope="${scope}" data-step="${escapeAttr(step.id)}" data-item="${escapeAttr(finding.id)}" placeholder="Finding">${escapeHtml(findingState.note || "")}</textarea>`
          : ""
      }
    </div>
  `;
}

function renderStrengthStep(step) {
  const stepState = getStepState(step.id);
  return LIMBS.map((limb) => {
    const limbState = stepState.limbs[limb.id];
    const selected = limbState.deferred ? "deferred" : limbState.grade;
    return `
      <div class="metric-row">
        <div class="metric-head">
          <div>
            <span class="field-label">${limb.label}</span>
            <span class="metric-meta">MRC grade</span>
          </div>
          <span class="status-pill ${selected === "5" ? "normal" : selected === "deferred" ? "deferred" : "abnormal"}">
            ${selected === "deferred" ? "Deferred" : `${selected}/5`}
          </span>
        </div>
        <div class="metric-grid">
          ${STRENGTH_GRADES.map(
            (grade) => `
              <button
                class="grade-button ${selected === grade ? "is-active" : ""}"
                data-action="set-grade"
                data-limb="${limb.id}"
                data-value="${grade}"
                aria-pressed="${selected === grade}"
              >${grade === "deferred" ? "D" : grade}</button>
            `
          ).join("")}
        </div>
        ${
          selected !== "5" && selected !== "deferred"
            ? `<textarea class="note-input" data-role="note" data-scope="strength" data-limb="${limb.id}" placeholder="Distribution / muscle groups">${escapeHtml(limbState.note || "")}</textarea>`
            : ""
        }
      </div>
    `;
  }).join("");
}

function renderReflexesStep(step) {
  const stepState = getStepState(step.id);
  return `
    ${REFLEX_GROUPS.map((group) => {
      const reflex = stepState.dtrs[group.id];
      return `
        <div class="reflex-group">
          <div class="metric-head">
            <div>
              <span class="field-label">${escapeHtml(group.label)}</span>
              <span class="metric-meta">${escapeHtml(group.root)}</span>
            </div>
          </div>
          ${renderReflexSide(group, "right", reflex.right)}
          ${renderReflexSide(group, "left", reflex.left)}
        </div>
      `;
    }).join("")}
    <div class="reflex-group">
      <div class="metric-head">
        <div>
          <span class="field-label">Plantar Response</span>
          <span class="metric-meta">Babinski</span>
        </div>
      </div>
      ${renderChoiceSide("plantar", "right", stepState.plantar.right, PLANTAR_CHOICES)}
      ${renderChoiceSide("plantar", "left", stepState.plantar.left, PLANTAR_CHOICES)}
    </div>
    <div class="reflex-group">
      <div class="metric-head">
        <div>
          <span class="field-label">Clonus</span>
        </div>
        <span class="status-pill ${stepState.clonus === "absent" ? "normal" : stepState.clonus === "deferred" ? "deferred" : "abnormal"}">${capitalize(stepState.clonus)}</span>
      </div>
      <div class="choice-buttons">
        ${CLONUS_CHOICES.map(
          (choice) => `
            <button class="grade-button ${stepState.clonus === choice ? "is-active" : ""}" data-action="set-clonus" data-value="${choice}" aria-pressed="${stepState.clonus === choice}">
              ${choice === "deferred" ? "Deferred" : capitalize(choice)}
            </button>
          `
        ).join("")}
      </div>
    </div>
  `;
}

function renderReflexSide(group, side, selected) {
  return `
    <div class="reflex-side">
      <span class="side-label">${side}</span>
      <div class="reflex-buttons">
        ${REFLEX_GRADES.map(
          (grade) => `
            <button
              class="grade-button ${selected === grade ? "is-active" : ""}"
              data-action="set-reflex"
              data-group="${group.id}"
              data-side="${side}"
              data-value="${grade}"
              aria-pressed="${selected === grade}"
            >${grade === "deferred" ? "D" : grade}</button>
          `
        ).join("")}
      </div>
    </div>
  `;
}

function renderChoiceSide(kind, side, selected, choices) {
  return `
    <div class="reflex-side">
      <span class="side-label">${side}</span>
      <div class="choice-buttons">
        ${choices.map(
          (choice) => `
            <button
              class="grade-button ${selected === choice ? "is-active" : ""}"
              data-action="set-${kind}"
              data-side="${side}"
              data-value="${choice}"
              aria-pressed="${selected === choice}"
            >${choice === "deferred" ? "Deferred" : capitalize(choice)}</button>
          `
        ).join("")}
      </div>
    </div>
  `;
}

function markStepDeferred(step) {
  const stepState = getStepState(step.id);
  stepState.skipped = true;
  if (step.type === "strength") {
    for (const limb of LIMBS) {
      stepState.limbs[limb.id].deferred = true;
    }
  } else if (step.type === "reflexes") {
    for (const group of REFLEX_GROUPS) {
      stepState.dtrs[group.id].right = "deferred";
      stepState.dtrs[group.id].left = "deferred";
    }
    stepState.plantar.right = "deferred";
    stepState.plantar.left = "deferred";
    stepState.clonus = "deferred";
  } else {
    for (const finding of step.items) {
      stepState.items[finding.id].status = "deferred";
    }
    for (const finding of step.children || []) {
      stepState.children[finding.id].status = "deferred";
    }
  }
}
