# formit
Vanilla Javascript utility to make forms less of a pain in the ass

## Features
- create a form from a basic JS object
- register a callback function to the form that receives all the parsed for data on input

## How to use
```javascript
// get some element to put the form in
const formContainer = document.findElementById("form-container");

// create and append the form to formContainer
formContainer.appendChild(form(
    // provide an ID for the form to use
    "test-form",
    // form data
    {
        textInput: "Placeholder Text",
        slider: slider(0, 10),
    }
).onChange((data) => {
    // logs the respective textInput and slider values each time either is changed
    console.log(data.textInput);
    console.log(data.slider);
})
```

Simple as that!

## Notes

This repo also contains a pre-made form style sheet and example implementation for reference
