# Pixfly Kit

![Pixfly](https://github.com/musamasays/pixfly-kit/blob/main/resources/pixfly_uploader.gif "Pixfly")

## Introduction

Pixfly is the next-generation platform designed to make image management effortless. With Pixfly, you can seamlessly manage your images, transform them on the fly, and optimize delivery—everything at lightning speed. Whether you’re a solo developer or part of a team, Pixfly integrates effortlessly into your workflow, offering a hassle-free experience from day one.

## Features

- Easy to set up for real, you can make it work in less than 30sec!
- Fast and efficient image optimization
- Image optimization and transformation on the fly
- Beautiful image uploader component
- Dark mode

## Installation

```bash
npm i pixfly-kit framer-motion axios
```

## Requirements

- React 18+
- Framer Motion
- Axios

## Usage

```jsx
import { PixflyUploader } from "pixfly-kit";
import "pixfly-kit/dist/styles.css";

function App() {
  return (
    <PixflyUploader
      apiKey="YOUR_API_KEY"
      proj="YOUR_PROJECT_NAME"
      onUploadSuccess={(result) => {
        console.log(result);
      }}
      onUploadError={(error) => {
        console.log(error);
      }}
    />
  );
}

export default App;
```

## Documentation

Check the [documentation](https://thepixfly.com/docs) to get you started!

## Props

| Name            | Type     | Description                                          |
| --------------- | -------- | ---------------------------------------------------- |
| apiKey          | string   | Your Pixfly API key.                                 |
| proj            | string   | Your Pixfly project name.                            |
| onUploadSuccess | function | Callback function to handle successful image upload. |
| onUploadError   | function | Callback function to handle upload errors.           |

## `Contributing`

We welcome contributions to Pixfly! If you have any suggestions, bug reports, or feature requests, please open an issue or submit a pull request.

## License

Pixfly is released under the [MIT License](https://opensource.org/licenses/MIT).
