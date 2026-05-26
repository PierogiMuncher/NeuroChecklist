app.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  const action = target.dataset.action;
  if (action === "set-status") {
    const stepState = getStepState(target.dataset.step);
    stepState.skipped = false;
    stepState.items[target.dataset.item].status = target.dataset.status;
    render();
  }

  if (action === "set-child-status") {
    const stepState = getStepState(target.dataset.step);
    stepState.skipped = false;
    stepState.children[target.dataset.item].status = target.dataset.status;
    render();
  }

  if (action === "set-grade") {
    const stepState = getStepState("strength");
    stepState.skipped = false;
    const limb = stepState.limbs[target.dataset.limb];
    if (target.dataset.value === "deferred") {
      limb.deferred = true;
    } else {
      limb.deferred = false;
      limb.grade = target.dataset.value;
    }
    render();
  }

  if (action === "set-reflex") {
    const stepState = getStepState("reflexes");
    stepState.skipped = false;
    stepState.dtrs[target.dataset.group][target.dataset.side] = target.dataset.value;
    render();
  }

  if (action === "set-plantar") {
    const stepState = getStepState("reflexes");
    stepState.skipped = false;
    stepState.plantar[target.dataset.side] = target.dataset.value;
    render();
  }

  if (action === "set-clonus") {
    const stepState = getStepState("reflexes");
    stepState.skipped = false;
    stepState.clonus = target.dataset.value;
    render();
  }

  if (action === "back") {
    state.current = Math.max(0, state.current - 1);
    render();
  }

  if (action === "summary-back") {
    state.current = steps.length - 1;
    render();
  }

  if (action === "next") {
    state.current = Math.min(steps.length, state.current + 1);
    render();
  }

  if (action === "skip") {
    markStepDeferred(steps[state.current]);
    state.current = Math.min(steps.length, state.current + 1);
    render();
  }

  if (action === "jump-section") {
    const index = steps.findIndex((step) => step.section === target.dataset.section);
    if (index >= 0) {
      state.current = index;
      render();
    }
  }

  if (action === "reset") {
    if (window.confirm("Start a new exam and clear current findings?")) {
      state = createInitialState();
      saveState();
      render();
    }
  }

  if (action === "copy-summary") {
    copySummary();
  }
});

app.addEventListener("input", (event) => {
  const target = event.target;
  if (!target.matches("[data-role='note']")) return;

  const stepState = getStepState(target.dataset.step);
  stepState.skipped = false;

  if (target.dataset.scope === "child") {
    stepState.children[target.dataset.item].note = target.value;
  } else if (target.dataset.scope === "strength") {
    stepState.limbs[target.dataset.limb].note = target.value;
  } else {
    stepState.items[target.dataset.item].note = target.value;
  }

  saveState();
});
