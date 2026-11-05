const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");
const mobileViewport = window.matchMedia("(max-width: 760px)");

if (menuToggle instanceof HTMLButtonElement && siteNav instanceof HTMLElement) {
  const setMenuOpen = (isOpen) => {
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    siteNav.classList.toggle("is-open", isOpen);
  };

  const updateNavigation = () => {
    document.body.classList.toggle("has-mobile-nav", mobileViewport.matches);
    if (mobileViewport.matches) {
      menuToggle.hidden = false;
    } else {
      menuToggle.hidden = true;
      setMenuOpen(false);
    }
  };

  menuToggle.addEventListener("click", () => {
    setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  siteNav.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) {
      setMenuOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  mobileViewport.addEventListener("change", updateNavigation);
  updateNavigation();
}