import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { UsernameForm } from "./username-form";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/lib/server/loginname", () => ({
  sendLoginname: vi.fn(),
}));

describe("UsernameForm", () => {
  afterEach(cleanup);

  test("should autofocus the loginName input on mount", () => {
    const { getByTestId } = render(
      <UsernameForm loginName="" requestId={undefined} loginSettings={undefined} submit={false} allowRegister={false} />,
    );
    expect(getByTestId("username-text-input")).toHaveFocus();
  });

  test("should place the question and register button in a row below back and continue", () => {
    const { getByTestId, getByText } = render(
      <UsernameForm loginName="" requestId={undefined} loginSettings={undefined} submit={false} allowRegister={true} />,
    );
    const registerButton = getByTestId("register-button");
    const question = getByText("noAccount");
    const submitButton = getByTestId("submit-button");

    expect(question.parentElement).toBe(registerButton.parentElement);
    expect(submitButton.parentElement?.contains(registerButton)).toBe(false);
  });

  test("should open the register page with the organization and request id", () => {
    const { getByTestId } = render(
      <UsernameForm
        loginName=""
        requestId="request-1"
        organization="org-1"
        loginSettings={undefined}
        submit={false}
        allowRegister={true}
      />,
    );
    fireEvent.click(getByTestId("register-button"));

    expect(push).toHaveBeenCalledWith("/register?organization=org-1&requestId=request-1");
  });

  test("should not render the register button or its question when registration is not allowed", () => {
    const { queryByTestId, queryByText } = render(
      <UsernameForm loginName="" requestId={undefined} loginSettings={undefined} submit={false} allowRegister={false} />,
    );
    expect(queryByTestId("register-button")).toBeNull();
    expect(queryByText("noAccount")).toBeNull();
  });
});
