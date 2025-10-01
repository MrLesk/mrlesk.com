---
layout: default
section: PRD
---

# What are we building?

A simple Rock, Paper, Scissors HTML5 game with AI opponent.

<a v-click :href="chatHref"  target="_blank"  rel="noopener"  class="btn">Go to ChatGPT Canvas -></a>

<script setup>
const prdSpec = `
We are here live at Vienna AI Engineering Meetup doing a demo of new AI Agent capabilities.
Your goal is to create a Canvas with a very minimal PRD from the document below. If anything is not clear please search on the internet.
Also some technologies might have changed so please check the latest best practices.
We need to build it in 30 minutes so skip any non-essential details.
The PRD should be enough for an AI Agent to build a working web application using the latest version of the technologies below.

## **Important**: The PRD should never include code. The focus is on the WHY and WHAT, not the HOW.

Project Goal: Rock Paper Scissors Game

Build a full-stack web application using SvelteKit and TypeScript that lets a user play "Rock Paper Scissors" against the computer. The application should track player scores and display a public scoreboard.

1. Core Technology Stack
    * Framework: Svelte & SvelteKit
    * Local only: all logic is client-side;
    * Language: TypeScript
    * Package Manager: bun
    * Styling: Tailwind CSS
    * Linting/Formatting: Biome
    * UI: The application should have a modern and clean design, using Flowbite icons whenever possible

2. State Management & Data
    * No Database: Do not use an external database (like Postgres, SQLite, etc.).
    * In-Memory Storage: All application state, including player names and their scores, must be stored in the browser. This data will be reset if the page reloads.

3. User Identification
    * No Authentication: Do not implement a formal username/password authentication system.
    * Session Tracking: Use a simple cookie to identify a user's session. When a user first visits, generate a unique ID for them and store it in a cookie so they are recognized on subsequent visits in the same browser.
    * Player Name: Before a user can play, they must enter a name. This name should be associated with their session ID.

4. Game Logic
    * Gameplay: The user plays against the computer.
    * Choices: The valid choices are "Rock", "Paper", and "Scissors". The computer should make a random choice for each round.
    * Rounds: A single game consists of multiple rounds.
    * Winning a Game: A player wins a "game" by being the first to win 2 rounds. The game is played as a "best 2 out of 3".
    * Scoring:
        * The user starts with 0 points.
        * If the user wins a full game (best of 3), add 10 points to their score.
        * If the user loses a full game (best of 3), subtract 10 points from their score.
        * A draw in a round does not count as a win for either player. If a game ends in a tie (e.g., each wins 1 round and there are multiple draws), there is no change in score.

5. Required Pages & UI Components
    A. Main Game Page (Route: /)
        1. Name Input:
            * If the user has not yet provided a name for their session, display a simple form with a text input for their name and a "Start Playing" button.
        2. Game Interface (show this after name is submitted):
            * Display the current player's name and their total score (e.g., "Player: Alice | Score: 20").
            * Show the current game's score (e.g., "Round Score: Player 1 - 0 Computer").
            * Provide three buttons for the user to make a choice: "Rock", "Paper", "Scissors".
            * Display the user's choice and the computer's choice after a round is played.
            * Display the result of each round (e.g., "You win this round!", "You lose this round!", "It's a draw!").
            * When a full game (best of 3) is complete, display a clear message declaring the winner (e.g., "You won the game! +10 points").
            * Include a link to navigate to the Scoreboard page.
    B. Scoreboard Page (Route: /scoreboard)
        1. Top Players List:
            * This page should display a list of the top 10 players sorted by their score in descending order.
            * The list should be presented in a clean table or formatted list showing: Rank, Player Name, and Score.
            * Include a link to navigate back to the Main Game Page.`.trim();

const chatHref = `https://chat.openai.com?q=${encodeURIComponent(prdSpec)}&hints=canvas`
</script>
