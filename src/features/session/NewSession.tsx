import React from "react";
import { useDispatch } from "react-redux";

import { startSession } from "./sessionSlice";

function NewSession() {
  const [name, setName] = React.useState("");
  const dispatch = useDispatch();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(startSession({ playerName: name }));

    console.log(startSession.toString());
  };

  return (
    <>
      <h1>Let's get started!</h1>
      <p>
        We just need to get a little info from you before you begin. If you do
        not to share this information, you can leave it blank or fill it in with
        a random value.
      </p>
      <form onSubmit={onSubmit}>
        <label htmlFor="name">What is your name?</label>
        <br />
        <input
          name="name"
          type="text"
          placeholder="Harry Potter"
          onChange={(e) => setName(e.target.value)}
        />
        <input type="submit" />
      </form>
    </>
  );
}

export default NewSession;
