import { Helicorder } from "../../helicorder";

describe("Helicorder", () => {
  it("should render", () => {
    const dom = document.createElement("canvas");
    const helicorder = new Helicorder(dom);
    expect(helicorder).toBeDefined();
  });

  it("should set the width and height", () => {
    const dom = document.createElement("canvas");
    dom.width = 100;
    dom.height = 200;

    const helicorder = new Helicorder(dom);
    expect(helicorder.width).toBe(100);
    expect(helicorder.height).toBe(200);
  });

  it("should set initial channel", () => {
    const dom = document.createElement("canvas");
    const helicorder = new Helicorder(dom, {
      channel: { id: "testChannel", label: "Test Channel" },
    });
    expect(helicorder.getChannel().id).toBe("testChannel");
    expect(helicorder.getChannel().label).toBe("Test Channel");
  });
});
