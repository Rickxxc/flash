import { FlashCardManager } from './flashCardManager.js';
import { UIManager } from './uiManager.js';
import { StorageManager } from './storageManager.js';

class App {
  constructor() {
    this.storage = new StorageManager();
    this.cardManager = new FlashCardManager(this.storage);
    this.ui = new UIManager(this.cardManager);
    
    // Wait for DOM to be fully loaded before initializing
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initialize());
    } else {
      this.initialize();
    }
  }
  
  async initialize() {
    await this.cardManager.loadCards();
    this.ui.initialize();
    this.attachEventListeners();
  }
  
  attachEventListeners() {
    // Modal controls
    document.getElementById('create-card-btn').addEventListener('click', () => this.ui.showCardModal());
    document.getElementById('close-modal').addEventListener('click', () => this.ui.hideCardModal());
    document.getElementById('cancel-card').addEventListener('click', () => this.ui.hideCardModal());
    
    // Card form submission
    document.getElementById('card-form').addEventListener('submit', (e) => this.handleCardSubmission(e));
    
    // Subject management
    document.getElementById('add-subject-btn').addEventListener('click', () => this.ui.showAddSubjectPrompt());
    
    // AI generation
    document.getElementById('ai-generate-btn').addEventListener('click', () => this.ui.showAIGenerationPrompt());
    
    // Add study mode button
    document.getElementById('study-mode-btn').addEventListener('click', () => {
      this.ui.startStudyMode();
    });
  }
 -----------------------------------------------------------------------------
  async handleCardSubmission(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    let subject = formData.get('subject');
    
    // Handle new subject creation
    if (subject === 'new') {
      subject = prompt('Digite o nome da nova matéria:');
      if (!subject) return;
    }
    
    const cardData = {
      subject,
      topic: formData.get('topic'),
      question: formData.get('question'),
      answer: formData.get('answer'),
      mnemonic: formData.get('mnemonic'),
      created: new Date().toISOString()
    };
    
    await this.cardManager.addCard(cardData);
    this.ui.hideCardModal();
    this.ui.refreshCardsDisplay();
    this.ui.refreshSubjectsList();
    this.ui.setupSubjectsInForm();
    e.target.reset();
  }
}

// Initialize the application
window.addEventListener('DOMContentLoaded', () => {
  new App();
});
