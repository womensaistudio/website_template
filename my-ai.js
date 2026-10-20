// ===================================================================
//  🤖  MY AI  (Part 2: Backend)
//
//  You don't need this file until Part 2!
//
//  This file tells the AI how to behave on your website. Describe
//  your AI's job in plain English. The backend (server.js) sends
//  these settings plus whatever your visitor typed to the AI.
//
//  ⚠️ Same rules as my-website.js: only change text inside the
//  "quotation marks", and keep the commas.
// ===================================================================

const MY_AI = {

  // Which AI company your API key is from:  "openai"  or  "anthropic"
  provider: "openai",

  // Which AI model to use. Good, cheap starting points:
  //   openai:     "gpt-5-mini"
  //   anthropic:  "claude-haiku-4-5"
  model: "gpt-5-mini",

  // ⭐ THE MOST IMPORTANT PART ⭐
  // Instructions for your AI, in plain English. Tell it:
  //   - who it is
  //   - what it should do with what the visitor types
  //   - what the answer should look like
  //   - anything it should NOT do
  instructions: "You are Study Buddy, a friendly study helper for college students. The visitor will tell you a topic they are studying. Reply with three short sections: Key ideas (2-3 sentences), a fun Memory trick, and one Practice question. Use simple words and be encouraging. If the topic isn't something you can study, kindly ask them for a school topic instead.",

  // How long should answers be?   "short"   "medium"   "long"
  answerLength: "short",

  // How creative should it be?   "focused"   "balanced"   "wild"
  // (Some OpenAI models ignore this setting, and that's okay.)
  creativity: "balanced",

};

module.exports = MY_AI;   // 🚫 Don't change this line!
