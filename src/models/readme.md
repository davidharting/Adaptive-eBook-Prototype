# Models

## What should be in here

Each model file should correspond to a ContentType defined in contentful.
For instance, the models/Book.ts file corresponds to the IBook TypeScript type.
Every exported function in a model file should be a pure file, and it's first argument should be an instance of the associated TypeScript type.
So the first argument of every function exported from Book.ts will be an IBook.

## Why organize this way?

The reducers were getting very bloated with logic that was specific to navigating the content tree we export from Contentful.
This way, we can let the selectors focus on state management, and let the models focus on the content model.

This should also make it easier to refactor the content model. Ideally, we will be able to just make updates in the model layer and most the selectors will be safe.
