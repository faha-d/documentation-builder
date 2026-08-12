document.addEventListener("DOMContentLoaded", () => {
  // ===== ACCORDION HANDLING =====
  const items = document.querySelectorAll(".db-accordion .db-item");
  items.forEach((item) => {
    const button = item.querySelector(".db-title");

    if (!button) {
      return;
    }

    button.addEventListener("click", () => {
      const isOpen = item.classList.contains("active");

      items.forEach((otherItem) => {
        otherItem.classList.remove("active");
      });

      if (!isOpen) {
        item.classList.add("active");
      }
    });
  });

  // ===== TABS HANDLING =====
  const tabButtons = document.querySelectorAll(".db-tabs-nav .db-tab-button");
  const tabPanes = document.querySelectorAll(".db-tabs-content .db-tab-pane");

  tabButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons and panes
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabPanes.forEach((pane) => pane.classList.remove("active"));

      // Add active class to clicked button and corresponding pane
      button.classList.add("active");
      if (tabPanes[index]) {
        tabPanes[index].classList.add("active");
      }
    });
  });

  // Set first tab as active by default
  if (tabButtons.length > 0) {
    tabButtons[0].classList.add("active");
  }
  if (tabPanes.length > 0) {
    tabPanes[0].classList.add("active");
  }
});
