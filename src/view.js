document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".db-title").forEach((button) => {
    button.addEventListener("click", () => {
      button.parentElement.classList.toggle("active");
    });
  });
});
