export class StorageManager {
  constructor() {
    this.STORAGE_KEY = 'flashcards_data';
  }
  
  async getCards() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }
  
  async saveCards(cards) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cards));
  }
}
