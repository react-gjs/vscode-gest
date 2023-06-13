import { Config } from "../../src/config";
import { Parser } from "../../src/parser/parser";
import { ProgramContext } from "../../src/program";

jest.mock(
  "vscode",
  () => ({
    workspace: {
      getConfiguration: () => ({ get: () => null }),
    },
  }),
  { virtual: true }
);

const contextMock = {
  config: new Config(),
} as ProgramContext;

describe("Parser", () => {
  it("should properly parse a test file", () => {
    const fileContent = /* ts */ `
import { describe, it, expect } from "gest";

export default describe("top level describe", () => {
    it("top level it", () => {});

    describe("nested describe", () => {
        it("nested it", () => {});

        describe("nested describe level 2", () => {
            it("nested it level 2", () => {});
        });
    });
});

`;

    const parsed = new Parser(contextMock).parse({
      getText: () => fileContent,
    } as any);

    expect(parsed).toHaveLength(6);
    expect(parsed).toContainEqual({
      name: "top level describe",
      start: expect.any(Number),
      end: expect.any(Number),
    });
    expect(parsed).toContainEqual({
      name: "top level describe > top level it",
      start: expect.any(Number),
      end: expect.any(Number),
    });
    expect(parsed).toContainEqual({
      name: "top level describe > nested describe",
      start: expect.any(Number),
      end: expect.any(Number),
    });
    expect(parsed).toContainEqual({
      name: "top level describe > nested describe > nested it",
      start: expect.any(Number),
      end: expect.any(Number),
    });
    expect(parsed).toContainEqual({
      name: "top level describe > nested describe > nested describe level 2",
      start: expect.any(Number),
      end: expect.any(Number),
    });
    expect(parsed).toContainEqual({
      name: "top level describe > nested describe > nested describe level 2 > nested it level 2",
      start: expect.any(Number),
      end: expect.any(Number),
    });
  });
});
