import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link, MemoryRouter } from "react-router-dom";

import { Button } from "./Button";

describe("Button", () => {
  it("obsługuje kliknięcie", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(<Button onClick={onClick}>Kliknij</Button>);

    await user.click(screen.getByRole("button", { name: "Kliknij" }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renderuje jako child przez Slot", () => {
    render(
      <MemoryRouter>
        <Button asChild>
          <Link to="/">Start</Link>
        </Button>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Start" })).toBeInTheDocument();
  });
});
