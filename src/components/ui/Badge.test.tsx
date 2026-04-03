import { render, screen } from "@testing-library/react";

import { Badge } from "./Badge";

describe("Badge", () => {
  it("renderuje treść i wariant", () => {
    render(<Badge variant="success">Gotowe</Badge>);

    const element = screen.getByText("Gotowe");
    expect(element).toBeInTheDocument();
    expect(element.className).toContain("emerald");
  });
});
