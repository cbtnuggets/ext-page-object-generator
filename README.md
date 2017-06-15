# ext-page-object-generator
Generates page objects from mouse clicks

# To get started:

Run `npm install`

## Development

Run `npm run dev` to start webpack dev server
In another terminal window run `npm run testDev` to start electron
Production

You have two options, an automatic build or two manual steps

## One Shot

Run `npm run package` to have webpack compile your application into dist/bundle.js and dist/index.html, and then an electron-packager run will be triggered for the current platform/arch, outputting to builds/
Manual

Recommendation: Update the "postpackage" script call in package.json to specify parameters as you choose and use the npm run package command instead of running these steps manually

Run npm run build to have webpack compile and output your bundle to dist/bundle.js
If you want to test the production build (In case you think Babili might be breaking something) after running npm run build you can then call `npm run testProd`. This will cause electron to load off of the dist/ build instead of looking for the webpack-dev-server instance.
