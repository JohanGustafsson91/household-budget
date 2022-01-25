import { useUser } from "components/App/App.UserProvider";
import { onSnapshot, query, collection, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AsyncState, Period as PeriodType } from "shared";
import styled from "styled-components";
import { fontSize, space } from "theme";
import { COLLECTION, db, displayDate, getDocument } from "utils";
import { categories, Category } from "./Period.categories";
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

  const user = useUser();
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

  const boardCategories = categories.filter(({ type }) => type !== "INCOME");

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

  if (period.status === "pending") {
    return <Content>Laddar budgetperiod...</Content>;
  }

  if (period.status === "rejected") {
    return <Content>Kunde inte ladda budgetperioder...</Content>;
  }

  return (
    <Content>
      <Menu>
        <h3>
          Period {period.data.fromDate.toLocaleDateString()} -{" "}
          {period.data.toDate.toLocaleDateString()}
        </h3>

        <button onClick={toggleTransactionModal}>Lägg till</button>
      </Menu>

      <Board
        columns={
          // TODO fix
          boardCategories.length + (period.data?.members?.length ?? 1) + 1
        }
      >
        {period.data.members.map((userId) => {
          const name = user.friendById(userId);

          const incomeForUser = (categorizedTransactions.INCOME || []).filter(
            ({ author }) => author === userId
          );

          const transactionsByUser = boardCategories.reduce((acc, curr) => {
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
            <Lane key={`sum-${userId}`} noBorders>
              <LaneHeader>{name}</LaneHeader>
              <LaneContent>
                {incomeForUser.map((item) => (
                  <Todo key={item.id}>
                    <span>
                      + {item.amount}kr {item.label}
                    </span>
                  </Todo>
                ))}

                {boardCategories.map(({ type, text }) => (
                  <Todo key={`${userId}-${type}`}>
                    - {summarize(transactionsByUser[type] || [])} {text}
                  </Todo>
                ))}

                <Todo>
                  <b>= {total} kr</b>
                </Todo>
              </LaneContent>
            </Lane>
          );
        })}

        <Lane noBorders>
          <LaneHeader>Tillsammans</LaneHeader>
          <LaneContent>
            <Todo>
              <span>
                + {summarize(categorizedTransactions["INCOME"] ?? [])}kr
              </span>
            </Todo>
            {boardCategories.map(({ type, text }) => (
              <Todo key={`shared-${type}`}>
                - {summarize(categorizedTransactions[type] || [])} {text}
              </Todo>
            ))}
            <Todo>
              <b>
                ={" "}
                {summarize(categorizedTransactions["INCOME"] || []) * 2 -
                  summarize(Object.values(categorizedTransactions).flat())}{" "}
                kr
              </b>
            </Todo>
          </LaneContent>
        </Lane>

        {boardCategories.map(({ type, text }) => (
          <Lane key={type}>
            <LaneHeader>{text}</LaneHeader>
            <LaneContent>
              {(categorizedTransactions[type] || []).map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  onClick={() => showUpdateTransaction(transaction)}
                >
                  <TransactionRow>
                    <TransactionCol>
                      {transaction.shared
                        ? "Gemensam"
                        : user.friendById(transaction.author)}
                    </TransactionCol>
                    <TransactionCol>{transaction.label}</TransactionCol>
                  </TransactionRow>
                  <TransactionRow>
                    <TransactionCol>
                      {displayDate(transaction.date)}
                    </TransactionCol>
                    <TransactionCol>{transaction.amount}kr</TransactionCol>
                  </TransactionRow>
                </TransactionCard>
              ))}
            </LaneContent>
          </Lane>
        ))}
      </Board>

      {addTransactionVisible && (
        <Overlay>
          <Modal>
            <button onClick={toggleTransactionModal}>Close</button>
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

const summarize = (list: Array<{ amount: number }>) =>
  list.reduce((acc, curr) => Number(acc) + Number(curr.amount), 0);

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Board = styled.div<{ columns: number }>`
  flex: 1;
  display: grid;
  grid-template-columns: ${(props) => `repeat(${props.columns}, 200px)`};
  overflow: auto;
  height: 100%;
`;

const LaneContent = styled.div`
  flex: 1;
  border-top: 1px solid #000;
  padding: ${space(1)};
`;

const Lane = styled.div<{ noBorders?: boolean }>`
  height: 100%;
  display: flex;
  flex-direction: column;

  ${(props) =>
    props.noBorders &&
    `

  margin-right: ${space(4)};
`}

  ${(props) =>
    !props.noBorders &&
    `

  &:nth-child(even) {
    ${LaneContent} {
      border: 1px solid #000;
    }
  }
  &:nth-child(odd) {
    ${LaneContent} {
      border-bottom: 1px solid #000;
    }
  }

`}
`;

const LaneHeader = styled.div``;

const Menu = styled.div`
  display: flex;
  justify-content: space-between;
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
  padding: ${space(4)};
`;

const TransactionCard = styled.div`
  border: 1px solid #000;
  padding: ${space(1)};
  margin-bottom: ${space(1)};
  font-size: ${fontSize(0)};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const TransactionRow = styled.div`
  display: flex;
  flex: 1;
  justify-content: space-between;

  &:first-child {
    margin-bottom: ${space(4)};
  }
`;
const TransactionCol = styled.div``;

const Todo = styled.div`
  margin-bottom: ${space(1)};
`;
