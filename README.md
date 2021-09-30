# RegExpLore

- [About](#about)
- [Features](#features)
- [Installation](#installation)

---

## About

**RegExpLore** is a regular expression visualizer and debugger built with [React](https://reactjs.org/), [Express](https://expressjs.com/) and [Material UI](https://mui.com/). The App includes among other things:

- syntax highlighting,
- a graph visualization, and
- a step-by-step execution mode.

All of these features are designed to help users learn about regular expressions and work with them.

The App leverages a **custom regex engine**. All the components, including the syntax highlighted editor and the graph visualization, are also coded from scratch.

![Application](./docs/all.png)

---

## Features

The App includes the following features:

- Syntax highlighting helps parsing the regex.
- Operand ranges are shown on hover.

![Regex string](./docs/regex.png)

- Additional information on each token is shown on hover in a separate box.

![Info box](./docs/info.png)

- Syntax errors are highlighted in the regex.

![Regex error](./docs/regex_error.png)

- Additional information on the errors is shown in a separate box.
- An auto-fix function is available to clean up the regex.

![Syntax errors](./docs/warnings.png)

- A graph based on the nondeterministic finite automaton (NFA) for the regex is built and updated as the user types the regex.
- Quantifiers are indicated through colors and tags to keep the graph simpler and more readable.
- Technically the nodes of this graph are the edges of the NFA and vice-versa. This transformation also aims for more readability.

![Graph](./docs/graph.png)

- The regex can be executed step-by-step: forward, backward or in auto-play.
- The nodes in the graph visualize the state of the NFA at each step.
- A log keeps tracks of the results.

![Run](./docs/run.png)

- Syntax highlighting of the test string also helps track the progression of the search.

![Test string](./docs/test_string.png)

---

## Installation

Clone the repository with [git](https://git-scm.com/):

```shell
git clone git@github.com:ycandau/regexplore.git
```

Install all the dependencies with [yarn](https://classic.yarnpkg.com/en/):

```shell
yarn install
```

The App also requires the [RegExpLore Server](https://github.com/milesAwayAlex/regexplore-server) to be installed separately.

For better user experience, we recommend the production build. First generate a new build:

```shell
yarn build
```

Then run it:

```shell
npx serve -s build
```

---

## Dependencies

- [React](https://reactjs.org/)
- [Material UI](https://mui.com/)

---

## Development dependencies

- [Storybook](https://storybook.js.org/)
- [Testing library](https://testing-library.com/)
