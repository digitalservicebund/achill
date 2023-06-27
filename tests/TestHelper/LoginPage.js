export default class LoginPage {
  constructor(page) {
    this.page = page;
  }

  async logIn(username, password) {
    await this.page.goto("/");
    await this.page.locator("#username").fill(username);
    await this.page.locator("#password").fill(password);
    await this.page.locator("text=Sign in").click();
  }
}
