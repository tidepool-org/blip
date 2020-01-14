export default class Queue {
  constructor() {
    this.items = [];
    this.processing = false;
  }

  add = item => this.items.push(item);

  getNext = () => this.items.shift();

  setProcessing = processing => {
    this.processing = processing;
  };
}
