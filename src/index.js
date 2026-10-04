import GameModel from "./GameModel";
import Game from "./Game";
import ItemUI from "./ItemUI";
import LidersModel from "./LidersModel";
import { delay } from "./utils";

const root = document.querySelector("body");

const COUNT_GAME_CARTS = 16;

const $ = ItemUI.create;

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
  await delay(250);
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
  const gameModel = new GameModel();
  const lidersModel = new LidersModel();
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
