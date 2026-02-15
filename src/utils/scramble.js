export const scrambleText = (e) => {
  // Find the element that actually contains the data-text
  // It could be the event target itself, or a child if the event was triggered on a parent
  const target = e.target.hasAttribute("data-text")
    ? e.target
    : e.target.closest("[data-text]") ||
      e.currentTarget.querySelector("[data-text]");

  if (!target) return;

  const originalText = target.getAttribute("data-text");
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let iteration = 0;

  // Prevent multiple intervals on same element
  if (target.dataset.scrambling === "true") return;
  target.dataset.scrambling = "true";

  const interval = setInterval(() => {
    target.innerText = originalText
      .split("")
      .map((letter, index) => {
        if (index < iteration) {
          return originalText[index];
        }
        return letters[Math.floor(Math.random() * 26)];
      })
      .join("");

    if (iteration >= originalText.length) {
      clearInterval(interval);
      target.dataset.scrambling = "false";
    }

    iteration += 1 / 3;
  }, 30);
};
