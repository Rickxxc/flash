export class UIManager {
  constructor(cardManager) {
    this.cardManager = cardManager;
    this.currentSubject = null;
    this.isStudyMode = false;
    this.currentStudyIndex = 0;
    this.studyCards = [];
  }
  
  initialize() {
    this.setupSubjectsInForm();
    this.refreshSubjectsList();
    this.refreshCardsDisplay();
    this.setupStudyMode();
  }
  
  setupSubjectsInForm() {
    const subjectSelect = document.getElementById('subject');
    if (!subjectSelect) return; // Guard clause if element doesn't exist
    
    const subjects = this.cardManager.getSubjects();
    
    subjectSelect.innerHTML = `
      <option value="">Selecione uma matéria</option>
      ${subjects.map(subject => `
        <option value="${subject}">${subject}</option>
      `).join('')}
      <option value="new">+ Nova Matéria</option>
    `;
    
    subjectSelect.addEventListener('change', (e) => {
      if (e.target.value === 'new') {
        const newSubject = prompt('Digite o nome da nova matéria:');
        if (newSubject) {
          const option = document.createElement('option');
          option.value = newSubject;
          option.textContent = newSubject;
          subjectSelect.insertBefore(option, subjectSelect.lastElementChild);
          subjectSelect.value = newSubject;
        } else {
          subjectSelect.value = '';
        }
      }
    });
  }
  
  refreshSubjectsList() {
    const subjectsList = document.getElementById('subjects-list');
    if (!subjectsList) return; // Guard clause if element doesn't exist
    
    const subjects = this.cardManager.getSubjects();
    
    subjectsList.innerHTML = subjects.map(subject => `
      <div class="subject-item ${this.currentSubject === subject ? 'active' : ''}" data-subject="${subject}">
        <span>${subject}</span>
      </div>
    `).join('');
    
    subjectsList.querySelectorAll('.subject-item').forEach(item => {
      item.addEventListener('click', () => this.selectSubject(item.dataset.subject));
    });
  }
  
  refreshCardsDisplay() {
    const cardsGrid = document.getElementById('cards-grid');
    if (!cardsGrid) return; // Guard clause if element doesn't exist
    
    const cards = this.currentSubject ? 
      this.cardManager.getCardsBySubject(this.currentSubject) :
      this.cardManager.cards;
    
    if (cards.length === 0) {
      cardsGrid.innerHTML = `
        <div class="empty-state">
          <p>Nenhum card encontrado. Comece criando seu primeiro flash card!</p>
        </div>
      `;
      return;
    }
    
    cardsGrid.innerHTML = cards.map(card => this.createCardHTML(card)).join('');
    this.attachCardListeners();
  }
  
  createCardHTML(card) {
    return `
      <div class="flash-card" data-id="${card.id}">
        <div class="card-header">
          <span class="card-topic">${card.topic}</span>
          <div class="card-actions">
            <button class="card-action-btn edit-card" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="card-action-btn delete-card" title="Excluir">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <div class="card-content">
          <p class="card-question">${card.question}</p>
          <p class="card-answer hidden">${card.answer}</p>
          ${card.mnemonic ? `<p class="card-mnemonic hidden">${card.mnemonic}</p>` : ''}
        </div>
      </div>
    `;
  }
  
  attachCardListeners() {
    document.querySelectorAll('.flash-card').forEach(card => {
      card.addEventListener('click', () => this.toggleCardContent(card));
      
      card.querySelector('.edit-card').addEventListener('click', (e) => {
        e.stopPropagation();
        this.editCard(card.dataset.id);
      });
      
      card.querySelector('.delete-card').addEventListener('click', (e) => {
        e.stopPropagation();
        this.deleteCard(card.dataset.id);
      });
    });
  }
  
  toggleCardContent(card) {
    card.querySelector('.card-answer').classList.toggle('hidden');
    const mnemonic = card.querySelector('.card-mnemonic');
    if (mnemonic) mnemonic.classList.toggle('hidden');
  }
  
  showCardModal(cardData = null) {
    const modal = document.getElementById('card-modal');
    const form = document.getElementById('card-form');
    
    if (cardData) {
      // Populate form for editing
      Object.keys(cardData).forEach(key => {
        const input = form.elements[key];
        if (input) input.value = cardData[key];
      });
    }
    
    modal.classList.add('active');
  }
  
  hideCardModal() {
    const modal = document.getElementById('card-modal');
    modal.classList.remove('active');
    document.getElementById('card-form').reset();
  }
  
  async showAddSubjectPrompt() {
    const subject = prompt('Digite o nome da nova matéria:');
    if (subject) {
      await this.cardManager.addCard({
        subject,
        topic: 'Introdução',
        question: 'Primeiro card da matéria',
        answer: 'Comece adicionando seus próprios cards!',
        created: new Date().toISOString()
      });
      this.refreshSubjectsList();
      this.refreshCardsDisplay();
    }
  }
  
  async showAIGenerationPrompt() {
    alert('Funcionalidade de geração por IA será implementada em breve!');
  }
  
  selectSubject(subject) {
    this.currentSubject = subject;
    document.getElementById('current-view-title').textContent = subject;
    this.refreshCardsDisplay();
  }
  
  async editCard(cardId) {
    const card = this.cardManager.cards.find(c => c.id === cardId);
    if (card) {
      this.showCardModal(card);
    }
  }
  
  async deleteCard(cardId) {
    if (confirm('Tem certeza que deseja excluir este card?')) {
      await this.cardManager.deleteCard(cardId);
      this.refreshCardsDisplay();
    }
  }
  
  setupStudyMode() {
    const studyModeBtn = document.getElementById('study-mode-btn');
    if (studyModeBtn) {
      studyModeBtn.addEventListener('click', () => this.startStudyMode());
    }
  }

  startStudyMode() {
    const cards = this.currentSubject ? 
      this.cardManager.getCardsBySubject(this.currentSubject) :
      this.cardManager.cards;

    if (cards.length === 0) {
      alert('Adicione alguns cards antes de iniciar o modo estudo!');
      return;
    }

    // Shuffle cards for study
    const shuffledCards = [...cards].sort(() => Math.random() - 0.5);
    
    document.getElementById('study-modal').classList.add('active');
    this.currentStudyIndex = 0;
    this.studyCards = shuffledCards;
    this.showCurrentStudyCard();
  }

  showCurrentStudyCard() {
    const card = this.studyCards[this.currentStudyIndex];
    const studyCard = document.getElementById('study-card');
    const progress = document.getElementById('study-progress');
    
    studyCard.classList.remove('flipped');
    progress.textContent = `Card ${this.currentStudyIndex + 1} de ${this.studyCards.length}`;
    
    studyCard.innerHTML = `
      <div class="study-card-inner">
        <div class="study-card-front">
          <div class="study-card-topic">${card.subject} - ${card.topic}</div>
          <div class="study-card-question">${card.question}</div>
          <div class="study-card-hint">Clique para ver a resposta</div>
        </div>
        <div class="study-card-back">
          <div class="study-card-answer">${card.answer}</div>
          ${card.mnemonic ? `<div class="study-card-mnemonic">Dica: ${card.mnemonic}</div>` : ''}
        </div>
      </div>
    `;

    studyCard.onclick = () => studyCard.classList.toggle('flipped');
  }

  nextStudyCard() {
    if (this.currentStudyIndex < this.studyCards.length - 1) {
      this.currentStudyIndex++;
      this.showCurrentStudyCard();
    }
  }

  previousStudyCard() {
    if (this.currentStudyIndex > 0) {
      this.currentStudyIndex--;
      this.showCurrentStudyCard();
    }
  }

  endStudyMode() {
    document.getElementById('study-modal').classList.remove('active');
  }
}
