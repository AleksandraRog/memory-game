import DataClient from "./DataClient";
import Game from "./Game";
import { delay } from "./utils";

class GameModel {
  constructor() {
    this.dataClient = new DataClient();
    this.shuffledCards = [];
    this._openCard = [];
    this.lockedCards = [];
    this.movesCount = 0;
    this.hit = 0;
    this.init();
    const defaultState = {
      win: undefined,
      lockcards: [],
      closecard: [],
      movescount: 0,
      hit: 0,
      addimg: undefined,
    };

    this.state = new Proxy(defaultState, {
      set: (target, property, value) => {
        if (target[property] === value) return true;
        target[property] = value;

        if (this.observer) {
          this.observer(property, value);
        }

        return true;
      },
    });
  }

  init() {
    this.shuffleCards();
  }

  shuffleCards() {
    this.shuffledCards = [];
    let startArray = Array.from({ length: 16 }, (_, i) => (i % 8) + 1);
    let m = startArray.length,
      t,
      i;
    while (m) {
      i = Math.floor(Math.random() * m--);
      t = startArray[m];
      startArray[m] = startArray[i];
      startArray[i] = t;
    }

    this.shuffledCards = startArray;
    console.log(this.shuffledCards);
  }

  set openCard(idCard) {
    if (typeof idCard !== "string") return;
    const indexCard = Number(idCard.replace(/[^\d]/g, ""));
    this._openCard.push(indexCard);
    this.state.addimg = {
      key: indexCard,
      value: this.shuffledCards[indexCard - 1],
    };
    this.lockCards();
    // this.state.addimg = { idCard: this.shuffledCards[indexCard - 1] };
    if (this._openCard.length === 2) {
      this.checkHit();
    }
  }

  lockCards() {
    this.state.lockcards = (() => {
      switch (this._openCard.length) {
        case 1:
          return this.lockedCards.concat(this._openCard);
        case 2:
          return Array.from({ length: 16 }, (_, i) => i + 1);
        default:
          return this.lockedCards;
      }
    })();
  }

  async startTimer() {
    await delay(1200);
    this.state.closecard = this._openCard;
    await delay(30);
    this._openCard = [];
    this.lockCards();
  }

  async checkHit() {
    if (this._openCard.length !== 2) return;
    this.movesCount += 1;
    this.state.movescount = this.movesCount;
    const hit =
      this.shuffledCards.at(this._openCard[0] - 1) ===
      this.shuffledCards.at(this._openCard[1] - 1);
    if (hit) {
      this.hit += 1;
      this.state.hit = this.hit;
      this.lockedCards = this.lockedCards.concat(this._openCard);
      this._openCard = [];
      this.lockCards();
      if (this.hit === 8) {
        await this.saveResult();
        this.state.win = { data: this.movesCount };
      }
    } else {
      this.startTimer();
    }
  }

  async saveResult() {
    const data = await this.dataClient.getItem("leaders");
    /** @type { Game[]} */
    const leaders = data === null ? [] : data.map((item) => new Game(item));
    leaders.push(new Game({ points: this.movesCount, winDate: Date.now() }));
    try {
      this.dataClient.setItem("leaders", leaders);
    } catch {
      console.log("no write");
    }
  }

  subscribe(reducerFunction) {
    this.observer = reducerFunction;
  }
}

export default GameModel;
