import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Modal } from "./Modal";

describe("Modal", () => {
  it("nie renderuje się gdy open=false", () => {
    render(
      <Modal open={false} onClose={vi.fn()} title="Szczegóły">
        Treść
      </Modal>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("zamyka się po ESC", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Modal open onClose={onClose} title="Szczegóły">
        <button type="button">Akcja</button>
      </Modal>,
    );

    await user.keyboard("{Escape}");

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("zamyka się po kliknięciu backdropu", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Modal open onClose={onClose} title="Szczegóły">
        Treść
      </Modal>,
    );

    await user.click(screen.getByRole("dialog"));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
