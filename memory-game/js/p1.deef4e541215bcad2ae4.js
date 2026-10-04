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
    await (0,_utils__WEBPACK_IMPORTED_MODULE_2__.delay)(1200);
    this.state.closecart = this._openCart;
    await (0,_utils__WEBPACK_IMPORTED_MODULE_2__.delay)(30);
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
    const liders = data === null ? [] : data.map((item) => new _Game__WEBPACK_IMPORTED_MODULE_1__["default"](item));
    liders.push(new _Game__WEBPACK_IMPORTED_MODULE_1__["default"]({ points: this.hitCount, winDate: Date.now() }));
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

/***/ "./LidersModel.js"
/*!************************!*\
  !*** ./LidersModel.js ***!
  \************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _DataClient__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./DataClient */ "./DataClient.js");
/* harmony import */ var _Game__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Game */ "./Game.js");



class LidersModel {
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

  async getLiders() {
    const data = await this.dataClient.getItem("liders");
    /** @type { Game[]} */
    const liders = data === null ? [] : data.map((item) => new _Game__WEBPACK_IMPORTED_MODULE_1__["default"](item));
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

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (LidersModel);


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
/* harmony import */ var _LidersModel__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./LidersModel */ "./LidersModel.js");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utils */ "./utils.js");






const root = document.querySelector("body");

const COUNT_GAME_CARTS = 16;

const $ = _ItemUI__WEBPACK_IMPORTED_MODULE_2__["default"].create;

const createCloseCarts = (model) =>
  Array.from({ length: COUNT_GAME_CARTS }, (_, i) => i + 1).map((ind) =>
    $(
      ".cart-container",
      {
        attrs: { id: `cart-${ind}` },
        events: {
          click: (event) => {
            revertCart(model, event);
          },
        },
      },
      [
        $(".img-wrapper", [
          $("img.figure-img", {
            attrs: { src: "images/origami_shape_1.svg", alt: "" },
          }),
        ]),
      ],
    ),
  );

const revertCart = (model, event) => {
  const cardContainer = event.currentTarget;
  model.openCart = cardContainer.id;
  cardContainer.classList.toggle("is-open");
};

const newGameButton = () =>
  $("button.header-button.new-game-button", {
    text: "New game",
    events: { click: onClickNewGameButton },
  });

const closeModalButton = () => $("button.close-modal-button", "Close");

/**
 * Функция для обработки или отображения таблицы лидеров.
 * @param {Game[]} liders - Массив объектов класса Game.
 * @returns {HTMLElement[]} Новый массив, полученный в результате маппинга.
 */
const lidersTable = (liders) =>
  liders.length === 0
    ? $(".placeholder", "Not Winers")
    : $("table.liders-table", [
        $("thead.liders-table-head", [
          $("td.gamer-position", "N"),
          $("td.gamer-points", "Points"),
          $("td.gamer-win-date", "Date"),
        ]),
        $("tbody", liderTableRows(liders)),
      ]);

/**
 * Функция для обработки или отображения таблицы лидеров.
 * @param {Game[]} liders - Массив объектов класса Game.
 * @returns {HTMLElement[]} Новый массив, полученный в результате маппинга.
 */
const liderTableRows = (liders) =>
  liders.map((game, i) =>
    $("tr.gamer-table-row", [
      $("td.gamer-position", i + 1),
      $("td.gamer-points", game.points),
      $("td.gamer-win-date", game.fwinDate),
    ]),
  );

function onClickLidersButton(model, event) {
  model.getLiders();
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
  root.querySelectorAll(".cart-container").forEach((cart) => {
    cart.classList.remove("is-open");
  });
  await (0,_utils__WEBPACK_IMPORTED_MODULE_4__.delay)(250);
  render();
}

const lidersModal = (liders) =>
  $("dialog.liders-modal", { events: dialogEvents }, [
    $(".modal-container", [
      $("h2.liders-table-title", "Liders"),
      lidersTable(liders),
      closeModalButton(),
    ]),
  ]);

const winModal = (score) =>
  $("dialog.win-modal", { events: dialogEvents }, [
    $(".modal-conainer", { events: dialogEvents }, [
      $("h2.win-title", "Congradulations!"),
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
    case "lockcarts":
      root.querySelectorAll(".cart-container").forEach((cart) => {
        if (payload.includes(Number(cart.id.replace(/[^\d]/g, "")))) {
          cart.classList.add("lock-click");
        } else {
          cart.classList.remove("lock-click");
        }
      });
      break;
    case "winhit":
      root.querySelector(".wins-count").textContent = `${payload} from 8 pair`;
      break;
    case "closecart":
      root.querySelectorAll(".cart-container").forEach((cart) => {
        if (payload.includes(Number(cart.id.replace(/[^\d]/g, "")))) {
          cart.classList.toggle("is-open");
        }
      });
      break;
    case "hitcount":
      root.querySelector(".hits-count").textContent = payload;
      break;
    case "addimg":
      const cont = root.querySelector(`.cart-container#cart-${payload.key}`);
      const img = cont.querySelector(".figure-img");
      img.setAttribute("src", `images/origami_shape_${payload.value}.svg`);
    default:
      break;
  }
}

function lidersReduser(actionType, payload) {
  switch (actionType) {
    case "openmodal":
      const modal = lidersModal(payload.data).uiElement;
      if (modal instanceof HTMLDialogElement) {
        root.appendChild(modal);
        modal.showModal();
      }
      break;
    //    case "openTwoGarts":
    //      break;
    //    case "hitwin":
    //      break;
    default:
      break;
  }
}

async function render() {
  const gameModel = new _GameModel__WEBPACK_IMPORTED_MODULE_0__["default"]();
  const lidersModel = new _LidersModel__WEBPACK_IMPORTED_MODULE_3__["default"]();
  gameModel.subscribe(gameReduser);
  lidersModel.subscribe(lidersReduser);

  const header = (model) =>
    $("header.header", [
      $(".container.header-container", [
        $("button.header-button.liders-modal-button", {
          text: "Liders",
          events: { click: onClickLidersButton.bind(null, model) },
        }),
        newGameButton(),
      ]),
    ]);

  const main = $("main", [
    $(".container", [
      $("h1.game-title", "Memory game"),
      $(".cart-grid", createCloseCarts(gameModel)),
    ]),
  ]);

  const footer = $("footer.footer", [
    $(".container", [
      $("h3.current-rezult-title", "Point ruzalt:"),
      $(".scors", [
        $(".hits", [$("span.hits-title", "Hits:"), $("span.hits-count", "0")]),
        $(".wins", [
          $("span.wins-title", "Wins:"),
          $("span.wins-count", "0 from 8 pair"),
        ]),
      ]),
    ]),
  ]);

  const bodyList = [header(lidersModel), main, footer].map(
    (tag) => tag.uiElement,
  );
  root.replaceChildren(...bodyList);
}

render();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx3QkFBd0Isa0RBQVM7QUFDakMsMEJBQTBCLG9EQUFXO0FBQ3JDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQiw4Q0FBOEM7QUFDbEUsU0FBUztBQUNUO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9EYXRhQ2xpZW50LmpzIiwid2VicGFjazovLy8uL0dhbWUuanMiLCJ3ZWJwYWNrOi8vLy4vR2FtZU1vZGVsLmpzIiwid2VicGFjazovLy8uL0l0ZW1VSS5qcyIsIndlYnBhY2s6Ly8vLi9MaWRlcnNNb2RlbC5qcyIsIndlYnBhY2s6Ly8vLi91dGlscy5qcyIsIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly8vLi9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBEYXRhQ2xpZW50IHtcbiAgY29uc3RydWN0b3IobmFtZXNwYWNlID0gXCJtZW1vcnktZ2FtZVwiLCB1cmwgPSBcIlwiKSB7XG4gICAgdGhpcy5uYW1lc3BhY2UgPSBuYW1lc3BhY2U7XG4gICAgdGhpcy51cmwgPSB1cmw7XG4gIH1cblxuICBhc3luYyBnZXRJdGVtKGtleSA9IFwiXCIpIHtcbiAgICBjb25zdCB2YWx1ZSA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKGAke3RoaXMubmFtZXNwYWNlfToke2tleX1gKTtcbiAgICByZXR1cm4gdmFsdWUgPyBKU09OLnBhcnNlKHZhbHVlKSA6IG51bGw7XG4gIH1cblxuICBzZXRJdGVtKGtleSA9IFwiXCIsIHZhbHVlID0gdW5kZWZpbmVkKSB7XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oYCR7dGhpcy5uYW1lc3BhY2V9OiR7a2V5fWAsIEpTT04uc3RyaW5naWZ5KHZhbHVlKSk7XG4gIH1cblxuICByZW1vdmVJdGVtKGtleSA9IFwiXCIpIHtcbiAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShgJHt0aGlzLm5hbWVzcGFjZX06JHtrZXl9YCk7XG4gIH1cblxuICBhc3luYyBwb3N0RGF0YSh1cmwgPSBcIlwiLCBkYXRhID0ge30pIHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge1xuICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgIG1vZGU6IFwiY29yc1wiLFxuICAgICAgY2FjaGU6IFwibm8tY2FjaGVcIixcbiAgICAgIGNyZWRlbnRpYWxzOiBcInNhbWUtb3JpZ2luXCIsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgfSxcbiAgICAgIHJlZGlyZWN0OiBcImZvbGxvd1wiLFxuICAgICAgcmVmZXJyZXJQb2xpY3k6IFwibm8tcmVmZXJyZXJcIixcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGRhdGEpLFxuICAgIH0pO1xuICAgIHJldHVybiBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRGF0YUNsaWVudDtcbiIsImNsYXNzIEdhbWUge1xuICBzdGF0aWMgZm9ybWF0dGVyID0gbmV3IEludGwuRGF0ZVRpbWVGb3JtYXQoXCJydS1SVVwiLCB7XG4gICAgZGF5OiBcIjItZGlnaXRcIixcbiAgICBtb250aDogXCIyLWRpZ2l0XCIsXG4gICAgeWVhcjogXCJudW1lcmljXCIsXG4gIH0pO1xuICAvKipcbiAgICogQHBhcmFtIHtPYmplY3R9IHByb2ZpbGUgLSDQlNCw0L3QvdGL0LUg0L/RgNC+0YTQuNC70Y8g0LjQs9GA0L7QutCwLlxuICAgKiBAcGFyYW0ge0RhdGV9IHByb2ZpbGUud2luRGF0ZSAtINCU0LDRgtCwINC/0L7QsdC10LTRiy5cbiAgICogQHBhcmFtIHtudW1iZXJ9IHByb2ZpbGUucG9pbnRzIC0g0J3QsNCx0YDQsNC90L3Ri9C1INC+0YfQutC4LlxuICAgKi9cbiAgY29uc3RydWN0b3IoeyB3aW5EYXRlLCBwb2ludHMgfSkge1xuICAgIHRoaXMud2luRGF0ZSA9IHdpbkRhdGU7XG4gICAgdGhpcy5wb2ludHMgPSBwb2ludHM7XG4gIH1cblxuICBnZXQgZndpbkRhdGUoKSB7XG4gICAgcmV0dXJuIEdhbWUuZm9ybWF0dGVyLmZvcm1hdCh0aGlzLndpbkRhdGUpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWU7XG4iLCJpbXBvcnQgRGF0YUNsaWVudCBmcm9tIFwiLi9EYXRhQ2xpZW50XCI7XG5pbXBvcnQgR2FtZSBmcm9tIFwiLi9HYW1lXCI7XG5pbXBvcnQgeyBkZWxheSB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbmNsYXNzIEdhbWVNb2RlbCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZGF0YUNsaWVudCA9IG5ldyBEYXRhQ2xpZW50KCk7XG4gICAgdGhpcy5zaHVmZmxlZENhcnRzID0gW107XG4gICAgdGhpcy5fb3BlbkNhcnQgPSBbXTtcbiAgICB0aGlzLmxvY2tlZENhcnRzID0gW107XG4gICAgdGhpcy5oaXRDb3VudCA9IDA7XG4gICAgdGhpcy53aW5IaXQgPSAwO1xuICAgIHRoaXMuaW5pdCgpO1xuICAgIGNvbnN0IGRlZmF1bHRTdGF0ZSA9IHtcbiAgICAgIHdpbjogdW5kZWZpbmVkLFxuICAgICAgbG9ja2NhcnRzOiBbXSxcbiAgICAgIGNsb3NlY2FydDogW10sXG4gICAgICBoaXRjb3VudDogMCxcbiAgICAgIHdpbmhpdDogMCxcbiAgICAgIGFkZGltZzogdW5kZWZpbmVkLFxuICAgIH07XG5cbiAgICB0aGlzLnN0YXRlID0gbmV3IFByb3h5KGRlZmF1bHRTdGF0ZSwge1xuICAgICAgc2V0OiAodGFyZ2V0LCBwcm9wZXJ0eSwgdmFsdWUpID0+IHtcbiAgICAgICAgaWYgKHRhcmdldFtwcm9wZXJ0eV0gPT09IHZhbHVlKSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgdGFyZ2V0W3Byb3BlcnR5XSA9IHZhbHVlO1xuXG4gICAgICAgIGlmICh0aGlzLm9ic2VydmVyKSB7XG4gICAgICAgICAgdGhpcy5vYnNlcnZlcihwcm9wZXJ0eSwgdmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgaW5pdCgpIHtcbiAgICB0aGlzLnNodWZmbGVDYXJ0cygpO1xuICB9XG5cbiAgc2h1ZmZsZUNhcnRzKCkge1xuICAgIHRoaXMuc2h1ZmZsZWRDYXJ0cyA9IFtdO1xuICAgIGxldCBzdGFydEFycmF5ID0gQXJyYXkuZnJvbSh7IGxlbmd0aDogMTYgfSwgKF8sIGkpID0+IChpICUgOCkgKyAxKTtcbiAgICBsZXQgbSA9IHN0YXJ0QXJyYXkubGVuZ3RoLFxuICAgICAgdCxcbiAgICAgIGk7XG4gICAgd2hpbGUgKG0pIHtcbiAgICAgIGkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBtLS0pO1xuICAgICAgdCA9IHN0YXJ0QXJyYXlbbV07XG4gICAgICBzdGFydEFycmF5W21dID0gc3RhcnRBcnJheVtpXTtcbiAgICAgIHN0YXJ0QXJyYXlbaV0gPSB0O1xuICAgIH1cblxuICAgIHRoaXMuc2h1ZmZsZWRDYXJ0cyA9IHN0YXJ0QXJyYXk7XG4gICAgY29uc29sZS5sb2codGhpcy5zaHVmZmxlZENhcnRzKTtcbiAgfVxuXG4gIHNldCBvcGVuQ2FydChpZENhcnQpIHtcbiAgICBpZiAodHlwZW9mIGlkQ2FydCAhPT0gXCJzdHJpbmdcIikgcmV0dXJuO1xuICAgIGNvbnN0IGluZGV4Q2FydCA9IE51bWJlcihpZENhcnQucmVwbGFjZSgvW15cXGRdL2csIFwiXCIpKTtcbiAgICB0aGlzLl9vcGVuQ2FydC5wdXNoKGluZGV4Q2FydCk7XG4gICAgdGhpcy5zdGF0ZS5hZGRpbWcgPSB7XG4gICAgICBrZXk6IGluZGV4Q2FydCxcbiAgICAgIHZhbHVlOiB0aGlzLnNodWZmbGVkQ2FydHNbaW5kZXhDYXJ0IC0gMV0sXG4gICAgfTtcbiAgICB0aGlzLmxvY2tDYXJ0cygpO1xuICAgIC8vIHRoaXMuc3RhdGUuYWRkaW1nID0geyBpZENhcnQ6IHRoaXMuc2h1ZmZsZWRDYXJ0c1tpbmRleENhcnQgLSAxXSB9O1xuICAgIGlmICh0aGlzLl9vcGVuQ2FydC5sZW5ndGggPT09IDIpIHtcbiAgICAgIHRoaXMuY2hlY2tXaW5IaXQoKTtcbiAgICB9XG4gIH1cblxuICBsb2NrQ2FydHMoKSB7XG4gICAgdGhpcy5zdGF0ZS5sb2NrY2FydHMgPSAoKCkgPT4ge1xuICAgICAgc3dpdGNoICh0aGlzLl9vcGVuQ2FydC5sZW5ndGgpIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIHJldHVybiB0aGlzLmxvY2tlZENhcnRzLmNvbmNhdCh0aGlzLl9vcGVuQ2FydCk7XG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICByZXR1cm4gQXJyYXkuZnJvbSh7IGxlbmd0aDogMTYgfSwgKF8sIGkpID0+IGkgKyAxKTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICByZXR1cm4gdGhpcy5sb2NrZWRDYXJ0cztcbiAgICAgIH1cbiAgICB9KSgpO1xuICB9XG5cbiAgYXN5bmMgc3RhcnRUaW1lcigpIHtcbiAgICBhd2FpdCBkZWxheSgxMjAwKTtcbiAgICB0aGlzLnN0YXRlLmNsb3NlY2FydCA9IHRoaXMuX29wZW5DYXJ0O1xuICAgIGF3YWl0IGRlbGF5KDMwKTtcbiAgICB0aGlzLl9vcGVuQ2FydCA9IFtdO1xuICAgIHRoaXMubG9ja0NhcnRzKCk7XG4gIH1cblxuICBhc3luYyBjaGVja1dpbkhpdCgpIHtcbiAgICBpZiAodGhpcy5fb3BlbkNhcnQubGVuZ3RoICE9PSAyKSByZXR1cm47XG4gICAgdGhpcy5oaXRDb3VudCArPSAxO1xuICAgIHRoaXMuc3RhdGUuaGl0Y291bnQgPSB0aGlzLmhpdENvdW50O1xuICAgIGNvbnN0IHdpbkhpdCA9XG4gICAgICB0aGlzLnNodWZmbGVkQ2FydHMuYXQodGhpcy5fb3BlbkNhcnRbMF0gLSAxKSA9PT1cbiAgICAgIHRoaXMuc2h1ZmZsZWRDYXJ0cy5hdCh0aGlzLl9vcGVuQ2FydFsxXSAtIDEpO1xuICAgIGlmICh3aW5IaXQpIHtcbiAgICAgIHRoaXMud2luSGl0ICs9IDE7XG4gICAgICB0aGlzLnN0YXRlLndpbmhpdCA9IHRoaXMud2luSGl0O1xuICAgICAgdGhpcy5sb2NrZWRDYXJ0cyA9IHRoaXMubG9ja2VkQ2FydHMuY29uY2F0KHRoaXMuX29wZW5DYXJ0KTtcbiAgICAgIHRoaXMuX29wZW5DYXJ0ID0gW107XG4gICAgICB0aGlzLmxvY2tDYXJ0cygpO1xuICAgICAgaWYgKHRoaXMud2luSGl0ID09PSA4KSB7XG4gICAgICAgIGF3YWl0IHRoaXMuc2F2ZVJlenVsdCgpO1xuICAgICAgICB0aGlzLnN0YXRlLndpbiA9IHsgZGF0YTogdGhpcy5oaXRDb3VudCB9O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnN0YXJ0VGltZXIoKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBzYXZlUmV6dWx0KCkge1xuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmRhdGFDbGllbnQuZ2V0SXRlbShcImxpZGVyc1wiKTtcbiAgICAvKiogQHR5cGUgeyBHYW1lW119ICovXG4gICAgY29uc3QgbGlkZXJzID0gZGF0YSA9PT0gbnVsbCA/IFtdIDogZGF0YS5tYXAoKGl0ZW0pID0+IG5ldyBHYW1lKGl0ZW0pKTtcbiAgICBsaWRlcnMucHVzaChuZXcgR2FtZSh7IHBvaW50czogdGhpcy5oaXRDb3VudCwgd2luRGF0ZTogRGF0ZS5ub3coKSB9KSk7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuZGF0YUNsaWVudC5zZXRJdGVtKFwibGlkZXJzXCIsIGxpZGVycyk7XG4gICAgfSBjYXRjaCB7XG4gICAgICBjb25zb2xlLmxvZyhcIm5vIHdyaXRlXCIpO1xuICAgIH1cbiAgfVxuXG4gIHN1YnNjcmliZShyZWR1Y2VyRnVuY3Rpb24pIHtcbiAgICB0aGlzLm9ic2VydmVyID0gcmVkdWNlckZ1bmN0aW9uO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdhbWVNb2RlbDtcbiIsImNsYXNzIEl0ZW1VSSB7XG4gIGNvbnN0cnVjdG9yKHtcbiAgICB0YWcgPSBcImRpdlwiLFxuICAgIGNsYXNzTmFtZXMgPSBbXSxcbiAgICBpbm5lcnMgPSBbXSxcbiAgICB0ZXh0ID0gdW5kZWZpbmVkLFxuICAgIHZhbHVlID0gdW5kZWZpbmVkLFxuICAgIGF0dHJzID0ge30sXG4gICAgZXZlbnRzID0ge30sXG4gIH0gPSB7fSkge1xuICAgIHRoaXMudGFnID0gdGFnO1xuICAgIHRoaXMuY2xhc3NOYW1lcyA9IGNsYXNzTmFtZXM7XG4gICAgdGhpcy5pbm5lcnMgPSBpbm5lcnM7XG4gICAgdGhpcy50ZXh0ID0gdGV4dDtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5hdHRycyA9IGF0dHJzO1xuICAgIHRoaXMuZXZlbnRzID0gZXZlbnRzO1xuICAgIHRoaXMudWlFbGVtZW50ID0gdGhpcy5jcmVhdGVOZXdFbGVtZW50KCk7XG4gIH1cblxuICBjcmVhdGVOZXdFbGVtZW50KCkge1xuICAgIGxldCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0aGlzLnRhZyk7XG5cbiAgICB0aGlzLmNsYXNzTmFtZXMuZm9yRWFjaCgoY2xhc3NOYW1lKSA9PiB7XG4gICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoY2xhc3NOYW1lKTtcbiAgICB9KTtcblxuICAgIGlmICh0aGlzLnRleHQpIHtcbiAgICAgIGVsZW1lbnQuaW5uZXJUZXh0ID0gdGhpcy50ZXh0O1xuICAgIH1cblxuICAgIE9iamVjdC5lbnRyaWVzKHRoaXMuYXR0cnMpLmZvckVhY2goKFtrLCB2XSkgPT4gZWxlbWVudC5zZXRBdHRyaWJ1dGUoaywgdikpO1xuXG4gICAgaWYgKHRoaXMudmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgZWxlbWVudC52YWx1ZSA9IHRoaXMudmFsdWU7XG4gICAgfVxuXG4gICAgT2JqZWN0LmVudHJpZXModGhpcy5ldmVudHMpLmZvckVhY2goKFtldmVudE5hbWUsIGhhbmRsZXJdKSA9PiB7XG4gICAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICBjb25zdCBib3VuZEhhbmRsZXIgPSBoYW5kbGVyLmJpbmQodGhpcyk7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGJvdW5kSGFuZGxlcik7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmlubmVycy5mb3JFYWNoKChpbm5lckVsZW1lbnQpID0+IHtcbiAgICAgIGlmIChpbm5lckVsZW1lbnQgaW5zdGFuY2VvZiBJdGVtVUkpIHtcbiAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChpbm5lckVsZW1lbnQudWlFbGVtZW50KTtcbiAgICAgIH0gZWxzZSBpZiAoaW5uZXJFbGVtZW50IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpIHtcbiAgICAgICAgZWxlbWVudC5hcHBlbmRDaGlsZChpbm5lckVsZW1lbnQpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGVsZW1lbnQ7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuaW5uZXJzLmZvckVhY2goKGlubmVyKSA9PiB7XG4gICAgICBpZiAoaW5uZXIgaW5zdGFuY2VvZiBJdGVtVUkpIHtcbiAgICAgICAgaW5uZXIuZGVzdHJveSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMudWlFbGVtZW50ICYmIHRoaXMudWlFbGVtZW50LnBhcmVudE5vZGUpIHtcbiAgICAgIHRoaXMudWlFbGVtZW50LnJlbW92ZSgpO1xuICAgIH1cblxuICAgIHRoaXMudWlFbGVtZW50ID0gbnVsbDtcbiAgICB0aGlzLmlubmVycyA9IFtdO1xuICAgIHRoaXMuZXZlbnRzID0ge307XG4gIH1cblxuICBzdGF0aWMgY3JlYXRlKHRhZ0FuZENsYXNzZXMsIGNvbmZpZ09ySW5uZXJzID0ge30sIHBvc3NpYmxlSW5uZXJzID0gW10pIHtcbiAgICBsZXQgdGFyZ2V0U3RyaW5nID0gdGFnQW5kQ2xhc3Nlcy50cmltKCk7XG4gICAgaWYgKHRhcmdldFN0cmluZy5zdGFydHNXaXRoKFwiLlwiKSkge1xuICAgICAgdGFyZ2V0U3RyaW5nID0gXCJkaXZcIiArIHRhcmdldFN0cmluZztcbiAgICB9XG5cbiAgICBjb25zdCBwYXJ0cyA9IHRhcmdldFN0cmluZy5zcGxpdChcIi5cIik7XG4gICAgY29uc3QgdGFnID0gcGFydHNbMF0gfHwgXCJkaXZcIjtcbiAgICBjb25zdCBjbGFzc05hbWVzID0gcGFydHMuc2xpY2UoMSk7XG5cbiAgICBsZXQgY29uZmlnID0ge307XG4gICAgbGV0IGlubmVycyA9IHBvc3NpYmxlSW5uZXJzO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoY29uZmlnT3JJbm5lcnMpKSB7XG4gICAgICBpbm5lcnMgPSBjb25maWdPcklubmVycztcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgdHlwZW9mIGNvbmZpZ09ySW5uZXJzID09PSBcInN0cmluZ1wiIHx8XG4gICAgICB0eXBlb2YgY29uZmlnT3JJbm5lcnMgPT09IFwibnVtYmVyXCJcbiAgICApIHtcbiAgICAgIGNvbmZpZy50ZXh0ID0gY29uZmlnT3JJbm5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbmZpZyA9IHsgLi4uY29uZmlnT3JJbm5lcnMgfTtcbiAgICB9XG5cbiAgICBpZiAoaW5uZXJzLmxlbmd0aCA+IDApIGNvbmZpZy5pbm5lcnMgPSBpbm5lcnM7XG4gICAgY29uZmlnLnRhZyA9IHRhZztcbiAgICBjb25maWcuY2xhc3NOYW1lcyA9IFsuLi5jbGFzc05hbWVzLCAuLi4oY29uZmlnLmNsYXNzTmFtZXMgfHwgW10pXTtcblxuICAgIHJldHVybiBuZXcgSXRlbVVJKGNvbmZpZyk7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSXRlbVVJO1xuIiwiaW1wb3J0IERhdGFDbGllbnQgZnJvbSBcIi4vRGF0YUNsaWVudFwiO1xuaW1wb3J0IEdhbWUgZnJvbSBcIi4vR2FtZVwiO1xuXG5jbGFzcyBMaWRlcnNNb2RlbCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuZGF0YUNsaWVudCA9IG5ldyBEYXRhQ2xpZW50KCk7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgY29uc3QgZGVmYXVsdFN0YXRlID0ge1xuICAgICAgb3Blbm1vZGFsOiBbXSxcbiAgICB9O1xuICAgIHRoaXMuc3RhdGUgPSBuZXcgUHJveHkoZGVmYXVsdFN0YXRlLCB7XG4gICAgICBzZXQ6ICh0YXJnZXQsIHByb3BlcnR5LCB2YWx1ZSkgPT4ge1xuICAgICAgICBpZiAodGFyZ2V0W3Byb3BlcnR5XSA9PT0gdmFsdWUpIHJldHVybiB0cnVlO1xuICAgICAgICB0YXJnZXRbcHJvcGVydHldID0gdmFsdWU7XG5cbiAgICAgICAgaWYgKHRoaXMub2JzZXJ2ZXIpIHtcbiAgICAgICAgICB0aGlzLm9ic2VydmVyKHByb3BlcnR5LCB2YWx1ZSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICBpbml0KCkge31cblxuICBhc3luYyBnZXRMaWRlcnMoKSB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuZGF0YUNsaWVudC5nZXRJdGVtKFwibGlkZXJzXCIpO1xuICAgIC8qKiBAdHlwZSB7IEdhbWVbXX0gKi9cbiAgICBjb25zdCBsaWRlcnMgPSBkYXRhID09PSBudWxsID8gW10gOiBkYXRhLm1hcCgoaXRlbSkgPT4gbmV3IEdhbWUoaXRlbSkpO1xuICAgIGNvbnN0IHNvcnRlZExpZGVycyA9IGxpZGVycy5zb3J0KFxuICAgICAgKGEsIGIpID0+IGEucG9pbnRzIC0gYi5wb2ludHMgfHwgYi53aW5EYXRlIC0gYS53aW5EYXRlLFxuICAgICk7XG4gICAgdGhpcy5zdGF0ZS5vcGVubW9kYWwgPSB7XG4gICAgICBkYXRhOiBzb3J0ZWRMaWRlcnMuc2xpY2UoMCwgTWF0aC5taW4oMTAsIHNvcnRlZExpZGVycy5sZW5ndGgpKSxcbiAgICB9O1xuICB9XG5cbiAgc3Vic2NyaWJlKHJlZHVjZXJGdW5jdGlvbikge1xuICAgIHRoaXMub2JzZXJ2ZXIgPSByZWR1Y2VyRnVuY3Rpb247XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgTGlkZXJzTW9kZWw7XG4iLCJleHBvcnQgY29uc3QgZGVsYXkgPSAobXMpID0+IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiBzZXRUaW1lb3V0KHJlc29sdmUsIG1zKSk7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG5jb25zdCBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdGNvbnN0IGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHRjb25zdCBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdGlmICghKG1vZHVsZUlkIGluIF9fd2VicGFja19tb2R1bGVzX18pKSB7XG5cdFx0ZGVsZXRlIF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdFx0Y29uc3QgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyBtb2R1bGVJZCArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fVxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIvdmFsdWUgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSk7IiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCBHYW1lTW9kZWwgZnJvbSBcIi4vR2FtZU1vZGVsXCI7XG5pbXBvcnQgR2FtZSBmcm9tIFwiLi9HYW1lXCI7XG5pbXBvcnQgSXRlbVVJIGZyb20gXCIuL0l0ZW1VSVwiO1xuaW1wb3J0IExpZGVyc01vZGVsIGZyb20gXCIuL0xpZGVyc01vZGVsXCI7XG5pbXBvcnQgeyBkZWxheSB9IGZyb20gXCIuL3V0aWxzXCI7XG5cbmNvbnN0IHJvb3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYm9keVwiKTtcblxuY29uc3QgQ09VTlRfR0FNRV9DQVJUUyA9IDE2O1xuXG5jb25zdCAkID0gSXRlbVVJLmNyZWF0ZTtcblxuY29uc3QgY3JlYXRlQ2xvc2VDYXJ0cyA9IChtb2RlbCkgPT5cbiAgQXJyYXkuZnJvbSh7IGxlbmd0aDogQ09VTlRfR0FNRV9DQVJUUyB9LCAoXywgaSkgPT4gaSArIDEpLm1hcCgoaW5kKSA9PlxuICAgICQoXG4gICAgICBcIi5jYXJ0LWNvbnRhaW5lclwiLFxuICAgICAge1xuICAgICAgICBhdHRyczogeyBpZDogYGNhcnQtJHtpbmR9YCB9LFxuICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICBjbGljazogKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICByZXZlcnRDYXJ0KG1vZGVsLCBldmVudCk7XG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBbXG4gICAgICAgICQoXCIuaW1nLXdyYXBwZXJcIiwgW1xuICAgICAgICAgICQoXCJpbWcuZmlndXJlLWltZ1wiLCB7XG4gICAgICAgICAgICBhdHRyczogeyBzcmM6IFwiaW1hZ2VzL29yaWdhbWlfc2hhcGVfMS5zdmdcIiwgYWx0OiBcIlwiIH0sXG4gICAgICAgICAgfSksXG4gICAgICAgIF0pLFxuICAgICAgXSxcbiAgICApLFxuICApO1xuXG5jb25zdCByZXZlcnRDYXJ0ID0gKG1vZGVsLCBldmVudCkgPT4ge1xuICBjb25zdCBjYXJkQ29udGFpbmVyID0gZXZlbnQuY3VycmVudFRhcmdldDtcbiAgbW9kZWwub3BlbkNhcnQgPSBjYXJkQ29udGFpbmVyLmlkO1xuICBjYXJkQ29udGFpbmVyLmNsYXNzTGlzdC50b2dnbGUoXCJpcy1vcGVuXCIpO1xufTtcblxuY29uc3QgbmV3R2FtZUJ1dHRvbiA9ICgpID0+XG4gICQoXCJidXR0b24uaGVhZGVyLWJ1dHRvbi5uZXctZ2FtZS1idXR0b25cIiwge1xuICAgIHRleHQ6IFwiTmV3IGdhbWVcIixcbiAgICBldmVudHM6IHsgY2xpY2s6IG9uQ2xpY2tOZXdHYW1lQnV0dG9uIH0sXG4gIH0pO1xuXG5jb25zdCBjbG9zZU1vZGFsQnV0dG9uID0gKCkgPT4gJChcImJ1dHRvbi5jbG9zZS1tb2RhbC1idXR0b25cIiwgXCJDbG9zZVwiKTtcblxuLyoqXG4gKiDQpNGD0L3QutGG0LjRjyDQtNC70Y8g0L7QsdGA0LDQsdC+0YLQutC4INC40LvQuCDQvtGC0L7QsdGA0LDQttC10L3QuNGPINGC0LDQsdC70LjRhtGLINC70LjQtNC10YDQvtCyLlxuICogQHBhcmFtIHtHYW1lW119IGxpZGVycyAtINCc0LDRgdGB0LjQsiDQvtCx0YrQtdC60YLQvtCyINC60LvQsNGB0YHQsCBHYW1lLlxuICogQHJldHVybnMge0hUTUxFbGVtZW50W119INCd0L7QstGL0Lkg0LzQsNGB0YHQuNCyLCDQv9C+0LvRg9GH0LXQvdC90YvQuSDQsiDRgNC10LfRg9C70YzRgtCw0YLQtSDQvNCw0L/Qv9C40L3Qs9CwLlxuICovXG5jb25zdCBsaWRlcnNUYWJsZSA9IChsaWRlcnMpID0+XG4gIGxpZGVycy5sZW5ndGggPT09IDBcbiAgICA/ICQoXCIucGxhY2Vob2xkZXJcIiwgXCJOb3QgV2luZXJzXCIpXG4gICAgOiAkKFwidGFibGUubGlkZXJzLXRhYmxlXCIsIFtcbiAgICAgICAgJChcInRoZWFkLmxpZGVycy10YWJsZS1oZWFkXCIsIFtcbiAgICAgICAgICAkKFwidGQuZ2FtZXItcG9zaXRpb25cIiwgXCJOXCIpLFxuICAgICAgICAgICQoXCJ0ZC5nYW1lci1wb2ludHNcIiwgXCJQb2ludHNcIiksXG4gICAgICAgICAgJChcInRkLmdhbWVyLXdpbi1kYXRlXCIsIFwiRGF0ZVwiKSxcbiAgICAgICAgXSksXG4gICAgICAgICQoXCJ0Ym9keVwiLCBsaWRlclRhYmxlUm93cyhsaWRlcnMpKSxcbiAgICAgIF0pO1xuXG4vKipcbiAqINCk0YPQvdC60YbQuNGPINC00LvRjyDQvtCx0YDQsNCx0L7RgtC60Lgg0LjQu9C4INC+0YLQvtCx0YDQsNC20LXQvdC40Y8g0YLQsNCx0LvQuNGG0Ysg0LvQuNC00LXRgNC+0LIuXG4gKiBAcGFyYW0ge0dhbWVbXX0gbGlkZXJzIC0g0JzQsNGB0YHQuNCyINC+0LHRitC10LrRgtC+0LIg0LrQu9Cw0YHRgdCwIEdhbWUuXG4gKiBAcmV0dXJucyB7SFRNTEVsZW1lbnRbXX0g0J3QvtCy0YvQuSDQvNCw0YHRgdC40LIsINC/0L7Qu9GD0YfQtdC90L3Ri9C5INCyINGA0LXQt9GD0LvRjNGC0LDRgtC1INC80LDQv9C/0LjQvdCz0LAuXG4gKi9cbmNvbnN0IGxpZGVyVGFibGVSb3dzID0gKGxpZGVycykgPT5cbiAgbGlkZXJzLm1hcCgoZ2FtZSwgaSkgPT5cbiAgICAkKFwidHIuZ2FtZXItdGFibGUtcm93XCIsIFtcbiAgICAgICQoXCJ0ZC5nYW1lci1wb3NpdGlvblwiLCBpICsgMSksXG4gICAgICAkKFwidGQuZ2FtZXItcG9pbnRzXCIsIGdhbWUucG9pbnRzKSxcbiAgICAgICQoXCJ0ZC5nYW1lci13aW4tZGF0ZVwiLCBnYW1lLmZ3aW5EYXRlKSxcbiAgICBdKSxcbiAgKTtcblxuZnVuY3Rpb24gb25DbGlja0xpZGVyc0J1dHRvbihtb2RlbCwgZXZlbnQpIHtcbiAgbW9kZWwuZ2V0TGlkZXJzKCk7XG59XG5cbmNvbnN0IGRpYWxvZ0V2ZW50cyA9IHtcbiAgY2xpY2soZXZlbnQpIHtcbiAgICBjb25zdCBpc092ZXJsYXkgPSBldmVudC50YXJnZXQgPT09IGV2ZW50LmN1cnJlbnRUYXJnZXQ7XG4gICAgY29uc3QgaXNDbG9zZUJ0biA9IGV2ZW50LnRhcmdldC5jbG9zZXN0KFwiLmNsb3NlLW1vZGFsLWJ1dHRvblwiKTtcbiAgICBpZiAoaXNPdmVybGF5IHx8IGlzQ2xvc2VCdG4pIHtcbiAgICAgIHRoaXMuZGVzdHJveSgpO1xuICAgIH1cbiAgfSxcbiAgY2FuY2VsKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB0aGlzLmRlc3Ryb3koKTtcbiAgfSxcbn07XG5cbmFzeW5jIGZ1bmN0aW9uIG9uQ2xpY2tOZXdHYW1lQnV0dG9uKCkge1xuICByb290LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY2FydC1jb250YWluZXJcIikuZm9yRWFjaCgoY2FydCkgPT4ge1xuICAgIGNhcnQuY2xhc3NMaXN0LnJlbW92ZShcImlzLW9wZW5cIik7XG4gIH0pO1xuICBhd2FpdCBkZWxheSgyNTApO1xuICByZW5kZXIoKTtcbn1cblxuY29uc3QgbGlkZXJzTW9kYWwgPSAobGlkZXJzKSA9PlxuICAkKFwiZGlhbG9nLmxpZGVycy1tb2RhbFwiLCB7IGV2ZW50czogZGlhbG9nRXZlbnRzIH0sIFtcbiAgICAkKFwiLm1vZGFsLWNvbnRhaW5lclwiLCBbXG4gICAgICAkKFwiaDIubGlkZXJzLXRhYmxlLXRpdGxlXCIsIFwiTGlkZXJzXCIpLFxuICAgICAgbGlkZXJzVGFibGUobGlkZXJzKSxcbiAgICAgIGNsb3NlTW9kYWxCdXR0b24oKSxcbiAgICBdKSxcbiAgXSk7XG5cbmNvbnN0IHdpbk1vZGFsID0gKHNjb3JlKSA9PlxuICAkKFwiZGlhbG9nLndpbi1tb2RhbFwiLCB7IGV2ZW50czogZGlhbG9nRXZlbnRzIH0sIFtcbiAgICAkKFwiLm1vZGFsLWNvbmFpbmVyXCIsIHsgZXZlbnRzOiBkaWFsb2dFdmVudHMgfSwgW1xuICAgICAgJChcImgyLndpbi10aXRsZVwiLCBcIkNvbmdyYWR1bGF0aW9ucyFcIiksXG4gICAgICAkKFwiLndpbi1zY29yZVwiLCBgWW91ciBzY29yZSAke3Njb3JlfSBwb2ludHNgKSxcbiAgICAgICQoXCIuYnV0dG9ucy1ibG9ja1wiLCBbbmV3R2FtZUJ1dHRvbigpLCBjbG9zZU1vZGFsQnV0dG9uKCldKSxcbiAgICBdKSxcbiAgXSk7XG5cbmNvbnN0IG9wZW5XaW5Nb2RhbCA9IChzY29yZSkgPT4ge1xuICBjb25zdCBtb2RhbCA9IHdpbk1vZGFsKHNjb3JlKS51aUVsZW1lbnQ7XG4gIGlmIChtb2RhbCBpbnN0YW5jZW9mIEhUTUxEaWFsb2dFbGVtZW50KSB7XG4gICAgcm9vdC5hcHBlbmRDaGlsZChtb2RhbCk7XG4gICAgbW9kYWwuc2hvd01vZGFsKCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGdhbWVSZWR1c2VyKGFjdGlvblR5cGUsIHBheWxvYWQpIHtcbiAgc3dpdGNoIChhY3Rpb25UeXBlKSB7XG4gICAgY2FzZSBcIndpblwiOlxuICAgICAgaWYgKHBheWxvYWQpIHtcbiAgICAgICAgb3Blbldpbk1vZGFsKHBheWxvYWQuZGF0YSk7XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwibG9ja2NhcnRzXCI6XG4gICAgICByb290LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY2FydC1jb250YWluZXJcIikuZm9yRWFjaCgoY2FydCkgPT4ge1xuICAgICAgICBpZiAocGF5bG9hZC5pbmNsdWRlcyhOdW1iZXIoY2FydC5pZC5yZXBsYWNlKC9bXlxcZF0vZywgXCJcIikpKSkge1xuICAgICAgICAgIGNhcnQuY2xhc3NMaXN0LmFkZChcImxvY2stY2xpY2tcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FydC5jbGFzc0xpc3QucmVtb3ZlKFwibG9jay1jbGlja1wiKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwid2luaGl0XCI6XG4gICAgICByb290LnF1ZXJ5U2VsZWN0b3IoXCIud2lucy1jb3VudFwiKS50ZXh0Q29udGVudCA9IGAke3BheWxvYWR9IGZyb20gOCBwYWlyYDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJjbG9zZWNhcnRcIjpcbiAgICAgIHJvb3QucXVlcnlTZWxlY3RvckFsbChcIi5jYXJ0LWNvbnRhaW5lclwiKS5mb3JFYWNoKChjYXJ0KSA9PiB7XG4gICAgICAgIGlmIChwYXlsb2FkLmluY2x1ZGVzKE51bWJlcihjYXJ0LmlkLnJlcGxhY2UoL1teXFxkXS9nLCBcIlwiKSkpKSB7XG4gICAgICAgICAgY2FydC5jbGFzc0xpc3QudG9nZ2xlKFwiaXMtb3BlblwiKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiaGl0Y291bnRcIjpcbiAgICAgIHJvb3QucXVlcnlTZWxlY3RvcihcIi5oaXRzLWNvdW50XCIpLnRleHRDb250ZW50ID0gcGF5bG9hZDtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJhZGRpbWdcIjpcbiAgICAgIGNvbnN0IGNvbnQgPSByb290LnF1ZXJ5U2VsZWN0b3IoYC5jYXJ0LWNvbnRhaW5lciNjYXJ0LSR7cGF5bG9hZC5rZXl9YCk7XG4gICAgICBjb25zdCBpbWcgPSBjb250LnF1ZXJ5U2VsZWN0b3IoXCIuZmlndXJlLWltZ1wiKTtcbiAgICAgIGltZy5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgYGltYWdlcy9vcmlnYW1pX3NoYXBlXyR7cGF5bG9hZC52YWx1ZX0uc3ZnYCk7XG4gICAgZGVmYXVsdDpcbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbmZ1bmN0aW9uIGxpZGVyc1JlZHVzZXIoYWN0aW9uVHlwZSwgcGF5bG9hZCkge1xuICBzd2l0Y2ggKGFjdGlvblR5cGUpIHtcbiAgICBjYXNlIFwib3Blbm1vZGFsXCI6XG4gICAgICBjb25zdCBtb2RhbCA9IGxpZGVyc01vZGFsKHBheWxvYWQuZGF0YSkudWlFbGVtZW50O1xuICAgICAgaWYgKG1vZGFsIGluc3RhbmNlb2YgSFRNTERpYWxvZ0VsZW1lbnQpIHtcbiAgICAgICAgcm9vdC5hcHBlbmRDaGlsZChtb2RhbCk7XG4gICAgICAgIG1vZGFsLnNob3dNb2RhbCgpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgLy8gICAgY2FzZSBcIm9wZW5Ud29HYXJ0c1wiOlxuICAgIC8vICAgICAgYnJlYWs7XG4gICAgLy8gICAgY2FzZSBcImhpdHdpblwiOlxuICAgIC8vICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgY29uc3QgZ2FtZU1vZGVsID0gbmV3IEdhbWVNb2RlbCgpO1xuICBjb25zdCBsaWRlcnNNb2RlbCA9IG5ldyBMaWRlcnNNb2RlbCgpO1xuICBnYW1lTW9kZWwuc3Vic2NyaWJlKGdhbWVSZWR1c2VyKTtcbiAgbGlkZXJzTW9kZWwuc3Vic2NyaWJlKGxpZGVyc1JlZHVzZXIpO1xuXG4gIGNvbnN0IGhlYWRlciA9IChtb2RlbCkgPT5cbiAgICAkKFwiaGVhZGVyLmhlYWRlclwiLCBbXG4gICAgICAkKFwiLmNvbnRhaW5lci5oZWFkZXItY29udGFpbmVyXCIsIFtcbiAgICAgICAgJChcImJ1dHRvbi5oZWFkZXItYnV0dG9uLmxpZGVycy1tb2RhbC1idXR0b25cIiwge1xuICAgICAgICAgIHRleHQ6IFwiTGlkZXJzXCIsXG4gICAgICAgICAgZXZlbnRzOiB7IGNsaWNrOiBvbkNsaWNrTGlkZXJzQnV0dG9uLmJpbmQobnVsbCwgbW9kZWwpIH0sXG4gICAgICAgIH0pLFxuICAgICAgICBuZXdHYW1lQnV0dG9uKCksXG4gICAgICBdKSxcbiAgICBdKTtcblxuICBjb25zdCBtYWluID0gJChcIm1haW5cIiwgW1xuICAgICQoXCIuY29udGFpbmVyXCIsIFtcbiAgICAgICQoXCJoMS5nYW1lLXRpdGxlXCIsIFwiTWVtb3J5IGdhbWVcIiksXG4gICAgICAkKFwiLmNhcnQtZ3JpZFwiLCBjcmVhdGVDbG9zZUNhcnRzKGdhbWVNb2RlbCkpLFxuICAgIF0pLFxuICBdKTtcblxuICBjb25zdCBmb290ZXIgPSAkKFwiZm9vdGVyLmZvb3RlclwiLCBbXG4gICAgJChcIi5jb250YWluZXJcIiwgW1xuICAgICAgJChcImgzLmN1cnJlbnQtcmV6dWx0LXRpdGxlXCIsIFwiUG9pbnQgcnV6YWx0OlwiKSxcbiAgICAgICQoXCIuc2NvcnNcIiwgW1xuICAgICAgICAkKFwiLmhpdHNcIiwgWyQoXCJzcGFuLmhpdHMtdGl0bGVcIiwgXCJIaXRzOlwiKSwgJChcInNwYW4uaGl0cy1jb3VudFwiLCBcIjBcIildKSxcbiAgICAgICAgJChcIi53aW5zXCIsIFtcbiAgICAgICAgICAkKFwic3Bhbi53aW5zLXRpdGxlXCIsIFwiV2luczpcIiksXG4gICAgICAgICAgJChcInNwYW4ud2lucy1jb3VudFwiLCBcIjAgZnJvbSA4IHBhaXJcIiksXG4gICAgICAgIF0pLFxuICAgICAgXSksXG4gICAgXSksXG4gIF0pO1xuXG4gIGNvbnN0IGJvZHlMaXN0ID0gW2hlYWRlcihsaWRlcnNNb2RlbCksIG1haW4sIGZvb3Rlcl0ubWFwKFxuICAgICh0YWcpID0+IHRhZy51aUVsZW1lbnQsXG4gICk7XG4gIHJvb3QucmVwbGFjZUNoaWxkcmVuKC4uLmJvZHlMaXN0KTtcbn1cblxucmVuZGVyKCk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=