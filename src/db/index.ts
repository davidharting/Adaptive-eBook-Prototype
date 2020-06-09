import firebase from "firebase/app";
import "firebase/firestore";

// These are not secrets but if I want them to be configurable by deploy,
// then I will need to utilize environment variables
var config = {
  apiKey: "AIzaSyAEXKnnn_sGmdWCntuNnXxXjO_n2CjVO9Q",
  authDomain: "adaptive-ebook.firebaseapp.com",
  databaseURL: "https://adaptive-ebook.firebaseio.com",
  projectId: "adaptive-ebook",
  storageBucket: "adaptive-ebook.appspot.com",
  messagingSenderId: "338065520619",
  appId: "1:338065520619:web:36cff7f9762ffd88c04bae",
};

// Initialize Firebase
firebase.initializeApp(config);

const db = firebase.firestore();

// TODO: Offline persistance
// This should allow me to just do my write code not thinking about it.
// Under the hood it will persist when it comes back online.

export interface AnswerDocument {
  questionId: string;
  stimulusId: string;
  bookId: string;
  bookTitle: string;
  userId: string | null;
  userName: string;
  questionText: string;
  isCorrect: boolean;
  pageNumber: number;

  // TODO: correctStimulusID
  // TODO: choseStimulusID
  // TODO: distractorStimulusID
  // TODO: choseCorrectStimulus
}

async function recordAnswer(answer: AnswerDocument) {
  try {
    await db.collection("responses").add(answer);
  } catch (err) {
    // TODO: Alert sentry that I was unable to record answer
    console.error(err, { msg: "Failed to create document", answer });
  }
}

export { recordAnswer };

// I could create a react component that listens for changes to read...
// I could create another slice that just records the history
// I could handle this inside an async action creator
//   only downside there is that I have to push the validation logic into the creator
//   and out of the reducer
