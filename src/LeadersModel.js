import DataClient from "./DataClient";
import Game from "./Game";

class LeadersModel {
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

  async getLeaders() {
    const data = await this.dataClient.getItem("leaders");
    /** @type { Game[]} */
    const leaders = data === null ? [] : data.map((item) => new Game(item));
    const sortedLeaders = leaders.sort(
      (a, b) => a.points - b.points || b.winDate - a.winDate,
    );
    this.state.openmodal = {
      data: sortedLeaders.slice(0, Math.min(10, sortedLeaders.length)),
    };
  }

  subscribe(reducerFunction) {
    this.observer = reducerFunction;
  }
}

export default LeadersModel;
