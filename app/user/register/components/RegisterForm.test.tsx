import { render, screen, fireEvent, within } from "@testing-library/react";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/app/theme";
import RegisterForm from "./RegisterForm";
import type { Register } from "../types/register.types";

const fmtCOP = (n: number) => `$${Math.round(n).toLocaleString("es-CO")}`;

function renderForm(props: Partial<React.ComponentProps<typeof RegisterForm>> = {}) {
  const onSubmit = jest.fn();
  const onCancel = jest.fn();
  render(
    <ThemeProvider theme={theme}>
      <RegisterForm onSubmit={onSubmit} onCancel={onCancel} overridePosId={10} {...props} />
    </ThemeProvider>
  );
  return { onSubmit, onCancel };
}

describe("RegisterForm — PURCHASE registers are not editable here (Fase 5 fix)", () => {
  it("shows a block message instead of the form and calls onCancel from its Cerrar button", () => {
    const purchaseRegister = {
      id: 1, type: "PURCHASE", description: "Compra", paymentMethod: "CASH", state: "COMPLETED",
      total: 14280, subtotal: 12000, tax: 2280, posId: 10, userId: 1, items: [],
      createdAt: "2026-01-01", updatedAt: "2026-01-01",
    } as unknown as Register;

    const { onCancel } = renderForm({ initialRegister: purchaseRegister });

    expect(screen.getByText(/compra de inventario/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /cerrar/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

describe("RegisterForm — type selector", () => {
  it("only offers Ingreso and Egreso, never Compra", () => {
    renderForm();

    fireEvent.mouseDown(screen.getByLabelText("Tipo"));
    const listbox = screen.getByRole("listbox");
    expect(within(listbox).getByText("Ingreso")).toBeInTheDocument();
    expect(within(listbox).getByText("Egreso")).toBeInTheDocument();
    expect(within(listbox).queryByText("Compra")).not.toBeInTheDocument();
  });

  it("switches to the manual expense amount field when Egreso is selected", () => {
    renderForm();

    fireEvent.mouseDown(screen.getByLabelText("Tipo"));
    fireEvent.click(within(screen.getByRole("listbox")).getByText("Egreso"));

    expect(screen.getByLabelText(/monto del egreso/i)).toBeInTheDocument();
    expect(screen.queryByText(/escanear código de barras/i)).not.toBeInTheDocument();
  });
});

describe("RegisterForm — totals mirror the backend tax formula", () => {
  it("shows subtotal, IVA and total computed from the pre-loaded items", () => {
    // price 3000, taxRate 19%, qty 2 -> subtotal 6000, IVA 1140, total 7140 (same case as the backend e2e suite)
    const register = {
      id: 5, type: "INCOME", description: "Venta", paymentMethod: "CASH", state: "COMPLETED",
      total: 7140, subtotal: 6000, tax: 1140, posId: 10, userId: 1,
      items: [{ productId: 1, quantity: 2, price: 3000, taxRate: 19, totalItem: 7140, name: "Gaseosa" }],
      createdAt: "2026-01-01", updatedAt: "2026-01-01",
    } as unknown as Register;

    renderForm({ initialRegister: register });

    expect(screen.getByDisplayValue(fmtCOP(6000))).toBeInTheDocument(); // Base gravable (sin IVA)
    expect(screen.getByDisplayValue(fmtCOP(1140))).toBeInTheDocument(); // IVA
    expect(screen.getByDisplayValue(fmtCOP(7140))).toBeInTheDocument(); // Total
  });
});
