beforeEach(() => {
  indexedDB.deleteDatabase("firebaseLocalStorageDb");
});

describe("Manage budget", () => {
  it("should login user", () => {
    cy.visit("http://localhost:3000");
    login("test@example.com", "test123");
  });

  // it.skip("selectes period", () => {
  //   cy.findAllByRole("listitem").first().click();
  // });

  it("should create a new budget period", () => {
    cy.findByRole("button", { name: /\+/i }).click();
    cy.findAllByRole("button").contains(1).click();
    cy.get(".react-datepicker")
      .last()
      .findAllByRole("button")
      .contains(25)
      .last()
      .click();
    cy.findByRole("checkbox", { name: /tillsammans med\?/i }).click();
    cy.findByRole("button", { name: /Skapa/i }).click();
  });

  it("should add transactions", () => {
    cy.findByRole("button", { name: /\+/i }).click();

    [
      { amount: "50000", name: "Lön", category: "Inkomst", shared: false },
      { amount: "1000", name: "Hyra", category: "Boende", shared: true },
      { amount: "1000", name: "Coop", category: "Mat", shared: false },
      { amount: "1000", name: "Bensin", category: "Transport", shared: false },
      { amount: "1000", name: "Tröja", category: "Kläder", shared: false },
      { amount: "1000", name: "Pension", category: "Sparande", shared: false },
      { amount: "1000", name: "Netflix", category: "Övrigt", shared: false },
      { amount: "1000", name: "Hus", category: "Lån", shared: true },
    ].forEach(({ amount, name, category, shared }) => {
      cy.findByDisplayValue(/0/i).clear().type(amount);
      cy.findByRole("textbox", { name: /händelse/i }).type(name);
      cy.findByRole("combobox", { name: /kategori/i }).select(category);
      cy.get(".react-datepicker")
        .first()
        .findAllByRole("button")
        .contains(10)
        .click();

      if (shared) {
        cy.findByRole("checkbox", { name: /gemensam\?/i }).click();
      }

      cy.findByRole("button", { name: /lägg till/i }).click();
      cy.findByDisplayValue(/0/i);
    });

    cy.findByRole("button", { name: /x/i }).click();
  });

  it("should have correct summarized overview values", () => {
    [
      { text: "Kvar", value: "43000" },
      { text: "Inkomster", value: "50000" },
      { text: "Utgifter", value: "7000" },
    ].forEach(({ text, value }) =>
      cy.get("div").contains(text).parent().get("div").contains(value)
    );
  });

  it("should have correct summarized detailed values", () => {
    cy.get("span").contains("Tillsammans").parent().as("togheterWrapper");
    cy.get("span").contains("Charlie").parent().as("charlieWrapper");
    cy.get("span").contains("Chaplin").parent().as("chaplinWrapper");

    [
      // TOGHETER
      { text: "Inkomst", value: "+50000 kr", wrapper: "@togheterWrapper" },
      { text: "Boende", value: "-1000 kr", wrapper: "@togheterWrapper" },
      { text: "Mat", value: "-1000 kr", wrapper: "@togheterWrapper" },
      { text: "Transport", value: "-1000 kr", wrapper: "@togheterWrapper" },
      { text: "Kläder", value: "-1000 kr", wrapper: "@togheterWrapper" },
      { text: "Sparande", value: "-1000 kr", wrapper: "@togheterWrapper" },
      { text: "Övrigt", value: "-1000 kr", wrapper: "@togheterWrapper" },
      { text: "Lån", value: "-1000 kr", wrapper: "@togheterWrapper" },
      { text: "Totalt", value: "43000 kr", wrapper: "@togheterWrapper" },
      // CHARLIE
      { text: "Inkomst", value: "+0 kr", wrapper: "@charlieWrapper" },
      { text: "Boende", value: "-500 kr", wrapper: "@charlieWrapper" },
      { text: "Mat", value: "-0 kr", wrapper: "@charlieWrapper" },
      { text: "Transport", value: "-0 kr", wrapper: "@charlieWrapper" },
      { text: "Kläder", value: "-0 kr", wrapper: "@charlieWrapper" },
      { text: "Sparande", value: "-0 kr", wrapper: "@charlieWrapper" },
      { text: "Övrigt", value: "-0 kr", wrapper: "@charlieWrapper" },
      { text: "Lån", value: "-500 kr", wrapper: "@charlieWrapper" },
      { text: "Totalt", value: "-1000 kr", wrapper: "@charlieWrapper" },
      // CHAPLIN
      { text: "Inkomst", value: "+50000 kr", wrapper: "@chaplinWrapper" },
      { text: "Boende", value: "-500 kr", wrapper: "@chaplinWrapper" },
      { text: "Mat", value: "-1000 kr", wrapper: "@chaplinWrapper" },
      { text: "Transport", value: "-1000 kr", wrapper: "@chaplinWrapper" },
      { text: "Kläder", value: "-1000 kr", wrapper: "@chaplinWrapper" },
      { text: "Sparande", value: "-1000 kr", wrapper: "@chaplinWrapper" },
      { text: "Övrigt", value: "-1000 kr", wrapper: "@chaplinWrapper" },
      { text: "Lån", value: "-500 kr", wrapper: "@chaplinWrapper" },
      { text: "Totalt", value: "44000 kr", wrapper: "@chaplinWrapper" },
    ].forEach(({ text, value, wrapper }) =>
      cy
        .get(wrapper)
        .get("div")
        .contains(text)
        .parent()
        .get("div")
        .contains(value)
    );
  });

  it("should logout", () => {
    cy.findByRole("img", {
      name: /logout/i,
    }).click();
  });

  it("should login with different user", () => {
    cy.visit("http://localhost:3000");
    login("test2@example.com", "test123");
  });

  it("should select previously created period", () => {
    cy.findAllByRole("listitem").first().click();
  });

  it("should add multiple transactions at once", () => {
    cy.findByRole("button", { name: /\+/i }).as("addMultipleButton");
    cy.get("@addMultipleButton").trigger("mousedown");

    const input = [
      { amount: "10000", name: "Lön", category: "Inkomst", shared: false },
      { amount: "-500", name: "Hyra", category: "Boende", shared: true },
      { amount: "-500", name: "Coop", category: "Mat", shared: false },
      { amount: "-500", name: "Bensin", category: "Transport", shared: false },
      { amount: "-500", name: "Tröja", category: "Kläder", shared: false },
      { amount: "-500", name: "Pension", category: "Sparande", shared: false },
      { amount: "-500", name: "Netflix", category: "Övrigt", shared: false },
      { amount: "-500", name: "Hus", category: "Lån", shared: true },
    ];

    const monthNumber = new Date().getMonth();
    const month = monthNumber <= 9 ? `0${monthNumber}` : `${monthNumber}`;

    const text = input.reduce((acc, curr) => {
      return `${acc}\n2022-${month}-10\t \t${curr.name}\t \t${curr.amount}`;
    }, "");

    cy.findByRole("textbox").type(text, { delay: 0 });

    input.forEach(({ name, category }) => {
      cy.findAllByRole("cell")
        .contains(name)
        .parent()
        .find("select")
        .select(category);
    });

    cy.findByRole("button", {
      name: /lägg till/i,
    }).click();
  });

  it("should have correct summarized overview values", () => {
    [
      { text: "Kvar", value: "49500" },
      { text: "Inkomster", value: "60000" },
      { text: "Utgifter", value: "10500" },
    ].forEach(({ text, value }) =>
      cy.get("div").contains(text).parent().get("div").contains(value)
    );
  });

  it("should have correct summarized detailed values", () => {
    cy.get("span").contains("Tillsammans").parent().as("togheterWrapper");
    cy.get("span").contains("Charlie").parent().as("charlieWrapper");
    cy.get("span").contains("Chaplin").parent().as("chaplinWrapper");

    [
      // TOGHETER
      { text: "Inkomst", value: "+60000 kr", wrapper: "@togheterWrapper" },
      { text: "Boende", value: "-1500 kr", wrapper: "@togheterWrapper" },
      { text: "Mat", value: "-1500 kr", wrapper: "@togheterWrapper" },
      { text: "Transport", value: "-1500 kr", wrapper: "@togheterWrapper" },
      { text: "Kläder", value: "-1500 kr", wrapper: "@togheterWrapper" },
      { text: "Sparande", value: "-1500 kr", wrapper: "@togheterWrapper" },
      { text: "Övrigt", value: "-1500 kr", wrapper: "@togheterWrapper" },
      { text: "Lån", value: "-1500 kr", wrapper: "@togheterWrapper" },
      { text: "Totalt", value: "49500 kr", wrapper: "@togheterWrapper" },
      // CHARLIE
      { text: "Inkomst", value: "+10000 kr", wrapper: "@charlieWrapper" },
      { text: "Boende", value: "-1000 kr", wrapper: "@charlieWrapper" },
      { text: "Mat", value: "-500 kr", wrapper: "@charlieWrapper" },
      { text: "Transport", value: "-500 kr", wrapper: "@charlieWrapper" },
      { text: "Kläder", value: "-500 kr", wrapper: "@charlieWrapper" },
      { text: "Sparande", value: "-500 kr", wrapper: "@charlieWrapper" },
      { text: "Övrigt", value: "-500 kr", wrapper: "@charlieWrapper" },
      { text: "Lån", value: "-1000 kr", wrapper: "@charlieWrapper" },
      { text: "Totalt", value: "5500 kr", wrapper: "@charlieWrapper" },
      // CHAPLIN
      { text: "Inkomst", value: "+50000 kr", wrapper: "@chaplinWrapper" },
      { text: "Boende", value: "-500 kr", wrapper: "@chaplinWrapper" },
      { text: "Mat", value: "-1000 kr", wrapper: "@chaplinWrapper" },
      { text: "Transport", value: "-1000 kr", wrapper: "@chaplinWrapper" },
      { text: "Kläder", value: "-1000 kr", wrapper: "@chaplinWrapper" },
      { text: "Sparande", value: "-1000 kr", wrapper: "@chaplinWrapper" },
      { text: "Övrigt", value: "-1000 kr", wrapper: "@chaplinWrapper" },
      { text: "Lån", value: "-500 kr", wrapper: "@chaplinWrapper" },
      { text: "Totalt", value: "44000 kr", wrapper: "@chaplinWrapper" },
    ].forEach(({ text, value, wrapper }) =>
      cy
        .get(wrapper)
        .get("div")
        .contains(text)
        .parent()
        .get("div")
        .contains(value)
    );
  });
});

function login(email: string, password: string) {
  cy.findByPlaceholderText("Ange email").type(email);
  cy.findByPlaceholderText("Ange lösenord").type(password);
  cy.findByRole("button").click();
}
