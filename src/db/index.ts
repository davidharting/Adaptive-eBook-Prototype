import firebase from "firebase/app";
import "firebase/firestore";

var config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
firebase.initializeApp(config);

const db = firebase.firestore();

// TODO: Offline persistance https://firebase.google.com/docs/firestore/manage-data/enable-offline
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

interface Auditable {
  createdAt: firebase.firestore.FieldValue;
  deploy: string;
}

function getInsertAuditFields() {
  return {
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    deploy: process.env.REACT_APP_DEPLOY || "unknown",
  };
}

async function recordAnswer(answer: AnswerDocument) {
  try {
    await db.collection("responses").add({
      ...answer,
      ...getInsertAuditFields(),
    });
  } catch (err) {
    // TODO: Alert sentry that I was unable to record answer
    console.error(err, { msg: "Failed to create document", answer });
  }
}

export { recordAnswer };