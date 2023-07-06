beforeEach(() => {
  indexedDB.deleteDatabase("firebaseLocalStorageDb");
});

describe("Manage budget", () => {
  it("should login user", () => {
    cy.visit("http://localhost:5173");
    login("test@example.com", "test123");
    cy.findByText(/välkommen chaplin/i).should("be.visible");
  });

  it("should clean up previously created budget periods", () => {
    cleanUp();
  });

  it("should create a new budget period", () => {
    cy.findByRole("button", { name: /\+/i }).click();
    cy.get(".react-datepicker").first().find("div").contains(1).last().click();
    cy.get(".react-datepicker").last().find("div").contains(25).last().click();
    cy.findByRole("checkbox", { name: /tillsammans med\?/i }).click();
    cy.findByRole("button", { name: /Skapa/i }).click();
  });

  it("should add transactions for Chaplin", () => {
    cy.findByText(/lägg till/i).click();
    addTransactions("Chaplin");
  });

  it("should logout", () => {
    cy.findByRole("img", {
      name: /profile/i,
    }).click({ force: true });
    cy.findByText(/logga ut/i).click();
  });

  it("should login with different user", () => {
    cy.visit("http://localhost:5173");
    login("test2@example.com", "test123");
    cy.findByText(/välkommen charlie/i);
  });

  it("should select previously created period", () => {
    cy.findAllByRole("listitem").first().click();
  });

  it("should add multiple transactions at once for Charlie", () => {
    cy.findByText(/lägg till/i).click();
    addTransactions("Charlie");
  });

  it("should have correct calculated values", () => {
    data.forEach(({ member, categories, summary }) => {
      cy.findByRole("img", {
        name: /profile/i,
      }).click({ force: true });
      cy.findByRole("alert").findByText(member).click();

      summary.forEach(({ text, value }) =>
        cy.get("div").contains(text).parent().get("div").contains(value)
      );

      categories.forEach((category) => {
        cy.findByTitle(`Summary for ${category.name}`).as(category.name);
        cy.get(`@${category.name}`).contains(category.name);

        if (category.percentage)
          cy.get(`@${category.name}`).contains(category.percentage);

        cy.get(`@${category.name}`).click();

        if (category.summary)
          cy.get(`@${category.name}`).contains(category.summary);

        cy.findByRole("heading", {
          name: `Transaktioner ${member} för ${category.name.toLowerCase()}`,
        });

        category.transactions.forEach((transaction) => {
          cy.findByRole("listitem", {
            name: `${member} ${transaction.amount} till ${transaction.name} för ${category.name}`,
          });
        });
      });
    });
  });

  it("should clean up budget periods", () => {
    cy.findByRole("img", {
      name: /back/i,
    }).click();
    cleanUp();
  });
});

function login(email: string, password: string) {
  cy.findByPlaceholderText("Ange email").type(email);
  cy.findByPlaceholderText("Ange lösenord").type(password);
  cy.findByRole("button").click();
}

function cleanUp() {
  cy.wait(1000); // Wait for request, bad practice

  cy.findAllByRole("button", { name: /ta bort/i })
    .should("have.length.gte", 0)
    .then(($budgetPeriods) => {
      if ($budgetPeriods.length === 0) {
        cy.log("No budget periods to delete");
        return;
      }

      return cy.wrap($budgetPeriods).click({ force: true, multiple: true });
    });

  cy.get("p").contains(/Inga skapade budgetperioder./i);
}

function addTransactions(member: string) {
  const input = data
    .find(({ member: m }) => member === m)
    ?.categories.flatMap((category) =>
      category.transactions.map((t) => ({
        ...t,
        category: category.name,
        amount: t.amount.replace("-", "").replace("+", "").replace("kr", ""),
      }))
    );

  const monthNumber = new Date().getMonth() + 1;
  const month = monthNumber <= 9 ? `0${monthNumber}` : `${monthNumber}`;

  const text = input?.reduce((acc, curr, i) => {
    return i % 2 === 0
      ? `${acc}\n2022-${month}-10\t \t2022-${month}-10\t \t${curr.name}\t \t${curr.amount}`
      : `${acc}\n2022-${month}-10, 2022-${month}-10, ${curr.name}, ${curr.amount}`;
  }, "");

  cy.findByRole("textbox").type(text ?? "", { delay: 0 });

  cy.findByRole("button", { name: /nästa/i }).click();
  cy.findByTitle(/kostnad nästa/i).click();
  cy.findByTitle(/namn nästa/i).click();
  cy.findByTitle(/datum nästa/i).click();
  cy.findByRole("button", { name: /nästa/i }).click();

  input?.forEach(({ name, category }) => {
    cy.findAllByRole("cell")
      .contains(name)
      .parent()
      .find("select")
      .select(category);
  });

  cy.findByRole("button", {
    name: /lägg till/i,
  }).click();
}

const data = [
  {
    member: "Chaplin",
    summary: [
      { text: "Saldo", value: "43000" },
      { text: "Inkomster", value: "50000" },
      { text: "Utgifter", value: "7000" },
    ],
    categories: [
      {
        name: "Inkomster",
        summary: undefined,
        percentage: undefined,
        transactions: [
          {
            name: "Lön",
            amount: "+50000kr",
          },
        ],
      },
      {
        name: "Boende",
        summary: "1000kr",
        percentage: "14%",
        transactions: [
          {
            name: "Hyra",
            amount: "-1000kr",
          },
        ],
      },
      {
        name: "Mat",
        summary: "1000kr",
        percentage: "14%",
        transactions: [
          {
            name: "Coop",
            amount: "-1000kr",
          },
        ],
      },
      {
        name: "Transport",
        summary: "1000kr",
        percentage: "14%",
        transactions: [
          {
            name: "Bensin",
            amount: "-1000kr",
          },
        ],
      },
      {
        name: "Kläder",
        summary: "1000kr",
        percentage: "14%",
        transactions: [
          {
            name: "Tröja",
            amount: "-1000kr",
          },
        ],
      },
      {
        name: "Sparande",
        summary: "1000kr",
        percentage: "14%",
        transactions: [
          {
            name: "Pension",
            amount: "-1000kr",
          },
        ],
      },
      {
        name: "Övrigt",
        summary: "1000kr",
        percentage: "14%",
        transactions: [
          {
            name: "Netflix",
            amount: "-1000kr",
          },
        ],
      },
      {
        name: "Lån",
        summary: "1000kr",
        percentage: "14%",
        transactions: [
          {
            name: "Hus",
            amount: "-1000kr",
          },
        ],
      },
    ],
  },
  {
    member: "Charlie",
    summary: [
      { text: "Saldo", value: "3500" },
      { text: "Inkomster", value: "10000" },
      { text: "Utgifter", value: "6500" },
    ],
    categories: [
      {
        name: "Inkomster",
        summary: undefined,
        percentage: undefined,
        transactions: [
          {
            name: "Lön",
            amount: "+9500kr",
          },
          {
            name: "Swish Mat",
            amount: "+500kr",
          },
        ],
      },
      {
        name: "Boende",
        summary: "1000kr",
        percentage: "15%",
        transactions: [
          {
            name: "Hyra",
            amount: "-1000kr",
          },
        ],
      },
      {
        name: "Mat",
        summary: "500kr",
        percentage: "8%",
        transactions: [
          {
            name: "Coop",
            amount: "-500kr",
          },
        ],
      },
      {
        name: "Transport",
        summary: "500kr",
        percentage: "8%",
        transactions: [
          {
            name: "Bensin",
            amount: "-500kr",
          },
        ],
      },
      {
        name: "Kläder",
        summary: "500kr",
        percentage: "8%",
        transactions: [
          {
            name: "Tröja",
            amount: "-500kr",
          },
        ],
      },
      {
        name: "Sparande",
        summary: "500kr",
        percentage: "8%",
        transactions: [
          {
            name: "Pension",
            amount: "-500kr",
          },
        ],
      },
      {
        name: "Övrigt",
        summary: "500kr",
        percentage: "8%",
        transactions: [
          {
            name: "Netflix",
            amount: "-500kr",
          },
        ],
      },
      {
        name: "Lån",
        summary: "3000kr",
        percentage: "46%",
        transactions: [
          {
            name: "Hus",
            amount: "-3000kr",
          },
        ],
      },
    ],
  },
  {
    member: "tillsammans",
    summary: [
      { text: "Saldo", value: "46500" },
      { text: "Inkomster", value: "60000" },
      { text: "Utgifter", value: "13500" },
    ],
    categories: [],
  },
];
