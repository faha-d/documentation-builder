document.addEventListener("DOMContentLoaded", () => {
  const items = document.querySelectorAll(".db-item");

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
});
