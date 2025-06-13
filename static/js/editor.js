let editor;
let openedFiles = {};
document.addEventListener("DOMContentLoaded", () => {
  
    lucide.createIcons({
        attrs: {
        width: 36,
        height: 36,
        stroke: '#ccc',
        'stroke-width': 1.5
        }
    });   
      const explorerBtn = document.querySelector('button[title="Explorer"]');
      const searchBtn = document.querySelector('button[title="Search"]');
      const terminalBtn = document.querySelector('button[title="Terminal"]');
      const settingsBtn = document.querySelector('button[title="Settings"]');
      
      const explorerPanel = document.getElementById("explorer-container");
      const searchPanel = document.getElementById("panel-search");
      const terminal = document.getElementById("bottom-bar");
      const settingsModal = document.getElementById("settings-modal");
      const fileLoader=document.getElementById("fileLoader");
  
      explorerBtn.addEventListener("click", () => {
        searchPanel.style.display = "none";
        explorerPanel.style.display = explorerPanel.style.display === "none" ? "block" : "none";

      });
  
      searchBtn.addEventListener("click", () => {
        togglePanel(searchPanel);
        explorerPanel.style.display = "block";
        searchPanel.style.display = "none";
      });
  
      terminalBtn.addEventListener("click", () => {
        terminal.style.display = terminal.style.display === "none" ? "block" : "none";
      });
  
      settingsBtn.addEventListener("click", () => {
        settingsModal.style.display = "block";
      });
      
      fileLoader.addEventListener("change",(e)=>{
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            const content = event.target.result;
            openedFiles[file.name] = content;
            updateFileList(file.name);
            loadFileToEditor(file.name);
        }     
        reader.readAsText(file);
     });
});

function updateFileList(filename) {
    const fileList = document.getElementById("file-list");
    if (!document.getElementById("file-item-" + filename)) {
      const div = document.createElement("div");
      div.className = "file-item";
      div.id = "file-item-" + filename;
      div.textContent = filename;
      div.onclick = () => loadFileToEditor(filename);
      fileList.appendChild(div);
    }
  }

function loadFileToEditor(filename) {
    editor.setValue(openedFiles[filename]);
    document.getElementById("file-name").textContent = "CodeForge • " + filename;
  }
    function togglePanel(panel) {
      panel.style.display = panel.style.display === "none" ? "block" : "none";
    }
  
    function closeSettings() {
      document.getElementById("settings-modal").style.display = "none";
    }

    require.config({ paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.34.1/min/vs" } });
    require(["vs/editor/editor.main"], function () {
      editor = monaco.editor.create(document.getElementById("editor"), {
        value: `print("Hello from CodeForge IDE!")`,
        language: "python",
        theme: "vs-dark",
        automaticLayout: true,
        tabSize: 4,
        insertSpaces: false,
        wordWrap: "on",
        lineHeight: 26,
        fontSize: 18,
        suggestOnTriggerCharacters: true
      });
  
      monaco.languages.registerCompletionItemProvider('python', {
        provideCompletionItems: () => {
          return {
            suggestions: [
              {
                label: 'print',
                kind: monaco.languages.CompletionItemKind.Function,
                insertText: 'print(${1:""})',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'הדפסת טקסט למסך'
              },
              {
                label: 'for',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'for ${1:item} in ${2:iterable}:\n\t$0',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'לולאת for'
              },
              {
                label: 'if',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: 'if ${1:condition}:\n\t$0',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'תנאי if'
              }
            ]
          };
        }
      });
    });
  
    async function runCode() {
      const code = editor.getValue();
      const response = await fetch("/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });
  
      const result = await response.json();
      const output = document.getElementById("bottom-bar");
      output.innerText = result.output || "// (No output)";
      output.scrollTop = output.scrollHeight;
    }