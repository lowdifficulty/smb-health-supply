(function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const navMobile = document.querySelector(".nav-mobile");
  const modal = document.getElementById("inquiry-modal");
  const modalForm = document.getElementById("inquiry-form");
  const modalSuccess = document.getElementById("form-success");

  if (menuToggle && navMobile) {
    menuToggle.addEventListener("click", function () {
      const open = navMobile.classList.toggle("open");
      menuToggle.classList.toggle("open", open);
      menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    });

    navMobile.querySelectorAll("a:not(.open-form)").forEach(function (link) {
      link.addEventListener("click", function () {
        navMobile.classList.remove("open");
        menuToggle.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  function openModal() {
    if (!modal) return;
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    if (modalForm) modalForm.classList.remove("hidden");
    if (modalSuccess) modalSuccess.classList.remove("show");
    const firstInput = modal.querySelector("input:not([type=hidden])");
    if (firstInput) setTimeout(function () { firstInput.focus(); }, 100);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".open-form").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      openModal();
    });
  });

  if (modal) {
    modal.querySelector(".modal-close")?.addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
  });

  if (modalForm) {
    modalForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      const submitBtn = modalForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";

      const data = Object.fromEntries(new FormData(modalForm));

      try {
        const res = await fetch("https://formsubmit.co/ajax/support@smbhealthsupply.com", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            _subject: "New SMB Health Supply inquiry",
            _template: "table",
            name: data.name,
            email: data.email,
            phone: data.phone,
            organization: data.organization,
            message: data.message || "—"
          })
        });

        if (!res.ok) throw new Error("Submit failed");

        modalForm.classList.add("hidden");
        modalSuccess?.classList.add("show");
        modalForm.reset();
      } catch {
        alert("Something went wrong. Please call us at (913) 302-6065 or email support@smbhealthsupply.com.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }
})();
