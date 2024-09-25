import { expect, test } from "vitest";
import { SelectionWindowModel } from "../src/helicorder/selectionWindow/selectionWindowModel";
import { ONE_MINUTE } from "../src/util/time";

test("sets window correctly", () => {
  const window = new SelectionWindowModel();
  window.setSize(10);
  window.setStartTime(0);
  expect(window.getWindow()).toEqual([0, 10 * ONE_MINUTE]);
});
