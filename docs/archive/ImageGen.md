# Image Generation Utility

This bot composes team images using the `makeTeamImage` helper. Icons are loaded from `ironaccord-bot/assets/heroes`.

## Usage

```js
const { makeTeamImage } = require('../src/utils/imageGen');
const buffer = await makeTeamImage(['hero-1', 'hero-2']);
```

The function returns a PNG `Buffer` that can be attached to a Discord message.

## Folder Structure

```
ironaccord-bot/
  assets/
    heroes/
      hero-1.png
      hero-2.png
      ...
```

Hero file names must be kebab-case and end with `.png`.

## Errors

- Passing an empty array will throw **"Hero list cannot be empty"**.
- If an icon file cannot be found, the promise rejects with **"Missing asset for hero: X"**.

## Troubleshooting

If images are blank or distorted, ensure the PNGs are valid and that Sharp is installed correctly.
