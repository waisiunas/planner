function initLayoutMenu() {
  if (!window.Menu || !window.Helpers) return;

  const menuEl = document.getElementById("layout-menu");
  if (!menuEl) return;

  if (!menuEl.menuInstance) {
    const isHorizontalLayout = menuEl.classList.contains("menu-horizontal");
    const templateName =
      window.templateName ||
      document.documentElement.getAttribute("data-template") ||
      "vertical-menu-template-starter";

    menuEl.menuInstance = new window.Menu(menuEl, {
      orientation: isHorizontalLayout ? "horizontal" : "vertical",
      closeChildren: isHorizontalLayout ? true : false,
      showDropdownOnHover: localStorage.getItem(
        "templateCustomizer-" + templateName + "--ShowDropdownOnHover",
      )
        ? localStorage.getItem(
            "templateCustomizer-" + templateName + "--ShowDropdownOnHover",
          ) === "true"
        : window.templateCustomizer !== undefined
          ? window.templateCustomizer.settings.defaultShowDropdownOnHover
          : true,
    });

    window.Helpers.scrollToActive((animate = false));
    window.Helpers.mainMenu = menuEl.menuInstance;
  }

  const togglers = document.querySelectorAll(".layout-menu-toggle");
  togglers.forEach((toggler) => {
    if (toggler.getAttribute("data-partial-bound") !== "true") {
      toggler.setAttribute("data-partial-bound", "true");
      toggler.addEventListener("click", function (event) {
        event.preventDefault();
        window.Helpers.toggleCollapsed();

        if (
          window.config &&
          window.config.enableMenuLocalStorage &&
          !window.Helpers.isSmallScreen()
        ) {
          try {
            const templateName =
              window.templateName ||
              document.documentElement.getAttribute("data-template") ||
              "vertical-menu-template-starter";
            localStorage.setItem(
              "templateCustomizer-" + templateName + "--LayoutCollapsed",
              String(window.Helpers.isCollapsed()),
            );
          } catch (e) {
            console.error("Failed to save menu state", e);
          }
        }
      });
    }
  });

  if (window.Helpers.initSidebarToggle) {
    window.Helpers.initSidebarToggle();
  }

  const menu = document.getElementById("layout-menu");
  const menuToggle = menu
    ? menu.querySelector(".layout-menu-toggle")
    : null;
  if (menu && menuToggle && !menu.hasAttribute("data-hover-bound")) {
    menu.setAttribute("data-hover-bound", "true");
    let hoverTimeout = null;

    menu.onmouseenter = function () {
      hoverTimeout = setTimeout(
        function () {
          if (!window.Helpers.isSmallScreen()) {
            menuToggle.classList.add("d-block");
          }
        },
        window.Helpers.isSmallScreen() ? 0 : 300,
      );
    };

    menu.onmouseleave = function () {
      menuToggle.classList.remove("d-block");
      clearTimeout(hoverTimeout);
    };
  }
}

function applyInitialMenuState() {
  if (
    !window.Helpers ||
    window.Helpers.isSmallScreen() ||
    !document.getElementById("layout-menu")
  ) {
    return;
  }

  let collapsed;
  const templateName =
    window.templateName ||
    document.documentElement.getAttribute("data-template") ||
    "vertical-menu-template-starter";

  if (window.templateCustomizer) {
    collapsed = window.templateCustomizer.settings.defaultMenuCollapsed;
  } else {
    collapsed = false;
  }

  if (
    window.config &&
    window.config.enableMenuLocalStorage &&
    localStorage.getItem(
      "templateCustomizer-" + templateName + "--LayoutCollapsed",
    ) !== null
  ) {
    collapsed =
      localStorage.getItem(
        "templateCustomizer-" + templateName + "--LayoutCollapsed",
      ) === "true";
  }

  window.Helpers.setCollapsed(collapsed, false);
}

function initThemeControls() {
  if (!window.Helpers) return;

  const templateName =
    window.templateName ||
    document.documentElement.getAttribute("data-template") ||
    "vertical-menu-template-starter";
  const preferredTheme = window.Helpers.getPreferredTheme();
  window.Helpers.showActiveTheme(preferredTheme);

  document
    .querySelectorAll("[data-bs-theme-value]")
    .forEach((toggle) => {
      if (toggle.getAttribute("data-theme-bound") === "true") return;
      toggle.setAttribute("data-theme-bound", "true");
      toggle.addEventListener("click", () => {
        const theme = toggle.getAttribute("data-bs-theme-value");
        if (!theme) return;

        window.Helpers.setStoredTheme(templateName, theme);
        window.Helpers.setTheme(theme);
        window.Helpers.showActiveTheme(theme, true);
        window.Helpers.syncCustomOptions(theme);
      });
    });
}

function updateFooterYear() {
  const footerYear = document.getElementById("footerYear");
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }
}

async function loadPartials() {
  const partialNodes = Array.from(
    document.querySelectorAll("[data-include-partial]"),
  );

  await Promise.all(
    partialNodes.map(async (node) => {
      const partialPath = node.getAttribute("data-include-partial");
      if (!partialPath) return;

      try {
        const response = await fetch(partialPath, { cache: "no-cache" });
        if (!response.ok) {
          throw new Error(
            `Failed to load partial ${partialPath}: ${response.status} ${response.statusText}`,
          );
        }

        node.outerHTML = await response.text();
      } catch (error) {
        console.error(error);
      }
    }),
  );

  initLayoutMenu();
  applyInitialMenuState();
  initThemeControls();
  updateFooterYear();
}

window.__partialsReady = loadPartials();