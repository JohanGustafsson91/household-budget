import { ActionBarTitle } from "components/ActionBar";
import { useUser } from "components/App/App.UserProvider";
import { ActionButton } from "components/Button";
import { Card, CardTitle } from "components/Card";
import { pagePadding } from "components/Page";
import { onSnapshot, query, collection, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AsyncState, Period as PeriodType } from "shared";
import styled from "styled-components";
import { fontSize, space } from "theme";
import { COLLECTION, db, displayDate, getDocument } from "utils";
import { categories, categoriesForBoard, Category } from "./Period.categories";
import { Transaction } from "./Period.Transaction";
import { TransactionForm } from "./Period.TransactionForm";

export const Period = () => {
  const [period, setPeriod] = useState<AsyncState<PeriodType>>({
    data: undefined,
    status: "pending",
  });

  const [transactions, setTransactions] = useState<AsyncState<Transaction[]>>({
    data: undefined,
    status: "pending",
  });

  const [addTransactionVisible, setManageTransaction] = useState<
    Transaction | true | undefined
  >(undefined);

  const { getFriendById: getFriendNameById } = useUser();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(
    function getPeriodById() {
      if (!id) {
        return;
      }

      (async function getPeriodFromDb() {
        const data = await getDocument(COLLECTION["budgetPeriods"], id).catch(
          () =>
            // TODO handle
            navigate("/")
        );

        data &&
          setPeriod({
            status: "resolved",
            data: {
              ...data,
              id,
              fromDate: data.fromDate.toDate(),
              toDate: data.toDate.toDate(),
              createdAt: data.createdAt.toDate(),
              lastUpdated: data.lastUpdated.toDate(),
            } as PeriodType,
          });
      })();
    },
    [id, navigate]
  );

  useEffect(
    function subscribeToTransactions() {
      if (!period.data?.members.length) {
        return;
      }

      const unsubscribe = onSnapshot(
        query(
          collection(db, COLLECTION["transactions"]),
          where("periodId", "==", id),
          where("author", "in", period.data.members)
        ),
        function onSnapshot(querySnapshot) {
          const transactions = querySnapshot.docs
            .map((doc) => {
              const data = doc.data();
              const docId = doc.id;

              return {
                ...data,
                id: docId,
                date: data.date.toDate(),
              };
            })
            .sort((a, b) => a.date - b.date);

          setTransactions({
            status: "resolved",
            data: transactions as Transaction[],
          });
        },
        function onError(_e) {
          // TODO handle
        }
      );

      return unsubscribe;
    },
    [id, period.data?.members]
  );

  function toggleTransactionModal() {
    return setManageTransaction((prev) =>
      Boolean(prev) === true ? undefined : true
    );
  }

  function showUpdateTransaction(transaction: Transaction) {
    setManageTransaction(transaction);
  }

  const categorizedTransactions = (transactions?.data || []).reduce(
    (acc, curr) => {
      const previous = acc[curr.category] || [];
      return {
        ...acc,
        [curr.category]: [...previous, curr],
      };
    },
    {} as Record<Category["type"], Transaction[]>
  );

  const totalIncome = summarize(categorizedTransactions["INCOME"] || []);
  const { INCOME, ...rest } = categorizedTransactions;
  const totalExpenses = summarize(Object.values(rest).flat());
  const totalLeftToSpend = totalIncome - totalExpenses;

  if (period.status === "pending") {
    return <Content>Laddar budgetperiod...</Content>;
  }

  if (period.status === "rejected") {
    return <Content>Kunde inte ladda budgetperioder...</Content>;
  }

  return (
    <Content>
      <ActionBarTitle
        title={`Period ${displayDate(period.data.fromDate)} - ${displayDate(
          period.data.toDate
        )}`}
      />

      <TopContent>
        <Item>
          <ItemMoney highlight>{totalLeftToSpend}</ItemMoney>
          <ItemMoneyLabel>Kvar</ItemMoneyLabel>
        </Item>
        <Item>
          <ItemMoney>{totalIncome}</ItemMoney>
          <ItemMoneyLabel>Inkomster</ItemMoneyLabel>
        </Item>
        <Item>
          <ItemMoney>{totalExpenses}</ItemMoney>
          <ItemMoneyLabel>Utgifter</ItemMoneyLabel>
        </Item>
      </TopContent>

      <MarginBottomFix />

      <Card height="calc(50vh)">
        <Board columns={categories.length}>
          {categories.map(({ type, text }) => (
            <Lane key={type}>
              <LaneHeader>
                <CardTitle>{text}</CardTitle>
              </LaneHeader>
              <LaneContent>
                {(categorizedTransactions[type] || []).map((transaction) => (
                  <TransactionCard
                    gender={
                      transaction.shared
                        ? "none"
                        : getFriendNameById(transaction.author)?.gender ||
                          "male"
                    }
                    key={transaction.id}
                    onClick={() => showUpdateTransaction(transaction)}
                  >
                    <TransactionRow>
                      <TransactionCol>
                        {transaction.shared
                          ? "Gemensam"
                          : getFriendNameById(transaction.author)?.name}
                      </TransactionCol>
                      <TransactionCol highlight>
                        {transaction.label}
                      </TransactionCol>
                    </TransactionRow>
                    <TransactionRow>
                      <TransactionCol>
                        {displayDate(transaction.date)}
                      </TransactionCol>
                      <TransactionCol highlight big>
                        {transaction.amount}kr
                      </TransactionCol>
                    </TransactionRow>
                  </TransactionCard>
                ))}
              </LaneContent>
            </Lane>
          ))}
        </Board>
      </Card>

      <Card>
        <CardTitle>Tillsammans</CardTitle>
        <CardRow>
          <CardCol>Inkomst</CardCol>
          <CardCol>+{totalIncome} kr</CardCol>
        </CardRow>
        {categoriesForBoard.map(({ type, text }) => (
          <CardRow key={`shared-${type}`}>
            <CardCol>{text}</CardCol>
            <CardCol>
              -{summarize(categorizedTransactions[type] || [])} kr
            </CardCol>
          </CardRow>
        ))}
        <CardRow>
          <CardCol>Totalt</CardCol>
          <CardCol>{totalLeftToSpend} kr</CardCol>
        </CardRow>
      </Card>

      {period.data.members.map((userId) => {
        const name = getFriendNameById(userId)?.name;

        const incomeForUser = (categorizedTransactions.INCOME || []).filter(
          ({ author }) => author === userId
        );

        const transactionsByUser = categoriesForBoard.reduce((acc, curr) => {
          const transaction = categorizedTransactions[curr.type] || [];

          const userTransactions = transaction
            .filter(
              ({ author, shared }) => author === userId || shared === true
            )
            .map((transaction) => ({
              ...transaction,
              amount: transaction.shared
                ? transaction.amount / period.data.members.length
                : transaction.amount,
            }));

          const previous = acc[curr.type] || [];
          return { ...acc, [curr.type]: [...previous, ...userTransactions] };
        }, {} as Record<Category["type"], Transaction[]>);

        const total =
          summarize(incomeForUser) -
          summarize(Object.values(transactionsByUser).flat());

        return (
          <Card key={`sum-${userId}`}>
            <CardTitle>{name}</CardTitle>
            {incomeForUser.map((item) => (
              <CardRow key={item.id}>
                <CardCol>{item.label}</CardCol>
                <CardCol>+{item.amount} kr</CardCol>
              </CardRow>
            ))}

            {categoriesForBoard.map(({ type, text }) => (
              <CardRow key={`${userId}-${type}`}>
                <CardCol>{text}</CardCol>
                <CardCol>
                  -{summarize(transactionsByUser[type] || [])} kr
                </CardCol>
              </CardRow>
            ))}
            <CardRow>
              <CardCol>Totalt</CardCol>
              <CardCol>{total} kr</CardCol>
            </CardRow>
          </Card>
        );
      })}

      <ActionButton onClick={toggleTransactionModal}>+</ActionButton>

      {addTransactionVisible && (
        <Overlay>
          <Modal>
            <CloseButton onClick={toggleTransactionModal}>x</CloseButton>
            <TransactionForm
              period={period.data}
              updateTransaction={addTransactionVisible}
              onUpdated={toggleTransactionModal}
            />
          </Modal>
        </Overlay>
      )}
    </Content>
  );
};

function summarize(list: Array<{ amount: number }>) {
  return list.reduce((acc, curr) => Number(acc) + Number(curr.amount), 0);
}

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  margin-bottom: ${space(2)};
`;

const TopContent = styled.div`
  background-color: var(--color-background-action-bar);
  display: flex;
  position: absolute;
  justify-content: space-between;
  padding: ${space(3)} ${space(4)} ${space(6)} ${space(4)};
  left: 0;
  right: 0;
  margin-top: -${pagePadding};
  z-index: -1;
`;

const Item = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: end;
`;
const ItemMoney = styled.div<{ highlight?: boolean }>`
  color: var(--color-text-action-bar);
  font-weight: 500;
  align-items: center;
  font-size: ${(props) => (props.highlight ? fontSize(5) : fontSize(3))};
  justify-self: flex-start;
`;
const ItemMoneyLabel = styled.div`
  color: #4d82d7;
`;

const MarginBottomFix = styled.div`
  margin-bottom: 90px;
`;

const Board = styled.div<{ columns: number }>`
  flex: 1;
  display: grid;
  grid-template-columns: ${(props) => `repeat(${props.columns}, 200px)`};
  overflow-y: hidden;
  overflow-x: scroll;
  height: 100%;
`;

const LaneContent = styled.div`
  flex: 1;
  border-top: 2px solid var(--color-border);
  padding: ${space(2)};
  height: 100%;
  overflow-x: hidden;
  overflow-y: scroll;
`;

const Lane = styled.div<{ noBorders?: boolean }>`
  height: 100%;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;

  ${LaneContent} {
    border-bottom: 2px solid var(--color-border);
    border-left: 2px solid var(--color-border);
  }
  &:first-child {
    ${LaneContent} {
      border-left: none;
    }
  }
`;

const LaneHeader = styled.div`
  color: var(--color-text);
  text-align: center;
  text-transform: uppercase;
  font-size: ${fontSize(0)};
`;

const Overlay = styled.div`
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const Modal = styled.div`
  background-color: #fff;
  padding: ${space(3)} ${space(3)};
  position: absolute;
  left: 0;
  right: 0;
  top: 60px;
  bottom: 0;
  overflow: auto;
`;

const CloseButton = styled.button`
  outline: 0;
  border: 0;
  position: absolute;
  right: ${space(2)};
  top: ${space(2)};
  background-color: inherit;
  border-radius: 50%;
  height: 25px;
  width: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TransactionCard = styled.div<{ gender: "none" | "male" | "female" }>`
  border: 1px solid var(--color-border);
  padding: ${space(1)};
  margin-bottom: ${space(2)};
  font-size: ${fontSize(0)};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  background-color: ${(props) => genderColorMap[props.gender]};
`;

const genderColorMap = {
  male: "rgba(144, 238, 144, 0.2)",
  female: "rgba(255, 182, 193, 0.2)",
  none: "#fff",
};

const TransactionRow = styled.div`
  display: flex;
  flex: 1;
  justify-content: space-between;

  &:first-child {
    margin-bottom: ${space(4)};
  }
`;
const TransactionCol = styled.div<{ highlight?: boolean; big?: boolean }>`
  color: ${(props) =>
    props.highlight ? "var(--color-text-strong)" : "inherit"};
  font-weight: ${(props) => (props.big ? "bold" : "normal")};
  font-size: ${(props) => (props.big ? fontSize(1) : "inherit")};
`;

const CardCol = styled.div`
  color: var(--color-text-strong);
`;

const CardRow = styled.div`
  margin-bottom: ${space(1)};
  border-bottom: 1px solid var(--color-border);
  display: flex;
  padding: ${space(2)} 0;

  ${CardCol} {
    &:first-child {
      flex: 1;
    }
  }

  &:last-child {
    margin-top: ${space(2)};
    border: 0;
    font-weight: bold;
    margin-bottom: 0;
  }
`;
