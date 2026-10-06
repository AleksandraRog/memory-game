import GameModel from "./GameModel";
import Game from "./Game";
import ItemUI from "./ItemUI";
import LeadersModel from "./LeadersModel";
import { delay } from "./utils";

const root = document.querySelector("body");

const COUNT_GAME_CARDS = 16;

const $ = ItemUI.create;

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
  await delay(250);
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
  const gameModel = new GameModel();
  const leadersModel = new LeadersModel();
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
