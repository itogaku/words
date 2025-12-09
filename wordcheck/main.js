let words = [];
let progress = {}; // {apple: "correct", cat: "wrong"}
let current = null;
let wrongOnlyMode = false; // ←追加！不正解のみ出題モード

function loadData() {
    // words.js で定義された words がそのまま使える

    const saved = localStorage.getItem("progress");
    if (saved) {
        progress = JSON.parse(saved);
    }

    renderQuestion();
}


function getNextWord() {
    let candidates = words.filter(w => {
        const state = progress[w.word];
        if (wrongOnlyMode) {
            return state === "wrong"; // ←不正解のみ
        }
        return state !== "correct"; // ←未出題＆不正解
    });

    if (candidates.length === 0) return null;

    return candidates[Math.floor(Math.random() * candidates.length)];
}

function renderQuestion() {
    current = getNextWord();
    if (!current) {
        if (!wrongOnlyMode) {
            // 全て出題＆正解済みはスキップ済み → 不正解のみへ自動移行！
            wrongOnlyMode = true;
            alert("全ての問題を出題しました！\n次は不正解のみを出題します。");
            current = getNextWord();
            if (!current) {
                document.getElementById("meaning").textContent = "学習完了！";
                return;
            }
        } else {
            document.getElementById("meaning").textContent = "学習完了！";
            return;
        }
    }

    document.getElementById("meaning").textContent = current.meaning;
    document.getElementById("answerInput").value = "";
    document.getElementById("result").textContent = "";
}

function checkAnswer() {
    const input = document.getElementById("answerInput").value.trim();
    if (!current) return;

    if (input.toLowerCase() === current.word.toLowerCase()) {
        progress[current.word] = "correct";
        document.getElementById("result").textContent = "正解！";
    } else {
        progress[current.word] = "wrong";
        document.getElementById("result").textContent = `不正解！答え: ${current.word}`;
    }

    localStorage.setItem("progress", JSON.stringify(progress));
    setTimeout(renderQuestion, 1200);
}

function renderList() {
    const filter = document.getElementById("filter").value;
    const table = document.getElementById("wordTable");
    table.innerHTML = "<tr><th>単語</th><th>意味</th><th>状態</th><th>操作</th></tr>";

    words.forEach(w => {
        const state = progress[w.word] || "unanswered";
        if (filter !== "all" && state !== filter) return;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${w.word}</td>
            <td>${w.meaning}</td>
            <td>${state}</td>
            <td><button onclick="toggleState('${w.word}')">変更</button></td>
        `;
        table.appendChild(row);
    });
}

function toggleState(word) {
    const state = progress[word];
    if (!state) progress[word] = "correct";
    else if (state === "correct") progress[word] = "wrong";
    else delete progress[word];

    localStorage.setItem("progress", JSON.stringify(progress));
    renderList();
}

// 不正解のみモードを手動切り替え
function toggleWrongOnlyMode() {
    wrongOnlyMode = !wrongOnlyMode;
    alert(wrongOnlyMode ? "不正解のみ出題モード ON" : "不正解のみ出題モード OFF");
    renderQuestion();
}

function showPage(id) {
    document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
    if (id === "list") renderList();
}

// 学習リセット
function resetProgress() {
    if (!confirm("進捗をリセットしますか？")) return;
    progress = {};
    localStorage.setItem("progress", JSON.stringify(progress));
    wrongOnlyMode = false;
    renderQuestion();
    renderList();
}

loadData();
