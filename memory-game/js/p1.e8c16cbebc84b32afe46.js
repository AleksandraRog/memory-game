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
      [
        $(".img-wrapper", [
          $("img.figure-img", {
            attrs: { src: "", alt: "" },
          }),
        ]),
      ],
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
          img.setAttribute("src", ``);
        }
      });
      break;
    case "movescount":
      root.querySelector(".moves-count").textContent = payload;
      break;
    case "addimg":
      const cont = root.querySelector(`.card-container#card-${payload.key}`);
      const img = cont.querySelector(".figure-img");
      img.setAttribute("src", `images/origami_shape_${payload.value}.svg`);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx3QkFBd0Isa0RBQVM7QUFDakMsMkJBQTJCLHFEQUFZO0FBQ3ZDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQiwrQ0FBK0M7QUFDbkUsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9EYXRhQ2xpZW50LmpzIiwid2VicGFjazovLy8uL0dhbWUuanMiLCJ3ZWJwYWNrOi8vLy4vR2FtZU1vZGVsLmpzIiwid2VicGFjazovLy8uL0l0ZW1VSS5qcyIsIndlYnBhY2s6Ly8vLi9MZWFkZXJzTW9kZWwuanMiLCJ3ZWJwYWNrOi8vLy4vdXRpbHMuanMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vLy4vaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiY2xhc3MgRGF0YUNsaWVudCB7XG4gIGNvbnN0cnVjdG9yKG5hbWVzcGFjZSA9IFwibWVtb3J5LWdhbWVcIiwgdXJsID0gXCJcIikge1xuICAgIHRoaXMubmFtZXNwYWNlID0gbmFtZXNwYWNlO1xuICAgIHRoaXMudXJsID0gdXJsO1xuICB9XG5cbiAgYXN5bmMgZ2V0SXRlbShrZXkgPSBcIlwiKSB7XG4gICAgY29uc3QgdmFsdWUgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShgJHt0aGlzLm5hbWVzcGFjZX06JHtrZXl9YCk7XG4gICAgcmV0dXJuIHZhbHVlID8gSlNPTi5wYXJzZSh2YWx1ZSkgOiBudWxsO1xuICB9XG5cbiAgc2V0SXRlbShrZXkgPSBcIlwiLCB2YWx1ZSA9IHVuZGVmaW5lZCkge1xuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGAke3RoaXMubmFtZXNwYWNlfToke2tleX1gLCBKU09OLnN0cmluZ2lmeSh2YWx1ZSkpO1xuICB9XG5cbiAgcmVtb3ZlSXRlbShrZXkgPSBcIlwiKSB7XG4gICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oYCR7dGhpcy5uYW1lc3BhY2V9OiR7a2V5fWApO1xuICB9XG5cbiAgYXN5bmMgcG9zdERhdGEodXJsID0gXCJcIiwgZGF0YSA9IHt9KSB7XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHtcbiAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICBtb2RlOiBcImNvcnNcIixcbiAgICAgIGNhY2hlOiBcIm5vLWNhY2hlXCIsXG4gICAgICBjcmVkZW50aWFsczogXCJzYW1lLW9yaWdpblwiLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgIH0sXG4gICAgICByZWRpcmVjdDogXCJmb2xsb3dcIixcbiAgICAgIHJlZmVycmVyUG9saWN5OiBcIm5vLXJlZmVycmVyXCIsXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShkYXRhKSxcbiAgICB9KTtcbiAgICByZXR1cm4gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IERhdGFDbGllbnQ7XG4iLCJjbGFzcyBHYW1lIHtcbiAgc3RhdGljIGZvcm1hdHRlciA9IG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KFwicnUtUlVcIiwge1xuICAgIGRheTogXCIyLWRpZ2l0XCIsXG4gICAgbW9udGg6IFwiMi1kaWdpdFwiLFxuICAgIHllYXI6IFwibnVtZXJpY1wiLFxuICB9KTtcbiAgLyoqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9maWxlIC0g0JTQsNC90L3Ri9C1INC/0YDQvtGE0LjQu9GPINC40LPRgNC+0LrQsC5cbiAgICogQHBhcmFtIHtEYXRlfSBwcm9maWxlLndpbkRhdGUgLSDQlNCw0YLQsCDQv9C+0LHQtdC00YsuXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwcm9maWxlLnBvaW50cyAtINCd0LDQsdGA0LDQvdC90YvQtSDQvtGH0LrQuC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHsgd2luRGF0ZSwgcG9pbnRzIH0pIHtcbiAgICB0aGlzLndpbkRhdGUgPSB3aW5EYXRlO1xuICAgIHRoaXMucG9pbnRzID0gcG9pbnRzO1xuICB9XG5cbiAgZ2V0IGZ3aW5EYXRlKCkge1xuICAgIHJldHVybiBHYW1lLmZvcm1hdHRlci5mb3JtYXQodGhpcy53aW5EYXRlKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBHYW1lO1xuIiwiaW1wb3J0IERhdGFDbGllbnQgZnJvbSBcIi4vRGF0YUNsaWVudFwiO1xuaW1wb3J0IEdhbWUgZnJvbSBcIi4vR2FtZVwiO1xuaW1wb3J0IHsgZGVsYXkgfSBmcm9tIFwiLi91dGlsc1wiO1xuXG5jbGFzcyBHYW1lTW9kZWwge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmRhdGFDbGllbnQgPSBuZXcgRGF0YUNsaWVudCgpO1xuICAgIHRoaXMuc2h1ZmZsZWRDYXJkcyA9IFtdO1xuICAgIHRoaXMuX29wZW5DYXJkID0gW107XG4gICAgdGhpcy5sb2NrZWRDYXJkcyA9IFtdO1xuICAgIHRoaXMubW92ZXNDb3VudCA9IDA7XG4gICAgdGhpcy5oaXQgPSAwO1xuICAgIHRoaXMuaW5pdCgpO1xuICAgIGNvbnN0IGRlZmF1bHRTdGF0ZSA9IHtcbiAgICAgIHdpbjogdW5kZWZpbmVkLFxuICAgICAgbG9ja2NhcmRzOiBbXSxcbiAgICAgIGNsb3NlY2FyZDogW10sXG4gICAgICBtb3Zlc2NvdW50OiAwLFxuICAgICAgaGl0OiAwLFxuICAgICAgYWRkaW1nOiB1bmRlZmluZWQsXG4gICAgfTtcblxuICAgIHRoaXMuc3RhdGUgPSBuZXcgUHJveHkoZGVmYXVsdFN0YXRlLCB7XG4gICAgICBzZXQ6ICh0YXJnZXQsIHByb3BlcnR5LCB2YWx1ZSkgPT4ge1xuICAgICAgICBpZiAodGFyZ2V0W3Byb3BlcnR5XSA9PT0gdmFsdWUpIHJldHVybiB0cnVlO1xuICAgICAgICB0YXJnZXRbcHJvcGVydHldID0gdmFsdWU7XG5cbiAgICAgICAgaWYgKHRoaXMub2JzZXJ2ZXIpIHtcbiAgICAgICAgICB0aGlzLm9ic2VydmVyKHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICBpbml0KCkge1xuICAgIHRoaXMuc2h1ZmZsZUNhcmRzKCk7XG4gIH1cblxuICBzaHVmZmxlQ2FyZHMoKSB7XG4gICAgdGhpcy5zaHVmZmxlZENhcmRzID0gW107XG4gICAgbGV0IHN0YXJ0QXJyYXkgPSBBcnJheS5mcm9tKHsgbGVuZ3RoOiAxNiB9LCAoXywgaSkgPT4gKGkgJSA4KSArIDEpO1xuICAgIGxldCBtID0gc3RhcnRBcnJheS5sZW5ndGgsXG4gICAgICB0LFxuICAgICAgaTtcbiAgICB3aGlsZSAobSkge1xuICAgICAgaSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIG0tLSk7XG4gICAgICB0ID0gc3RhcnRBcnJheVttXTtcbiAgICAgIHN0YXJ0QXJyYXlbbV0gPSBzdGFydEFycmF5W2ldO1xuICAgICAgc3RhcnRBcnJheVtpXSA9IHQ7XG4gICAgfVxuXG4gICAgdGhpcy5zaHVmZmxlZENhcmRzID0gc3RhcnRBcnJheTtcbiAgICBjb25zb2xlLmxvZyh0aGlzLnNodWZmbGVkQ2FyZHMpO1xuICB9XG5cbiAgc2V0IG9wZW5DYXJkKGlkQ2FyZCkge1xuICAgIGlmICh0eXBlb2YgaWRDYXJkICE9PSBcInN0cmluZ1wiKSByZXR1cm47XG4gICAgY29uc3QgaW5kZXhDYXJkID0gTnVtYmVyKGlkQ2FyZC5yZXBsYWNlKC9bXlxcZF0vZywgXCJcIikpO1xuICAgIHRoaXMuX29wZW5DYXJkLnB1c2goaW5kZXhDYXJkKTtcbiAgICB0aGlzLnN0YXRlLmFkZGltZyA9IHtcbiAgICAgIGtleTogaW5kZXhDYXJkLFxuICAgICAgdmFsdWU6IHRoaXMuc2h1ZmZsZWRDYXJkc1tpbmRleENhcmQgLSAxXSxcbiAgICB9O1xuICAgIHRoaXMubG9ja0NhcmRzKCk7XG4gICAgLy8gdGhpcy5zdGF0ZS5hZGRpbWcgPSB7IGlkQ2FyZDogdGhpcy5zaHVmZmxlZENhcmRzW2luZGV4Q2FyZCAtIDFdIH07XG4gICAgaWYgKHRoaXMuX29wZW5DYXJkLmxlbmd0aCA9PT0gMikge1xuICAgICAgdGhpcy5jaGVja0hpdCgpO1xuICAgIH1cbiAgfVxuXG4gIGxvY2tDYXJkcygpIHtcbiAgICB0aGlzLnN0YXRlLmxvY2tjYXJkcyA9ICgoKSA9PiB7XG4gICAgICBzd2l0Y2ggKHRoaXMuX29wZW5DYXJkLmxlbmd0aCkge1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgcmV0dXJuIHRoaXMubG9ja2VkQ2FyZHMuY29uY2F0KHRoaXMuX29wZW5DYXJkKTtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIHJldHVybiBBcnJheS5mcm9tKHsgbGVuZ3RoOiAxNiB9LCAoXywgaSkgPT4gaSArIDEpO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVybiB0aGlzLmxvY2tlZENhcmRzO1xuICAgICAgfVxuICAgIH0pKCk7XG4gIH1cblxuICBhc3luYyBzdGFydFRpbWVyKCkge1xuICAgIGF3YWl0IGRlbGF5KDEyMDApO1xuICAgIHRoaXMuc3RhdGUuY2xvc2VjYXJkID0gdGhpcy5fb3BlbkNhcmQ7XG4gICAgYXdhaXQgZGVsYXkoMzApO1xuICAgIHRoaXMuX29wZW5DYXJkID0gW107XG4gICAgdGhpcy5sb2NrQ2FyZHMoKTtcbiAgfVxuXG4gIGFzeW5jIGNoZWNrSGl0KCkge1xuICAgIGlmICh0aGlzLl9vcGVuQ2FyZC5sZW5ndGggIT09IDIpIHJldHVybjtcbiAgICB0aGlzLm1vdmVzQ291bnQgKz0gMTtcbiAgICB0aGlzLnN0YXRlLm1vdmVzY291bnQgPSB0aGlzLm1vdmVzQ291bnQ7XG4gICAgY29uc3QgaGl0ID1cbiAgICAgIHRoaXMuc2h1ZmZsZWRDYXJkcy5hdCh0aGlzLl9vcGVuQ2FyZFswXSAtIDEpID09PVxuICAgICAgdGhpcy5zaHVmZmxlZENhcmRzLmF0KHRoaXMuX29wZW5DYXJkWzFdIC0gMSk7XG4gICAgaWYgKGhpdCkge1xuICAgICAgdGhpcy5oaXQgKz0gMTtcbiAgICAgIHRoaXMuc3RhdGUuaGl0ID0gdGhpcy5oaXQ7XG4gICAgICB0aGlzLmxvY2tlZENhcmRzID0gdGhpcy5sb2NrZWRDYXJkcy5jb25jYXQodGhpcy5fb3BlbkNhcmQpO1xuICAgICAgdGhpcy5fb3BlbkNhcmQgPSBbXTtcbiAgICAgIHRoaXMubG9ja0NhcmRzKCk7XG4gICAgICBpZiAodGhpcy5oaXQgPT09IDgpIHtcbiAgICAgICAgYXdhaXQgdGhpcy5zYXZlUmVzdWx0KCk7XG4gICAgICAgIHRoaXMuc3RhdGUud2luID0geyBkYXRhOiB0aGlzLm1vdmVzQ291bnQgfTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zdGFydFRpbWVyKCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgc2F2ZVJlc3VsdCgpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5kYXRhQ2xpZW50LmdldEl0ZW0oXCJsZWFkZXJzXCIpO1xuICAgIC8qKiBAdHlwZSB7IEdhbWVbXX0gKi9cbiAgICBjb25zdCBsZWFkZXJzID0gZGF0YSA9PT0gbnVsbCA/IFtdIDogZGF0YS5tYXAoKGl0ZW0pID0+IG5ldyBHYW1lKGl0ZW0pKTtcbiAgICBsZWFkZXJzLnB1c2gobmV3IEdhbWUoeyBwb2ludHM6IHRoaXMubW92ZXNDb3VudCwgd2luRGF0ZTogRGF0ZS5ub3coKSB9KSk7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuZGF0YUNsaWVudC5zZXRJdGVtKFwibGVhZGVyc1wiLCBsZWFkZXJzKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIGNvbnNvbGUubG9nKFwibm8gd3JpdGVcIik7XG4gICAgfVxuICB9XG5cbiAgc3Vic2NyaWJlKHJlZHVjZXJGdW5jdGlvbikge1xuICAgIHRoaXMub2JzZXJ2ZXIgPSByZWR1Y2VyRnVuY3Rpb247XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgR2FtZU1vZGVsO1xuIiwiY2xhc3MgSXRlbVVJIHtcbiAgY29uc3RydWN0b3Ioe1xuICAgIHRhZyA9IFwiZGl2XCIsXG4gICAgY2xhc3NOYW1lcyA9IFtdLFxuICAgIGlubmVycyA9IFtdLFxuICAgIHRleHQgPSB1bmRlZmluZWQsXG4gICAgdmFsdWUgPSB1bmRlZmluZWQsXG4gICAgYXR0cnMgPSB7fSxcbiAgICBldmVudHMgPSB7fSxcbiAgfSA9IHt9KSB7XG4gICAgdGhpcy50YWcgPSB0YWc7XG4gICAgdGhpcy5jbGFzc05hbWVzID0gY2xhc3NOYW1lcztcbiAgICB0aGlzLmlubmVycyA9IGlubmVycztcbiAgICB0aGlzLnRleHQgPSB0ZXh0O1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLmF0dHJzID0gYXR0cnM7XG4gICAgdGhpcy5ldmVudHMgPSBldmVudHM7XG4gICAgdGhpcy51aUVsZW1lbnQgPSB0aGlzLmNyZWF0ZU5ld0VsZW1lbnQoKTtcbiAgfVxuXG4gIGNyZWF0ZU5ld0VsZW1lbnQoKSB7XG4gICAgbGV0IGVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRoaXMudGFnKTtcblxuICAgIHRoaXMuY2xhc3NOYW1lcy5mb3JFYWNoKChjbGFzc05hbWUpID0+IHtcbiAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChjbGFzc05hbWUpO1xuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMudGV4dCkge1xuICAgICAgZWxlbWVudC5pbm5lclRleHQgPSB0aGlzLnRleHQ7XG4gICAgfVxuXG4gICAgT2JqZWN0LmVudHJpZXModGhpcy5hdHRycykuZm9yRWFjaCgoW2ssIHZdKSA9PiBlbGVtZW50LnNldEF0dHJpYnV0ZShrLCB2KSk7XG5cbiAgICBpZiAodGhpcy52YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBlbGVtZW50LnZhbHVlID0gdGhpcy52YWx1ZTtcbiAgICB9XG5cbiAgICBPYmplY3QuZW50cmllcyh0aGlzLmV2ZW50cykuZm9yRWFjaCgoW2V2ZW50TmFtZSwgaGFuZGxlcl0pID0+IHtcbiAgICAgIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIGNvbnN0IGJvdW5kSGFuZGxlciA9IGhhbmRsZXIuYmluZCh0aGlzKTtcbiAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgYm91bmRIYW5kbGVyKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuaW5uZXJzLmZvckVhY2goKGlubmVyRWxlbWVudCkgPT4ge1xuICAgICAgaWYgKGlubmVyRWxlbWVudCBpbnN0YW5jZW9mIEl0ZW1VSSkge1xuICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKGlubmVyRWxlbWVudC51aUVsZW1lbnQpO1xuICAgICAgfSBlbHNlIGlmIChpbm5lckVsZW1lbnQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkge1xuICAgICAgICBlbGVtZW50LmFwcGVuZENoaWxkKGlubmVyRWxlbWVudCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZWxlbWVudDtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5pbm5lcnMuZm9yRWFjaCgoaW5uZXIpID0+IHtcbiAgICAgIGlmIChpbm5lciBpbnN0YW5jZW9mIEl0ZW1VSSkge1xuICAgICAgICBpbm5lci5kZXN0cm95KCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAodGhpcy51aUVsZW1lbnQgJiYgdGhpcy51aUVsZW1lbnQucGFyZW50Tm9kZSkge1xuICAgICAgdGhpcy51aUVsZW1lbnQucmVtb3ZlKCk7XG4gICAgfVxuXG4gICAgdGhpcy51aUVsZW1lbnQgPSBudWxsO1xuICAgIHRoaXMuaW5uZXJzID0gW107XG4gICAgdGhpcy5ldmVudHMgPSB7fTtcbiAgfVxuXG4gIHN0YXRpYyBjcmVhdGUodGFnQW5kQ2xhc3NlcywgY29uZmlnT3JJbm5lcnMgPSB7fSwgcG9zc2libGVJbm5lcnMgPSBbXSkge1xuICAgIGxldCB0YXJnZXRTdHJpbmcgPSB0YWdBbmRDbGFzc2VzLnRyaW0oKTtcbiAgICBpZiAodGFyZ2V0U3RyaW5nLnN0YXJ0c1dpdGgoXCIuXCIpKSB7XG4gICAgICB0YXJnZXRTdHJpbmcgPSBcImRpdlwiICsgdGFyZ2V0U3RyaW5nO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcnRzID0gdGFyZ2V0U3RyaW5nLnNwbGl0KFwiLlwiKTtcbiAgICBjb25zdCB0YWcgPSBwYXJ0c1swXSB8fCBcImRpdlwiO1xuICAgIGNvbnN0IGNsYXNzTmFtZXMgPSBwYXJ0cy5zbGljZSgxKTtcblxuICAgIGxldCBjb25maWcgPSB7fTtcbiAgICBsZXQgaW5uZXJzID0gcG9zc2libGVJbm5lcnM7XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShjb25maWdPcklubmVycykpIHtcbiAgICAgIGlubmVycyA9IGNvbmZpZ09ySW5uZXJzO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0eXBlb2YgY29uZmlnT3JJbm5lcnMgPT09IFwic3RyaW5nXCIgfHxcbiAgICAgIHR5cGVvZiBjb25maWdPcklubmVycyA9PT0gXCJudW1iZXJcIlxuICAgICkge1xuICAgICAgY29uZmlnLnRleHQgPSBjb25maWdPcklubmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uZmlnID0geyAuLi5jb25maWdPcklubmVycyB9O1xuICAgIH1cblxuICAgIGlmIChpbm5lcnMubGVuZ3RoID4gMCkgY29uZmlnLmlubmVycyA9IGlubmVycztcbiAgICBjb25maWcudGFnID0gdGFnO1xuICAgIGNvbmZpZy5jbGFzc05hbWVzID0gWy4uLmNsYXNzTmFtZXMsIC4uLihjb25maWcuY2xhc3NOYW1lcyB8fCBbXSldO1xuXG4gICAgcmV0dXJuIG5ldyBJdGVtVUkoY29uZmlnKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBJdGVtVUk7XG4iLCJpbXBvcnQgRGF0YUNsaWVudCBmcm9tIFwiLi9EYXRhQ2xpZW50XCI7XG5pbXBvcnQgR2FtZSBmcm9tIFwiLi9HYW1lXCI7XG5cbmNsYXNzIExlYWRlcnNNb2RlbCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZGF0YUNsaWVudCA9IG5ldyBEYXRhQ2xpZW50KCk7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgY29uc3QgZGVmYXVsdFN0YXRlID0ge1xuICAgICAgb3Blbm1vZGFsOiBbXSxcbiAgICB9O1xuICAgIHRoaXMuc3RhdGUgPSBuZXcgUHJveHkoZGVmYXVsdFN0YXRlLCB7XG4gICAgICBzZXQ6ICh0YXJnZXQsIHByb3BlcnR5LCB2YWx1ZSkgPT4ge1xuICAgICAgICBpZiAodGFyZ2V0W3Byb3BlcnR5XSA9PT0gdmFsdWUpIHJldHVybiB0cnVlO1xuICAgICAgICB0YXJnZXRbcHJvcGVydHldID0gdmFsdWU7XG5cbiAgICAgICAgaWYgKHRoaXMub2JzZXJ2ZXIpIHtcbiAgICAgICAgICB0aGlzLm9ic2VydmVyKHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICBpbml0KCkge31cblxuICBhc3luYyBnZXRMZWFkZXJzKCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmRhdGFDbGllbnQuZ2V0SXRlbShcImxlYWRlcnNcIik7XG4gICAgLyoqIEB0eXBlIHsgR2FtZVtdfSAqL1xuICAgIGNvbnN0IGxlYWRlcnMgPSBkYXRhID09PSBudWxsID8gW10gOiBkYXRhLm1hcCgoaXRlbSkgPT4gbmV3IEdhbWUoaXRlbSkpO1xuICAgIGNvbnN0IHNvcnRlZExlYWRlcnMgPSBsZWFkZXJzLnNvcnQoXG4gICAgICAoYSwgYikgPT4gYS5wb2ludHMgLSBiLnBvaW50cyB8fCBiLndpbkRhdGUgLSBhLndpbkRhdGUsXG4gICAgKTtcbiAgICB0aGlzLnN0YXRlLm9wZW5tb2RhbCA9IHtcbiAgICAgIGRhdGE6IHNvcnRlZExlYWRlcnMuc2xpY2UoMCwgTWF0aC5taW4oMTAsIHNvcnRlZExlYWRlcnMubGVuZ3RoKSksXG4gICAgfTtcbiAgfVxuXG4gIHN1YnNjcmliZShyZWR1Y2VyRnVuY3Rpb24pIHtcbiAgICB0aGlzLm9ic2VydmVyID0gcmVkdWNlckZ1bmN0aW9uO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IExlYWRlcnNNb2RlbDtcbiIsImV4cG9ydCBjb25zdCBkZWxheSA9IChtcykgPT4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgbXMpKTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbmNvbnN0IF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0Y29uc3QgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdGNvbnN0IG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0aWYgKCEobW9kdWxlSWQgaW4gX193ZWJwYWNrX21vZHVsZXNfXykpIHtcblx0XHRkZWxldGUgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0XHRjb25zdCBlID0gbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIiArIG1vZHVsZUlkICsgXCInXCIpO1xuXHRcdGUuY29kZSA9ICdNT0RVTEVfTk9UX0ZPVU5EJztcblx0XHR0aHJvdyBlO1xuXHR9XG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlci92YWx1ZSBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKTsiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IEdhbWVNb2RlbCBmcm9tIFwiLi9HYW1lTW9kZWxcIjtcbmltcG9ydCBHYW1lIGZyb20gXCIuL0dhbWVcIjtcbmltcG9ydCBJdGVtVUkgZnJvbSBcIi4vSXRlbVVJXCI7XG5pbXBvcnQgTGVhZGVyc01vZGVsIGZyb20gXCIuL0xlYWRlcnNNb2RlbFwiO1xuaW1wb3J0IHsgZGVsYXkgfSBmcm9tIFwiLi91dGlsc1wiO1xuXG5jb25zdCByb290ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJvZHlcIik7XG5cbmNvbnN0IENPVU5UX0dBTUVfQ0FSRFMgPSAxNjtcblxuY29uc3QgJCA9IEl0ZW1VSS5jcmVhdGU7XG5cbmNvbnN0IGNyZWF0ZUNsb3NlQ2FyZHMgPSAobW9kZWwpID0+XG4gIEFycmF5LmZyb20oeyBsZW5ndGg6IENPVU5UX0dBTUVfQ0FSRFMgfSwgKF8sIGkpID0+IGkgKyAxKS5tYXAoKGluZCkgPT5cbiAgICAkKFxuICAgICAgXCIuY2FyZC1jb250YWluZXJcIixcbiAgICAgIHtcbiAgICAgICAgYXR0cnM6IHsgaWQ6IGBjYXJkLSR7aW5kfWAgfSxcbiAgICAgICAgZXZlbnRzOiB7XG4gICAgICAgICAgY2xpY2s6IChldmVudCkgPT4ge1xuICAgICAgICAgICAgcmV2ZXJ0Q2FyZChtb2RlbCwgZXZlbnQpO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgW1xuICAgICAgICAkKFwiLmltZy13cmFwcGVyXCIsIFtcbiAgICAgICAgICAkKFwiaW1nLmZpZ3VyZS1pbWdcIiwge1xuICAgICAgICAgICAgYXR0cnM6IHsgc3JjOiBcIlwiLCBhbHQ6IFwiXCIgfSxcbiAgICAgICAgICB9KSxcbiAgICAgICAgXSksXG4gICAgICBdLFxuICAgICksXG4gICk7XG5cbmNvbnN0IHJldmVydENhcmQgPSBhc3luYyAobW9kZWwsIGV2ZW50KSA9PiB7XG4gIGNvbnN0IGNhcmRDb250YWluZXIgPSBldmVudC5jdXJyZW50VGFyZ2V0O1xuICBtb2RlbC5vcGVuQ2FyZCA9IGNhcmRDb250YWluZXIuaWQ7XG4gIGRlbGF5KDE1KTtcbiAgY2FyZENvbnRhaW5lci5jbGFzc0xpc3QudG9nZ2xlKFwiaXMtb3BlblwiKTtcbn07XG5cbmNvbnN0IG5ld0dhbWVCdXR0b24gPSAoKSA9PlxuICAkKFwiYnV0dG9uLm5ldy1nYW1lLWJ1dHRvblwiLCB7XG4gICAgdGV4dDogXCJOZXcgZ2FtZVwiLFxuICAgIGV2ZW50czogeyBjbGljazogb25DbGlja05ld0dhbWVCdXR0b24gfSxcbiAgfSk7XG5cbmNvbnN0IGNsb3NlTW9kYWxCdXR0b24gPSAoKSA9PiAkKFwiYnV0dG9uLmNsb3NlLW1vZGFsLWJ1dHRvblwiLCBcIkNsb3NlXCIpO1xuXG4vKipcbiAqINCk0YPQvdC60YbQuNGPINC00LvRjyDQvtCx0YDQsNCx0L7RgtC60Lgg0LjQu9C4INC+0YLQvtCx0YDQsNC20LXQvdC40Y8g0YLQsNCx0LvQuNGG0Ysg0LvQuNC00LXRgNC+0LIuXG4gKiBAcGFyYW0ge0dhbWVbXX0gbGVhZGVycyAtINCc0LDRgdGB0LjQsiDQvtCx0YrQtdC60YLQvtCyINC60LvQsNGB0YHQsCBHYW1lLlxuICogQHJldHVybnMge0hUTUxFbGVtZW50W119INCd0L7QstGL0Lkg0LzQsNGB0YHQuNCyLCDQv9C+0LvRg9GH0LXQvdC90YvQuSDQsiDRgNC10LfRg9C70YzRgtCw0YLQtSDQvNCw0L/Qv9C40L3Qs9CwLlxuICovXG5jb25zdCBsZWFkZXJzVGFibGUgPSAobGVhZGVycykgPT5cbiAgbGVhZGVycy5sZW5ndGggPT09IDBcbiAgICA/ICQoXCIucGxhY2Vob2xkZXJcIiwgXCJOb3QgV2luZXJzXCIpXG4gICAgOiAkKFwidGFibGUubGVhZGVycy10YWJsZVwiLCBbXG4gICAgICAgICQoXCJ0aGVhZC5sZWFkZXJzLXRhYmxlLWhlYWRcIiwgW1xuICAgICAgICAgICQoXCJ0ZC5nYW1lci1wb3NpdGlvblwiLCBcIk5cIiksXG4gICAgICAgICAgJChcInRkLmdhbWVyLXBvaW50c1wiLCBcIlBvaW50c1wiKSxcbiAgICAgICAgICAkKFwidGQuZ2FtZXItd2luLWRhdGVcIiwgXCJEYXRlXCIpLFxuICAgICAgICBdKSxcbiAgICAgICAgJChcInRib2R5XCIsIGxlYWRlclRhYmxlUm93cyhsZWFkZXJzKSksXG4gICAgICBdKTtcblxuLyoqXG4gKiDQpNGD0L3QutGG0LjRjyDQtNC70Y8g0L7QsdGA0LDQsdC+0YLQutC4INC40LvQuCDQvtGC0L7QsdGA0LDQttC10L3QuNGPINGC0LDQsdC70LjRhtGLINC70LjQtNC10YDQvtCyLlxuICogQHBhcmFtIHtHYW1lW119IGxlYWRlcnMgLSDQnNCw0YHRgdC40LIg0L7QsdGK0LXQutGC0L7QsiDQutC70LDRgdGB0LAgR2FtZS5cbiAqIEByZXR1cm5zIHtIVE1MRWxlbWVudFtdfSDQndC+0LLRi9C5INC80LDRgdGB0LjQsiwg0L/QvtC70YPRh9C10L3QvdGL0Lkg0LIg0YDQtdC30YPQu9GM0YLQsNGC0LUg0LzQsNC/0L/QuNC90LPQsC5cbiAqL1xuY29uc3QgbGVhZGVyVGFibGVSb3dzID0gKGxlYWRlcnMpID0+XG4gIGxlYWRlcnMubWFwKChnYW1lLCBpKSA9PlxuICAgICQoXCJ0ci5nYW1lci10YWJsZS1yb3dcIiwgW1xuICAgICAgJChcInRkLmdhbWVyLXBvc2l0aW9uXCIsIGkgKyAxKSxcbiAgICAgICQoXCJ0ZC5nYW1lci1wb2ludHNcIiwgZ2FtZS5wb2ludHMpLFxuICAgICAgJChcInRkLmdhbWVyLXdpbi1kYXRlXCIsIGdhbWUuZndpbkRhdGUpLFxuICAgIF0pLFxuICApO1xuXG5mdW5jdGlvbiBvbkNsaWNrTGVhZGVyc0J1dHRvbihtb2RlbCwgZXZlbnQpIHtcbiAgbW9kZWwuZ2V0TGVhZGVycygpO1xufVxuXG5jb25zdCBkaWFsb2dFdmVudHMgPSB7XG4gIGNsaWNrKGV2ZW50KSB7XG4gICAgY29uc3QgaXNPdmVybGF5ID0gZXZlbnQudGFyZ2V0ID09PSBldmVudC5jdXJyZW50VGFyZ2V0O1xuICAgIGNvbnN0IGlzQ2xvc2VCdG4gPSBldmVudC50YXJnZXQuY2xvc2VzdChcIi5jbG9zZS1tb2RhbC1idXR0b25cIik7XG4gICAgaWYgKGlzT3ZlcmxheSB8fCBpc0Nsb3NlQnRuKSB7XG4gICAgICB0aGlzLmRlc3Ryb3koKTtcbiAgICB9XG4gIH0sXG4gIGNhbmNlbChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgdGhpcy5kZXN0cm95KCk7XG4gIH0sXG59O1xuXG5hc3luYyBmdW5jdGlvbiBvbkNsaWNrTmV3R2FtZUJ1dHRvbigpIHtcbiAgcm9vdC5xdWVyeVNlbGVjdG9yQWxsKFwiLmNhcmQtY29udGFpbmVyXCIpLmZvckVhY2goKGNhcmQpID0+IHtcbiAgICBjYXJkLmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1vcGVuXCIpO1xuICB9KTtcbiAgYXdhaXQgZGVsYXkoMjUwKTtcbiAgcmVuZGVyKCk7XG59XG5cbmNvbnN0IGxlYWRlcnNNb2RhbCA9IChsZWFkZXJzKSA9PlxuICAkKFwiZGlhbG9nLmxlYWRlcnMtbW9kYWxcIiwgeyBldmVudHM6IGRpYWxvZ0V2ZW50cyB9LCBbXG4gICAgJChcIi5tb2RhbC1jb250YWluZXJcIiwgW1xuICAgICAgJChcImgyLmxlYWRlcnMtdGFibGUtdGl0bGVcIiwgXCJMZWFkZXJzXCIpLFxuICAgICAgbGVhZGVyc1RhYmxlKGxlYWRlcnMpLFxuICAgICAgY2xvc2VNb2RhbEJ1dHRvbigpLFxuICAgIF0pLFxuICBdKTtcblxuY29uc3Qgd2luTW9kYWwgPSAoc2NvcmUpID0+XG4gICQoXCJkaWFsb2cud2luLW1vZGFsXCIsIHsgZXZlbnRzOiBkaWFsb2dFdmVudHMgfSwgW1xuICAgICQoXCIubW9kYWwtY29udGFpbmVyXCIsIHsgZXZlbnRzOiBkaWFsb2dFdmVudHMgfSwgW1xuICAgICAgJChcImgyLndpbi10aXRsZVwiLCBcIkNvbmdyYXR1bGF0aW9ucyFcIiksXG4gICAgICAkKFwiLndpbi1zY29yZVwiLCBgWW91ciBzY29yZSAke3Njb3JlfSBwb2ludHNgKSxcbiAgICAgICQoXCIuYnV0dG9ucy1ibG9ja1wiLCBbbmV3R2FtZUJ1dHRvbigpLCBjbG9zZU1vZGFsQnV0dG9uKCldKSxcbiAgICBdKSxcbiAgXSk7XG5cbmNvbnN0IG9wZW5XaW5Nb2RhbCA9IChzY29yZSkgPT4ge1xuICBjb25zdCBtb2RhbCA9IHdpbk1vZGFsKHNjb3JlKS51aUVsZW1lbnQ7XG4gIGlmIChtb2RhbCBpbnN0YW5jZW9mIEhUTUxEaWFsb2dFbGVtZW50KSB7XG4gICAgcm9vdC5hcHBlbmRDaGlsZChtb2RhbCk7XG4gICAgbW9kYWwuc2hvd01vZGFsKCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGdhbWVSZWR1c2VyKGFjdGlvblR5cGUsIHBheWxvYWQpIHtcbiAgc3dpdGNoIChhY3Rpb25UeXBlKSB7XG4gICAgY2FzZSBcIndpblwiOlxuICAgICAgaWYgKHBheWxvYWQpIHtcbiAgICAgICAgb3Blbldpbk1vZGFsKHBheWxvYWQuZGF0YSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwibG9ja2NhcmRzXCI6XG4gICAgICByb290LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY2FyZC1jb250YWluZXJcIikuZm9yRWFjaCgoY2FyZCkgPT4ge1xuICAgICAgICBpZiAocGF5bG9hZC5pbmNsdWRlcyhOdW1iZXIoY2FyZC5pZC5yZXBsYWNlKC9bXlxcZF0vZywgXCJcIikpKSkge1xuICAgICAgICAgIGNhcmQuY2xhc3NMaXN0LmFkZChcImxvY2stY2xpY2tcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FyZC5jbGFzc0xpc3QucmVtb3ZlKFwibG9jay1jbGlja1wiKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiaGl0XCI6XG4gICAgICByb290LnF1ZXJ5U2VsZWN0b3IoXCIud2lucy1jb3VudFwiKS50ZXh0Q29udGVudCA9IGAke3BheWxvYWR9IG9mIDggcGFpcnNgO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImNsb3NlY2FyZFwiOlxuICAgICAgcm9vdC5xdWVyeVNlbGVjdG9yQWxsKFwiLmNhcmQtY29udGFpbmVyXCIpLmZvckVhY2goKGNhcmQpID0+IHtcbiAgICAgICAgaWYgKHBheWxvYWQuaW5jbHVkZXMoTnVtYmVyKGNhcmQuaWQucmVwbGFjZSgvW15cXGRdL2csIFwiXCIpKSkpIHtcbiAgICAgICAgICBjYXJkLmNsYXNzTGlzdC50b2dnbGUoXCJpcy1vcGVuXCIpO1xuICAgICAgICAgIGNvbnN0IGltZyA9IGNhcmQucXVlcnlTZWxlY3RvcihcIi5maWd1cmUtaW1nXCIpO1xuICAgICAgICAgIGltZy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgYGApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJtb3Zlc2NvdW50XCI6XG4gICAgICByb290LnF1ZXJ5U2VsZWN0b3IoXCIubW92ZXMtY291bnRcIikudGV4dENvbnRlbnQgPSBwYXlsb2FkO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcImFkZGltZ1wiOlxuICAgICAgY29uc3QgY29udCA9IHJvb3QucXVlcnlTZWxlY3RvcihgLmNhcmQtY29udGFpbmVyI2NhcmQtJHtwYXlsb2FkLmtleX1gKTtcbiAgICAgIGNvbnN0IGltZyA9IGNvbnQucXVlcnlTZWxlY3RvcihcIi5maWd1cmUtaW1nXCIpO1xuICAgICAgaW1nLnNldEF0dHJpYnV0ZShcInNyY1wiLCBgaW1hZ2VzL29yaWdhbWlfc2hhcGVfJHtwYXlsb2FkLnZhbHVlfS5zdmdgKTtcbiAgICBkZWZhdWx0OlxuICAgICAgYnJlYWs7XG4gIH1cbn1cblxuZnVuY3Rpb24gbGVhZGVyc1JlZHVzZXIoYWN0aW9uVHlwZSwgcGF5bG9hZCkge1xuICBzd2l0Y2ggKGFjdGlvblR5cGUpIHtcbiAgICBjYXNlIFwib3Blbm1vZGFsXCI6XG4gICAgICBjb25zdCBtb2RhbCA9IGxlYWRlcnNNb2RhbChwYXlsb2FkLmRhdGEpLnVpRWxlbWVudDtcbiAgICAgIGlmIChtb2RhbCBpbnN0YW5jZW9mIEhUTUxEaWFsb2dFbGVtZW50KSB7XG4gICAgICAgIHJvb3QuYXBwZW5kQ2hpbGQobW9kYWwpO1xuICAgICAgICBtb2RhbC5zaG93TW9kYWwoKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICBicmVhaztcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiByZW5kZXIoKSB7XG4gIGNvbnN0IGdhbWVNb2RlbCA9IG5ldyBHYW1lTW9kZWwoKTtcbiAgY29uc3QgbGVhZGVyc01vZGVsID0gbmV3IExlYWRlcnNNb2RlbCgpO1xuICBnYW1lTW9kZWwuc3Vic2NyaWJlKGdhbWVSZWR1c2VyKTtcbiAgbGVhZGVyc01vZGVsLnN1YnNjcmliZShsZWFkZXJzUmVkdXNlcik7XG5cbiAgY29uc3QgaGVhZGVyID0gKG1vZGVsKSA9PlxuICAgICQoXCJoZWFkZXIuaGVhZGVyXCIsIFtcbiAgICAgICQoXCIuY29udGFpbmVyLmhlYWRlci1jb250YWluZXJcIiwgW1xuICAgICAgICAkKFwiYnV0dG9uLmhlYWRlci1idXR0b24ubGVhZGVycy1tb2RhbC1idXR0b25cIiwge1xuICAgICAgICAgIHRleHQ6IFwiTGVhZGVyc1wiLFxuICAgICAgICAgIGV2ZW50czogeyBjbGljazogb25DbGlja0xlYWRlcnNCdXR0b24uYmluZChudWxsLCBtb2RlbCkgfSxcbiAgICAgICAgfSksXG4gICAgICAgIG5ld0dhbWVCdXR0b24oKSxcbiAgICAgIF0pLFxuICAgIF0pO1xuXG4gIGNvbnN0IG1haW4gPSAkKFwibWFpblwiLCBbXG4gICAgJChcIi5jb250YWluZXJcIiwgW1xuICAgICAgJChcImgxLmdhbWUtdGl0bGVcIiwgXCJNZW1vcnkgZ2FtZVwiKSxcbiAgICAgICQoXCIuY2FyZC1ncmlkXCIsIGNyZWF0ZUNsb3NlQ2FyZHMoZ2FtZU1vZGVsKSksXG4gICAgXSksXG4gIF0pO1xuXG4gIGNvbnN0IGZvb3RlciA9ICQoXCJmb290ZXIuZm9vdGVyXCIsIFtcbiAgICAkKFwiLmNvbnRhaW5lclwiLCBbXG4gICAgICAkKFwiaDMuY3VycmVudC1yZXN1bHQtdGl0bGVcIiwgXCJDdXJyZW50IFNjb3JlOlwiKSxcbiAgICAgICQoXCIuc2NvcmVcIiwgW1xuICAgICAgICAkKFwiLm1vdmVzXCIsIFtcbiAgICAgICAgICAkKFwic3Bhbi5tb3Zlcy10aXRsZVwiLCBcIk1vdmVzOlwiKSxcbiAgICAgICAgICAkKFwic3Bhbi5tb3Zlcy1jb3VudFwiLCBcIjBcIiksXG4gICAgICAgIF0pLFxuICAgICAgICAkKFwiLndpbnNcIiwgW1xuICAgICAgICAgICQoXCJzcGFuLndpbnMtdGl0bGVcIiwgXCJXaW5zOlwiKSxcbiAgICAgICAgICAkKFwic3Bhbi53aW5zLWNvdW50XCIsIFwiMCBvZiA4IHBhaXJzXCIpLFxuICAgICAgICBdKSxcbiAgICAgIF0pLFxuICAgIF0pLFxuICBdKTtcblxuICBjb25zdCBib2R5TGlzdCA9IFtoZWFkZXIobGVhZGVyc01vZGVsKSwgbWFpbiwgZm9vdGVyXS5tYXAoXG4gICAgKHRhZykgPT4gdGFnLnVpRWxlbWVudCxcbiAgKTtcbiAgcm9vdC5yZXBsYWNlQ2hpbGRyZW4oLi4uYm9keUxpc3QpO1xufVxuXG5yZW5kZXIoKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==