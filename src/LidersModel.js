import DataClient from "./DataClient";
import Game from "./Game";

class LidersModel {
  constructor() {
    this.dataClient = new DataClient();
    this.init();
    const defaultState = {
      openmodal: [],
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

  init() {}

  async getLiders() {
    const data = await this.dataClient.getItem("liders");
    /** @type { Game[]} */
    const liders = data === null ? [] : data.map((item) => new Game(item));
    const sortedLiders = liders.sort(
      (a, b) => a.points - b.points || b.winDate - a.winDate,
    );
    this.state.openmodal = {
      data: sortedLiders.slice(0, Math.min(10, sortedLiders.length)),
    };
  }

  subscribe(reducerFunction) {
    this.observer = reducerFunction;
  }
}

export default LidersModel;
