const { Listener } = require("gcommands");
const xpUser = require("../schemas/xpUser");
const { addRandomXP } = require("../utils/addRandomXP");

new Listener({
  name: "giveXP",
  event: "messageCreate",
  run: async (ctx) => {
    // If the author of the message is a bot, return
    if (ctx.author.bot) return;

    // 1) Remove *all* whitespace (including newlines, tabs, etc.)
    const stripped = ctx.content.replace(/\s+/g, "");

    // 2) Regex to match only emojis (custom or Unicode)
    const onlyEmojisRegex = new RegExp(
      [
        "^",
        // Repeat one or more of:
        "(?:",
        // (a) Custom Discord emoji <a:name:id> or <:name:id>
        "<a?:\\w+:\\d+>",
        "|",
        // (b) Single pictographic codepoint (plus ZWJ or variation selectors)
        "[\\p{Extended_Pictographic}\\u200d\\uFE0F]",
        "|",
        // (c) Two regional indicators in a row => a flag (🇺🇸 etc.)
        "(?:[\\uD83C][\\uDDE6-\\uDDFF]){2}",
        ")+",
        "$",
      ].join(""),
      "u"
    );

    // 3) Final check
    if (onlyEmojisRegex.test(stripped)) {
      return;
    }

    // Get the user from the database
    xpUser.findById(`${ctx.author.id}_${ctx.guild.id}`).then(async (user) => {
      // If the user is not in the database, create a new user
      if (!user) {
        user = new xpUser({
          _id: `${ctx.author.id}_${ctx.guild.id}`,
          current_xp: 0,
          current_level: 0,
          rankCard: {
            background: "#222222",
            progressBarColor: ctx.member.displayHexColor,
            unlockedBackgrounds: [],
          },
        });
      }

      await addRandomXP(user, ctx);
    });
  },
});
