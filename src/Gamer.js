class Gamer {
  /**
   * @param {Object} profile - Данные профиля игрока.
   * @param {string} profile.name - Имя игрока.
   * @param {Date} profile.winDate - Дата победы.
   * @param {string|number} profile.result - Результат игры.
   * @param {number} profile.points - Набранные очки.
   */
  constructor({ name, winDate, result, points }) {
    this.name = name;
    this.winDate = winDate;
    this.points = points;
    this.result = result;
  }
}

export default Gamer;
