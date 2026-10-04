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

export default DataClient;
