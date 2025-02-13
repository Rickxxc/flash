export class FlashCard {
  constructor(question, answer) {
    this.question = question;
    this.answer = answer;
  }
  
  getHTML() {
    return `
      <div class="flash-card">
        <div class="card-front">
          <p>${this.question}</p>
        </div>
        <div class="card-back">
          <p>${this.answer}</p>
        </div>
      </div>
    `;
  }
}
