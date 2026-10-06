/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./DataClient.js"
/*!***********************!*\
  !*** ./DataClient.js ***!
  \***********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class DataClient {
  constructor(namespace = "memory-game", url = "") {
    this.namespace = namespace;
    this.url = url;
  }

  async getItem(key = "") {
    const value = localStorage.getItem(`${this.namespace}:${key}`);
    return value ? JSON.parse(value) : null;
  }

  setItem(key = "", value = undefined) {
    localStorage.setItem(`${this.namespace}:${key}`, JSON.stringify(value));
  }

  removeItem(key = "") {
    localStorage.removeItem(`${this.namespace}:${key}`);
  }

  async postData(url = "", data = {}) {
    const response = await fetch(url, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      referrerPolicy: "no-referrer",
      body: JSON.stringify(data),
    });
    return await response.json();
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (DataClient);


/***/ },

/***/ "./Game.js"
/*!*****************!*\
  !*** ./Game.js ***!
  \*****************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class Game {
  static formatter = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  /**
   * @param {Object} profile - Данные профиля игрока.
   * @param {Date} profile.winDate - Дата победы.
   * @param {number} profile.points - Набранные очки.
   */
  constructor({ winDate, points }) {
    this.winDate = winDate;
    this.points = points;
  }

  get fwinDate() {
    return Game.formatter.format(this.winDate);
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Game);


/***/ },

/***/ "./GameModel.js"
/*!**********************!*\
  !*** ./GameModel.js ***!
  \**********************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _DataClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./DataClient */ "./DataClient.js");
/* harmony import */ var _Game__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Game */ "./Game.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utils */ "./utils.js");




class GameModel {
  constructor() {
    this.dataClient = new _DataClient__WEBPACK_IMPORTED_MODULE_0__["default"]();
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
    await (0,_utils__WEBPACK_IMPORTED_MODULE_2__.delay)(1200);
    this.state.closecard = this._openCard;
    await (0,_utils__WEBPACK_IMPORTED_MODULE_2__.delay)(30);
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
    const leaders = data === null ? [] : data.map((item) => new _Game__WEBPACK_IMPORTED_MODULE_1__["default"](item));
    leaders.push(new _Game__WEBPACK_IMPORTED_MODULE_1__["default"]({ points: this.movesCount, winDate: Date.now() }));
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

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GameModel);


/***/ },

/***/ "./ItemUI.js"
/*!*******************!*\
  !*** ./ItemUI.js ***!
  \*******************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class ItemUI {
  constructor({
    tag = "div",
    classNames = [],
    inners = [],
    text = undefined,
    value = undefined,
    attrs = {},
    events = {},
  } = {}) {
    this.tag = tag;
    this.classNames = classNames;
    this.inners = inners;
    this.text = text;
    this.value = value;
    this.attrs = attrs;
    this.events = events;
    this.uiElement = this.createNewElement();
  }

  createNewElement() {
    let element = document.createElement(this.tag);

    this.classNames.forEach((className) => {
      element.classList.add(className);
    });

    if (this.text) {
      element.innerText = this.text;
    }

    Object.entries(this.attrs).forEach(([k, v]) => element.setAttribute(k, v));

    if (this.value !== undefined) {
      element.value = this.value;
    }

    Object.entries(this.events).forEach(([eventName, handler]) => {
      if (typeof handler === "function") {
        const boundHandler = handler.bind(this);
        element.addEventListener(eventName, boundHandler);
      }
    });

    this.inners.forEach((innerElement) => {
      if (innerElement instanceof ItemUI) {
        element.appendChild(innerElement.uiElement);
      } else if (innerElement instanceof HTMLElement) {
        element.appendChild(innerElement);
      }
    });

    return element;
  }

  destroy() {
    this.inners.forEach((inner) => {
      if (inner instanceof ItemUI) {
        inner.destroy();
      }
    });

    if (this.uiElement && this.uiElement.parentNode) {
      this.uiElement.remove();
    }

    this.uiElement = null;
    this.inners = [];
    this.events = {};
  }

  static create(tagAndClasses, configOrInners = {}, possibleInners = []) {
    let targetString = tagAndClasses.trim();
    if (targetString.startsWith(".")) {
      targetString = "div" + targetString;
    }

    const parts = targetString.split(".");
    const tag = parts[0] || "div";
    const classNames = parts.slice(1);

    let config = {};
    let inners = possibleInners;

    if (Array.isArray(configOrInners)) {
      inners = configOrInners;
    } else if (
      typeof configOrInners === "string" ||
      typeof configOrInners === "number"
    ) {
      config.text = configOrInners;
    } else {
      config = { ...configOrInners };
    }

    if (inners.length > 0) config.inners = inners;
    config.tag = tag;
    config.classNames = [...classNames, ...(config.classNames || [])];

    return new ItemUI(config);
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ItemUI);


/***/ },

/***/ "./LeadersModel.js"
/*!*************************!*\
  !*** ./LeadersModel.js ***!
  \*************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _DataClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./DataClient */ "./DataClient.js");
/* harmony import */ var _Game__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Game */ "./Game.js");



class LeadersModel {
  constructor() {
    this.dataClient = new _DataClient__WEBPACK_IMPORTED_MODULE_0__["default"]();
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
    const leaders = data === null ? [] : data.map((item) => new _Game__WEBPACK_IMPORTED_MODULE_1__["default"](item));
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

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (LeadersModel);


/***/ },

/***/ "./utils.js"
/*!******************!*\
  !*** ./utils.js ***!
  \******************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   delay: () => (/* binding */ delay)
/* harmony export */ });
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			const e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	// define getter/value functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop));
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ 	
/************************************************************************/
let __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!******************!*\
  !*** ./index.js ***!
  \******************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _GameModel__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./GameModel */ "./GameModel.js");
/* harmony import */ var _Game__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Game */ "./Game.js");
/* harmony import */ var _ItemUI__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./ItemUI */ "./ItemUI.js");
/* harmony import */ var _LeadersModel__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./LeadersModel */ "./LeadersModel.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utils */ "./utils.js");






const root = document.querySelector("body");

const COUNT_GAME_CARDS = 16;

const $ = _ItemUI__WEBPACK_IMPORTED_MODULE_2__["default"].create;

const createCloseCards = (model) =>
  Array.from({ length: COUNT_GAME_CARDS }, (_, i) => i + 1).map((ind) =>
    $(
      ".card-container",
      {
        attrs: { id: `card-${ind}` },
        events: {
          click: (event) => {
            revertCard(model, event);
          },
        },
      },
      [$(".img-wrapper")],
    ),
  );

const revertCard = async (model, event) => {
  const cardContainer = event.currentTarget;
  model.openCard = cardContainer.id;
  (0,_utils__WEBPACK_IMPORTED_MODULE_4__.delay)(15);
  cardContainer.classList.toggle("is-open");
};

const newGameButton = () =>
  $("button.new-game-button", {
    text: "New game",
    events: { click: onClickNewGameButton },
  });

const closeModalButton = () => $("button.close-modal-button", "Close");

/**
 * Функция для обработки или отображения таблицы лидеров.
 * @param {Game[]} leaders - Массив объектов класса Game.
 * @returns {HTMLElement[]} Новый массив, полученный в результате маппинга.
 */
const leadersTable = (leaders) =>
  leaders.length === 0
    ? $(".placeholder", "Not Winers")
    : $("table.leaders-table", [
        $("thead.leaders-table-head", [
          $("td.gamer-position", "N"),
          $("td.gamer-points", "Points"),
          $("td.gamer-win-date", "Date"),
        ]),
        $("tbody", leaderTableRows(leaders)),
      ]);

/**
 * Функция для обработки или отображения таблицы лидеров.
 * @param {Game[]} leaders - Массив объектов класса Game.
 * @returns {HTMLElement[]} Новый массив, полученный в результате маппинга.
 */
const leaderTableRows = (leaders) =>
  leaders.map((game, i) =>
    $("tr.gamer-table-row", [
      $("td.gamer-position", i + 1),
      $("td.gamer-points", game.points),
      $("td.gamer-win-date", game.fwinDate),
    ]),
  );

function onClickLeadersButton(model, event) {
  model.getLeaders();
}

const dialogEvents = {
  click(event) {
    const isOverlay = event.target === event.currentTarget;
    const isCloseBtn = event.target.closest(".close-modal-button");
    if (isOverlay || isCloseBtn) {
      this.destroy();
    }
  },
  cancel(event) {
    event.preventDefault();
    this.destroy();
  },
};

async function onClickNewGameButton() {
  root.querySelectorAll(".card-container").forEach((card) => {
    card.classList.remove("is-open");
  });
  await (0,_utils__WEBPACK_IMPORTED_MODULE_4__.delay)(250);
  render();
}

const leadersModal = (leaders) =>
  $("dialog.leaders-modal", { events: dialogEvents }, [
    $(".modal-container", [
      $("h2.leaders-table-title", "Leaders"),
      leadersTable(leaders),
      closeModalButton(),
    ]),
  ]);

const winModal = (score) =>
  $("dialog.win-modal", { events: dialogEvents }, [
    $(".modal-container", { events: dialogEvents }, [
      $("h2.win-title", "Congratulations!"),
      $(".win-score", `Your score ${score} points`),
      $(".buttons-block", [newGameButton(), closeModalButton()]),
    ]),
  ]);

const openWinModal = (score) => {
  const modal = winModal(score).uiElement;
  if (modal instanceof HTMLDialogElement) {
    root.appendChild(modal);
    modal.showModal();
  }
};

function gameReduser(actionType, payload) {
  switch (actionType) {
    case "win":
      if (payload) {
        openWinModal(payload.data);
      }
      break;
    case "lockcards":
      root.querySelectorAll(".card-container").forEach((card) => {
        if (payload.includes(Number(card.id.replace(/[^\d]/g, "")))) {
          card.classList.add("lock-click");
        } else {
          card.classList.remove("lock-click");
        }
      });
      break;
    case "hit":
      root.querySelector(".wins-count").textContent = `${payload} of 8 pairs`;
      break;
    case "closecard":
      root.querySelectorAll(".card-container").forEach((card) => {
        if (payload.includes(Number(card.id.replace(/[^\d]/g, "")))) {
          card.classList.toggle("is-open");
          const img = card.querySelector(".figure-img");
          img.remove();
        }
      });
      break;
    case "movescount":
      root.querySelector(".moves-count").textContent = payload;
      break;
    case "addimg":
      const cont = root.querySelector(`.card-container#card-${payload.key}`);
      const wrapper = cont.querySelector(".img-wrapper");
      const img = $("img.figure-img", {
        attrs: { src: `images/origami_shape_${payload.value}.svg`, alt: "" },
      });
      wrapper.appendChild(img.uiElement);
    default:
      break;
  }
}

function leadersReduser(actionType, payload) {
  switch (actionType) {
    case "openmodal":
      const modal = leadersModal(payload.data).uiElement;
      if (modal instanceof HTMLDialogElement) {
        root.appendChild(modal);
        modal.showModal();
      }
      break;
    default:
      break;
  }
}

async function render() {
  const gameModel = new _GameModel__WEBPACK_IMPORTED_MODULE_0__["default"]();
  const leadersModel = new _LeadersModel__WEBPACK_IMPORTED_MODULE_3__["default"]();
  gameModel.subscribe(gameReduser);
  leadersModel.subscribe(leadersReduser);

  const header = (model) =>
    $("header.header", [
      $(".container.header-container", [
        $("button.header-button.leaders-modal-button", {
          text: "Leaders",
          events: { click: onClickLeadersButton.bind(null, model) },
        }),
        newGameButton(),
      ]),
    ]);

  const main = $("main", [
    $(".container", [
      $("h1.game-title", "Memory game"),
      $(".card-grid", createCloseCards(gameModel)),
    ]),
  ]);

  const footer = $("footer.footer", [
    $(".container", [
      $("h3.current-result-title", "Current Score:"),
      $(".score", [
        $(".moves", [
          $("span.moves-title", "Moves:"),
          $("span.moves-count", "0"),
        ]),
        $(".wins", [
          $("span.wins-title", "Wins:"),
          $("span.wins-count", "0 of 8 pairs"),
        ]),
      ]),
    ]),
  ]);

  const bodyList = [header(leadersModel), main, footer].map(
    (tag) => tag.uiElement,
  );
  root.replaceChildren(...bodyList);
}

render();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTs7QUFFQTtBQUNBLHdCQUF3QixrREFBUztBQUNqQywyQkFBMkIscURBQVk7QUFDdkM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLCtDQUErQztBQUNuRSxTQUFTO0FBQ1Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL0RhdGFDbGllbnQuanMiLCJ3ZWJwYWNrOi8vLy4vR2FtZS5qcyIsIndlYnBhY2s6Ly8vLi9HYW1lTW9kZWwuanMiLCJ3ZWJwYWNrOi8vLy4vSXRlbVVJLmpzIiwid2VicGFjazovLy8uL0xlYWRlcnNNb2RlbC5qcyIsIndlYnBhY2s6Ly8vLi91dGlscy5qcyIsIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly8vLi9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBEYXRhQ2xpZW50IHtcbiAgY29uc3RydWN0b3IobmFtZXNwYWNlID0gXCJtZW1vcnktZ2FtZVwiLCB1cmwgPSBcIlwiKSB7XG4gICAgdGhpcy5uYW1lc3BhY2UgPSBuYW1lc3BhY2U7XG4gICAgdGhpcy51cmwgPSB1cmw7XG4gIH1cblxuICBhc3luYyBnZXRJdGVtKGtleSA9IFwiXCIpIHtcbiAgICBjb25zdCB2YWx1ZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKGAke3RoaXMubmFtZXNwYWNlfToke2tleX1gKTtcbiAgICByZXR1cm4gdmFsdWUgPyBKU09OLnBhcnNlKHZhbHVlKSA6IG51bGw7XG4gIH1cblxuICBzZXRJdGVtKGtleSA9IFwiXCIsIHZhbHVlID0gdW5kZWZpbmVkKSB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oYCR7dGhpcy5uYW1lc3BhY2V9OiR7a2V5fWAsIEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG4gIH1cblxuICByZW1vdmVJdGVtKGtleSA9IFwiXCIpIHtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShgJHt0aGlzLm5hbWVzcGFjZX06JHtrZXl9YCk7XG4gIH1cblxuICBhc3luYyBwb3N0RGF0YSh1cmwgPSBcIlwiLCBkYXRhID0ge30pIHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge1xuICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgIG1vZGU6IFwiY29yc1wiLFxuICAgICAgY2FjaGU6IFwibm8tY2FjaGVcIixcbiAgICAgIGNyZWRlbnRpYWxzOiBcInNhbWUtb3JpZ2luXCIsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgfSxcbiAgICAgIHJlZGlyZWN0OiBcImZvbGxvd1wiLFxuICAgICAgcmVmZXJyZXJQb2xpY3k6IFwibm8tcmVmZXJyZXJcIixcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGRhdGEpLFxuICAgIH0pO1xuICAgIHJldHVybiBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRGF0YUNsaWVudDtcbiIsImNsYXNzIEdhbWUge1xuICBzdGF0aWMgZm9ybWF0dGVyID0gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQoXCJydS1SVVwiLCB7XG4gICAgZGF5OiBcIjItZGlnaXRcIixcbiAgICBtb250aDogXCIyLWRpZ2l0XCIsXG4gICAgeWVhcjogXCJudW1lcmljXCIsXG4gIH0pO1xuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IHByb2ZpbGUgLSDQlNCw0L3QvdGL0LUg0L/RgNC+0YTQuNC70Y8g0LjQs9GA0L7QutCwLlxuICAgKiBAcGFyYW0ge0RhdGV9IHByb2ZpbGUud2luRGF0ZSAtINCU0LDRgtCwINC/0L7QsdC10LTRiy5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHByb2ZpbGUucG9pbnRzIC0g0J3QsNCx0YDQsNC90L3Ri9C1INC+0YfQutC4LlxuICAgKi9cbiAgY29uc3RydWN0b3IoeyB3aW5EYXRlLCBwb2ludHMgfSkge1xuICAgIHRoaXMud2luRGF0ZSA9IHdpbkRhdGU7XG4gICAgdGhpcy5wb2ludHMgPSBwb2ludHM7XG4gIH1cblxuICBnZXQgZndpbkRhdGUoKSB7XG4gICAgcmV0dXJuIEdhbWUuZm9ybWF0dGVyLmZvcm1hdCh0aGlzLndpbkRhdGUpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWU7XG4iLCJpbXBvcnQgRGF0YUNsaWVudCBmcm9tIFwiLi9EYXRhQ2xpZW50XCI7XG5pbXBvcnQgR2FtZSBmcm9tIFwiLi9HYW1lXCI7XG5pbXBvcnQgeyBkZWxheSB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbmNsYXNzIEdhbWVNb2RlbCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZGF0YUNsaWVudCA9IG5ldyBEYXRhQ2xpZW50KCk7XG4gICAgdGhpcy5zaHVmZmxlZENhcmRzID0gW107XG4gICAgdGhpcy5fb3BlbkNhcmQgPSBbXTtcbiAgICB0aGlzLmxvY2tlZENhcmRzID0gW107XG4gICAgdGhpcy5tb3Zlc0NvdW50ID0gMDtcbiAgICB0aGlzLmhpdCA9IDA7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgY29uc3QgZGVmYXVsdFN0YXRlID0ge1xuICAgICAgd2luOiB1bmRlZmluZWQsXG4gICAgICBsb2NrY2FyZHM6IFtdLFxuICAgICAgY2xvc2VjYXJkOiBbXSxcbiAgICAgIG1vdmVzY291bnQ6IDAsXG4gICAgICBoaXQ6IDAsXG4gICAgICBhZGRpbWc6IHVuZGVmaW5lZCxcbiAgICB9O1xuXG4gICAgdGhpcy5zdGF0ZSA9IG5ldyBQcm94eShkZWZhdWx0U3RhdGUsIHtcbiAgICAgIHNldDogKHRhcmdldCwgcHJvcGVydHksIHZhbHVlKSA9PiB7XG4gICAgICAgIGlmICh0YXJnZXRbcHJvcGVydHldID09PSB2YWx1ZSkgcmV0dXJuIHRydWU7XG4gICAgICAgIHRhcmdldFtwcm9wZXJ0eV0gPSB2YWx1ZTtcblxuICAgICAgICBpZiAodGhpcy5vYnNlcnZlcikge1xuICAgICAgICAgIHRoaXMub2JzZXJ2ZXIocHJvcGVydHksIHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIGluaXQoKSB7XG4gICAgdGhpcy5zaHVmZmxlQ2FyZHMoKTtcbiAgfVxuXG4gIHNodWZmbGVDYXJkcygpIHtcbiAgICB0aGlzLnNodWZmbGVkQ2FyZHMgPSBbXTtcbiAgICBsZXQgc3RhcnRBcnJheSA9IEFycmF5LmZyb20oeyBsZW5ndGg6IDE2IH0sIChfLCBpKSA9PiAoaSAlIDgpICsgMSk7XG4gICAgbGV0IG0gPSBzdGFydEFycmF5Lmxlbmd0aCxcbiAgICAgIHQsXG4gICAgICBpO1xuICAgIHdoaWxlIChtKSB7XG4gICAgICBpID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogbS0tKTtcbiAgICAgIHQgPSBzdGFydEFycmF5W21dO1xuICAgICAgc3RhcnRBcnJheVttXSA9IHN0YXJ0QXJyYXlbaV07XG4gICAgICBzdGFydEFycmF5W2ldID0gdDtcbiAgICB9XG5cbiAgICB0aGlzLnNodWZmbGVkQ2FyZHMgPSBzdGFydEFycmF5O1xuICAgIGNvbnNvbGUubG9nKHRoaXMuc2h1ZmZsZWRDYXJkcyk7XG4gIH1cblxuICBzZXQgb3BlbkNhcmQoaWRDYXJkKSB7XG4gICAgaWYgKHR5cGVvZiBpZENhcmQgIT09IFwic3RyaW5nXCIpIHJldHVybjtcbiAgICBjb25zdCBpbmRleENhcmQgPSBOdW1iZXIoaWRDYXJkLnJlcGxhY2UoL1teXFxkXS9nLCBcIlwiKSk7XG4gICAgdGhpcy5fb3BlbkNhcmQucHVzaChpbmRleENhcmQpO1xuICAgIHRoaXMuc3RhdGUuYWRkaW1nID0ge1xuICAgICAga2V5OiBpbmRleENhcmQsXG4gICAgICB2YWx1ZTogdGhpcy5zaHVmZmxlZENhcmRzW2luZGV4Q2FyZCAtIDFdLFxuICAgIH07XG4gICAgdGhpcy5sb2NrQ2FyZHMoKTtcbiAgICAvLyB0aGlzLnN0YXRlLmFkZGltZyA9IHsgaWRDYXJkOiB0aGlzLnNodWZmbGVkQ2FyZHNbaW5kZXhDYXJkIC0gMV0gfTtcbiAgICBpZiAodGhpcy5fb3BlbkNhcmQubGVuZ3RoID09PSAyKSB7XG4gICAgICB0aGlzLmNoZWNrSGl0KCk7XG4gICAgfVxuICB9XG5cbiAgbG9ja0NhcmRzKCkge1xuICAgIHRoaXMuc3RhdGUubG9ja2NhcmRzID0gKCgpID0+IHtcbiAgICAgIHN3aXRjaCAodGhpcy5fb3BlbkNhcmQubGVuZ3RoKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICByZXR1cm4gdGhpcy5sb2NrZWRDYXJkcy5jb25jYXQodGhpcy5fb3BlbkNhcmQpO1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oeyBsZW5ndGg6IDE2IH0sIChfLCBpKSA9PiBpICsgMSk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIHRoaXMubG9ja2VkQ2FyZHM7XG4gICAgICB9XG4gICAgfSkoKTtcbiAgfVxuXG4gIGFzeW5jIHN0YXJ0VGltZXIoKSB7XG4gICAgYXdhaXQgZGVsYXkoMTIwMCk7XG4gICAgdGhpcy5zdGF0ZS5jbG9zZWNhcmQgPSB0aGlzLl9vcGVuQ2FyZDtcbiAgICBhd2FpdCBkZWxheSgzMCk7XG4gICAgdGhpcy5fb3BlbkNhcmQgPSBbXTtcbiAgICB0aGlzLmxvY2tDYXJkcygpO1xuICB9XG5cbiAgYXN5bmMgY2hlY2tIaXQoKSB7XG4gICAgaWYgKHRoaXMuX29wZW5DYXJkLmxlbmd0aCAhPT0gMikgcmV0dXJuO1xuICAgIHRoaXMubW92ZXNDb3VudCArPSAxO1xuICAgIHRoaXMuc3RhdGUubW92ZXNjb3VudCA9IHRoaXMubW92ZXNDb3VudDtcbiAgICBjb25zdCBoaXQgPVxuICAgICAgdGhpcy5zaHVmZmxlZENhcmRzLmF0KHRoaXMuX29wZW5DYXJkWzBdIC0gMSkgPT09XG4gICAgICB0aGlzLnNodWZmbGVkQ2FyZHMuYXQodGhpcy5fb3BlbkNhcmRbMV0gLSAxKTtcbiAgICBpZiAoaGl0KSB7XG4gICAgICB0aGlzLmhpdCArPSAxO1xuICAgICAgdGhpcy5zdGF0ZS5oaXQgPSB0aGlzLmhpdDtcbiAgICAgIHRoaXMubG9ja2VkQ2FyZHMgPSB0aGlzLmxvY2tlZENhcmRzLmNvbmNhdCh0aGlzLl9vcGVuQ2FyZCk7XG4gICAgICB0aGlzLl9vcGVuQ2FyZCA9IFtdO1xuICAgICAgdGhpcy5sb2NrQ2FyZHMoKTtcbiAgICAgIGlmICh0aGlzLmhpdCA9PT0gOCkge1xuICAgICAgICBhd2FpdCB0aGlzLnNhdmVSZXN1bHQoKTtcbiAgICAgICAgdGhpcy5zdGF0ZS53aW4gPSB7IGRhdGE6IHRoaXMubW92ZXNDb3VudCB9O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0YXJ0VGltZXIoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBzYXZlUmVzdWx0KCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmRhdGFDbGllbnQuZ2V0SXRlbShcImxlYWRlcnNcIik7XG4gICAgLyoqIEB0eXBlIHsgR2FtZVtdfSAqL1xuICAgIGNvbnN0IGxlYWRlcnMgPSBkYXRhID09PSBudWxsID8gW10gOiBkYXRhLm1hcCgoaXRlbSkgPT4gbmV3IEdhbWUoaXRlbSkpO1xuICAgIGxlYWRlcnMucHVzaChuZXcgR2FtZSh7IHBvaW50czogdGhpcy5tb3Zlc0NvdW50LCB3aW5EYXRlOiBEYXRlLm5vdygpIH0pKTtcbiAgICB0cnkge1xuICAgICAgdGhpcy5kYXRhQ2xpZW50LnNldEl0ZW0oXCJsZWFkZXJzXCIsIGxlYWRlcnMpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgY29uc29sZS5sb2coXCJubyB3cml0ZVwiKTtcbiAgICB9XG4gIH1cblxuICBzdWJzY3JpYmUocmVkdWNlckZ1bmN0aW9uKSB7XG4gICAgdGhpcy5vYnNlcnZlciA9IHJlZHVjZXJGdW5jdGlvbjtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBHYW1lTW9kZWw7XG4iLCJjbGFzcyBJdGVtVUkge1xuICBjb25zdHJ1Y3Rvcih7XG4gICAgdGFnID0gXCJkaXZcIixcbiAgICBjbGFzc05hbWVzID0gW10sXG4gICAgaW5uZXJzID0gW10sXG4gICAgdGV4dCA9IHVuZGVmaW5lZCxcbiAgICB2YWx1ZSA9IHVuZGVmaW5lZCxcbiAgICBhdHRycyA9IHt9LFxuICAgIGV2ZW50cyA9IHt9LFxuICB9ID0ge30pIHtcbiAgICB0aGlzLnRhZyA9IHRhZztcbiAgICB0aGlzLmNsYXNzTmFtZXMgPSBjbGFzc05hbWVzO1xuICAgIHRoaXMuaW5uZXJzID0gaW5uZXJzO1xuICAgIHRoaXMudGV4dCA9IHRleHQ7XG4gICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgIHRoaXMuYXR0cnMgPSBhdHRycztcbiAgICB0aGlzLmV2ZW50cyA9IGV2ZW50cztcbiAgICB0aGlzLnVpRWxlbWVudCA9IHRoaXMuY3JlYXRlTmV3RWxlbWVudCgpO1xuICB9XG5cbiAgY3JlYXRlTmV3RWxlbWVudCgpIHtcbiAgICBsZXQgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGhpcy50YWcpO1xuXG4gICAgdGhpcy5jbGFzc05hbWVzLmZvckVhY2goKGNsYXNzTmFtZSkgPT4ge1xuICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKGNsYXNzTmFtZSk7XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy50ZXh0KSB7XG4gICAgICBlbGVtZW50LmlubmVyVGV4dCA9IHRoaXMudGV4dDtcbiAgICB9XG5cbiAgICBPYmplY3QuZW50cmllcyh0aGlzLmF0dHJzKS5mb3JFYWNoKChbaywgdl0pID0+IGVsZW1lbnQuc2V0QXR0cmlidXRlKGssIHYpKTtcblxuICAgIGlmICh0aGlzLnZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGVsZW1lbnQudmFsdWUgPSB0aGlzLnZhbHVlO1xuICAgIH1cblxuICAgIE9iamVjdC5lbnRyaWVzKHRoaXMuZXZlbnRzKS5mb3JFYWNoKChbZXZlbnROYW1lLCBoYW5kbGVyXSkgPT4ge1xuICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgY29uc3QgYm91bmRIYW5kbGVyID0gaGFuZGxlci5iaW5kKHRoaXMpO1xuICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCBib3VuZEhhbmRsZXIpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5pbm5lcnMuZm9yRWFjaCgoaW5uZXJFbGVtZW50KSA9PiB7XG4gICAgICBpZiAoaW5uZXJFbGVtZW50IGluc3RhbmNlb2YgSXRlbVVJKSB7XG4gICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoaW5uZXJFbGVtZW50LnVpRWxlbWVudCk7XG4gICAgICB9IGVsc2UgaWYgKGlubmVyRWxlbWVudCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSB7XG4gICAgICAgIGVsZW1lbnQuYXBwZW5kQ2hpbGQoaW5uZXJFbGVtZW50KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBlbGVtZW50O1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmlubmVycy5mb3JFYWNoKChpbm5lcikgPT4ge1xuICAgICAgaWYgKGlubmVyIGluc3RhbmNlb2YgSXRlbVVJKSB7XG4gICAgICAgIGlubmVyLmRlc3Ryb3koKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmICh0aGlzLnVpRWxlbWVudCAmJiB0aGlzLnVpRWxlbWVudC5wYXJlbnROb2RlKSB7XG4gICAgICB0aGlzLnVpRWxlbWVudC5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICB0aGlzLnVpRWxlbWVudCA9IG51bGw7XG4gICAgdGhpcy5pbm5lcnMgPSBbXTtcbiAgICB0aGlzLmV2ZW50cyA9IHt9O1xuICB9XG5cbiAgc3RhdGljIGNyZWF0ZSh0YWdBbmRDbGFzc2VzLCBjb25maWdPcklubmVycyA9IHt9LCBwb3NzaWJsZUlubmVycyA9IFtdKSB7XG4gICAgbGV0IHRhcmdldFN0cmluZyA9IHRhZ0FuZENsYXNzZXMudHJpbSgpO1xuICAgIGlmICh0YXJnZXRTdHJpbmcuc3RhcnRzV2l0aChcIi5cIikpIHtcbiAgICAgIHRhcmdldFN0cmluZyA9IFwiZGl2XCIgKyB0YXJnZXRTdHJpbmc7XG4gICAgfVxuXG4gICAgY29uc3QgcGFydHMgPSB0YXJnZXRTdHJpbmcuc3BsaXQoXCIuXCIpO1xuICAgIGNvbnN0IHRhZyA9IHBhcnRzWzBdIHx8IFwiZGl2XCI7XG4gICAgY29uc3QgY2xhc3NOYW1lcyA9IHBhcnRzLnNsaWNlKDEpO1xuXG4gICAgbGV0IGNvbmZpZyA9IHt9O1xuICAgIGxldCBpbm5lcnMgPSBwb3NzaWJsZUlubmVycztcblxuICAgIGlmIChBcnJheS5pc0FycmF5KGNvbmZpZ09ySW5uZXJzKSkge1xuICAgICAgaW5uZXJzID0gY29uZmlnT3JJbm5lcnM7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHR5cGVvZiBjb25maWdPcklubmVycyA9PT0gXCJzdHJpbmdcIiB8fFxuICAgICAgdHlwZW9mIGNvbmZpZ09ySW5uZXJzID09PSBcIm51bWJlclwiXG4gICAgKSB7XG4gICAgICBjb25maWcudGV4dCA9IGNvbmZpZ09ySW5uZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25maWcgPSB7IC4uLmNvbmZpZ09ySW5uZXJzIH07XG4gICAgfVxuXG4gICAgaWYgKGlubmVycy5sZW5ndGggPiAwKSBjb25maWcuaW5uZXJzID0gaW5uZXJzO1xuICAgIGNvbmZpZy50YWcgPSB0YWc7XG4gICAgY29uZmlnLmNsYXNzTmFtZXMgPSBbLi4uY2xhc3NOYW1lcywgLi4uKGNvbmZpZy5jbGFzc05hbWVzIHx8IFtdKV07XG5cbiAgICByZXR1cm4gbmV3IEl0ZW1VSShjb25maWcpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEl0ZW1VSTtcbiIsImltcG9ydCBEYXRhQ2xpZW50IGZyb20gXCIuL0RhdGFDbGllbnRcIjtcbmltcG9ydCBHYW1lIGZyb20gXCIuL0dhbWVcIjtcblxuY2xhc3MgTGVhZGVyc01vZGVsIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5kYXRhQ2xpZW50ID0gbmV3IERhdGFDbGllbnQoKTtcbiAgICB0aGlzLmluaXQoKTtcbiAgICBjb25zdCBkZWZhdWx0U3RhdGUgPSB7XG4gICAgICBvcGVubW9kYWw6IFtdLFxuICAgIH07XG4gICAgdGhpcy5zdGF0ZSA9IG5ldyBQcm94eShkZWZhdWx0U3RhdGUsIHtcbiAgICAgIHNldDogKHRhcmdldCwgcHJvcGVydHksIHZhbHVlKSA9PiB7XG4gICAgICAgIGlmICh0YXJnZXRbcHJvcGVydHldID09PSB2YWx1ZSkgcmV0dXJuIHRydWU7XG4gICAgICAgIHRhcmdldFtwcm9wZXJ0eV0gPSB2YWx1ZTtcblxuICAgICAgICBpZiAodGhpcy5vYnNlcnZlcikge1xuICAgICAgICAgIHRoaXMub2JzZXJ2ZXIocHJvcGVydHksIHZhbHVlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfSxcbiAgICB9KTtcbiAgfVxuXG4gIGluaXQoKSB7fVxuXG4gIGFzeW5jIGdldExlYWRlcnMoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuZGF0YUNsaWVudC5nZXRJdGVtKFwibGVhZGVyc1wiKTtcbiAgICAvKiogQHR5cGUgeyBHYW1lW119ICovXG4gICAgY29uc3QgbGVhZGVycyA9IGRhdGEgPT09IG51bGwgPyBbXSA6IGRhdGEubWFwKChpdGVtKSA9PiBuZXcgR2FtZShpdGVtKSk7XG4gICAgY29uc3Qgc29ydGVkTGVhZGVycyA9IGxlYWRlcnMuc29ydChcbiAgICAgIChhLCBiKSA9PiBhLnBvaW50cyAtIGIucG9pbnRzIHx8IGIud2luRGF0ZSAtIGEud2luRGF0ZSxcbiAgICApO1xuICAgIHRoaXMuc3RhdGUub3Blbm1vZGFsID0ge1xuICAgICAgZGF0YTogc29ydGVkTGVhZGVycy5zbGljZSgwLCBNYXRoLm1pbigxMCwgc29ydGVkTGVhZGVycy5sZW5ndGgpKSxcbiAgICB9O1xuICB9XG5cbiAgc3Vic2NyaWJlKHJlZHVjZXJGdW5jdGlvbikge1xuICAgIHRoaXMub2JzZXJ2ZXIgPSByZWR1Y2VyRnVuY3Rpb247XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTGVhZGVyc01vZGVsO1xuIiwiZXhwb3J0IGNvbnN0IGRlbGF5ID0gKG1zKSA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4gc2V0VGltZW91dChyZXNvbHZlLCBtcykpO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxuY29uc3QgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHRjb25zdCBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0Y29uc3QgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRpZiAoIShtb2R1bGVJZCBpbiBfX3dlYnBhY2tfbW9kdWxlc19fKSkge1xuXHRcdGRlbGV0ZSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRcdGNvbnN0IGUgPSBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiICsgbW9kdWxlSWQgKyBcIidcIik7XG5cdFx0ZS5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuXHRcdHRocm93IGU7XG5cdH1cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyL3ZhbHVlIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpOyIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgR2FtZU1vZGVsIGZyb20gXCIuL0dhbWVNb2RlbFwiO1xuaW1wb3J0IEdhbWUgZnJvbSBcIi4vR2FtZVwiO1xuaW1wb3J0IEl0ZW1VSSBmcm9tIFwiLi9JdGVtVUlcIjtcbmltcG9ydCBMZWFkZXJzTW9kZWwgZnJvbSBcIi4vTGVhZGVyc01vZGVsXCI7XG5pbXBvcnQgeyBkZWxheSB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbmNvbnN0IHJvb3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYm9keVwiKTtcblxuY29uc3QgQ09VTlRfR0FNRV9DQVJEUyA9IDE2O1xuXG5jb25zdCAkID0gSXRlbVVJLmNyZWF0ZTtcblxuY29uc3QgY3JlYXRlQ2xvc2VDYXJkcyA9IChtb2RlbCkgPT5cbiAgQXJyYXkuZnJvbSh7IGxlbmd0aDogQ09VTlRfR0FNRV9DQVJEUyB9LCAoXywgaSkgPT4gaSArIDEpLm1hcCgoaW5kKSA9PlxuICAgICQoXG4gICAgICBcIi5jYXJkLWNvbnRhaW5lclwiLFxuICAgICAge1xuICAgICAgICBhdHRyczogeyBpZDogYGNhcmQtJHtpbmR9YCB9LFxuICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICBjbGljazogKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICByZXZlcnRDYXJkKG1vZGVsLCBldmVudCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBbJChcIi5pbWctd3JhcHBlclwiKV0sXG4gICAgKSxcbiAgKTtcblxuY29uc3QgcmV2ZXJ0Q2FyZCA9IGFzeW5jIChtb2RlbCwgZXZlbnQpID0+IHtcbiAgY29uc3QgY2FyZENvbnRhaW5lciA9IGV2ZW50LmN1cnJlbnRUYXJnZXQ7XG4gIG1vZGVsLm9wZW5DYXJkID0gY2FyZENvbnRhaW5lci5pZDtcbiAgZGVsYXkoMTUpO1xuICBjYXJkQ29udGFpbmVyLmNsYXNzTGlzdC50b2dnbGUoXCJpcy1vcGVuXCIpO1xufTtcblxuY29uc3QgbmV3R2FtZUJ1dHRvbiA9ICgpID0+XG4gICQoXCJidXR0b24ubmV3LWdhbWUtYnV0dG9uXCIsIHtcbiAgICB0ZXh0OiBcIk5ldyBnYW1lXCIsXG4gICAgZXZlbnRzOiB7IGNsaWNrOiBvbkNsaWNrTmV3R2FtZUJ1dHRvbiB9LFxuICB9KTtcblxuY29uc3QgY2xvc2VNb2RhbEJ1dHRvbiA9ICgpID0+ICQoXCJidXR0b24uY2xvc2UtbW9kYWwtYnV0dG9uXCIsIFwiQ2xvc2VcIik7XG5cbi8qKlxuICog0KTRg9C90LrRhtC40Y8g0LTQu9GPINC+0LHRgNCw0LHQvtGC0LrQuCDQuNC70Lgg0L7RgtC+0LHRgNCw0LbQtdC90LjRjyDRgtCw0LHQu9C40YbRiyDQu9C40LTQtdGA0L7Qsi5cbiAqIEBwYXJhbSB7R2FtZVtdfSBsZWFkZXJzIC0g0JzQsNGB0YHQuNCyINC+0LHRitC10LrRgtC+0LIg0LrQu9Cw0YHRgdCwIEdhbWUuXG4gKiBAcmV0dXJucyB7SFRNTEVsZW1lbnRbXX0g0J3QvtCy0YvQuSDQvNCw0YHRgdC40LIsINC/0L7Qu9GD0YfQtdC90L3Ri9C5INCyINGA0LXQt9GD0LvRjNGC0LDRgtC1INC80LDQv9C/0LjQvdCz0LAuXG4gKi9cbmNvbnN0IGxlYWRlcnNUYWJsZSA9IChsZWFkZXJzKSA9PlxuICBsZWFkZXJzLmxlbmd0aCA9PT0gMFxuICAgID8gJChcIi5wbGFjZWhvbGRlclwiLCBcIk5vdCBXaW5lcnNcIilcbiAgICA6ICQoXCJ0YWJsZS5sZWFkZXJzLXRhYmxlXCIsIFtcbiAgICAgICAgJChcInRoZWFkLmxlYWRlcnMtdGFibGUtaGVhZFwiLCBbXG4gICAgICAgICAgJChcInRkLmdhbWVyLXBvc2l0aW9uXCIsIFwiTlwiKSxcbiAgICAgICAgICAkKFwidGQuZ2FtZXItcG9pbnRzXCIsIFwiUG9pbnRzXCIpLFxuICAgICAgICAgICQoXCJ0ZC5nYW1lci13aW4tZGF0ZVwiLCBcIkRhdGVcIiksXG4gICAgICAgIF0pLFxuICAgICAgICAkKFwidGJvZHlcIiwgbGVhZGVyVGFibGVSb3dzKGxlYWRlcnMpKSxcbiAgICAgIF0pO1xuXG4vKipcbiAqINCk0YPQvdC60YbQuNGPINC00LvRjyDQvtCx0YDQsNCx0L7RgtC60Lgg0LjQu9C4INC+0YLQvtCx0YDQsNC20LXQvdC40Y8g0YLQsNCx0LvQuNGG0Ysg0LvQuNC00LXRgNC+0LIuXG4gKiBAcGFyYW0ge0dhbWVbXX0gbGVhZGVycyAtINCc0LDRgdGB0LjQsiDQvtCx0YrQtdC60YLQvtCyINC60LvQsNGB0YHQsCBHYW1lLlxuICogQHJldHVybnMge0hUTUxFbGVtZW50W119INCd0L7QstGL0Lkg0LzQsNGB0YHQuNCyLCDQv9C+0LvRg9GH0LXQvdC90YvQuSDQsiDRgNC10LfRg9C70YzRgtCw0YLQtSDQvNCw0L/Qv9C40L3Qs9CwLlxuICovXG5jb25zdCBsZWFkZXJUYWJsZVJvd3MgPSAobGVhZGVycykgPT5cbiAgbGVhZGVycy5tYXAoKGdhbWUsIGkpID0+XG4gICAgJChcInRyLmdhbWVyLXRhYmxlLXJvd1wiLCBbXG4gICAgICAkKFwidGQuZ2FtZXItcG9zaXRpb25cIiwgaSArIDEpLFxuICAgICAgJChcInRkLmdhbWVyLXBvaW50c1wiLCBnYW1lLnBvaW50cyksXG4gICAgICAkKFwidGQuZ2FtZXItd2luLWRhdGVcIiwgZ2FtZS5md2luRGF0ZSksXG4gICAgXSksXG4gICk7XG5cbmZ1bmN0aW9uIG9uQ2xpY2tMZWFkZXJzQnV0dG9uKG1vZGVsLCBldmVudCkge1xuICBtb2RlbC5nZXRMZWFkZXJzKCk7XG59XG5cbmNvbnN0IGRpYWxvZ0V2ZW50cyA9IHtcbiAgY2xpY2soZXZlbnQpIHtcbiAgICBjb25zdCBpc092ZXJsYXkgPSBldmVudC50YXJnZXQgPT09IGV2ZW50LmN1cnJlbnRUYXJnZXQ7XG4gICAgY29uc3QgaXNDbG9zZUJ0biA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KFwiLmNsb3NlLW1vZGFsLWJ1dHRvblwiKTtcbiAgICBpZiAoaXNPdmVybGF5IHx8IGlzQ2xvc2VCdG4pIHtcbiAgICAgIHRoaXMuZGVzdHJveSgpO1xuICAgIH1cbiAgfSxcbiAgY2FuY2VsKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLmRlc3Ryb3koKTtcbiAgfSxcbn07XG5cbmFzeW5jIGZ1bmN0aW9uIG9uQ2xpY2tOZXdHYW1lQnV0dG9uKCkge1xuICByb290LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY2FyZC1jb250YWluZXJcIikuZm9yRWFjaCgoY2FyZCkgPT4ge1xuICAgIGNhcmQuY2xhc3NMaXN0LnJlbW92ZShcImlzLW9wZW5cIik7XG4gIH0pO1xuICBhd2FpdCBkZWxheSgyNTApO1xuICByZW5kZXIoKTtcbn1cblxuY29uc3QgbGVhZGVyc01vZGFsID0gKGxlYWRlcnMpID0+XG4gICQoXCJkaWFsb2cubGVhZGVycy1tb2RhbFwiLCB7IGV2ZW50czogZGlhbG9nRXZlbnRzIH0sIFtcbiAgICAkKFwiLm1vZGFsLWNvbnRhaW5lclwiLCBbXG4gICAgICAkKFwiaDIubGVhZGVycy10YWJsZS10aXRsZVwiLCBcIkxlYWRlcnNcIiksXG4gICAgICBsZWFkZXJzVGFibGUobGVhZGVycyksXG4gICAgICBjbG9zZU1vZGFsQnV0dG9uKCksXG4gICAgXSksXG4gIF0pO1xuXG5jb25zdCB3aW5Nb2RhbCA9IChzY29yZSkgPT5cbiAgJChcImRpYWxvZy53aW4tbW9kYWxcIiwgeyBldmVudHM6IGRpYWxvZ0V2ZW50cyB9LCBbXG4gICAgJChcIi5tb2RhbC1jb250YWluZXJcIiwgeyBldmVudHM6IGRpYWxvZ0V2ZW50cyB9LCBbXG4gICAgICAkKFwiaDIud2luLXRpdGxlXCIsIFwiQ29uZ3JhdHVsYXRpb25zIVwiKSxcbiAgICAgICQoXCIud2luLXNjb3JlXCIsIGBZb3VyIHNjb3JlICR7c2NvcmV9IHBvaW50c2ApLFxuICAgICAgJChcIi5idXR0b25zLWJsb2NrXCIsIFtuZXdHYW1lQnV0dG9uKCksIGNsb3NlTW9kYWxCdXR0b24oKV0pLFxuICAgIF0pLFxuICBdKTtcblxuY29uc3Qgb3Blbldpbk1vZGFsID0gKHNjb3JlKSA9PiB7XG4gIGNvbnN0IG1vZGFsID0gd2luTW9kYWwoc2NvcmUpLnVpRWxlbWVudDtcbiAgaWYgKG1vZGFsIGluc3RhbmNlb2YgSFRNTERpYWxvZ0VsZW1lbnQpIHtcbiAgICByb290LmFwcGVuZENoaWxkKG1vZGFsKTtcbiAgICBtb2RhbC5zaG93TW9kYWwoKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZ2FtZVJlZHVzZXIoYWN0aW9uVHlwZSwgcGF5bG9hZCkge1xuICBzd2l0Y2ggKGFjdGlvblR5cGUpIHtcbiAgICBjYXNlIFwid2luXCI6XG4gICAgICBpZiAocGF5bG9hZCkge1xuICAgICAgICBvcGVuV2luTW9kYWwocGF5bG9hZC5kYXRhKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJsb2NrY2FyZHNcIjpcbiAgICAgIHJvb3QucXVlcnlTZWxlY3RvckFsbChcIi5jYXJkLWNvbnRhaW5lclwiKS5mb3JFYWNoKChjYXJkKSA9PiB7XG4gICAgICAgIGlmIChwYXlsb2FkLmluY2x1ZGVzKE51bWJlcihjYXJkLmlkLnJlcGxhY2UoL1teXFxkXS9nLCBcIlwiKSkpKSB7XG4gICAgICAgICAgY2FyZC5jbGFzc0xpc3QuYWRkKFwibG9jay1jbGlja1wiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjYXJkLmNsYXNzTGlzdC5yZW1vdmUoXCJsb2NrLWNsaWNrXCIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJoaXRcIjpcbiAgICAgIHJvb3QucXVlcnlTZWxlY3RvcihcIi53aW5zLWNvdW50XCIpLnRleHRDb250ZW50ID0gYCR7cGF5bG9hZH0gb2YgOCBwYWlyc2A7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiY2xvc2VjYXJkXCI6XG4gICAgICByb290LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY2FyZC1jb250YWluZXJcIikuZm9yRWFjaCgoY2FyZCkgPT4ge1xuICAgICAgICBpZiAocGF5bG9hZC5pbmNsdWRlcyhOdW1iZXIoY2FyZC5pZC5yZXBsYWNlKC9bXlxcZF0vZywgXCJcIikpKSkge1xuICAgICAgICAgIGNhcmQuY2xhc3NMaXN0LnRvZ2dsZShcImlzLW9wZW5cIik7XG4gICAgICAgICAgY29uc3QgaW1nID0gY2FyZC5xdWVyeVNlbGVjdG9yKFwiLmZpZ3VyZS1pbWdcIik7XG4gICAgICAgICAgaW1nLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJtb3Zlc2NvdW50XCI6XG4gICAgICByb290LnF1ZXJ5U2VsZWN0b3IoXCIubW92ZXMtY291bnRcIikudGV4dENvbnRlbnQgPSBwYXlsb2FkO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImFkZGltZ1wiOlxuICAgICAgY29uc3QgY29udCA9IHJvb3QucXVlcnlTZWxlY3RvcihgLmNhcmQtY29udGFpbmVyI2NhcmQtJHtwYXlsb2FkLmtleX1gKTtcbiAgICAgIGNvbnN0IHdyYXBwZXIgPSBjb250LnF1ZXJ5U2VsZWN0b3IoXCIuaW1nLXdyYXBwZXJcIik7XG4gICAgICBjb25zdCBpbWcgPSAkKFwiaW1nLmZpZ3VyZS1pbWdcIiwge1xuICAgICAgICBhdHRyczogeyBzcmM6IGBpbWFnZXMvb3JpZ2FtaV9zaGFwZV8ke3BheWxvYWQudmFsdWV9LnN2Z2AsIGFsdDogXCJcIiB9LFxuICAgICAgfSk7XG4gICAgICB3cmFwcGVyLmFwcGVuZENoaWxkKGltZy51aUVsZW1lbnQpO1xuICAgIGRlZmF1bHQ6XG4gICAgICBicmVhaztcbiAgfVxufVxuXG5mdW5jdGlvbiBsZWFkZXJzUmVkdXNlcihhY3Rpb25UeXBlLCBwYXlsb2FkKSB7XG4gIHN3aXRjaCAoYWN0aW9uVHlwZSkge1xuICAgIGNhc2UgXCJvcGVubW9kYWxcIjpcbiAgICAgIGNvbnN0IG1vZGFsID0gbGVhZGVyc01vZGFsKHBheWxvYWQuZGF0YSkudWlFbGVtZW50O1xuICAgICAgaWYgKG1vZGFsIGluc3RhbmNlb2YgSFRNTERpYWxvZ0VsZW1lbnQpIHtcbiAgICAgICAgcm9vdC5hcHBlbmRDaGlsZChtb2RhbCk7XG4gICAgICAgIG1vZGFsLnNob3dNb2RhbCgpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgY29uc3QgZ2FtZU1vZGVsID0gbmV3IEdhbWVNb2RlbCgpO1xuICBjb25zdCBsZWFkZXJzTW9kZWwgPSBuZXcgTGVhZGVyc01vZGVsKCk7XG4gIGdhbWVNb2RlbC5zdWJzY3JpYmUoZ2FtZVJlZHVzZXIpO1xuICBsZWFkZXJzTW9kZWwuc3Vic2NyaWJlKGxlYWRlcnNSZWR1c2VyKTtcblxuICBjb25zdCBoZWFkZXIgPSAobW9kZWwpID0+XG4gICAgJChcImhlYWRlci5oZWFkZXJcIiwgW1xuICAgICAgJChcIi5jb250YWluZXIuaGVhZGVyLWNvbnRhaW5lclwiLCBbXG4gICAgICAgICQoXCJidXR0b24uaGVhZGVyLWJ1dHRvbi5sZWFkZXJzLW1vZGFsLWJ1dHRvblwiLCB7XG4gICAgICAgICAgdGV4dDogXCJMZWFkZXJzXCIsXG4gICAgICAgICAgZXZlbnRzOiB7IGNsaWNrOiBvbkNsaWNrTGVhZGVyc0J1dHRvbi5iaW5kKG51bGwsIG1vZGVsKSB9LFxuICAgICAgICB9KSxcbiAgICAgICAgbmV3R2FtZUJ1dHRvbigpLFxuICAgICAgXSksXG4gICAgXSk7XG5cbiAgY29uc3QgbWFpbiA9ICQoXCJtYWluXCIsIFtcbiAgICAkKFwiLmNvbnRhaW5lclwiLCBbXG4gICAgICAkKFwiaDEuZ2FtZS10aXRsZVwiLCBcIk1lbW9yeSBnYW1lXCIpLFxuICAgICAgJChcIi5jYXJkLWdyaWRcIiwgY3JlYXRlQ2xvc2VDYXJkcyhnYW1lTW9kZWwpKSxcbiAgICBdKSxcbiAgXSk7XG5cbiAgY29uc3QgZm9vdGVyID0gJChcImZvb3Rlci5mb290ZXJcIiwgW1xuICAgICQoXCIuY29udGFpbmVyXCIsIFtcbiAgICAgICQoXCJoMy5jdXJyZW50LXJlc3VsdC10aXRsZVwiLCBcIkN1cnJlbnQgU2NvcmU6XCIpLFxuICAgICAgJChcIi5zY29yZVwiLCBbXG4gICAgICAgICQoXCIubW92ZXNcIiwgW1xuICAgICAgICAgICQoXCJzcGFuLm1vdmVzLXRpdGxlXCIsIFwiTW92ZXM6XCIpLFxuICAgICAgICAgICQoXCJzcGFuLm1vdmVzLWNvdW50XCIsIFwiMFwiKSxcbiAgICAgICAgXSksXG4gICAgICAgICQoXCIud2luc1wiLCBbXG4gICAgICAgICAgJChcInNwYW4ud2lucy10aXRsZVwiLCBcIldpbnM6XCIpLFxuICAgICAgICAgICQoXCJzcGFuLndpbnMtY291bnRcIiwgXCIwIG9mIDggcGFpcnNcIiksXG4gICAgICAgIF0pLFxuICAgICAgXSksXG4gICAgXSksXG4gIF0pO1xuXG4gIGNvbnN0IGJvZHlMaXN0ID0gW2hlYWRlcihsZWFkZXJzTW9kZWwpLCBtYWluLCBmb290ZXJdLm1hcChcbiAgICAodGFnKSA9PiB0YWcudWlFbGVtZW50LFxuICApO1xuICByb290LnJlcGxhY2VDaGlsZHJlbiguLi5ib2R5TGlzdCk7XG59XG5cbnJlbmRlcigpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9