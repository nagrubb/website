function NaSole(document, window, debug = false) {
  this.onresize = function(e) {
    this.height = $(window).height();
    this.width = $(window).width();
    this.editArea.style.height = (this.height - 1) + "px";
    this.editArea.style.width = (this.width - 2) + "px";
  };

  this.appendConsole = function(str) {
    this.editArea.value += str;
    this.editArea.scrollTop = this.editArea.scrollHeight;
  }

  this.keyDownHandler = function(e) {
    if (e.code == 'Enter' || e.which == 13) {
        this.appendConsole('\n');
      if (this.executeCommand()) {
        this.showPrompt();
      } else {
        //we could do a cool progress bar
      }
    } else if (e.code == 'Shift' || e.code == 'ShiftLeft' || e.code == 'ShiftRight' || e.which == 16) {
      //ignore
    } else if (e.code == 'Backspace' || e.which == 8) {
      if (this.currentCommand != "") {
        this.currentCommand = this.currentCommand.slice(0, -1);
        this.editArea.value = this.editArea.value.slice(0, -1);
      }
    } else {
      if (e.which in this.specialKeys) {
        if (!e.shiftKey) {
          char = this.specialKeys[e.which][0];
        } else {
          char = this.specialKeys[e.which][1];
        }
      } else {
        char = String.fromCharCode(e.which);

        if (!e.shiftKey) {
          char = char.toLowerCase();
        }
      }

      this.currentCommand += char;
      this.appendConsole(char);
    }

    this.editArea.scrollTop = this.editArea.scrollHeight;
  };

  this.showTitle = function() {
      title =
        "\n" +
        "\n" +
        "\n" +
        " __    __    __    __     _______           _________      .__              __    __    __    __ \n" +
        " \\ \\   \\ \\   \\ \\   \\ \\    \\      \\ _____   /   _____/ ____ |  |   ____     / /   / /   / /   / / \n" +
        "  \\ \\   \\ \\   \\ \\   \\ \\   /   |   \\\\__  \\  \\_____  \\ /  _ \\|  | _/ __ \\   / /   / /   / /   / /  \n" +
        "  / /   / /   / /   / /  /    |    \\/ __ \\_/        (  <_> )  |_\\  ___/   \\ \\   \\ \\   \\ \\   \\ \\  \n" +
        " /_/   /_/   /_/   /_/   \\____|__  (____  /_______  /\\____/|____/\\___  >   \\_\\   \\_\\   \\_\\   \\_\\ \n" +
        "                                 \\/     \\/        \\/                 \\/                          \n" +
        "\n" +
        "\n" +
        "\n";

      this.appendConsole(title);
  }

  this.showPrompt = function(afterNewLine = true) {
    this.appendConsole("ns />");
  };

  this.executeCommand = function() {
    if (this.currentCommand == "") {
      return true;
    }

    if (this.pendingCommand) {
      return false;
    }

    cmd = this.currentCommand.split(" ")[0]

    if (cmd in this.shortcuts) {
      cmd = this.shortcuts[cmd];
    }

    if (cmd in this.commandHandlers) {
      if (this.commandHandlers[cmd](this.currentCommand) == false) {
        this.pendingCommand = true;
        return false;
      }
    } else {
      this.appendConsole("-nasole: " + cmd + ": command not found\n");
    }
    this.currentCommand = "";
    return true;
  };

  this.showHelp = function() {
    var col = 1;
    var needNewLine = true;

    for (cmd in this.commandHandlers) {
      if (col % 4 == 0) {
        col = 1;
        this.appendConsole(cmd + "\n");
        needNewLine = false;
      } else {
        col += 1;
        filler = 20 - cmd.length;

        var extra = "";
        for (i = 0; i <= filler; ++i) {
          extra += " ";
        }

        this.appendConsole(cmd + extra);
        needNewLine = true;
      }
    }

    if (needNewLine) {
      this.appendConsole("\n");
    }
  };

  this.showVersion = function() {
    this.appendConsole("NaSole version 1.0\n");
  };

  this.showShortcuts = function() {
    for (shortcut in this.shortcuts) {
      this.appendConsole(shortcut + " -> " + this.shortcuts[shortcut] + "\n");
    }
  }

  this.addCommandHandler = function(name, func) {
    if (name in this.commandHandlers) {
      throw new Error("Command Handler already registered");ß
    }

    this.commandHandlers[name] = func;
  };

  this.addShortcut = function(shortcut, command) {
    if (shortcut in this.shortcuts) {
      throw new Error("Shortcut already in use");
    }

    if (!name in this.commandHandlers) {
      throw new Error("Command does not exist");
    }

    this.shortcuts[shortcut] = command;
  };

  this.completeCommand = function() {
    this.pendingCommand = false;
    this.currentCommand = "";
    this.showPrompt();
  }

  this.focus = function() {
    this.editArea.focus();
  };

  this.document = document;
  this.debug = debug;
  this.editArea = document.getElementById("console");
  this.currentCommand = "";
  this.pendingCommand = false;

  this.specialKeys = {
    191 : '/?',
    186 : ':;',
    222 : '\'\"'
  };

  this.commandHandlers = {
    'help' : this.showHelp.bind(this),
    'version' : this.showVersion.bind(this),
    'shortcuts' : this.showShortcuts.bind(this)
  };

  this.shortcuts = {
    'h' : 'help',
    'v' : 'version'
  }

  this.document.addEventListener("keydown", this.keyDownHandler.bind(this), false);
  this.document.addEventListener("onresize", this.onresize.bind(this), false);
  window.onresize = this.onresize.bind(this);

  this.onresize();
  this.editArea.focus();
  this.showTitle();
  this.showPrompt(true);

}
