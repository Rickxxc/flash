export class FlashCardManager {
  constructor(storage) {
    this.storage = storage;
    this.cards = [];
    this.subjects = new Set();
  }
  
  async loadCards() {
    this.cards = await this.storage.getCards();
    this.updateSubjects();
  }
  
  updateSubjects() {
    this.subjects = new Set(this.cards.map(card => card.subject));
  }
  
  async addCard(cardData) {
    const card = {
      id: Date.now().toString(),
      ...cardData
    };
    this.cards.push(card);
    await this.storage.saveCards(this.cards);
    this.updateSubjects();
    return card;
  }
  
  async updateCard(id, updates) {
    const index = this.cards.findIndex(card => card.id === id);
    if (index !== -1) {
      this.cards[index] = { ...this.cards[index], ...updates };
      await this.storage.saveCards(this.cards);
      this.updateSubjects();
    }
  }
  
  async deleteCard(id) {
    this.cards = this.cards.filter(card => card.id !== id);
    await this.storage.saveCards(this.cards);
    this.updateSubjects();
  }
  
  getCardsBySubject(subject) {
    return this.cards.filter(card => card.subject === subject);
  }
  
  getSubjects() {
    return Array.from(this.subjects);
  }
}
