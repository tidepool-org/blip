export default class Queue {
  constructor() {
    this.items = [];
    this.processing = false;
    this.id = null;
  }

  add = item => this.items.push(item);

  getNext = () => this.items.shift();

  clear = () => {
    this.items = [];
    this.setId();
  };

  setId = (id = null) => this.id = id;

  setProcessing = processing => {
    this.processing = processing;
  };
}
