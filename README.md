# ✨ Build Your Own AI Website — Women’s AI Studio

A starter template for your very own AI-powered website. You don’t need to know how to code: you design your site by filling in plain text, and the template does the rest.

- **Part 1: Frontend.** Fill in `my-website.js` to give your site a name, colors, and an AI box. Answers are pretend for now.
- **Part 2: Backend.** Fill in `my-ai.js` to tell a real AI what to do, add an API key, and your website starts giving real answers.

---

## What’s in here

| File | What it is | Do you edit it? |
|---|---|---|
| `my-website.js` | Your site’s words, colors, and AI box | ✏️ **Yes, Part 1** |
| `my-ai.js` | Instructions for your AI | ✏️ **Yes, Part 2** |
| `index.html` | The page structure (the skeleton) | No |
| `style.css` | How the page looks (colors, fonts, spacing) | No (but you can peek!) |
| `app.js` | Makes the page work: buttons, answers | No |
| `server.js` | The backend: talks to the AI | No |

**Frontend** = everything you see in the browser (`index.html`, `style.css`, `app.js`, `my-website.js`).
**Backend** = the part that runs on a computer and talks to the AI (`server.js`, `my-ai.js`).

---

## Part 1: Design your website (frontend)

### 1. Make your own copy
On the template’s GitHub page, click **Use this template → Create a new repository**. Name it (like `study-buddy`), set it to **Public**, and click **Create repository**.

### 2. Clone it to your computer
On **your** new repo, click the green **Code** button and copy the link. Then:
```bash
cd ~/Desktop
git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
cd YOUR-REPO-NAME
```

### 3. Open your website
- **Mac:** `open index.html`
- **Windows (Git Bash):** `start index.html`

### 4. Make it yours
Open `my-website.js` in a text editor:
- **Mac:** `open -e my-website.js` (TextEdit)
- **Windows:** `notepad my-website.js`

Change the text inside the quotation marks, **save**, and **refresh** your browser. Repeat until you love it!

> **Rules so nothing breaks:** only change text *inside* the `"quotation marks"`, keep the comma at the end of every line, and use `'` instead of `"` inside your text. If you break something, the page tells you what to check.

### 5. Save it to GitHub
```bash
git add my-website.js
git commit -m "Designed my website"
git push
```

### 6. Bonus: put it on the internet 🌍
On your repo on GitHub: **Settings → Pages**. Under **Branch**, pick **main** and **/(root)**, then **Save**. After a minute your site is live at:
```
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
```
Every time you `git push`, the live site updates. (It stays in demo mode online, since the real AI needs the backend from Part 2.)

---

## Part 2: Connect a real AI (backend)

### 1. Describe your AI
Open `my-ai.js` and fill it in:
- `provider` and `model`: which AI to use (match the company your API key is from)
- `instructions`: **the most important part.** Explain in plain English who your AI is, what to do with what people type, and what the answer should look like
- `answerLength`: `"short"`, `"medium"` or `"long"`
- `creativity`: `"focused"`, `"balanced"` or `"wild"`

### 2. Add your API key
An API key is like a password that lets your backend use the AI. Make a file called `api-key.txt` in your project folder and paste the key inside:
```bash
nano api-key.txt
```
Paste the key, then save (`Ctrl + O`, `Enter`) and exit (`Ctrl + X`).

> 🔒 **Never put your API key on GitHub.** This template’s `.gitignore` file keeps `api-key.txt` out of your commits. Don’t rename it, and never paste your key into any other file.

### 3. Start the backend
```bash
node server.js
```
Open **http://localhost:3000**. The note next to your button should say **Connected to AI**. Try it!

Change `my-ai.js` anytime: just save and ask again (no restart needed). Stop the server with `Ctrl + C`.

### 4. Save your work
```bash
git add my-ai.js
git commit -m "Connected my AI"
git push
```

---

## Need an idea?

- 🍳 **Fridge Chef:** type what’s in your fridge, get a recipe
- 💌 **Compliment Machine:** type a friend’s name and something they love, get a sweet compliment
- 🐶 **Pet Namer:** describe a pet, get five perfect names
- ✈️ **Weekend Planner:** type a city, get a fun 2-day plan
- 📚 **Study Buddy:** type a topic, get a mini study guide
- 🎤 **Hype Woman:** type something you’re nervous about, get a pep talk
- 👗 **Outfit Helper:** describe the weather and the event, get an outfit idea
- 🎬 **Movie Matchmaker:** describe your mood, get three movie picks

---

## Something went wrong?

| Problem | Fix |
|---|---|
| Page says “Oops! There’s a typo” | Check quotes and commas in `my-website.js` |
| My changes don’t show up | Did you **save** the file? Then refresh the browser |
| Says “Demo mode” in Part 2 | Is `api-key.txt` in the same folder as `server.js`? Is `node server.js` running? |
| “didn’t accept your API key” | Check the key, and that `provider` matches the company the key is from |
| “doesn’t know that model name” | Check the spelling of `model` in `my-ai.js` |
| `address already in use` | The server is already running in another window. Use that one, or press `Ctrl + C` there |
