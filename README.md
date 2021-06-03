# TartanHacks backend

This is the backend system for the TartanHacks software suite. 

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
We are using Mocha for testing.

For any functions or endpoints you write, please write the appropriate tests
in the `tests` folder. Before committing, please make sure that all tests
pass.

### Code coverage
To generate code coverage, we are using [Istanbul](https://istanbul.js.org/).
To view code coverage, run `npm run coverage`