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

const revertCard = (model, event) => {
  const cardContainer = event.currentTarget;
  model.openCard = cardContainer.id;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0Esd0JBQXdCLGtEQUFTO0FBQ2pDLDJCQUEyQixxREFBWTtBQUN2QztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsK0NBQStDO0FBQ25FLFNBQVM7QUFDVDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vRGF0YUNsaWVudC5qcyIsIndlYnBhY2s6Ly8vLi9HYW1lLmpzIiwid2VicGFjazovLy8uL0dhbWVNb2RlbC5qcyIsIndlYnBhY2s6Ly8vLi9JdGVtVUkuanMiLCJ3ZWJwYWNrOi8vLy4vTGVhZGVyc01vZGVsLmpzIiwid2VicGFjazovLy8uL3V0aWxzLmpzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovLy8uL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNsYXNzIERhdGFDbGllbnQge1xuICBjb25zdHJ1Y3RvcihuYW1lc3BhY2UgPSBcIm1lbW9yeS1nYW1lXCIsIHVybCA9IFwiXCIpIHtcbiAgICB0aGlzLm5hbWVzcGFjZSA9IG5hbWVzcGFjZTtcbiAgICB0aGlzLnVybCA9IHVybDtcbiAgfVxuXG4gIGFzeW5jIGdldEl0ZW0oa2V5ID0gXCJcIikge1xuICAgIGNvbnN0IHZhbHVlID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oYCR7dGhpcy5uYW1lc3BhY2V9OiR7a2V5fWApO1xuICAgIHJldHVybiB2YWx1ZSA/IEpTT04ucGFyc2UodmFsdWUpIDogbnVsbDtcbiAgfVxuXG4gIHNldEl0ZW0oa2V5ID0gXCJcIiwgdmFsdWUgPSB1bmRlZmluZWQpIHtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShgJHt0aGlzLm5hbWVzcGFjZX06JHtrZXl9YCwgSlNPTi5zdHJpbmdpZnkodmFsdWUpKTtcbiAgfVxuXG4gIHJlbW92ZUl0ZW0oa2V5ID0gXCJcIikge1xuICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKGAke3RoaXMubmFtZXNwYWNlfToke2tleX1gKTtcbiAgfVxuXG4gIGFzeW5jIHBvc3REYXRhKHVybCA9IFwiXCIsIGRhdGEgPSB7fSkge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7XG4gICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgbW9kZTogXCJjb3JzXCIsXG4gICAgICBjYWNoZTogXCJuby1jYWNoZVwiLFxuICAgICAgY3JlZGVudGlhbHM6IFwic2FtZS1vcmlnaW5cIixcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICB9LFxuICAgICAgcmVkaXJlY3Q6IFwiZm9sbG93XCIsXG4gICAgICByZWZlcnJlclBvbGljeTogXCJuby1yZWZlcnJlclwiLFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZGF0YSksXG4gICAgfSk7XG4gICAgcmV0dXJuIGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBEYXRhQ2xpZW50O1xuIiwiY2xhc3MgR2FtZSB7XG4gIHN0YXRpYyBmb3JtYXR0ZXIgPSBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChcInJ1LVJVXCIsIHtcbiAgICBkYXk6IFwiMi1kaWdpdFwiLFxuICAgIG1vbnRoOiBcIjItZGlnaXRcIixcbiAgICB5ZWFyOiBcIm51bWVyaWNcIixcbiAgfSk7XG4gIC8qKlxuICAgKiBAcGFyYW0ge09iamVjdH0gcHJvZmlsZSAtINCU0LDQvdC90YvQtSDQv9GA0L7RhNC40LvRjyDQuNCz0YDQvtC60LAuXG4gICAqIEBwYXJhbSB7RGF0ZX0gcHJvZmlsZS53aW5EYXRlIC0g0JTQsNGC0LAg0L/QvtCx0LXQtNGLLlxuICAgKiBAcGFyYW0ge251bWJlcn0gcHJvZmlsZS5wb2ludHMgLSDQndCw0LHRgNCw0L3QvdGL0LUg0L7Rh9C60LguXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih7IHdpbkRhdGUsIHBvaW50cyB9KSB7XG4gICAgdGhpcy53aW5EYXRlID0gd2luRGF0ZTtcbiAgICB0aGlzLnBvaW50cyA9IHBvaW50cztcbiAgfVxuXG4gIGdldCBmd2luRGF0ZSgpIHtcbiAgICByZXR1cm4gR2FtZS5mb3JtYXR0ZXIuZm9ybWF0KHRoaXMud2luRGF0ZSk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgR2FtZTtcbiIsImltcG9ydCBEYXRhQ2xpZW50IGZyb20gXCIuL0RhdGFDbGllbnRcIjtcbmltcG9ydCBHYW1lIGZyb20gXCIuL0dhbWVcIjtcbmltcG9ydCB7IGRlbGF5IH0gZnJvbSBcIi4vdXRpbHNcIjtcblxuY2xhc3MgR2FtZU1vZGVsIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5kYXRhQ2xpZW50ID0gbmV3IERhdGFDbGllbnQoKTtcbiAgICB0aGlzLnNodWZmbGVkQ2FyZHMgPSBbXTtcbiAgICB0aGlzLl9vcGVuQ2FyZCA9IFtdO1xuICAgIHRoaXMubG9ja2VkQ2FyZHMgPSBbXTtcbiAgICB0aGlzLm1vdmVzQ291bnQgPSAwO1xuICAgIHRoaXMuaGl0ID0gMDtcbiAgICB0aGlzLmluaXQoKTtcbiAgICBjb25zdCBkZWZhdWx0U3RhdGUgPSB7XG4gICAgICB3aW46IHVuZGVmaW5lZCxcbiAgICAgIGxvY2tjYXJkczogW10sXG4gICAgICBjbG9zZWNhcmQ6IFtdLFxuICAgICAgbW92ZXNjb3VudDogMCxcbiAgICAgIGhpdDogMCxcbiAgICAgIGFkZGltZzogdW5kZWZpbmVkLFxuICAgIH07XG5cbiAgICB0aGlzLnN0YXRlID0gbmV3IFByb3h5KGRlZmF1bHRTdGF0ZSwge1xuICAgICAgc2V0OiAodGFyZ2V0LCBwcm9wZXJ0eSwgdmFsdWUpID0+IHtcbiAgICAgICAgaWYgKHRhcmdldFtwcm9wZXJ0eV0gPT09IHZhbHVlKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgdGFyZ2V0W3Byb3BlcnR5XSA9IHZhbHVlO1xuXG4gICAgICAgIGlmICh0aGlzLm9ic2VydmVyKSB7XG4gICAgICAgICAgdGhpcy5vYnNlcnZlcihwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICB0aGlzLnNodWZmbGVDYXJkcygpO1xuICB9XG5cbiAgc2h1ZmZsZUNhcmRzKCkge1xuICAgIHRoaXMuc2h1ZmZsZWRDYXJkcyA9IFtdO1xuICAgIGxldCBzdGFydEFycmF5ID0gQXJyYXkuZnJvbSh7IGxlbmd0aDogMTYgfSwgKF8sIGkpID0+IChpICUgOCkgKyAxKTtcbiAgICBsZXQgbSA9IHN0YXJ0QXJyYXkubGVuZ3RoLFxuICAgICAgdCxcbiAgICAgIGk7XG4gICAgd2hpbGUgKG0pIHtcbiAgICAgIGkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBtLS0pO1xuICAgICAgdCA9IHN0YXJ0QXJyYXlbbV07XG4gICAgICBzdGFydEFycmF5W21dID0gc3RhcnRBcnJheVtpXTtcbiAgICAgIHN0YXJ0QXJyYXlbaV0gPSB0O1xuICAgIH1cblxuICAgIHRoaXMuc2h1ZmZsZWRDYXJkcyA9IHN0YXJ0QXJyYXk7XG4gICAgY29uc29sZS5sb2codGhpcy5zaHVmZmxlZENhcmRzKTtcbiAgfVxuXG4gIHNldCBvcGVuQ2FyZChpZENhcmQpIHtcbiAgICBpZiAodHlwZW9mIGlkQ2FyZCAhPT0gXCJzdHJpbmdcIikgcmV0dXJuO1xuICAgIGNvbnN0IGluZGV4Q2FyZCA9IE51bWJlcihpZENhcmQucmVwbGFjZSgvW15cXGRdL2csIFwiXCIpKTtcbiAgICB0aGlzLl9vcGVuQ2FyZC5wdXNoKGluZGV4Q2FyZCk7XG4gICAgdGhpcy5zdGF0ZS5hZGRpbWcgPSB7XG4gICAgICBrZXk6IGluZGV4Q2FyZCxcbiAgICAgIHZhbHVlOiB0aGlzLnNodWZmbGVkQ2FyZHNbaW5kZXhDYXJkIC0gMV0sXG4gICAgfTtcbiAgICB0aGlzLmxvY2tDYXJkcygpO1xuICAgIC8vIHRoaXMuc3RhdGUuYWRkaW1nID0geyBpZENhcmQ6IHRoaXMuc2h1ZmZsZWRDYXJkc1tpbmRleENhcmQgLSAxXSB9O1xuICAgIGlmICh0aGlzLl9vcGVuQ2FyZC5sZW5ndGggPT09IDIpIHtcbiAgICAgIHRoaXMuY2hlY2tIaXQoKTtcbiAgICB9XG4gIH1cblxuICBsb2NrQ2FyZHMoKSB7XG4gICAgdGhpcy5zdGF0ZS5sb2NrY2FyZHMgPSAoKCkgPT4ge1xuICAgICAgc3dpdGNoICh0aGlzLl9vcGVuQ2FyZC5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIHJldHVybiB0aGlzLmxvY2tlZENhcmRzLmNvbmNhdCh0aGlzLl9vcGVuQ2FyZCk7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh7IGxlbmd0aDogMTYgfSwgKF8sIGkpID0+IGkgKyAxKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gdGhpcy5sb2NrZWRDYXJkcztcbiAgICAgIH1cbiAgICB9KSgpO1xuICB9XG5cbiAgYXN5bmMgc3RhcnRUaW1lcigpIHtcbiAgICBhd2FpdCBkZWxheSgxMjAwKTtcbiAgICB0aGlzLnN0YXRlLmNsb3NlY2FyZCA9IHRoaXMuX29wZW5DYXJkO1xuICAgIGF3YWl0IGRlbGF5KDMwKTtcbiAgICB0aGlzLl9vcGVuQ2FyZCA9IFtdO1xuICAgIHRoaXMubG9ja0NhcmRzKCk7XG4gIH1cblxuICBhc3luYyBjaGVja0hpdCgpIHtcbiAgICBpZiAodGhpcy5fb3BlbkNhcmQubGVuZ3RoICE9PSAyKSByZXR1cm47XG4gICAgdGhpcy5tb3Zlc0NvdW50ICs9IDE7XG4gICAgdGhpcy5zdGF0ZS5tb3Zlc2NvdW50ID0gdGhpcy5tb3Zlc0NvdW50O1xuICAgIGNvbnN0IGhpdCA9XG4gICAgICB0aGlzLnNodWZmbGVkQ2FyZHMuYXQodGhpcy5fb3BlbkNhcmRbMF0gLSAxKSA9PT1cbiAgICAgIHRoaXMuc2h1ZmZsZWRDYXJkcy5hdCh0aGlzLl9vcGVuQ2FyZFsxXSAtIDEpO1xuICAgIGlmIChoaXQpIHtcbiAgICAgIHRoaXMuaGl0ICs9IDE7XG4gICAgICB0aGlzLnN0YXRlLmhpdCA9IHRoaXMuaGl0O1xuICAgICAgdGhpcy5sb2NrZWRDYXJkcyA9IHRoaXMubG9ja2VkQ2FyZHMuY29uY2F0KHRoaXMuX29wZW5DYXJkKTtcbiAgICAgIHRoaXMuX29wZW5DYXJkID0gW107XG4gICAgICB0aGlzLmxvY2tDYXJkcygpO1xuICAgICAgaWYgKHRoaXMuaGl0ID09PSA4KSB7XG4gICAgICAgIGF3YWl0IHRoaXMuc2F2ZVJlc3VsdCgpO1xuICAgICAgICB0aGlzLnN0YXRlLndpbiA9IHsgZGF0YTogdGhpcy5tb3Zlc0NvdW50IH07XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3RhcnRUaW1lcigpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHNhdmVSZXN1bHQoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuZGF0YUNsaWVudC5nZXRJdGVtKFwibGVhZGVyc1wiKTtcbiAgICAvKiogQHR5cGUgeyBHYW1lW119ICovXG4gICAgY29uc3QgbGVhZGVycyA9IGRhdGEgPT09IG51bGwgPyBbXSA6IGRhdGEubWFwKChpdGVtKSA9PiBuZXcgR2FtZShpdGVtKSk7XG4gICAgbGVhZGVycy5wdXNoKG5ldyBHYW1lKHsgcG9pbnRzOiB0aGlzLm1vdmVzQ291bnQsIHdpbkRhdGU6IERhdGUubm93KCkgfSkpO1xuICAgIHRyeSB7XG4gICAgICB0aGlzLmRhdGFDbGllbnQuc2V0SXRlbShcImxlYWRlcnNcIiwgbGVhZGVycyk7XG4gICAgfSBjYXRjaCB7XG4gICAgICBjb25zb2xlLmxvZyhcIm5vIHdyaXRlXCIpO1xuICAgIH1cbiAgfVxuXG4gIHN1YnNjcmliZShyZWR1Y2VyRnVuY3Rpb24pIHtcbiAgICB0aGlzLm9ic2VydmVyID0gcmVkdWNlckZ1bmN0aW9uO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWVNb2RlbDtcbiIsImNsYXNzIEl0ZW1VSSB7XG4gIGNvbnN0cnVjdG9yKHtcbiAgICB0YWcgPSBcImRpdlwiLFxuICAgIGNsYXNzTmFtZXMgPSBbXSxcbiAgICBpbm5lcnMgPSBbXSxcbiAgICB0ZXh0ID0gdW5kZWZpbmVkLFxuICAgIHZhbHVlID0gdW5kZWZpbmVkLFxuICAgIGF0dHJzID0ge30sXG4gICAgZXZlbnRzID0ge30sXG4gIH0gPSB7fSkge1xuICAgIHRoaXMudGFnID0gdGFnO1xuICAgIHRoaXMuY2xhc3NOYW1lcyA9IGNsYXNzTmFtZXM7XG4gICAgdGhpcy5pbm5lcnMgPSBpbm5lcnM7XG4gICAgdGhpcy50ZXh0ID0gdGV4dDtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5hdHRycyA9IGF0dHJzO1xuICAgIHRoaXMuZXZlbnRzID0gZXZlbnRzO1xuICAgIHRoaXMudWlFbGVtZW50ID0gdGhpcy5jcmVhdGVOZXdFbGVtZW50KCk7XG4gIH1cblxuICBjcmVhdGVOZXdFbGVtZW50KCkge1xuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0aGlzLnRhZyk7XG5cbiAgICB0aGlzLmNsYXNzTmFtZXMuZm9yRWFjaCgoY2xhc3NOYW1lKSA9PiB7XG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLnRleHQpIHtcbiAgICAgIGVsZW1lbnQuaW5uZXJUZXh0ID0gdGhpcy50ZXh0O1xuICAgIH1cblxuICAgIE9iamVjdC5lbnRyaWVzKHRoaXMuYXR0cnMpLmZvckVhY2goKFtrLCB2XSkgPT4gZWxlbWVudC5zZXRBdHRyaWJ1dGUoaywgdikpO1xuXG4gICAgaWYgKHRoaXMudmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZWxlbWVudC52YWx1ZSA9IHRoaXMudmFsdWU7XG4gICAgfVxuXG4gICAgT2JqZWN0LmVudHJpZXModGhpcy5ldmVudHMpLmZvckVhY2goKFtldmVudE5hbWUsIGhhbmRsZXJdKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBjb25zdCBib3VuZEhhbmRsZXIgPSBoYW5kbGVyLmJpbmQodGhpcyk7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGJvdW5kSGFuZGxlcik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmlubmVycy5mb3JFYWNoKChpbm5lckVsZW1lbnQpID0+IHtcbiAgICAgIGlmIChpbm5lckVsZW1lbnQgaW5zdGFuY2VvZiBJdGVtVUkpIHtcbiAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChpbm5lckVsZW1lbnQudWlFbGVtZW50KTtcbiAgICAgIH0gZWxzZSBpZiAoaW5uZXJFbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChpbm5lckVsZW1lbnQpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGVsZW1lbnQ7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuaW5uZXJzLmZvckVhY2goKGlubmVyKSA9PiB7XG4gICAgICBpZiAoaW5uZXIgaW5zdGFuY2VvZiBJdGVtVUkpIHtcbiAgICAgICAgaW5uZXIuZGVzdHJveSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMudWlFbGVtZW50ICYmIHRoaXMudWlFbGVtZW50LnBhcmVudE5vZGUpIHtcbiAgICAgIHRoaXMudWlFbGVtZW50LnJlbW92ZSgpO1xuICAgIH1cblxuICAgIHRoaXMudWlFbGVtZW50ID0gbnVsbDtcbiAgICB0aGlzLmlubmVycyA9IFtdO1xuICAgIHRoaXMuZXZlbnRzID0ge307XG4gIH1cblxuICBzdGF0aWMgY3JlYXRlKHRhZ0FuZENsYXNzZXMsIGNvbmZpZ09ySW5uZXJzID0ge30sIHBvc3NpYmxlSW5uZXJzID0gW10pIHtcbiAgICBsZXQgdGFyZ2V0U3RyaW5nID0gdGFnQW5kQ2xhc3Nlcy50cmltKCk7XG4gICAgaWYgKHRhcmdldFN0cmluZy5zdGFydHNXaXRoKFwiLlwiKSkge1xuICAgICAgdGFyZ2V0U3RyaW5nID0gXCJkaXZcIiArIHRhcmdldFN0cmluZztcbiAgICB9XG5cbiAgICBjb25zdCBwYXJ0cyA9IHRhcmdldFN0cmluZy5zcGxpdChcIi5cIik7XG4gICAgY29uc3QgdGFnID0gcGFydHNbMF0gfHwgXCJkaXZcIjtcbiAgICBjb25zdCBjbGFzc05hbWVzID0gcGFydHMuc2xpY2UoMSk7XG5cbiAgICBsZXQgY29uZmlnID0ge307XG4gICAgbGV0IGlubmVycyA9IHBvc3NpYmxlSW5uZXJzO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoY29uZmlnT3JJbm5lcnMpKSB7XG4gICAgICBpbm5lcnMgPSBjb25maWdPcklubmVycztcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgdHlwZW9mIGNvbmZpZ09ySW5uZXJzID09PSBcInN0cmluZ1wiIHx8XG4gICAgICB0eXBlb2YgY29uZmlnT3JJbm5lcnMgPT09IFwibnVtYmVyXCJcbiAgICApIHtcbiAgICAgIGNvbmZpZy50ZXh0ID0gY29uZmlnT3JJbm5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbmZpZyA9IHsgLi4uY29uZmlnT3JJbm5lcnMgfTtcbiAgICB9XG5cbiAgICBpZiAoaW5uZXJzLmxlbmd0aCA+IDApIGNvbmZpZy5pbm5lcnMgPSBpbm5lcnM7XG4gICAgY29uZmlnLnRhZyA9IHRhZztcbiAgICBjb25maWcuY2xhc3NOYW1lcyA9IFsuLi5jbGFzc05hbWVzLCAuLi4oY29uZmlnLmNsYXNzTmFtZXMgfHwgW10pXTtcblxuICAgIHJldHVybiBuZXcgSXRlbVVJKGNvbmZpZyk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSXRlbVVJO1xuIiwiaW1wb3J0IERhdGFDbGllbnQgZnJvbSBcIi4vRGF0YUNsaWVudFwiO1xuaW1wb3J0IEdhbWUgZnJvbSBcIi4vR2FtZVwiO1xuXG5jbGFzcyBMZWFkZXJzTW9kZWwge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmRhdGFDbGllbnQgPSBuZXcgRGF0YUNsaWVudCgpO1xuICAgIHRoaXMuaW5pdCgpO1xuICAgIGNvbnN0IGRlZmF1bHRTdGF0ZSA9IHtcbiAgICAgIG9wZW5tb2RhbDogW10sXG4gICAgfTtcbiAgICB0aGlzLnN0YXRlID0gbmV3IFByb3h5KGRlZmF1bHRTdGF0ZSwge1xuICAgICAgc2V0OiAodGFyZ2V0LCBwcm9wZXJ0eSwgdmFsdWUpID0+IHtcbiAgICAgICAgaWYgKHRhcmdldFtwcm9wZXJ0eV0gPT09IHZhbHVlKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgdGFyZ2V0W3Byb3BlcnR5XSA9IHZhbHVlO1xuXG4gICAgICAgIGlmICh0aGlzLm9ic2VydmVyKSB7XG4gICAgICAgICAgdGhpcy5vYnNlcnZlcihwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgaW5pdCgpIHt9XG5cbiAgYXN5bmMgZ2V0TGVhZGVycygpIHtcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5kYXRhQ2xpZW50LmdldEl0ZW0oXCJsZWFkZXJzXCIpO1xuICAgIC8qKiBAdHlwZSB7IEdhbWVbXX0gKi9cbiAgICBjb25zdCBsZWFkZXJzID0gZGF0YSA9PT0gbnVsbCA/IFtdIDogZGF0YS5tYXAoKGl0ZW0pID0+IG5ldyBHYW1lKGl0ZW0pKTtcbiAgICBjb25zdCBzb3J0ZWRMZWFkZXJzID0gbGVhZGVycy5zb3J0KFxuICAgICAgKGEsIGIpID0+IGEucG9pbnRzIC0gYi5wb2ludHMgfHwgYi53aW5EYXRlIC0gYS53aW5EYXRlLFxuICAgICk7XG4gICAgdGhpcy5zdGF0ZS5vcGVubW9kYWwgPSB7XG4gICAgICBkYXRhOiBzb3J0ZWRMZWFkZXJzLnNsaWNlKDAsIE1hdGgubWluKDEwLCBzb3J0ZWRMZWFkZXJzLmxlbmd0aCkpLFxuICAgIH07XG4gIH1cblxuICBzdWJzY3JpYmUocmVkdWNlckZ1bmN0aW9uKSB7XG4gICAgdGhpcy5vYnNlcnZlciA9IHJlZHVjZXJGdW5jdGlvbjtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBMZWFkZXJzTW9kZWw7XG4iLCJleHBvcnQgY29uc3QgZGVsYXkgPSAobXMpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG5jb25zdCBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdGNvbnN0IGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHRjb25zdCBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdGlmICghKG1vZHVsZUlkIGluIF9fd2VicGFja19tb2R1bGVzX18pKSB7XG5cdFx0ZGVsZXRlIF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdFx0Y29uc3QgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyBtb2R1bGVJZCArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fVxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIvdmFsdWUgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSk7IiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCBHYW1lTW9kZWwgZnJvbSBcIi4vR2FtZU1vZGVsXCI7XG5pbXBvcnQgR2FtZSBmcm9tIFwiLi9HYW1lXCI7XG5pbXBvcnQgSXRlbVVJIGZyb20gXCIuL0l0ZW1VSVwiO1xuaW1wb3J0IExlYWRlcnNNb2RlbCBmcm9tIFwiLi9MZWFkZXJzTW9kZWxcIjtcbmltcG9ydCB7IGRlbGF5IH0gZnJvbSBcIi4vdXRpbHNcIjtcblxuY29uc3Qgcm9vdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJib2R5XCIpO1xuXG5jb25zdCBDT1VOVF9HQU1FX0NBUkRTID0gMTY7XG5cbmNvbnN0ICQgPSBJdGVtVUkuY3JlYXRlO1xuXG5jb25zdCBjcmVhdGVDbG9zZUNhcmRzID0gKG1vZGVsKSA9PlxuICBBcnJheS5mcm9tKHsgbGVuZ3RoOiBDT1VOVF9HQU1FX0NBUkRTIH0sIChfLCBpKSA9PiBpICsgMSkubWFwKChpbmQpID0+XG4gICAgJChcbiAgICAgIFwiLmNhcmQtY29udGFpbmVyXCIsXG4gICAgICB7XG4gICAgICAgIGF0dHJzOiB7IGlkOiBgY2FyZC0ke2luZH1gIH0sXG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgIGNsaWNrOiAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIHJldmVydENhcmQobW9kZWwsIGV2ZW50KTtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIFtcbiAgICAgICAgJChcIi5pbWctd3JhcHBlclwiLCBbXG4gICAgICAgICAgJChcImltZy5maWd1cmUtaW1nXCIsIHtcbiAgICAgICAgICAgIGF0dHJzOiB7IHNyYzogXCJcIiwgYWx0OiBcIlwiIH0sXG4gICAgICAgICAgfSksXG4gICAgICAgIF0pLFxuICAgICAgXSxcbiAgICApLFxuICApO1xuXG5jb25zdCByZXZlcnRDYXJkID0gKG1vZGVsLCBldmVudCkgPT4ge1xuICBjb25zdCBjYXJkQ29udGFpbmVyID0gZXZlbnQuY3VycmVudFRhcmdldDtcbiAgbW9kZWwub3BlbkNhcmQgPSBjYXJkQ29udGFpbmVyLmlkO1xuICBjYXJkQ29udGFpbmVyLmNsYXNzTGlzdC50b2dnbGUoXCJpcy1vcGVuXCIpO1xufTtcblxuY29uc3QgbmV3R2FtZUJ1dHRvbiA9ICgpID0+XG4gICQoXCJidXR0b24ubmV3LWdhbWUtYnV0dG9uXCIsIHtcbiAgICB0ZXh0OiBcIk5ldyBnYW1lXCIsXG4gICAgZXZlbnRzOiB7IGNsaWNrOiBvbkNsaWNrTmV3R2FtZUJ1dHRvbiB9LFxuICB9KTtcblxuY29uc3QgY2xvc2VNb2RhbEJ1dHRvbiA9ICgpID0+ICQoXCJidXR0b24uY2xvc2UtbW9kYWwtYnV0dG9uXCIsIFwiQ2xvc2VcIik7XG5cbi8qKlxuICog0KTRg9C90LrRhtC40Y8g0LTQu9GPINC+0LHRgNCw0LHQvtGC0LrQuCDQuNC70Lgg0L7RgtC+0LHRgNCw0LbQtdC90LjRjyDRgtCw0LHQu9C40YbRiyDQu9C40LTQtdGA0L7Qsi5cbiAqIEBwYXJhbSB7R2FtZVtdfSBsZWFkZXJzIC0g0JzQsNGB0YHQuNCyINC+0LHRitC10LrRgtC+0LIg0LrQu9Cw0YHRgdCwIEdhbWUuXG4gKiBAcmV0dXJucyB7SFRNTEVsZW1lbnRbXX0g0J3QvtCy0YvQuSDQvNCw0YHRgdC40LIsINC/0L7Qu9GD0YfQtdC90L3Ri9C5INCyINGA0LXQt9GD0LvRjNGC0LDRgtC1INC80LDQv9C/0LjQvdCz0LAuXG4gKi9cbmNvbnN0IGxlYWRlcnNUYWJsZSA9IChsZWFkZXJzKSA9PlxuICBsZWFkZXJzLmxlbmd0aCA9PT0gMFxuICAgID8gJChcIi5wbGFjZWhvbGRlclwiLCBcIk5vdCBXaW5lcnNcIilcbiAgICA6ICQoXCJ0YWJsZS5sZWFkZXJzLXRhYmxlXCIsIFtcbiAgICAgICAgJChcInRoZWFkLmxlYWRlcnMtdGFibGUtaGVhZFwiLCBbXG4gICAgICAgICAgJChcInRkLmdhbWVyLXBvc2l0aW9uXCIsIFwiTlwiKSxcbiAgICAgICAgICAkKFwidGQuZ2FtZXItcG9pbnRzXCIsIFwiUG9pbnRzXCIpLFxuICAgICAgICAgICQoXCJ0ZC5nYW1lci13aW4tZGF0ZVwiLCBcIkRhdGVcIiksXG4gICAgICAgIF0pLFxuICAgICAgICAkKFwidGJvZHlcIiwgbGVhZGVyVGFibGVSb3dzKGxlYWRlcnMpKSxcbiAgICAgIF0pO1xuXG4vKipcbiAqINCk0YPQvdC60YbQuNGPINC00LvRjyDQvtCx0YDQsNCx0L7RgtC60Lgg0LjQu9C4INC+0YLQvtCx0YDQsNC20LXQvdC40Y8g0YLQsNCx0LvQuNGG0Ysg0LvQuNC00LXRgNC+0LIuXG4gKiBAcGFyYW0ge0dhbWVbXX0gbGVhZGVycyAtINCc0LDRgdGB0LjQsiDQvtCx0YrQtdC60YLQvtCyINC60LvQsNGB0YHQsCBHYW1lLlxuICogQHJldHVybnMge0hUTUxFbGVtZW50W119INCd0L7QstGL0Lkg0LzQsNGB0YHQuNCyLCDQv9C+0LvRg9GH0LXQvdC90YvQuSDQsiDRgNC10LfRg9C70YzRgtCw0YLQtSDQvNCw0L/Qv9C40L3Qs9CwLlxuICovXG5jb25zdCBsZWFkZXJUYWJsZVJvd3MgPSAobGVhZGVycykgPT5cbiAgbGVhZGVycy5tYXAoKGdhbWUsIGkpID0+XG4gICAgJChcInRyLmdhbWVyLXRhYmxlLXJvd1wiLCBbXG4gICAgICAkKFwidGQuZ2FtZXItcG9zaXRpb25cIiwgaSArIDEpLFxuICAgICAgJChcInRkLmdhbWVyLXBvaW50c1wiLCBnYW1lLnBvaW50cyksXG4gICAgICAkKFwidGQuZ2FtZXItd2luLWRhdGVcIiwgZ2FtZS5md2luRGF0ZSksXG4gICAgXSksXG4gICk7XG5cbmZ1bmN0aW9uIG9uQ2xpY2tMZWFkZXJzQnV0dG9uKG1vZGVsLCBldmVudCkge1xuICBtb2RlbC5nZXRMZWFkZXJzKCk7XG59XG5cbmNvbnN0IGRpYWxvZ0V2ZW50cyA9IHtcbiAgY2xpY2soZXZlbnQpIHtcbiAgICBjb25zdCBpc092ZXJsYXkgPSBldmVudC50YXJnZXQgPT09IGV2ZW50LmN1cnJlbnRUYXJnZXQ7XG4gICAgY29uc3QgaXNDbG9zZUJ0biA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KFwiLmNsb3NlLW1vZGFsLWJ1dHRvblwiKTtcbiAgICBpZiAoaXNPdmVybGF5IHx8IGlzQ2xvc2VCdG4pIHtcbiAgICAgIHRoaXMuZGVzdHJveSgpO1xuICAgIH1cbiAgfSxcbiAgY2FuY2VsKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLmRlc3Ryb3koKTtcbiAgfSxcbn07XG5cbmFzeW5jIGZ1bmN0aW9uIG9uQ2xpY2tOZXdHYW1lQnV0dG9uKCkge1xuICByb290LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY2FyZC1jb250YWluZXJcIikuZm9yRWFjaCgoY2FyZCkgPT4ge1xuICAgIGNhcmQuY2xhc3NMaXN0LnJlbW92ZShcImlzLW9wZW5cIik7XG4gIH0pO1xuICBhd2FpdCBkZWxheSgyNTApO1xuICByZW5kZXIoKTtcbn1cblxuY29uc3QgbGVhZGVyc01vZGFsID0gKGxlYWRlcnMpID0+XG4gICQoXCJkaWFsb2cubGVhZGVycy1tb2RhbFwiLCB7IGV2ZW50czogZGlhbG9nRXZlbnRzIH0sIFtcbiAgICAkKFwiLm1vZGFsLWNvbnRhaW5lclwiLCBbXG4gICAgICAkKFwiaDIubGVhZGVycy10YWJsZS10aXRsZVwiLCBcIkxlYWRlcnNcIiksXG4gICAgICBsZWFkZXJzVGFibGUobGVhZGVycyksXG4gICAgICBjbG9zZU1vZGFsQnV0dG9uKCksXG4gICAgXSksXG4gIF0pO1xuXG5jb25zdCB3aW5Nb2RhbCA9IChzY29yZSkgPT5cbiAgJChcImRpYWxvZy53aW4tbW9kYWxcIiwgeyBldmVudHM6IGRpYWxvZ0V2ZW50cyB9LCBbXG4gICAgJChcIi5tb2RhbC1jb250YWluZXJcIiwgeyBldmVudHM6IGRpYWxvZ0V2ZW50cyB9LCBbXG4gICAgICAkKFwiaDIud2luLXRpdGxlXCIsIFwiQ29uZ3JhdHVsYXRpb25zIVwiKSxcbiAgICAgICQoXCIud2luLXNjb3JlXCIsIGBZb3VyIHNjb3JlICR7c2NvcmV9IHBvaW50c2ApLFxuICAgICAgJChcIi5idXR0b25zLWJsb2NrXCIsIFtuZXdHYW1lQnV0dG9uKCksIGNsb3NlTW9kYWxCdXR0b24oKV0pLFxuICAgIF0pLFxuICBdKTtcblxuY29uc3Qgb3Blbldpbk1vZGFsID0gKHNjb3JlKSA9PiB7XG4gIGNvbnN0IG1vZGFsID0gd2luTW9kYWwoc2NvcmUpLnVpRWxlbWVudDtcbiAgaWYgKG1vZGFsIGluc3RhbmNlb2YgSFRNTERpYWxvZ0VsZW1lbnQpIHtcbiAgICByb290LmFwcGVuZENoaWxkKG1vZGFsKTtcbiAgICBtb2RhbC5zaG93TW9kYWwoKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZ2FtZVJlZHVzZXIoYWN0aW9uVHlwZSwgcGF5bG9hZCkge1xuICBzd2l0Y2ggKGFjdGlvblR5cGUpIHtcbiAgICBjYXNlIFwid2luXCI6XG4gICAgICBpZiAocGF5bG9hZCkge1xuICAgICAgICBvcGVuV2luTW9kYWwocGF5bG9hZC5kYXRhKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJsb2NrY2FyZHNcIjpcbiAgICAgIHJvb3QucXVlcnlTZWxlY3RvckFsbChcIi5jYXJkLWNvbnRhaW5lclwiKS5mb3JFYWNoKChjYXJkKSA9PiB7XG4gICAgICAgIGlmIChwYXlsb2FkLmluY2x1ZGVzKE51bWJlcihjYXJkLmlkLnJlcGxhY2UoL1teXFxkXS9nLCBcIlwiKSkpKSB7XG4gICAgICAgICAgY2FyZC5jbGFzc0xpc3QuYWRkKFwibG9jay1jbGlja1wiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjYXJkLmNsYXNzTGlzdC5yZW1vdmUoXCJsb2NrLWNsaWNrXCIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJoaXRcIjpcbiAgICAgIHJvb3QucXVlcnlTZWxlY3RvcihcIi53aW5zLWNvdW50XCIpLnRleHRDb250ZW50ID0gYCR7cGF5bG9hZH0gb2YgOCBwYWlyc2A7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiY2xvc2VjYXJkXCI6XG4gICAgICByb290LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY2FyZC1jb250YWluZXJcIikuZm9yRWFjaCgoY2FyZCkgPT4ge1xuICAgICAgICBpZiAocGF5bG9hZC5pbmNsdWRlcyhOdW1iZXIoY2FyZC5pZC5yZXBsYWNlKC9bXlxcZF0vZywgXCJcIikpKSkge1xuICAgICAgICAgIGNhcmQuY2xhc3NMaXN0LnRvZ2dsZShcImlzLW9wZW5cIik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBcIm1vdmVzY291bnRcIjpcbiAgICAgIHJvb3QucXVlcnlTZWxlY3RvcihcIi5tb3Zlcy1jb3VudFwiKS50ZXh0Q29udGVudCA9IHBheWxvYWQ7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiYWRkaW1nXCI6XG4gICAgICBjb25zdCBjb250ID0gcm9vdC5xdWVyeVNlbGVjdG9yKGAuY2FyZC1jb250YWluZXIjY2FyZC0ke3BheWxvYWQua2V5fWApO1xuICAgICAgY29uc3QgaW1nID0gY29udC5xdWVyeVNlbGVjdG9yKFwiLmZpZ3VyZS1pbWdcIik7XG4gICAgICBpbWcuc2V0QXR0cmlidXRlKFwic3JjXCIsIGBpbWFnZXMvb3JpZ2FtaV9zaGFwZV8ke3BheWxvYWQudmFsdWV9LnN2Z2ApO1xuICAgIGRlZmF1bHQ6XG4gICAgICBicmVhaztcbiAgfVxufVxuXG5mdW5jdGlvbiBsZWFkZXJzUmVkdXNlcihhY3Rpb25UeXBlLCBwYXlsb2FkKSB7XG4gIHN3aXRjaCAoYWN0aW9uVHlwZSkge1xuICAgIGNhc2UgXCJvcGVubW9kYWxcIjpcbiAgICAgIGNvbnN0IG1vZGFsID0gbGVhZGVyc01vZGFsKHBheWxvYWQuZGF0YSkudWlFbGVtZW50O1xuICAgICAgaWYgKG1vZGFsIGluc3RhbmNlb2YgSFRNTERpYWxvZ0VsZW1lbnQpIHtcbiAgICAgICAgcm9vdC5hcHBlbmRDaGlsZChtb2RhbCk7XG4gICAgICAgIG1vZGFsLnNob3dNb2RhbCgpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgY29uc3QgZ2FtZU1vZGVsID0gbmV3IEdhbWVNb2RlbCgpO1xuICBjb25zdCBsZWFkZXJzTW9kZWwgPSBuZXcgTGVhZGVyc01vZGVsKCk7XG4gIGdhbWVNb2RlbC5zdWJzY3JpYmUoZ2FtZVJlZHVzZXIpO1xuICBsZWFkZXJzTW9kZWwuc3Vic2NyaWJlKGxlYWRlcnNSZWR1c2VyKTtcblxuICBjb25zdCBoZWFkZXIgPSAobW9kZWwpID0+XG4gICAgJChcImhlYWRlci5oZWFkZXJcIiwgW1xuICAgICAgJChcIi5jb250YWluZXIuaGVhZGVyLWNvbnRhaW5lclwiLCBbXG4gICAgICAgICQoXCJidXR0b24uaGVhZGVyLWJ1dHRvbi5sZWFkZXJzLW1vZGFsLWJ1dHRvblwiLCB7XG4gICAgICAgICAgdGV4dDogXCJMZWFkZXJzXCIsXG4gICAgICAgICAgZXZlbnRzOiB7IGNsaWNrOiBvbkNsaWNrTGVhZGVyc0J1dHRvbi5iaW5kKG51bGwsIG1vZGVsKSB9LFxuICAgICAgICB9KSxcbiAgICAgICAgbmV3R2FtZUJ1dHRvbigpLFxuICAgICAgXSksXG4gICAgXSk7XG5cbiAgY29uc3QgbWFpbiA9ICQoXCJtYWluXCIsIFtcbiAgICAkKFwiLmNvbnRhaW5lclwiLCBbXG4gICAgICAkKFwiaDEuZ2FtZS10aXRsZVwiLCBcIk1lbW9yeSBnYW1lXCIpLFxuICAgICAgJChcIi5jYXJkLWdyaWRcIiwgY3JlYXRlQ2xvc2VDYXJkcyhnYW1lTW9kZWwpKSxcbiAgICBdKSxcbiAgXSk7XG5cbiAgY29uc3QgZm9vdGVyID0gJChcImZvb3Rlci5mb290ZXJcIiwgW1xuICAgICQoXCIuY29udGFpbmVyXCIsIFtcbiAgICAgICQoXCJoMy5jdXJyZW50LXJlc3VsdC10aXRsZVwiLCBcIkN1cnJlbnQgU2NvcmU6XCIpLFxuICAgICAgJChcIi5zY29yZVwiLCBbXG4gICAgICAgICQoXCIubW92ZXNcIiwgW1xuICAgICAgICAgICQoXCJzcGFuLm1vdmVzLXRpdGxlXCIsIFwiTW92ZXM6XCIpLFxuICAgICAgICAgICQoXCJzcGFuLm1vdmVzLWNvdW50XCIsIFwiMFwiKSxcbiAgICAgICAgXSksXG4gICAgICAgICQoXCIud2luc1wiLCBbXG4gICAgICAgICAgJChcInNwYW4ud2lucy10aXRsZVwiLCBcIldpbnM6XCIpLFxuICAgICAgICAgICQoXCJzcGFuLndpbnMtY291bnRcIiwgXCIwIG9mIDggcGFpcnNcIiksXG4gICAgICAgIF0pLFxuICAgICAgXSksXG4gICAgXSksXG4gIF0pO1xuXG4gIGNvbnN0IGJvZHlMaXN0ID0gW2hlYWRlcihsZWFkZXJzTW9kZWwpLCBtYWluLCBmb290ZXJdLm1hcChcbiAgICAodGFnKSA9PiB0YWcudWlFbGVtZW50LFxuICApO1xuICByb290LnJlcGxhY2VDaGlsZHJlbiguLi5ib2R5TGlzdCk7XG59XG5cbnJlbmRlcigpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9