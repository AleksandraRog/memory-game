import Gamer from "./Gamer";
import ItemUI from "./ItemUI";

const createImage = (src) =>
  new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });

async function render() {
  const subHeader = document.createElement("h2");
  subHeader.innerHTML = "This elements was created by js";
  const myImage = await createImage(image);
  document.body.appendChild(subHeader);
  document.body.appendChild(myImage);
}

render();

const COUNT_GAME_CARTS = 16;

const $ = ItemUI.create;

const createCloseCarts = (revertCart) =>
  Array.from({ length: COUNT_GAME_CARTS }, (_, i) => i + 1).map((ind) => {
    $(
      ".cart-container",
      {
        attrs: { id: `cart-${ind}` },
        events: { click: revertCart },
      },
      [
        $(".img-wrapper", [
          $("img.figure-img", {
            attrs: { src: "", alt: "" },
          }),
        ]),
      ],
    );
  });

const header = $("header.header", [
  $(".container", [
    $("button.header-button.liders-modal-button", {
      attr: { click: onClickLidersButton },
    }),
    newGameButton,
  ]),
]);

const revertCart = () => {};

const main = $("main", [
  $(".container", [
    $("h1.game-title", "Memory game"),
    $(".cart-grid", createCloseCarts(revertCart)),
  ]),
]);

const footer = $("footer.footer", [$(".container", [])]);

const winModal = $("dialog.win-modal", { events: { cancel: onEscp } }, [
  $(".modal-conainer", [
    $("h2.win-title"),
    $(".buttons-block", [newGameButton, closeModalButton]),
  ]),
]);

const lidersModal = $("dialog.liders-modal", { events: { cancel: onEsc } }, [
  $(".modal-container", [
    $("h2.liders-table-title"),
    lidersTable,
    closeModalButton,
  ]),
]);

const newGameButton = $("button.header-button.new-game-button", {
  text: "New game",
  attrs: { click: onClickNewGameButton },
});

const closeModalButton = $("button.close-modal-button", {
  text: "Close",
  events: { click: onCloseModal },
});

/**
 * Функция для обработки или отображения таблицы лидеров.
 * @param {Gamer[]} liders - Массив объектов класса Gamer.
 * @returns {HTMLElement[]} Новый массив, полученный в результате маппинга.
 */
const lidersTable = (liders =
  liders === 0
    ? $(".placeholder", "Not Winers")
    : $("table.liders-table", [
        $("thead.liders-table-head", [
          $("td.gamer-position", "N"),
          $("td.gamer-name", "Name"),
          $("td.gamer-points", "Points"),
          $("td.gamer-win-date", "Date"),
        ]),
        $("tbody", liderTableRows(liders)),
      ]));

/**
 * Функция для обработки или отображения таблицы лидеров.
 * @param {Gamer[]} liders - Массив объектов класса Gamer.
 * @returns {HTMLElement[]} Новый массив, полученный в результате маппинга.
 */
const liderTableRows = (liders) =>
  liders.map((gamer) =>
    $("tr.gamer-table-row", [
      $("td.gamer-position", gamer.result),
      $("td.gamer-name", gamer.name),
      $("td.gamer-points", gamer.points),
      $("td.gamer-win-date", gamer.winDate.toLocaleString()),
    ]),
  );
