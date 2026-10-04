import DataClient from "./DataClient";
import Game from "./Game";
import { delay } from "./utils";

class GameModel {
  constructor() {
    this.dataClient = new DataClient();
    this.shuffledCarts = [];
    this._openCart = [];
    this.lockedCarts = [];
    this.hitCount = 0;
    this.winHit = 0;
    this.init();
    const defaultState = {
      win: undefined,
      lockcarts: [],
      closecart: [],
      hitcount: 0,
      winhit: 0,
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
    this.shuffleCarts();
  }

  shuffleCarts() {
    this.shuffledCarts = [];
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

    this.shuffledCarts = startArray;
    console.log(this.shuffledCarts);
  }

  set openCart(idCart) {
    if (typeof idCart !== "string") return;
    const indexCart = Number(idCart.replace(/[^\d]/g, ""));
    this._openCart.push(indexCart);
    this.state.addimg = {
      key: indexCart,
      value: this.shuffledCarts[indexCart - 1],
    };
    this.lockCarts();
    // this.state.addimg = { idCart: this.shuffledCarts[indexCart - 1] };
    if (this._openCart.length === 2) {
      this.checkWinHit();
    }
  }

  lockCarts() {
    this.state.lockcarts = (() => {
      switch (this._openCart.length) {
        case 1:
          return this.lockedCarts.concat(this._openCart);
        case 2:
          return Array.from({ length: 16 }, (_, i) => i + 1);
        default:
          return this.lockedCarts;
      }
    })();
  }

  async startTimer() {
    await delay(1200);
    this.state.closecart = this._openCart;
    await delay(30);
    this._openCart = [];
    this.lockCarts();
  }

  async checkWinHit() {
    if (this._openCart.length !== 2) return;
    this.hitCount += 1;
    this.state.hitcount = this.hitCount;
    const winHit =
      this.shuffledCarts.at(this._openCart[0] - 1) ===
      this.shuffledCarts.at(this._openCart[1] - 1);
    if (winHit) {
      this.winHit += 1;
      this.state.winhit = this.winHit;
      this.lockedCarts = this.lockedCarts.concat(this._openCart);
      this._openCart = [];
      this.lockCarts();
      if (this.winHit === 8) {
        await this.saveRezult();
        this.state.win = { data: this.hitCount };
      }
    } else {
      this.startTimer();
    }
  }

  async saveRezult() {
    const data = await this.dataClient.getItem("liders");
    /** @type { Game[]} */
    const liders = data === null ? [] : data.map((item) => new Game(item));
    liders.push(new Game({ points: this.hitCount, winDate: Date.now() }));
    try {
      this.dataClient.setItem("liders", liders);
    } catch {
      console.log("no write");
    }
  }

  subscribe(reducerFunction) {
    this.observer = reducerFunction;
  }
}

export default GameModel;
