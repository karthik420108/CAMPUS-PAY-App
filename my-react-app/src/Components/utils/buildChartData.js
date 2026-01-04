import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export const buildChartData = ({ transactions, mode, fromDate, toDate }) => {
  let buckets = [];

  /* DAY — TODAY */
  if (mode === "day") {
    const today = dayjs();

    buckets = Array.from({ length: 24 }, (_, i) => ({
      label: `${i}:00`,
      amount: 0,
    }));

    transactions.forEach((txn) => {
      if (dayjs(txn.createdAt).isSame(today, "day")) {
        const hour = dayjs(txn.createdAt).hour();
        buckets[hour].amount += txn.amount;
      }
    });
  }

  /* WEEK — LAST 7 DAYS */
  if (mode === "week") {
    const start = dayjs().subtract(6, "day").startOf("day");
    const end = dayjs().endOf("day");

    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(start.add(i, "day"));
    }

    buckets = days.map((d) => ({
      label: d.format("ddd"),
      amount: 0,
      date: d.format("YYYY-MM-DD"),
    }));

    transactions.forEach((txn) => {
      const date = dayjs(txn.createdAt).format("YYYY-MM-DD");
      const bucket = buckets.find((b) => b.date === date);
      if (bucket) bucket.amount += txn.amount;
    });
  }

  /* CUSTOM */
  if (mode === "custom" && fromDate && toDate) {
    const start = dayjs(fromDate);
    const end = dayjs(toDate);

    if (start.isSame(end, "day")) {
      buckets = Array.from({ length: 24 }, (_, i) => ({
        label: `${i}:00`,
        amount: 0,
      }));

      transactions.forEach((txn) => {
        if (dayjs(txn.createdAt).isSame(start, "day")) {
          const hour = dayjs(txn.createdAt).hour();
          buckets[hour].amount += txn.amount;
        }
      });
    } else {
      let current = start.clone();

      while (current.isSameOrBefore(end, "day")) {
        buckets.push({
          label: current.format("DD MMM"),
          amount: 0,
          date: current.format("YYYY-MM-DD"),
        });
        current = current.add(1, "day");
      }

      transactions.forEach((txn) => {
        const date = dayjs(txn.createdAt).format("YYYY-MM-DD");
        const bucket = buckets.find((b) => b.date === date);
        if (bucket) bucket.amount += txn.amount;
      });
    }
  }

  return buckets.map(({ label, amount }) => ({ label, amount }));
};
