import { describe, it, expect, vi, beforeEach } from "vitest";

describe("CommandPalette", () => {
  let CommandPalette;
  let filteredCommands;
  let commandPaletteSelectedIdx;

  beforeEach(() => {
    filteredCommands = [];
    commandPaletteSelectedIdx = 0;

    CommandPalette = {
      commands: [],

      register(command) {
        if (!command || !command.id || !command.label || typeof command.action !== "function")
          return;
        this.commands.push(command);
      },

      search(query) {
        const q = query.toLowerCase().trim();
        filteredCommands = this.commands.filter(cmd => cmd.label.toLowerCase().includes(q));
        commandPaletteSelectedIdx = 0;
      },

      executeCommand(cmd) {
        if (cmd && typeof cmd.action === "function") {
          try {
            cmd.action();
          } catch (err) {
            console.error(err);
          }
        }
      },
    };
  });

  it("register adds a valid command", () => {
    CommandPalette.register({
      id: "test-cmd",
      label: "Test Command",
      action: () => {},
    });
    expect(CommandPalette.commands).toHaveLength(1);
    expect(CommandPalette.commands[0].id).toBe("test-cmd");
  });

  it("register rejects commands without required fields", () => {
    CommandPalette.register({ id: "no-action" });
    CommandPalette.register({ label: "no-id" });
    CommandPalette.register({});
    expect(CommandPalette.commands).toHaveLength(0);
  });

  it("search filters commands by label", () => {
    CommandPalette.register({ id: "run", label: "Run Code", action: () => {} });
    CommandPalette.register({ id: "reset", label: "Reset Code", action: () => {} });
    CommandPalette.register({ id: "theme", label: "Toggle Theme", action: () => {} });

    CommandPalette.search("code");
    expect(filteredCommands).toHaveLength(2);

    CommandPalette.search("theme");
    expect(filteredCommands).toHaveLength(1);
    expect(filteredCommands[0].id).toBe("theme");
  });

  it("search returns empty array for no match", () => {
    CommandPalette.register({ id: "run", label: "Run Code", action: () => {} });
    CommandPalette.search("zzzzz");
    expect(filteredCommands).toHaveLength(0);
  });

  it("executeCommand calls the action function", () => {
    const action = vi.fn();
    CommandPalette.register({ id: "test", label: "Test", action });
    CommandPalette.executeCommand(CommandPalette.commands[0]);
    expect(action).toHaveBeenCalledOnce();
  });

  it("executeCommand handles errors gracefully", () => {
    const action = vi.fn(() => {
      throw new Error("fail");
    });
    CommandPalette.register({ id: "fail", label: "Fail", action });
    expect(() => CommandPalette.executeCommand(CommandPalette.commands[0])).not.toThrow();
  });
});
