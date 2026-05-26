function renderSummary() {
  const summary = buildSummary();
  app.innerHTML = `
    ${renderTopbar(steps.length, steps.length)}
    ${renderProgress(100)}
    <section class="summary-panel">
      <header class="summary-head">
        <p class="section-label">Final</p>
        <h1 class="summary-title">Paragraph Summary</h1>
      </header>
      <div class="summary-body">
        <textarea id="summary-output" class="summary-output">${escapeHtml(summary)}</textarea>
        <div class="summary-actions">
          <button class="secondary-button" data-action="summary-back">Back</button>
          <button class="primary-button" data-action="copy-summary">Copy</button>
        </div>
      </div>
    </section>
    <nav class="sticky-actions two" aria-label="Summary navigation">
      <button class="ghost-button" data-action="reset">New Exam</button>
      <button class="primary-button" data-action="copy-summary">Copy Summary</button>
    </nav>
  `;
}

function buildSummary() {
  const sentences = steps.map((step) => summarizeStep(step)).filter(Boolean);
  return `Neurologic exam: ${sentences.join(" ")}`;
}

function summarizeStep(step) {
  const stepState = getStepState(step.id);
  if (stepState.skipped) return step.deferredSummary;
  if (step.type === "strength") return summarizeStrength(step, stepState);
  if (step.type === "reflexes") return summarizeReflexes(step, stepState);
  if (step.type === "gait") return summarizeGait(step, stepState);
  return summarizeGeneric(step, stepState);
}

function summarizeGeneric(step, stepState) {
  const allNormal = step.items.every((finding) => stepState.items[finding.id].status === "normal");
  const childrenNeeded = step.childrenFor && stepState.items[step.childrenFor].status === "abnormal";
  const childrenNormal = !childrenNeeded || step.children.every((finding) => stepState.children[finding.id].status === "normal");
  if (allNormal && childrenNormal && step.normalSummary) return step.normalSummary;

  const fragments = step.items.map((finding) => summarizeFinding(finding, stepState.items[finding.id]));
  if (childrenNeeded) {
    fragments.push(...step.children.map((finding) => summarizeFinding(finding, stepState.children[finding.id])));
  }
  return `${step.title}: ${fragments.join("; ")}.`;
}

function summarizeFinding(finding, findingState) {
  if (findingState.status === "normal") return finding.normal;
  if (findingState.status === "deferred") return finding.deferred;
  const note = cleanNote(findingState.note);
  return note ? `${finding.abnormal} (${note})` : finding.abnormal;
}

function summarizeStrength(step, stepState) {
  const allDeferred = LIMBS.every((limb) => stepState.limbs[limb.id].deferred);
  if (allDeferred) return step.deferredSummary;
  const allNormal = LIMBS.every((limb) => !stepState.limbs[limb.id].deferred && stepState.limbs[limb.id].grade === "5");
  if (allNormal) return "Strength is 5/5 in bilateral upper and lower extremities by MRC grading.";

  const fragments = LIMBS.map((limb) => {
    const limbState = stepState.limbs[limb.id];
    if (limbState.deferred) return `${limb.label} strength deferred`;
    const note = cleanNote(limbState.note);
    return `${limb.label} ${limbState.grade}/5${note ? ` (${note})` : ""}`;
  });
  return `Strength by MRC grading: ${fragments.join(", ")}.`;
}

function summarizeReflexes(step, stepState) {
  const dtrs = REFLEX_GROUPS.flatMap((group) => [stepState.dtrs[group.id].right, stepState.dtrs[group.id].left]);
  const allDeferred =
    dtrs.every((value) => value === "deferred") &&
    stepState.plantar.right === "deferred" &&
    stepState.plantar.left === "deferred" &&
    stepState.clonus === "deferred" &&
    stepState.hyperreflexia.spread === "deferred" &&
    stepState.hyperreflexia.crossed === "deferred";
  if (allDeferred) return step.deferredSummary;

  const allNormal =
    dtrs.every((value) => value === "2+") &&
    stepState.plantar.right === "downgoing" &&
    stepState.plantar.left === "downgoing" &&
    stepState.clonus === "absent" &&
    stepState.hyperreflexia.spread === "absent" &&
    stepState.hyperreflexia.crossed === "absent";
  if (allNormal) {
    return "Deep tendon reflexes are 2+ and symmetric in biceps, brachioradialis, triceps, patellar, and Achilles; plantar responses are downgoing bilaterally; no clonus.";
  }

  const reflexFragments = REFLEX_GROUPS.map((group) => {
    const reflex = stepState.dtrs[group.id];
    return `${group.label} ${summarizeReflexSide("R", reflex, "right")}, ${summarizeReflexSide("L", reflex, "left")}`;
  });
  const plantar = `plantar responses R ${stepState.plantar.right}, L ${stepState.plantar.left}`;
  const clonus = stepState.clonus === "deferred" ? "clonus deferred" : `${stepState.clonus === "absent" ? "no" : "positive"} clonus`;
  const hyperreflexia = `reflex spread ${stepState.hyperreflexia.spread}; crossed adductor responses ${stepState.hyperreflexia.crossed}`;
  return `Deep tendon reflexes: ${reflexFragments.join("; ")}; ${plantar}; ${clonus}; ${hyperreflexia}.`;
}

function summarizeReflexSide(label, reflex, side) {
  const grade = reflex[side];
  const beats = cleanNote(reflex.clonusBeats?.[side]);
  if (grade === "4+" && beats) {
    return `${label} ${grade} (${beats} ${beats === "1" ? "beat" : "beats"} clonus)`;
  }
  return `${label} ${grade}`;
}

function summarizeGait(step, stepState) {
  if (stepState.gait === "deferred" && stepState.romberg === "deferred") return step.deferredSummary;
  const gaitChoice = GAIT_CHOICES.find((choice) => choice.value === stepState.gait) || GAIT_CHOICES[0];
  const note = cleanNote(stepState.note);
  const gait = stepState.gait === "deferred" ? "gait testing deferred" : `${gaitChoice.summary}${note ? ` (${note})` : ""}`;
  const romberg = stepState.romberg === "deferred" ? "Romberg testing deferred" : `Romberg ${stepState.romberg}`;
  if (stepState.gait === "normal" && stepState.romberg === "negative") {
    return "Gait is steady with normal base; Romberg negative.";
  }
  return `Gait and station: ${gait}; ${romberg}.`;
}

async function copySummary() {
  const output = document.querySelector("#summary-output");
  const text = output ? output.value : buildSummary();
  let copied = false;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      copied = true;
    }
  } catch {
    copied = false;
  }

  if (!copied && output) {
    try {
      output.focus();
      output.select();
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
  }

  if (copied) {
    showToast("Copied");
  } else {
    if (output) {
      output.focus();
      output.select();
    }
    showToast("Select + Copy");
  }
}

function showToast(message) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.remove(), 1600);
}

function connectionLabel() {
  if (!connectionState.online) return "Offline";
  if (connectionState.offlineReady) return "Saved";
  if (connectionState.installable) return "Ready";
  return "Online";
}

function watchConnection() {
  window.addEventListener("online", () => {
    connectionState.online = true;
    render();
  });
  window.addEventListener("offline", () => {
    connectionState.online = false;
    render();
  });
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    connectionState.installable = true;
    render();
  });
}

function statusLabel(status) {
  if (status === "normal") return "Normal";
  if (status === "abnormal") return "Abnormal";
  return "Deferred";
}

function cleanNote(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

function capitalize(value) {
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("sw.js")
      .then((registration) => {
        if (registration.active) {
          registration.active.postMessage({ type: "GET_OFFLINE_STATUS" });
        }
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              showToast("Updated");
            }
          });
        });
      })
      .catch(() => {});

    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "OFFLINE_READY") {
        connectionState.offlineReady = true;
        render();
      }
    });
  });
}

state = loadState() || createInitialState();
render();
registerServiceWorker();
watchConnection();
