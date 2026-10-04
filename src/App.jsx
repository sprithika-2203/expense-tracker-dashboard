import { useState, useEffect } from "react";
import "./App.css";

function App() {

  // Selected Month

  const [selectedMonth, setSelectedMonth] = useState(() => {
    return localStorage.getItem("selectedMonth") || "2026-09";
  });

  // Income Records

  const [incomeRecords, setIncomeRecords] = useState(() => {
    const savedIncome = localStorage.getItem("incomeRecords");

    if (savedIncome) {
      return JSON.parse(savedIncome);
    }
  });

  // Expenses

  const [expenses, setExpenses] = useState(() => {
    const savedExpenses = localStorage.getItem("expenses");

    if (savedExpenses) {
      return JSON.parse(savedExpenses);
    }

    // Default September expenses
    // return [
    //   {
    //     id: 1,
    //     title: "Rent",
    //     amount: 15000,
    //     category: "Housing",
    //     date: "2026-09-05",
    //   },
    //   {
    //     id: 2,
    //     title: "Groceries",
    //     amount: 10000,
    //     category: "Food",
    //     date: "2026-09-10",
    //   },
    //   {
    //     id: 3,
    //     title: "Travel",
    //     amount: 5000,
    //     category: "Travel",
    //     date: "2026-09-15",
    //   },
    //   {
    //     id: 4,
    //     title: "Shopping",
    //     amount: 10000,
    //     category: "Shopping",
    //     date: "2026-09-20",
    //   },
    // ];
  });

  // Form States

  const [incomeInput, setIncomeInput] = useState("");

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");

  const [date, setDate] = useState("2026-09-01");

  const [search, setSearch] = useState("");

  // Save Selected Month

  useEffect(() => {
    localStorage.setItem(
      "selectedMonth",
      selectedMonth
    );
  }, [selectedMonth]);

  // Save Income

  useEffect(() => {
    localStorage.setItem(
      "incomeRecords",
      JSON.stringify(incomeRecords)
    );
  }, [incomeRecords]);

  // Save Expenses

  useEffect(() => {
    localStorage.setItem(
      "expenses",
      JSON.stringify(expenses)
    );
  }, [expenses]);

  // Get Selected Month Income

  const selectedIncome =
    incomeRecords.find(
      (item) => item.month === selectedMonth
    )?.amount || 0;

  // Get Selected Month Expenses


  const selectedExpenses = expenses.filter(
    (expense) =>
      expense.date.startsWith(selectedMonth)
  );

  // Total Monthly Expense

  const monthlyExpense = selectedExpenses.reduce(
    (total, expense) =>
      total + Number(expense.amount),0
  );

  // Get Previous Month

  const getPreviousMonth = (month) => {

    const [year, monthNumber] =
      month.split("-").map(Number);

    const previousDate = new Date(
      year,
      monthNumber - 2,
      1
    );

    const previousYear =
      previousDate.getFullYear();

    const previousMonth = String(
      previousDate.getMonth() + 1
    ).padStart(2, "0");

    return `${previousYear}-${previousMonth}`;
  };

  // Calculate Opening Balance

  const getOpeningBalance = (month) => {

    const [year, monthNumber] =
      month.split("-").map(Number);

    // January 2026 starts from zero
    if (year === 2026 && monthNumber === 1) {
      return 0;
    }

    const previousMonth =
      getPreviousMonth(month);

    const previousIncome =
      incomeRecords.find(
        (item) =>
          item.month === previousMonth
      )?.amount || 0;

    const previousExpenses =
      expenses
        .filter((expense) =>
          expense.date.startsWith(previousMonth)
        )
        .reduce(
          (total, expense) =>
            total + Number(expense.amount),0
        );

    return (
      getOpeningBalance(previousMonth) +
      previousIncome -
      previousExpenses
    );
  };


  const openingBalance =
    getOpeningBalance(selectedMonth);

  // Closing Balance

  const closingBalance =
    openingBalance +
    selectedIncome -
    monthlyExpense;

  // Add Income

  const addIncome = () => {

    const newIncome =
      Number(incomeInput);

    if (!incomeInput || newIncome <= 0) {
      alert("Please enter a valid income");
      return;
    }

    setIncomeRecords((prev) => {

      const existingRecord =
        prev.find(
          (item) =>
            item.month === selectedMonth
        );

      // If month already exists
      if (existingRecord) {

        return prev.map((item) =>
          item.month === selectedMonth
            ? {
                ...item,
                amount:
                  item.amount + newIncome,
              }
            : item
        );
      }

      // New month
      return [
        ...prev,
        {
          month: selectedMonth,
          amount: newIncome,
        },
      ];
    });

    setIncomeInput("");
  };

  // Set Income

  const setIncome = () => {

    const newIncome =
      Number(incomeInput);

    if (!incomeInput || newIncome <= 0) {
      alert("Please enter a valid income");
      return;
    }

    setIncomeRecords((prev) => {

      const existingRecord =
        prev.find(
          (item) =>
            item.month === selectedMonth
        );

      if (existingRecord) {

        return prev.map((item) =>
          item.month === selectedMonth
            ? {
                ...item,
                amount: newIncome,
              }
            : item
        );
      }

      return [
        ...prev,
        {
          month: selectedMonth,
          amount: newIncome,
        },
      ];
    });

    setIncomeInput("");
  };

  // Add Expense

  const addExpense = (e) => {

    e.preventDefault();

    if (!title || !amount || !date) {
      alert("Please fill all fields");
      return;
    }

    const newExpense = {
      id: Date.now(),
      title: title,
      amount: Number(amount),
      category: category,
      date: date,
    };

    setExpenses((prev) => [
      ...prev,
      newExpense,
    ]);

    setTitle("");
    setAmount("");
  };

  // Delete Expense

  const deleteExpense = (id) => {

    setExpenses((prev) =>
      prev.filter(
        (expense) =>
          expense.id !== id
      )
    );
  };

  // Search

  const filteredExpenses =
    selectedExpenses.filter(
      (expense) =>
        expense.title
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        expense.category
          .toLowerCase()
          .includes(search.toLowerCase())
    );

  // Currency Format

  const formatCurrency = (value) => {

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(value);
  };

  // Format Month

  const formatMonth = (month) => {

    const date =
      new Date(`${month}-01`);

    return date.toLocaleDateString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      }
    );
  };


  return (

    <div className="app">

      {/* Header */}

      <header className="header">

        <div>
          <h1>Expense Tracker</h1>

          <p>
            Manage your monthly finances easily
          </p>
        </div>

        <div className="header-badge">
          Personal Finance
        </div>

      </header>


      {/* Month Selector */}

      <section className="month-selector card">

        <div>

          <span className="section-label">
            Selected Month
          </span>

          <h2>
            {formatMonth(selectedMonth)}
          </h2>

        </div>

        <input
          type="month"
          value={selectedMonth}
          onChange={(e) =>
            setSelectedMonth(
              e.target.value
            )
          }
        />

      </section>


      {/* Summary Cards */}

      <section className="summary-grid">

        <div className="summary-card opening">

          <span>Opening Balance</span>

          <h2>
            {formatCurrency(
              openingBalance
            )}
          </h2>

          <p>
            Previous month balance
          </p>

        </div>


        <div className="summary-card income">

          <span>Monthly Income</span>

          <h2>
            {formatCurrency(
              selectedIncome
            )}
          </h2>

          <p>
            {formatMonth(selectedMonth)}
          </p>

        </div>


        <div className="summary-card expense">

          <span>Monthly Expenses</span>

          <h2>
            {formatCurrency(
              monthlyExpense
            )}
          </h2>

          <p>
            {selectedExpenses.length} transactions
          </p>

        </div>


        <div className="summary-card balance">

          <span>Closing Balance</span>

          <h2>
            {formatCurrency(
              closingBalance
            )}
          </h2>

          <p>
            Available balance
          </p>

        </div>

      </section>


      {/* Manage Income */}

      <section className="card">

        <div className="card-title">

          <h2>Manage Income</h2>

          <p>
            Add or update income for{" "}
            <strong>
              {formatMonth(selectedMonth)}
            </strong>
          </p>

        </div>


        <div className="income-form">

          <input
            type="number"
            placeholder="Enter income amount"
            value={incomeInput}
            onChange={(e) =>
              setIncomeInput(
                e.target.value
              )
            }
          />

          <button
            className="btn-primary"
            onClick={addIncome}
          >
            + Add Income
          </button>

          <button
            className="btn-secondary"
            onClick={setIncome}
          >
            Set Income
          </button>

        </div>

      </section>


      {/* Add Expense */}

      <section className="card">

        <div className="card-title">

          <h2>Add Expense</h2>

          <p>
            Record your monthly spending
          </p>

        </div>


        <form
          className="expense-form"
          onSubmit={addExpense}
        >

          <div className="form-group">

            <label>
              Expense Title
            </label>

            <input
              type="text"
              placeholder="Eg: Grocery shopping"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
            />

          </div>


          <div className="form-group">

            <label>
              Amount
            </label>

            <input
              type="number"
              placeholder="₹ Amount"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
            />

          </div>


          <div className="form-group">

            <label>
              Category
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
            >

              <option>Food</option>
              <option>Housing</option>
              <option>Travel</option>
              <option>Shopping</option>
              <option>Education</option>
              <option>Entertainment</option>
              <option>Health</option>
              <option>Other</option>

            </select>

          </div>


          <div className="form-group">

            <label>
              Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
            />

          </div>


          <button
            type="submit"
            className="add-expense-btn"
          >
            + Add Expense
          </button>

        </form>

      </section>


      {/* Expense History */}

      <section className="card">

        <div className="history-header">

          <div>

            <h2>
              Expense History
            </h2>

            <p>
              Showing expenses for{" "}
              <strong>
                {formatMonth(
                  selectedMonth
                )}
              </strong>
            </p>

          </div>


          <input
            className="search-input"
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>


        {filteredExpenses.length === 0 ? (

          <div className="empty-state">

            <h3>
              No expenses found
            </h3>

            <p>
              Add an expense to see it here.
            </p>

          </div>

        ) : (

          <div className="expense-list">

            {filteredExpenses.map(
              (expense) => (

                <div
                  className="expense-item"
                  key={expense.id}
                >

                  <div className="expense-info">

                    <div className="expense-icon">
                      ₹
                    </div>

                    <div>

                      <h3>
                        {expense.title}
                      </h3>

                      <p>
                        {expense.category}
                        {" • "}
                        {expense.date}
                      </p>

                    </div>

                  </div>


                  <div className="expense-right">

                    <strong>
                      -{" "}
                      {formatCurrency(
                        expense.amount
                      )}
                    </strong>

                    <button
                      onClick={() =>
                        deleteExpense(
                          expense.id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>


      {/* Monthly Calculation */}

      <section className="calculation-card">

        <h2>
          Monthly Calculation
        </h2>

        <div className="calculation-row">

          <span>
            Opening Balance
          </span>

          <strong>
            {formatCurrency(
              openingBalance
            )}
          </strong>

        </div>


        <div className="calculation-row income-row">

          <span>
            + Income
          </span>

          <strong>
            {formatCurrency(
              selectedIncome
            )}
          </strong>

        </div>


        <div className="calculation-row expense-row">

          <span>
            - Expenses
          </span>

          <strong>
            {formatCurrency(
              monthlyExpense
            )}
          </strong>

        </div>


        <div className="calculation-line"></div>


        <div className="calculation-row final-row">

          <span>
            Closing Balance
          </span>

          <strong>
            {formatCurrency(
              closingBalance
            )}
          </strong>

        </div>

      </section>


      <footer>
        Expense Tracker Dashboard • React Project
      </footer>

    </div>
  );
}

export default App;