function formatQuestionText(question) {
  const formattedQuestion = question.replace(/'/g, '"');
  document.getElementById("question").innerHTML = formattedQuestion;
}

document.addEventListener("DOMContentLoaded", async () => {
  const response = await fetch("../JSON/questions.json");
  const compressedData = await response.text();
  const data = JSON.parse(compressedData);
  const questionElement = document.getElementById("question");
  const randomQuestionObj = data[Math.floor(Math.random() * data.length)];
  const randomQuestion = `${randomQuestionObj.category}: ${randomQuestionObj.question}`;
  formatQuestionText(randomQuestion);
  questionElement.setAttribute("answer", randomQuestionObj.answer);
});

let NQB;

let tryCount = 0;
let answered = false;
let correct = false;

function verifyAnswer() {
  correct = false;
  if (answered) {
    return;
  }

  const userAnswer = document.getElementById("ans").value.toLowerCase();
  const currentQuestionElement = document.getElementById("question");
  const correctAnswer = currentQuestionElement
    .getAttribute("answer")
    .toLowerCase();

  const normaliseAnswer = (answer) => {
    return answer.replace(/^(a |an| the )/g, "").trim();
  };

  if (normaliseAnswer(userAnswer) === normaliseAnswer(correctAnswer)) {
    console.log("Correct!");
    showAlert("Correct!");
    NQB = createNQB();
    NQB.style.backgroundColor = "#3FB541"; // greenish
    answered = true;
    correct = true;
  } else {
    tryCount++;
    if (tryCount < 3) {
      console.log("Incorrect! Try again.");
      showAlert(`Incorrect! Try again. Tries left: ${3 - tryCount}`);
    } else {
      console.log("Incorrect! Showing correct answer.");
      showAlert(`Incorrect! The correct answer is: ${correctAnswer}.`);
      NQB = createNQB();
      NQB.style.backgroundColor = "#B53F3F"; // reddish
      answered = true;
      correct = false;
      document.getElementById("ans").disabled = true;
      const panel = document.getElementById("panel");
      clearNQB(panel);
      panel.appendChild(NQB);
    }
  }

  if ((!answered && tryCount === 3) || correct === true) {
    document.getElementById("ans").disabled = true;
    NQB = createNQB();
    NQB.style.backgroundColor = correct ? "#3FB541" : "#E65454";
    const panel = document.getElementById("panel");
    clearNQB(panel);
    panel.appendChild(NQB);
  }
}

function showNQ() {
  tryCount = 0;
  answered = false;
  document.getElementById("ans").disabled = false;
  document.getElementById("ans").value = "";
  fetch("../JSON/questions.json")
    .then((response) => response.json())
    .then((data) => {
      const questionElement = document.getElementById("question");
      const randomQuestionObj = data[Math.floor(Math.random() * data.length)];
      const randomQuestion = `${randomQuestionObj.question}`;
      formatQuestionText(randomQuestion);
      questionElement.setAttribute("answer", randomQuestionObj.answer);
    });
}

function clearNQB(parentElement) {
  const previousNQB = parentElement.querySelector("#nQ");
  if (previousNQB) {
    previousNQB.remove();
  }
}

function createNQB() {
  const NQB = document.createElement("button");
  NQB.textContent = "Next question";
  NQB.id = "nQ";
  NQB.onclick = () => {
    showNQ();
    clearNQB(document.getElementById("panel"));
    hideAlert();
  };
  return NQB;
}

let correctAnswers = 0;
let incorrectAnswers = 0;

function skipQuestion() {
  showNQ();
  const questionElement = document.getElementById("question");
  const questionAnswer = questionElement.getAttribute("answer");
  showAlert(`Correct answer was: ${questionAnswer}`);
  updateSkippedCount();
}

function showAlert(message) {
  const alertBox = document.querySelector(".alert-box");
  if (alertBox) {
    alertBox.remove();
  }
  const alertBx = document.createElement("div");
  alertBx.classList.add("alert-box");
  alertBx.textContent = message;
  document.body.appendChild(alertBx);
  setTimeout(function () {
    alertBx.classList.add("show");
    updateAnswerCounters(message);
  }, 100);
}

function hideAlert() {
  const alertBox = document.querySelector(".alert-box");
  if (alertBox) {
    alertBox.classList.remove("show");
    setTimeout(() => {
      alertBox.remove();
    }, 250);
  }
}

function updateSkippedCount() {
  let skippedCount = localStorage.getItem("skipped") || 0;
  skippedCount++;
  localStorage.setItem("skipped", skippedCount);
  updateAnswerCounters("Skipped");
}

function updateAnswerCounters(message) {
  const answerCountElement = document.getElementById("answerCount");
  let userAnswers = JSON.parse(localStorage.getItem("userAnswers")) || {
    correct: 0,
    incorrect: 0,
    skipped: 0,
  };
  if (message === "Correct!") {
    userAnswers.correct++;
  } else if (message === "Skipped") {
    userAnswers.skipped++;
  } else {
    userAnswers.incorrect++;
  }
  const totalAnswerCount =
    userAnswers.correct + userAnswers.incorrect + userAnswers.skipped;
  answerCountElement.textContent = `${userAnswers.correct} correct, ${userAnswers.incorrect} wrong and ${userAnswers.skipped} skipped (${totalAnswerCount} total)`;
  localStorage.setItem("userAnswers", JSON.stringify(userAnswers));
}

// document.addEventListener("click", function (e) {
//   if (!e.target.closest(".alert-box")) {
//     const alertBox = document.querySelector(".alert-box");
//     if (alertBox) {
//       alertBox.remove();
//     }
//   }
// });
