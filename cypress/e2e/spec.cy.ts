beforeEach(() => {
  indexedDB.deleteDatabase("firebaseLocalStorageDb");
});

describe("Manage budget", () => {
  it("should login user", () => {
    cy.visit("/");
    login("test@example.com", "test123");
    cy.findByText(/välkommen chaplin/i).should("be.visible");
  });

  it("should clean up previously created budget periods", () => {
    cleanUp();
  });

  it("should create a new budget period", () => {
    cy.findByRole("button", { name: /\+/i }).click();
    cy.get(".react-datepicker").first().find("div").contains(1).last().click();
    cy.get(".react-datepicker").last().find("div").contains(24).last().click();
    cy.findByRole("checkbox", { name: /tillsammans med\?/i }).click();
    cy.findByRole("button", { name: /Skapa/i }).click();
  });

  it("should add transactions for Chaplin", () => {
    cy.findByText(/lägg till/i).click();
    addTransactions("Chaplin");
  });

  it("should verify no duplicates exist for Chaplin's transactions", () => {
    // After adding initial transactions, there should be no duplicates
    cy.get("body").then(($body) => {
      if ($body.text().includes("potentiella duplicerade transaktioner")) {
        throw new Error("No duplicates should be detected yet");
      }
    });
  });

  it("should add a duplicate transaction and verify detection", () => {
    // Add a duplicate transaction
    cy.findByText(/lägg till/i).click();
    
    const monthNumber = new Date().getMonth() + 1;
    const month = monthNumber <= 9 ? `0${monthNumber}` : `${monthNumber}`;
    
    // Add exact duplicate: same name and amount as an existing Coop transaction
    cy.findByRole("textbox").type(
      `2022-${month}-10\n2022-${month}-10\nCoop\n1000\nSALDO`,
      { delay: 0 }
    );

    cy.findByRole("button", { name: /formatera/i }).click();
    cy.findByRole("button", { name: /nästa/i }).click();
    cy.findByRole("button", { name: /nästa/i }).click();

    // Assign category
    cy.findAllByRole("cell").contains("Coop").parent().find("select").select("Mat");

    cy.findByRole("button", { name: /lägg till/i }).click();

    // Verify duplicate detection warning appears
    cy.findByText(/potentiella duplicerade transaktioner/i, { timeout: 10000 }).should("be.visible");
  });

  it("should remove the duplicate transaction", () => {
    // Click on Mat category to see transactions
    cy.findByTitle("Summary for Mat").click();

    // Find and click on one of the Coop transactions (the duplicate)
    cy.findAllByRole("listitem")
      .filter('[title*="Coop"]')
      .last()
      .click();

    // Click the "Ta bort" (delete) button
    cy.findByRole("button", { name: /ta bort/i }).click();

    // Wait for the deletion to complete
    cy.wait(500);

    // Verify the duplicate warning is no longer visible
    cy.get("body").then(($body) => {
      if ($body.text().includes("potentiella duplicerade transaktioner")) {
        throw new Error("Duplicate warning should be gone after removing the duplicate");
      }
    });
  });

  it("should add an optional transaction and verify visual styling", () => {
    // Click to add a new transaction
    cy.findByText(/lägg till/i).click();
    
    const monthNumber = new Date().getMonth() + 1;
    const month = monthNumber <= 9 ? `0${monthNumber}` : `${monthNumber}`;
    
    // Add a coffee purchase (optional transaction)
    cy.findByRole("textbox").type(
      `2022-${month}-15\nKaffe på café\n45`,
      { delay: 0 }
    );

    cy.findByRole("button", { name: /formatera/i }).click();
    cy.findByRole("button", { name: /nästa/i }).click();
    cy.findByRole("button", { name: /nästa/i }).click();

    // Select category and mark as optional (uncheck "Nödvändig")
    cy.findAllByRole("cell").contains("Kaffe på café").parent().find("select").select("Övrigt");
    cy.findAllByRole("cell").contains("Kaffe på café").parent().find('input[type="checkbox"]').uncheck();

    cy.findByRole("button", { name: /lägg till/i }).click();

    // Wait for the transaction to be added
    cy.wait(500);

    // Verify potential savings is displayed in the overview
    cy.get("div").contains("Möjlig besparing").should("be.visible");
    cy.get("div").contains("Möjlig besparing").parent().contains("45kr");

    // Click on Övrigt category to see the transaction
    cy.findByTitle("Summary for Övrigt").click();

    // Find the optional transaction item
    cy.findByRole("listitem", {
      name: /Kaffe på café/i,
    }).as("optionalTransaction");

    // Verify the optional transaction has the correct styling
    cy.get("@optionalTransaction").should("have.css", "opacity", "0.6");
    cy.get("@optionalTransaction").should("have.css", "background-color", "rgb(250, 251, 252)");
    cy.get("@optionalTransaction").should("have.css", "border-left-width", "3px");
    cy.get("@optionalTransaction").should("have.css", "border-left-color", "rgb(212, 219, 230)");

    // Verify the transaction name is italic and has the right color
    cy.get("@optionalTransaction").find("p").first().should("have.css", "font-style", "italic");
    cy.get("@optionalTransaction").find("p").first().should("have.css", "color", "rgb(138, 146, 163)");
    cy.get("@optionalTransaction").find("p").first().should("have.css", "font-weight", "400");

    // Clean up: delete the optional transaction to not affect other tests
    cy.get("@optionalTransaction").click();
    cy.findByRole("button", { name: /ta bort/i }).click();
    cy.wait(500);
  });

  it("should logout", () => {
    cy.findByRole("img", {
      name: /profile/i,
    }).click({ force: true });
    cy.findByText(/logga ut/i).click();
  });

  it("should login with different user", () => {
    cy.visit("/");
    login("test2@example.com", "test123");
    cy.findByText(/välkommen charlie/i);
  });

  it("should select previously created period", () => {
    cy.scrollTo("bottom", { ensureScrollable: false });
    cy.findAllByRole("listitem").last().click();
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
        cy.get("div").contains(text).parent().get("div").contains(value),
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
      })),
    );

  const monthNumber = new Date().getMonth() + 1;
  const month = monthNumber <= 9 ? `0${monthNumber}` : `${monthNumber}`;

  const text = input?.reduce((acc, curr, i) => {
    return i % 2 === 0
      ? `${acc}\n2022-${month}-10\n2022-${month}-10\n${curr.name}\n${curr.amount}\nSALDO`
      : `${acc}\n2022-${month}-10\n${curr.name}\n${curr.amount}\nSALDO`;
  }, "");

  cy.findByRole("textbox").type(text ?? "", { delay: 0 });

  cy.findByRole("button", { name: /formatera/i }).click();
  cy.findByRole("button", { name: /nästa/i }).click();
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
    member: "Tillsammans",
    summary: [
      { text: "Saldo", value: "46500" },
      { text: "Inkomster", value: "60000" },
      { text: "Utgifter", value: "13500" },
    ],
    categories: [],
  },
];
