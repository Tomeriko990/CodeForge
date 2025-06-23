// Global variable to store the Monaco editor instance
let editor;


function getResponsiveFontSize() {
  const vw = Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0
  );
  return Math.max(10, Math.min(16, vw * 0.014));
}


window.addEventListener("resize", () => {
  if (editor) {
    const fontSize = getResponsiveFontSize();
    editor.updateOptions({ fontSize });
    editor.layout();
  }
});



// Configure Monaco loader path
require.config({
  paths: {
    vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs",
  },
});

// Load Monaco editor
require(["vs/editor/editor.main"], async function () {
  // Create the Monaco editor instance
  editor = monaco.editor.create(document.getElementById("monaco-editor"), {
    value: `print("Hello from CodeForge IDE!")`,
    language: "python",
    theme: "vs-dark",
    automaticLayout: true,
    fontSize: getResponsiveFontSize(),
    wordWrap: "on",
  });
  console.log("hey");
  window.editor = editor;

  // Register intelligent completions for Python
  fetch("/static/js/python-snippets.json")
    .then((res) => res.json())
    .then((snippets) => {
      monaco.languages.registerCompletionItemProvider("python", {
        provideCompletionItems: () => {
          const suggestions = Object.entries(snippets).map(([key, val]) => ({
            label: val.prefix,
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: val.body.join("\n"),
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: val.description,
          }));
          return { suggestions };
        },
      });
    });



      

  // Reinitialize Pyright if the language is changed back to Python
  editor.onDidChangeModelLanguage(async () => {
    const lang = editor.getModel().getLanguageId();
    if (lang === "python") {
      await initPyright();
    }
  });

  // Listen for changes in the editor and update diagnostics
  editor.onDidChangeModelContent(onEditorContentChange);
});

// Get the code currently written in the editor
function getEditorCode() {
  return editor ? editor.getValue() : "";
}

// Get the current programming language of the editor
function getEditorLang() {
  return editor ? editor.getModel().getLanguageId() : "python";
}

// Set a new language for the Monaco editor
function setEditorLanguage(lang) {
  if (editor) {
    monaco.editor.setModelLanguage(editor.getModel(), lang);
  }
}

// Set the theme of Monaco Editor
const setEditorTheme = (theme) => {
  if (editor) {
    monaco.editor.setTheme(theme);
  }
};
