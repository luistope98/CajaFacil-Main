import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/app/theme";
import RegisterStats from "./RegisterStats";
import type { RegisterRangeSummary } from "@/src/services/registerService";

function renderStats(totalRegisters: number, summary: RegisterRangeSummary) {
  return render(
    <ThemeProvider theme={theme}>
      <RegisterStats totalRegisters={totalRegisters} summary={summary} />
    </ThemeProvider>
  );
}

describe("RegisterStats", () => {
  it("renders totalRegisters and the range-wide summary values passed in as props", () => {
    const summary: RegisterRangeSummary = { totalIncome: 7500, totalExpense: 1000, net: 6500, itemsSold: 8 };
    renderStats(12, summary);

    expect(screen.getByText("12")).toBeInTheDocument(); // Registros
    expect(screen.getByText("8")).toBeInTheDocument(); // Items vendidos
    expect(screen.getByText(`$${summary.totalIncome.toLocaleString("es-CO")}`)).toBeInTheDocument();
    expect(screen.getByText(`$${summary.totalExpense.toLocaleString("es-CO")}`)).toBeInTheDocument();
    expect(screen.getByText(`$${summary.net.toLocaleString("es-CO")}`)).toBeInTheDocument();
  });

  it("prefixes a negative net with a minus sign and shows the absolute value", () => {
    const summary: RegisterRangeSummary = { totalIncome: 1000, totalExpense: 5000, net: -4000, itemsSold: 2 };
    renderStats(3, summary);

    expect(screen.getByText(`-$${Math.abs(summary.net).toLocaleString("es-CO")}`)).toBeInTheDocument();
  });

  it("never derives its numbers from a registers list — it only reads the summary/totalRegisters props", () => {
    // Regression guard for the Fase 5 fix: stats used to be computed client-side
    // from a paginated `registers` array, which only reflected the current page.
    const summary: RegisterRangeSummary = { totalIncome: 999999, totalExpense: 0, net: 999999, itemsSold: 500 };
    renderStats(9999, summary);

    expect(screen.getByText("9999")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
  });
});
