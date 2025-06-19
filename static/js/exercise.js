
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
let runButton;  
let spinner;

window.addEventListener("DOMContentLoaded",async () => {
  
  runButton = document.getElementById("run-code-btn");
  spinner = document.getElementById("spinner");

  runButton.disabled = false; // Enable button once editor is ready

  // Only after the editor is ready:
  document.getElementById("language").addEventListener("change", e => {
    setEditorLanguage(e.target.value);
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



async function runCode() {
  const btntTxt=document.getElementById("run-text");
  const output=document.getElementById("result");

  // Lock the button and show spinner
  runButton.disabled = true;
  output.style.display = "none";
  btntTxt.innerText = "Running...";
  spinner.classList.remove("d-none");
  
  
  try {
    const code = getEditorCode();
    const lang = getEditorLang();

    const response = await fetch("/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language: lang })
    });

    const result = await response.json();

    // Hide spinner and unlock the button
    setTimeout(() => {
      runButton.disabled = false;
      spinner.classList.add("d-none");
      btntTxt.innerText = "Run Code";

      output.innerText = result.output;
      output.style.display = "block";
    }, 500); 
    

  } catch (error) {
    document.getElementById("result").innerText = `Error: ${error.message}`;
    document.getElementById("result").style.display = "block";
  }
}



function loadQuestion(index, element) {
  document.getElementById("question-display").innerText = questions[index];
  if (window.editor) window.editor.setValue("");
  document.querySelectorAll(".question-item").forEach(item => item.classList.remove("active"));
  element.classList.add("active");
  document.getElementById("result").style.display = "none";
}
