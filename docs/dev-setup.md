
## Developer setup (Linux)
1. Install pnpm with `curl -fsSL https://get.pnpm.io/install.sh | sh -`. If necessary, install using [alternative methods](https://pnpm.io/installation#on-posix-systems).
2. Choose an appropriate place to clone the project and `cd` into it. For example, `mkdir ~/proj && cd ~/proj`
3. `git clone https://github.com/Vacansee/app` and `cd` into `app`
4. `pnpm install` to install dependencies

5. Done!
To view your changes, run `pnpm dev`. A local server will spin up using Vite at `localhost:<port>/app/`. The URL will be printed to the console.

## Debugging
It can be helpful to change the current time or date in order to evaluate edge cases or work with more active occasions.
To fix time at a particular date and hour, substitute each of the 3 lines which update time in `main.js` with the commented one below them.

If you want to watch time advance, use the `add()` or `subtract()` Moment.js methods on the lines in `main.js` which update time like so:

```
Moment.tz('America/New_York').subtract(5, 'hours').format('e:HHmm')
```

Also, any errors and console logs can be viewed in the `F12` Devtools menu in your browser preview.

## Codebase introduction
For the Fall '23 RCOS class, the new team that led development on the project met with the original developer to gain an overview of the codebase. That video can be found [here](https://drive.google.com/file/d/1N-sEflGNpD0a7PdGBSsbbGNePsH7WFmB/view?usp=sharing).

## Getting started on an issue
Once the project is cloned and you have found an issue that you want to work on ([for the frontend app](https://github.com/Vacansee/app/issues) or [for the backend data processing](https://github.com/Vacansee/data/issues)), you will then create a branch off of the dev branch (in app) or the main branch (in data) by either:

1.  adding a branch on github, running `git fetch` and then running `git checkout -b branch_name` in your terminal
2.  or by running the command `git checkout -b branch_name` while on the correct branch and then running `git push --set-upstream origin branch_name` in your terminal when you are ready to push your changes

The `branch_name` should be of the form `issue#-short-description` (e.g. 22-make-map-zoomable).

Once finished with your changes, you will add your files (`git add whatever-file`, or simply `git add .` if you want to commit all changed files) that you changed and commit your changes (`git commit -m "commit message"`) to your new branch. A good practice to adopt is to continuously run `git status` to see what branch you're on, what files you have staged to commit, and what files are untracked.