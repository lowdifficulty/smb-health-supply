(function () {
  var API = {
    register: function (payload) {
      return fetch("/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload)
      }).then(handleResponse);
    },
    login: function (payload) {
      return fetch("/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload)
      }).then(handleResponse);
    },
    logout: function () {
      return fetch("/api/auth/logout/", {
        method: "POST",
        credentials: "same-origin"
      }).then(handleResponse);
    },
    me: function () {
      return fetch("/api/auth/me/", { credentials: "same-origin" }).then(handleResponse);
    },
    getProgress: function () {
      return fetch("/api/progress/", { credentials: "same-origin" }).then(handleResponse);
    },
    saveProgress: function (completedItems) {
      return fetch("/api/progress/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ completedItems: completedItems })
      }).then(handleResponse);
    },
    toggleItem: function (itemId, completed) {
      return fetch("/api/progress/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ itemId: itemId, completed: completed })
      }).then(handleResponse);
    },
    resetProgress: function () {
      return fetch("/api/progress/", {
        method: "DELETE",
        credentials: "same-origin"
      }).then(handleResponse);
    }
  };

  function handleResponse(res) {
    var contentType = res.headers.get("content-type") || "";
    if (contentType.indexOf("application/json") === -1) {
      return res.text().then(function (text) {
        if (/^\s*</.test(text)) {
          throw new Error("Server API unavailable. From the site folder, run: npm run local");
        }
        throw new Error("Unexpected server response.");
      });
    }

    return res.json().then(function (data) {
      if (!res.ok) {
        var err = new Error(data.error || "Request failed");
        err.status = res.status;
        throw err;
      }
      return data;
    });
  }

  function showError(el, message) {
    if (!el) return;
    el.textContent = message;
    el.hidden = false;
  }

  function hideError(el) {
    if (!el) return;
    el.hidden = true;
    el.textContent = "";
  }

  function setLoading(btn, loading, label) {
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? "Please wait…" : label;
  }

  window.OnboardingAuth = {
    API: API,
    showError: showError,
    hideError: hideError,
    setLoading: setLoading,
    requireAuth: function () {
      return API.me().catch(function () {
        window.location.href = "/onboarding/login/";
        return Promise.reject();
      });
    }
  };

  var registerForm = document.getElementById("register-form");
  if (registerForm) {
    var registerError = document.getElementById("auth-error");
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();
      hideError(registerError);
      var btn = registerForm.querySelector('button[type="submit"]');
      setLoading(btn, true, "Create account");

      API.register({
        name: registerForm.name.value.trim(),
        email: registerForm.email.value.trim(),
        password: registerForm.password.value,
        organization: registerForm.organization.value.trim(),
        role: registerForm.role.value
      })
        .then(function () {
          window.location.href = "/onboarding/dashboard/";
        })
        .catch(function (err) {
          showError(registerError, err.message);
        })
        .finally(function () {
          setLoading(btn, false, "Create account & start checklist");
        });
    });
  }

  var loginForm = document.getElementById("login-form");
  if (loginForm) {
    var loginError = document.getElementById("auth-error");
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      hideError(loginError);
      var btn = loginForm.querySelector('button[type="submit"]');
      setLoading(btn, true, "Sign in");

      API.login({
        email: loginForm.email.value.trim(),
        password: loginForm.password.value
      })
        .then(function () {
          window.location.href = "/onboarding/dashboard/";
        })
        .catch(function (err) {
          showError(loginError, err.message);
        })
        .finally(function () {
          setLoading(btn, false, "Sign in");
        });
    });
  }

  var logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      API.logout().finally(function () {
        window.location.href = "/onboarding/login/";
      });
    });
  }
})();
