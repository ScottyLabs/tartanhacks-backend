# TartanHacks backend

This is the backend system for the TartanHacks software suite. 

## Getting Started

1. Use the `.env.template` file to create a `.env` file
2. Reach out to Gram or Anuda to get access to the MongoDB and E-Mail config for the `.env` file
3. Run `npm install` to install packages
4. Run `npm run build`
5. Run `npm start` if you want to run in production mode. Run `npm run dev` if you want to run in dev mode.

## Documentation
|||
|--|--|
|Database Model|https://www.figma.com/file/TXPqZa0vUg3BNw9fHGn9vT/TartanHacks-Model?node-id=1%3A6|
|Endpoints| https://www.notion.so/TartanHacks-Backend-efb4ac6250244dbab85254a56a85f318

## Style
Please install [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
in your VS Code workspace. The workspace has configuration files for helping
you adhere to the project style guidelines. Before commits, please make sure
that your code is formatted correctly by running `npm run lint`

## Testing
We are using Jest for testing.

For any functions or endpoints you write, please write the appropriate tests
in the `tests` folder. Before committing, please make sure that all tests
pass.

We also have CI configured through GitHub actions. These will show you if your
commit builds and passes all tests.

## Environment
If you need to create any new environment variables, add an example to `.env.template`
and make sure to add it as well to `.github/workflows/main.yml` so that CI
passes

## Code coverage
To view code coverage, run `npm run coverage`

## Emails
In order to configure a new email template, create a folder under `email-templates`.
In that folder, create your [mjml](https://documentation.mjml.io/) templates. Also,
create a file called `index.ts` which exports the rendered html by calling
[mjml2html](https://documentation.mjml.io/#inside-node-js) on your template file
and indexing on the `html` field. See `email-templates/verification` for an example.
In `email-templates/index.ts`, make sure to include your folder in the default
export so that the email service can detect your newly added template.