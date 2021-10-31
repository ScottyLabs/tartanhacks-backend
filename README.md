# TartanHacks Backend

![TartanHacks Backend](https://github.com/ScottyLabs/tartanhacks-backend/actions/workflows/main.yml/badge.svg)
[![Test Coverage](https://api.codeclimate.com/v1/badges/c33b0b2952c311738215/test_coverage)](https://codeclimate.com/github/ScottyLabs/tartanhacks-backend/test_coverage)

This is the backend system for the TartanHacks software suite. 

## Getting Started

1. Create a Doppler Account [here.](https://www.doppler.com/)
2. Get an invite to the ScottyLabs Doppler workspace by reaching out to David Hwang
3. Install the Doppler CLI by following the installation instructions [here.](https://docs.doppler.com/docs/enclave-installation)
4. Login to doppler with the CLI by running `doppler login --scope ~/project-dir`
5. Run `npm install` to install packages
6. Run `npm run build`
7. Run `npm run dev` to run the project in dev mode.
8. See the swagger endpoint documentation by visiting `/docs`

## Database Model
https://www.figma.com/file/TXPqZa0vUg3BNw9fHGn9vT/TartanHacks-Model?node-id=1%3A6

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