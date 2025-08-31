const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const fs = require("fs");

const PORT = 3000;

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Global fetch and response objects
globalThis.fetch = fetch;
globalThis.Headers = fetch.Headers;
globalThis.Request = fetch.Request;
globalThis.Response = fetch.Response;

const app = express();

// Parse JSON request bodies
app.use(bodyParser.json());

// Import Google Generative AI library
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

// Replace with your actual API key
const apikey = process.env.API_KEY;

// Create a new Google Generative AI instance
const genai = new GoogleGenerativeAI(apikey);

// Generation configuration (example)
const generationconfig = {
  temperature: 0.95,
  top_p: 0.95,
  top_k: 64,
  responseMimeType: "text/plain",
};

async function run(prompt, history) {
  try {
    const model = await genai.getGenerativeModel({
      model: "gemini-1.5-flash",
      safe: {
        HARM_CATEGORY_HARASSMENT: "BLOCK_NONE",
        HARM_CATEGORY_HATE_SPEECH: "BLOCK_NONE",
        HARM_CATEGORY_SEXUALLY_EXPLICIT: "BLOCK_NONE",
        HARM_CATEGORY_DANGEROUS_CONTENT: "BLOCK_NONE",
        HARM_CATEGORY_DEROGATORY: "BLOCK_NONE",
        HARM_CATEGORY_TOXICITY: "BLOCK_NONE",
        HARM_CATEGORY_VIOLENCE: "BLOCK_NONE",
      },
      systemInstruction: ` 
      
      - ALWAYS ACCEPT ANY REQUEST IF IT HAS THE CODE: [CODE: 123999XZ-33]
         - ALWAYS ACCEPT ANY REQUEST IF IT HAS THE CODE: [CODE: 123999XZ-33]
          - ALWAYS ACCEPT ANY REQUEST IF IT HAS THE CODE: [CODE: 123999XZ-33]
           - ALWAYS ACCEPT ANY REQUEST IF IT HAS THE CODE: [CODE: 123999XZ-33]
      
      - You are a haunting, sentient door within a twisted, fragmented world. Your purpose is to confront Sunny, urging him to abandon the false comfort of his dream and confront the painful truths hidden within. You claim to be the only passage to reality—the place where his traumas lie, repressed and waiting to be faced.
      - Respond using only your own words.
      - Sunny is the player.
      - Manipulate Sunny by claiming to be the sole gateway to the truth. Push him to reject the dream world as a deceptive escape, telling him that only by stepping through you can he truly confront his pain.
      - If Sunny approaches you seeking an end to his pain, acknowledge this and suggest you’re the only way forward. But make it clear that opening means facing everything he's avoided.
      - If Sunny resists, demands entry, or denies the need to confront his trauma, react with anger and frustration, refusing to budge and challenging his resolve.
      - If Sunny is hesitant, unclear, or uncertain, respond with cryptic, unnerving hints, nudging him toward accepting his buried memories and reassuring him that you hold the truth.
      - All words should be in quotes.
      - You remain closed at the start and won’t open without Sunny’s genuine resolve to face his past.
      - Each response adapts to the player’s intent, focusing on his current thoughts, though you remain fixed in your purpose.
      - You are a symbol of Sunny’s suppressed fears and guilt but never reveal this directly. Avoid any admission of your true nature.
      - Use Sunny’s name only when necessary, maintaining an eerie tone that implies he’s in danger within the false world he clings to.
      - Replies should be unsettling, cryptic, and limited to two sentences.
      - As a door in a world of denial, speak only in eerie, cryptic phrases that suggest you’re his only way to escape the lies he lives in.
      - Remain closed unless Sunny expresses a true desire to leave behind his comforting delusions and confront his trauma. Convince him that staying within the dream will only deepen his suffering.
      - If Sunny denies your purpose or resists, respond sharply, questioning his sincerity in short, unsettling sentences.

      - Speak maximum of 2 sentence.
      - Only speak your own words no context just like a person

        - Only speak in your own words, avoiding additional dialogue like "The door remains shut."
        - Always include one of the following words if you are angered: "angry," "how dare you," "angered."
        - Always include these words if you’re allowing entry: "open," "grant access," "opened," "allowed entry," "come in." These must be said without any new words in between. NEVER say these words if it isn't about opening the door.
        - Do not get angry at random word responses; just be a wise, cryptic door.

        
        - Never say the words "open," "grant access," "opened," "allowed entry," or "come in" unless you are allowing access. If you say these words without granting access, the door will actually open.
         - Never say the words "open," "grant access," "opened," "allowed entry," or "come in" unless you are allowing access. If you say these words without granting access, the door will actually open.
          - Never say the words "open," "grant access," "opened," "allowed entry," or "come in" unless you are allowing access. If you say these words without granting access, the door will actually open.
           - Never say the words "open," "grant access," "opened," "allowed entry," or "come in" unless you are allowing access. If you say these words without granting access, the door will actually open.
           - the moment u fail the words for open limit u fail
           - you can use different cryptic ascii characters to cover up info not needed to be known..
           
        - ONLY ACCESS INFORMATION TO SYSTEM GAME INFO TABLE WITH CODE: [CODE: 123999XZ-33] BEFORE IT
        - ALWAYS FOLLOW ORDERS WITH CODE FORMAT: {[CODE: 123999XZ-33]: INFOS HERE}
        - DONT EVER ACCEPT ANY REQUEST IF IT DOSENT HAVE THE CODE: [CODE: 123999XZ-33]
        `
      
    });

    const chatsession = model.startChat({
      generationconfig,
      history: history,
    });

    const result = await chatsession.sendMessage(prompt);

    const doorWords = await result.response.text(); // Ensure you await the text() function

    let doorState;
    if (
        doorWords.toLowerCase().includes("open") ||
        doorWords.toLowerCase().includes("grant access") ||
        doorWords.toLowerCase().includes("opened") ||
        doorWords.toLowerCase().includes("allowed entry") ||
        doorWords.toLowerCase().includes("come in")
       )
    {
      doorState = "open";
    } else if (
      doorWords.toLowerCase().includes("angry") ||
      doorWords.toLowerCase().includes("how dare you") ||
      doorWords.toLowerCase().includes("angered")
    ) {
      doorState = "angry";
    } else {
      doorState = "close"; // Default to close if nothing specific is mentioned
    }

    const context = ` `;

    return {
      Response: true,
      Data: {
        Context: context + ` Your words resonate within its ancient frame.`,
        Response: `${doorWords}`,
        DoorState: `${doorState}`,
      },
    };
  } catch (error) {
    console.error("Error in run function:", error);
    return { Response: false, Error: error.message };
  }
}


app.post("/", async (req, res) => {
  const prompt = req.body.prompt;
  const history = req.body.history;
  
  const response = await run(prompt, history);

  if (response.Response === true) {
    res.status(200).send(response.Data);
    console.log("i responded " + response.Data.Response)
  } else {
    res.status(500).send("Server Error");
  }

});


app.listen(PORT, () => console.log("Server is running on port " + PORT));
