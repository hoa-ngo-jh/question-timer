
const timerQuestion = (function () {
  const TEXT_PLAIN_QUESTION = 'text_plain';
  const MULTIPLE_CHOICES_QUESTION = 'multiple_choices';

  const timerConfig = {
    timerAppControl: null,
    timerLimitQuestion: null,
    timerRealtime: null
  };

  let currentIndex;
  let timeLeft = 0;
  let questions = [];
  let answers = [];

  const start = (data) => {
    hideElement(data.startButton);
    countUpTimer(data.startTime);
    changeQuestion(questions[currentIndex].time, currentIndex);
  };

  const changeQuestion = (time, index, answer) => {
    if (questions[index].type === TEXT_PLAIN_QUESTION) {
      renderTextPlainQuesitonBox(index, answer);
    } else if (questions[index].type === MULTIPLE_CHOICES_QUESTION) {
      renderMultipleChoicesQuestionBox(index, answer);
    }

    updateTimer(time, '-sub');
    countDownTimer(time, index);
  };

  const setEventForDirectionButton = (currentQuestion, index) => {
    document.querySelector('.wrapper').innerHTML = currentQuestion;
    document.querySelector('.next-btn').addEventListener('click', nextQuestion);

    if (index !== 0) {
      document.querySelector('.back-btn').addEventListener('click', prevQuesiton);
    }
  };

  const renderTextPlainQuesitonBox = (index, answer = '') => {
    const currentQuestion = `
    <div class="box">
      <div class="box-info">
        <div class="question">
          <p>${questions[index].question}</p>
        </div>
        <div class="timer">
          <div class="timer-minutes-sub">00</div>
          <div class="">:</div>
          <div class="timer-seconds-sub">00</div>
        </div>
      </div>
      <textarea name="" id="answer" cols="55" rows="10" placeholder="Answer the question">${answer}</textarea>
    </div>

    <div class="direction-btn">
      ${index === 0 ? '' : '<button class="btn back-btn">Back</button>'}
      <button class="btn next-btn">${index === questions.length - 1 ? 'Submit' : 'Next'}</button>
    </div>
    `;
  
    setEventForDirectionButton(currentQuestion, index);
  }; 

  const renderMultipleChoicesQuestionBox = (index, answer = '') => {
    const choices = questions[index].choices.map((item, i) => {
      if (answer === item) {
        return `
          <div class="choice">
            <input type="checkbox" name="answer-choice" class="answer-choice" id="choice-${index}-${i}" value="${item}" checked>
            <label for="0">${item}</label>
          </div>
        `;
      } else {
        return `
          <div class="choice">
            <input type="checkbox" name="answer-choice" class="answer-choice" id="choice-${index}-${i}" value="${item}">
            <label for="0">${item}</label>
          </div> 
        `;
      }
    }).join('');

    const currentQuestion = `
    <div class="box">
      <div class="box-info">
        <div class="question">
          <p>${questions[index].question}</p>
        </div>
        <div class="timer">
          <div class="timer-minutes-sub">00</div>
          <div class="">:</div>
          <div class="timer-seconds-sub">00</div>
        </div>
      </div>
      ${choices}
    </div>

    <div class="direction-btn">
      ${index === 0 ? '' : '<button class="btn back-btn">Back</button>'}
      <button class="btn next-btn">${index === questions.length - 1 ? 'Submit' : 'Next'}</button>
    </div>
    `; 

    setEventForDirectionButton(currentQuestion, index);
  };

  const hideElement = (element) => {
    document.querySelector(element).classList.add('hide');
  };
  
  const formatTime = (time) => {
    const stringTime = time + '';
    if (stringTime.length < 2) {
      return '0' + stringTime;
    }
  
    return stringTime;
  };
  
  const updateTimer = (currentSecond, type = '') => {
    document.querySelector(`.timer-minutes${type}`).innerHTML = formatTime(parseInt(currentSecond / 60));
    document.querySelector(`.timer-seconds${type}`).innerHTML = formatTime(currentSecond % 60);
  };
  
  const countUpTimer = (time) => {
    timerConfig.timerRealtime = time;
    timerConfig.timerAppControl = setInterval(() => {
      timerConfig.timerRealtime++;
      updateTimer(timerConfig.timerRealtime);

      if (isTimeout(timerConfig.timerRealtime)) {
        stopCountTimer(timerConfig.timerLimitQuestion);
        handleSubmitAnswer();
      }
    }, 1000);
  };
  
  const countDownTimer = (time) => {
    timeLeft = time;
    timerConfig.timerLimitQuestion = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateTimer(timeLeft, '-sub');
      } else {
        nextQuestion();
      }
    }, 1000);
  };

  const isLastQuestion = (currentIndex) => {
    return (currentIndex === questions.length - 1);
  };

  const isTimeout = (time) => {
    return time === sumTimePerQuestion(questions, 'time');
  };

  const nextQuestion = () => {
    stopCountTimer(timerConfig.timerLimitQuestion);
    if (questions[0].type === TEXT_PLAIN_QUESTION) {
      updateCurrentAnswer(currentIndex);
    } 

    if (isLastQuestion(currentIndex)) {
      if (isTimeout(timerConfig.timerRealtime)) {
        return;
      }

      handleSubmitAnswer();
    } else {
      currentIndex++;
      changeQuestion(questions[currentIndex].time, currentIndex);
    }
  };

  const prevQuesiton = () => {
    stopCountTimer(timerConfig.timerLimitQuestion);
    currentIndex--;
    changeQuestion(answers[currentIndex].timeLeft, currentIndex, answers[currentIndex].answer);
  };

  const stopCountTimer = (type) => {
    clearInterval(type);
  };

  const getInputAnswer = (element) => {
    return element.value;
  };

  const handleAddMultipleChoicesAnswer = (event) => {
    const choice = event.target;
    const choiceCheckboxes =  document.getElementsByName('answer-choice');

    choiceCheckboxes.forEach(item => {
      if (item !== choice) {
        item.checked = false;
      }
    });

    if (choice.classList == 'answer-choice') {
      const answer = choice.getAttribute('value');
      addAnswerToList(answer, currentIndex);
    }
  };

  const addAnswerToList = (answer, index) => {
    const ans = {
      questionId: questions[index].id,
      answer,
      timeLeft
    };

    answers[index] = ans;
  };

  const updateCurrentAnswer = (index) => {
    const ans = getInputAnswer(document.getElementById('answer'));
    addAnswerToList(ans, index);
  };

  const renderAnswerQuestions = (data) => {
    const html = data.map(item => `
      <div class="box">
        <div class="result">
          <div class="box-info">
            <div class="question">
              <p>Q: ${questions[item.questionId].question}</p>
            </div>
          </div>
          <div>
            <p>A: ${item.answer ? item.answer : 'No answer'}</p>
          </div>
        </div>
        
      </div>
    `).join('');

    document.querySelector('.wrapper').innerHTML = html;
  };

  const renderMultilpleChoicesAnswerQuestions = (data) => {
    const html = data.map(item => `
      <div class="box">
        <div class="result">
          <div class="box-info">
            <div class="question">
              <p>Q: ${questions[item.questionId].question}</p>
            </div>
          </div>
          <div>
            <p>${isCorrectAnswer(item) ? 'Correct: ' + item.answer : 'Wrong, the answer must be ' + questions[item.questionId].answer}</p>
          </div>
        </div>
        
      </div>
    `).join('');

    document.querySelector('.wrapper').innerHTML = html;
  };

  const handleSubmitAnswer = () => {
    stopCountTimer(timerConfig.timerAppControl);
    if (questions[0].type === TEXT_PLAIN_QUESTION) {
      renderAnswerQuestions(answers);
    } else if (questions[0].type === MULTIPLE_CHOICES_QUESTION) {
      renderMultilpleChoicesAnswerQuestions(answers);
    }
  };

  const sumTimePerQuestion = (questionList, prop) => {
    return questionList.reduce((prev, curr) => prev + curr[prop], 0);
  };

  const isCorrectAnswer = (answer) => {
    return answer.answer === questions[answer.questionId].answer;
  };

  const init = (data) => {
    questions = data.list;
    currentIndex = data.startIndexQuestion;
    document.querySelector(data.startButton).addEventListener('click', () => start(data));
    document.addEventListener('click', handleAddMultipleChoicesAnswer);
  };

  return {
    init
  }
})();

timerQuestion.init({
  list: list2,
  startButton: '#start-btn',
  startIndexQuestion: 0,
  startTime: 0
});