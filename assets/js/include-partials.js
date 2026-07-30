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

  const toggler = document.querySelector(".layout-menu-toggle");
  if (toggler && toggler.getAttribute("data-partial-bound") !== "true") {
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
}

window.__partialsReady = loadPartials();
