function createInitialState() {
  const findings = {};
  for (const step of steps) {
    if (step.type === "strength") {
      findings[step.id] = {
        skipped: false,
        limbs: Object.fromEntries(LIMBS.map((limb) => [limb.id, { grade: "5", deferred: false, note: "" }]))
      };
      continue;
    }

    if (step.type === "reflexes") {
      findings[step.id] = {
        skipped: false,
        dtrs: Object.fromEntries(
          REFLEX_GROUPS.map((group) => [
            group.id,
            { right: "2+", left: "2+", clonusBeats: { right: "", left: "" } }
          ])
        ),
        plantar: { right: "downgoing", left: "downgoing" },
        clonus: "absent",
        hyperreflexia: { spread: "absent", crossed: "absent" }
      };
      continue;
    }

    if (step.type === "gait") {
      findings[step.id] = {
        skipped: false,
        gait: "normal",
        romberg: "negative",
        note: ""
      };
      continue;
    }

    findings[step.id] = {
      skipped: false,
      items: Object.fromEntries(
        step.items.map((finding) => [
          finding.id,
          { status: finding.defaultStatus || "normal", note: "" }
        ])
      ),
      children: Object.fromEntries(
        (step.children || []).map((finding) => [
          finding.id,
          { status: finding.defaultStatus || "normal", note: "" }
        ])
      )
    };
  }
  return { version: 1, current: 0, findings };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.version !== 1 || !parsed.findings) return null;
    const fresh = createInitialState();
    return mergeState(fresh, parsed);
  } catch {
    return null;
  }
}

function mergeState(fresh, saved) {
  fresh.current = Math.min(Number(saved.current) || 0, steps.length);
  for (const step of steps) {
    const savedStep = saved.findings?.[step.id];
    if (!savedStep) continue;
    if (step.type === "strength") {
      fresh.findings[step.id].skipped = Boolean(savedStep.skipped);
      for (const limb of LIMBS) {
        fresh.findings[step.id].limbs[limb.id] = {
          ...fresh.findings[step.id].limbs[limb.id],
          ...savedStep.limbs?.[limb.id]
        };
      }
    } else if (step.type === "reflexes") {
      fresh.findings[step.id].skipped = Boolean(savedStep.skipped);
      for (const group of REFLEX_GROUPS) {
        fresh.findings[step.id].dtrs[group.id] = {
          ...fresh.findings[step.id].dtrs[group.id],
          ...savedStep.dtrs?.[group.id],
          clonusBeats: {
            ...fresh.findings[step.id].dtrs[group.id].clonusBeats,
            ...savedStep.dtrs?.[group.id]?.clonusBeats
          }
        };
      }
      fresh.findings[step.id].plantar = {
        ...fresh.findings[step.id].plantar,
        ...savedStep.plantar
      };
      fresh.findings[step.id].clonus = savedStep.clonus || fresh.findings[step.id].clonus;
      fresh.findings[step.id].hyperreflexia = {
        ...fresh.findings[step.id].hyperreflexia,
        ...savedStep.hyperreflexia
      };
    } else if (step.type === "gait") {
      fresh.findings[step.id] = {
        ...fresh.findings[step.id],
        ...savedStep
      };
    } else {
      fresh.findings[step.id].skipped = Boolean(savedStep.skipped);
      for (const finding of step.items) {
        fresh.findings[step.id].items[finding.id] = {
          ...fresh.findings[step.id].items[finding.id],
          ...savedStep.items?.[finding.id]
        };
      }
      for (const finding of step.children || []) {
        fresh.findings[step.id].children[finding.id] = {
          ...fresh.findings[step.id].children[finding.id],
          ...savedStep.children?.[finding.id]
        };
      }
    }
  }
  return fresh;
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage can be unavailable in some private browsing contexts.
  }
}

function getStepState(stepId) {
  return state.findings[stepId];
}

function render() {
  saveState();
  if (state.current >= steps.length) {
    renderSummary();
  } else {
    renderStep();
  }
}

function renderStep() {
  const step = steps[state.current];
  const progress = Math.round(((state.current + 1) / steps.length) * 100);
  app.innerHTML = `
    ${renderTopbar(state.current + 1, steps.length)}
    ${renderProgress(progress)}
    ${renderSections(step.section)}
    <section class="step-panel">
      <header class="step-head">
        <p class="section-label">${escapeHtml(step.section)}${step.meta ? ` - ${escapeHtml(step.meta)}` : ""}</p>
        <h1 class="step-title">${escapeHtml(step.title)}</h1>
      </header>
      <div class="step-body">
        ${renderStepBody(step)}
      </div>
    </section>
    <nav class="sticky-actions" aria-label="Exam navigation">
      <button class="ghost-button" data-action="back" ${state.current === 0 ? "disabled" : ""}>Back</button>
      <button class="secondary-button" data-action="skip">Skip</button>
      <button class="primary-button" data-action="next">${state.current === steps.length - 1 ? "Summary" : "Next"}</button>
    </nav>
  `;
}
