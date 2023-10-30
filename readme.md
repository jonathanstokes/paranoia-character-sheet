# Paranoia (Red Clearance Edition) Character Sheet for Roll20

## Build

This character sheet uses HTML Fragments, Typescript, and SASS to keep good separation of
concerns in source code, and then uses custom-built tools to compile down to the HTML with
JS, and CSS content used in Roll20's custom Character Sheet Templates.

`yarn compile` to build the output.

## Auto-Deploy

Custom-built tools also deploy the compiled source to Roll20, but this is very brittle and
often has trouble with the Cloudflare bot detection.

`yarn deploy` to deploy, or `yarn compile-and-deploy` to do both.

