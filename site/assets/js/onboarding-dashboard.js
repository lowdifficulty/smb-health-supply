(function () {
  if (!window.CHECKLIST || !window.OnboardingAuth) return;

  var completedItems = {};
  var saveTimer = null;
  var user = null;

  var els = {
    userName: document.getElementById("user-name"),
    userOrg: document.getElementById("user-org"),
    roleBadge: document.getElementById("role-badge"),
    dashboardSubtitle: document.getElementById("dashboard-subtitle"),
    overallPercent: document.getElementById("overall-percent"),
    overallBar: document.getElementById("overall-bar"),
    statusBadge: document.getElementById("status-badge"),
    tasksSummary: document.getElementById("tasks-summary"),
    nextStepCard: document.getElementById("next-step-card"),
    nextStepText: document.getElementById("next-step-text"),
    nextStepCategory: document.getElementById("next-step-category"),
    searchInput: document.getElementById("checklist-search"),
    categoriesRoot: document.getElementById("categories-root"),
    resetBtn: document.getElementById("reset-progress-btn"),
    printBtn: document.getElementById("print-checklist-btn"),
    saveStatus: document.getElementById("save-status")
  };

  function setSaveStatus(text) {
    if (els.saveStatus) els.saveStatus.textContent = text;
  }

  function scheduleSaveStatus() {
    setSaveStatus("Saving…");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      setSaveStatus("All changes saved");
    }, 500);
  }

  function render() {
    var overall = CHECKLIST.calculateOverallCompletion(completedItems);
    var total = CHECKLIST.getTotalCount();
    var doneCount = CHECKLIST.getAllItems().filter(function (entry) {
      return completedItems[entry.id];
    }).length;

    if (els.overallPercent) els.overallPercent.textContent = overall + "%";
    if (els.overallBar) els.overallBar.style.width = overall + "%";
    if (els.statusBadge) {
      els.statusBadge.textContent = CHECKLIST.getStatusLabel(overall);
      els.statusBadge.className = "status-badge status-" + slugStatus(overall);
    }
    if (els.tasksSummary) {
      els.tasksSummary.textContent = "Completed " + doneCount + " of " + total + " tasks";
    }

    renderNextStep(overall);
    renderCategories();
  }

  function slugStatus(percent) {
    if (percent === 0) return "not-started";
    if (percent === 100) return "complete";
    return "in-progress";
  }

  function renderNextStep(overall) {
    if (!els.nextStepCard) return;
    if (overall === 100) {
      els.nextStepCard.hidden = false;
      if (els.nextStepText) els.nextStepText.textContent = "Congratulations — every launch step is complete.";
      if (els.nextStepCategory) els.nextStepCategory.textContent = "Ready for your first patient";
      return;
    }

    var next = CHECKLIST.getFirstIncompleteItem(completedItems);
    if (!next) {
      els.nextStepCard.hidden = true;
      return;
    }

    els.nextStepCard.hidden = false;
    if (els.nextStepText) els.nextStepText.textContent = next.text;
    if (els.nextStepCategory) els.nextStepCategory.textContent = next.category;
  }

  function renderCategories() {
    if (!els.categoriesRoot) return;
    var query = (els.searchInput?.value || "").trim().toLowerCase();
    els.categoriesRoot.innerHTML = "";

    CHECKLIST.data.forEach(function (cat, index) {
      var visibleItems = cat.items.filter(function (item) {
        var text = typeof item === "string" ? item : item;
        if (!query) return true;
        return text.toLowerCase().includes(query) || cat.category.toLowerCase().includes(query);
      });

      if (query && !visibleItems.length) return;

      var catPercent = CHECKLIST.calculateCategoryCompletion(cat.category, completedItems);
      var card = document.createElement("article");
      card.className = "category-card";
      card.dataset.category = cat.category;

      card.innerHTML =
        '<div class="category-card-header">' +
          '<button type="button" class="category-toggle" aria-expanded="true" aria-controls="cat-body-' + index + '">' +
            '<div class="category-title-wrap">' +
              '<h2 class="category-title">' + escapeHtml(cat.category) + '</h2>' +
              '<p class="category-desc">' + escapeHtml(cat.description) + '</p>' +
            '</div>' +
            '<span class="category-toggle-icon" aria-hidden="true"></span>' +
          '</button>' +
          '<div class="category-progress-wrap">' +
            '<div class="category-progress-meta">' +
              '<span class="category-percent">' + catPercent + '%</span>' +
              '<span class="category-count">' + countDone(cat) + ' / ' + cat.items.length + '</span>' +
            '</div>' +
            '<div class="progress-bar"><div class="progress-fill" style="width:' + catPercent + '%"></div></div>' +
          '</div>' +
        '</div>' +
        '<div class="category-body" id="cat-body-' + index + '"></div>';

      var body = card.querySelector(".category-body");
      var itemsToRender = query ? visibleItems : cat.items;

      itemsToRender.forEach(function (item) {
        var id = CHECKLIST.generateItemId(cat.category, item);
        var isDone = !!completedItems[id];
        body.appendChild(createChecklistRow(id, item, isDone));
      });

      var toggle = card.querySelector(".category-toggle");
      toggle.addEventListener("click", function () {
        var expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", expanded ? "false" : "true");
        card.classList.toggle("collapsed", expanded);
      });

      els.categoriesRoot.appendChild(card);
    });
  }

  function countDone(cat) {
    return cat.items.filter(function (item) {
      return completedItems[CHECKLIST.generateItemId(cat.category, item)];
    }).length;
  }

  function createChecklistRow(id, text, isDone) {
    var row = document.createElement("label");
    row.className = "checklist-item" + (isDone ? " is-complete" : "");
    row.dataset.itemId = id;

    row.innerHTML =
      '<input type="checkbox" ' + (isDone ? "checked" : "") + ' aria-label="' + escapeAttr(text) + '">' +
      '<span class="check-indicator" aria-hidden="true"></span>' +
      '<span class="checklist-text">' + escapeHtml(text) + '</span>';

    var checkbox = row.querySelector("input");
    checkbox.addEventListener("change", function () {
      toggleItem(id, checkbox.checked, row);
    });

    return row;
  }

  function toggleItem(itemId, checked, rowEl) {
    if (checked) {
      completedItems[itemId] = true;
    } else {
      delete completedItems[itemId];
    }

    if (rowEl) {
      rowEl.classList.toggle("is-complete", checked);
    }

    render();
    scheduleSaveStatus();

    OnboardingAuth.API.toggleItem(itemId, checked).catch(function () {
      if (checked) {
        delete completedItems[itemId];
      } else {
        completedItems[itemId] = true;
      }
      if (rowEl) rowEl.classList.toggle("is-complete", !!completedItems[itemId]);
      render();
      setSaveStatus("Unable to save — try again");
    });
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(str) {
    return escapeHtml(str);
  }

  if (els.searchInput) {
    els.searchInput.addEventListener("input", render);
  }

  if (els.resetBtn) {
    els.resetBtn.addEventListener("click", function () {
      if (!window.confirm("Reset all checklist progress? This cannot be undone.")) return;
      completedItems = {};
      render();
      setSaveStatus("Saving…");
      OnboardingAuth.API.resetProgress()
        .then(function (data) {
          completedItems = data.completedItems || {};
          render();
          setSaveStatus("Progress reset");
        })
        .catch(function () {
          setSaveStatus("Reset failed — refresh and try again");
        });
    });
  }

  if (els.printBtn) {
    els.printBtn.addEventListener("click", function () {
      window.print();
    });
  }

  OnboardingAuth.requireAuth()
    .then(function (data) {
      user = data.user;
      CHECKLIST.setRole(user.role || "md");
      if (els.userName) els.userName.textContent = user.name;
      if (els.userOrg) els.userOrg.textContent = user.organization;
      if (els.roleBadge) {
        els.roleBadge.hidden = false;
        els.roleBadge.textContent = CHECKLIST.getRoleLabel(user.role) + " checklist";
      }
      if (els.dashboardSubtitle) {
        els.dashboardSubtitle.textContent = CHECKLIST.getRoleSubtitle(user.role);
      }
      return OnboardingAuth.API.getProgress();
    })
    .then(function (data) {
      completedItems = data.completedItems || {};
      render();
      setSaveStatus("All changes saved");
    })
    .catch(function () {
      /* redirected to login */
    });
})();
