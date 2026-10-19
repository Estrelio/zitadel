import { registerUser } from "@/lib/server/register";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { create } from "@zitadel/client";
import { LegalAndSupportSettingsSchema } from "@zitadel/proto/zitadel/settings/v2/legal_settings_pb";
import { LoginSettings, LoginSettingsSchema, PasskeysType } from "@zitadel/proto/zitadel/settings/v2/login_settings_pb";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { RegisterForm } from "./register-form";

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/lib/server/register", () => ({
  registerUser: vi.fn(),
}));

vi.mock("@/lib/client-utils", () => ({
  handleServerActionResponse: vi.fn(),
}));

const defaultLegal = create(LegalAndSupportSettingsSchema, {});

const chooserSettings: LoginSettings = create(LoginSettingsSchema, {
  allowLocalAuthentication: true,
  passkeysType: PasskeysType.ALLOWED,
});

function fillRequiredFields(getByTestId: (testId: string) => HTMLElement) {
  fireEvent.change(getByTestId("firstname-text-input"), { target: { value: "Ada" } });
  fireEvent.change(getByTestId("lastname-text-input"), { target: { value: "Lovelace" } });
  fireEvent.change(getByTestId("email-text-input"), { target: { value: "ada@example.com" } });
}

describe("RegisterForm", () => {
  beforeEach(() => {
    push.mockClear();
    vi.mocked(registerUser).mockClear();
  });
  afterEach(cleanup);

  test("should autofocus the firstname input on mount", () => {
    const { getByTestId } = render(<RegisterForm legal={defaultLegal} organization="org-1" idpCount={0} />);
    expect(getByTestId("firstname-text-input")).toHaveFocus();
  });

  test("should list password before passkey and preselect password when both are allowed", () => {
    const { getByTestId } = render(
      <RegisterForm legal={defaultLegal} organization="org-1" idpCount={0} loginSettings={chooserSettings} />,
    );
    const password = getByTestId("password-radio");
    const passkey = getByTestId("passkey-radio");

    expect(password.compareDocumentPosition(passkey) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(password.getAttribute("aria-checked")).toBe("true");
    expect(passkey.getAttribute("aria-checked")).toBe("false");
  });

  test("should continue to the password flow with the default selection", async () => {
    const { getByTestId } = render(
      <RegisterForm legal={defaultLegal} organization="org-1" idpCount={0} loginSettings={chooserSettings} />,
    );
    fillRequiredFields(getByTestId);
    const submit = getByTestId("submit-button");
    await waitFor(() => expect(submit).not.toBeDisabled());

    fireEvent.click(submit);

    await waitFor(() => expect(push).toHaveBeenCalledWith(expect.stringMatching(/^\/register\/password\?/)));
    expect(registerUser).not.toHaveBeenCalled();
  });

  test("should start passkey registration when passkey is chosen", async () => {
    const { getByTestId } = render(
      <RegisterForm legal={defaultLegal} organization="org-1" idpCount={0} loginSettings={chooserSettings} />,
    );
    fillRequiredFields(getByTestId);
    fireEvent.click(getByTestId("passkey-radio"));
    const submit = getByTestId("submit-button");
    await waitFor(() => expect(submit).not.toBeDisabled());

    fireEvent.click(submit);

    await waitFor(() => expect(registerUser).toHaveBeenCalledTimes(1));
    expect(push).not.toHaveBeenCalled();
  });
});
