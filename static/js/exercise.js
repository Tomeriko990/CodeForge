const questions = [
  "Write code that prints numbers from 1 to 10.",
  "Write a function that takes a list of numbers and returns their sum.",
  "Write a function that checks if a number is prime.",
  "Write a function that reverses a string.",
  "Write a function that counts vowels in a string.",
  "Write a program that prints all prime numbers up to a given number N.",
  "Implement FizzBuzz from 1 to 100.",
  "Check if a string is a palindrome (reads the same forward and backward)."
];

let editor;

window.addEventListener("DOMContentLoaded", () => {
  editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    mode: "python",
    theme: "default",
    lineNumbers: true,
  });

  // Theme toggle
  const toggleBtn = document.getElementById("theme-toggle");
  const body = document.body;

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    body.classList.add("light-mode");
    toggleBtn.textContent = "🌙 Dark Mode";
  }

  toggleBtn.addEventListener("click", () => {
    body.classList.toggle("light-mode");
    const isLight = body.classList.contains("light-mode");
    toggleBtn.textContent = isLight ? "🌙 Dark Mode" : "☀️ Light Mode";
    localStorage.setItem("theme", isLight ? "light" : "dark");
  });
});

function loadQuestion(index, element) {
  document.getElementById("question-display").innerText = questions[index];
  if (editor) editor.setValue("");

  document.querySelectorAll(".question-item").forEach(item => item.classList.remove("active"));
  element.classList.add("active");
  document.getElementById("result").style.display = "none";
}

async function runCode() {
  const code = editor.getValue();
  const response = await fetch("/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code })
  });

  const result = await response.json();
  document.getElementById("result").innerText = result.output;
  document.getElementById("result").style.display = "block";
}
