function setSidebarActiveMenuItem(menuItemId) {
  const activateMenuItem = () => {
    const menu = document.getElementById("layout-menu");
    const menuItemElement = document.getElementById(menuItemId);
    if (!menu || !menuItemElement) {
      console.warn(`Sidebar menu item "${menuItemId}" was not found.`);
      return false;
    }

    menu.querySelectorAll(".menu-item.active, .menu-link.active").forEach(
      (element) => element.classList.remove("active"),
    );
    menuItemElement.classList.add("active");
    const link = menuItemElement.querySelector(".menu-link");
    if (link) link.classList.add("active");
    return true;
  };

  if (document.getElementById(menuItemId)) return activateMenuItem();
  if (window.__partialsReady) {
    return window.__partialsReady.then(activateMenuItem);
  }
  return activateMenuItem();
}
