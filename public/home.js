// When a li is clicked, it's text content is input into the input field

const tags = document.querySelectorAll(".scroller li");
const input = document.querySelector("#search-topic");

tags.forEach((tag) => {
  tag.addEventListener("click", () => {
    input.value = tag.textContent;
  });
});

// prevent submit of empty input field
const form = document.querySelector("form");
form.addEventListener("submit", (e) => {
  if (input.value === "") {
    e.preventDefault();
    const tooltip = document.createElement("div");
    tooltip.textContent = "Enter a topic";
    tooltip.classList.add("tooltip");
    form.appendChild(tooltip);
  }
});

// remove the tooltip when the input field is clicked
input.addEventListener("click", () => {
  const tooltip = document.querySelector(".tooltip");
  if (tooltip) {
    tooltip.remove();
  }
});
