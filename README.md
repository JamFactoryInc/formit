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

## Docs
Most JavaScript Primitives are supported by formit's `form` function. Below is an example for the main primitive types

```js
form(
    "test-form",
    {
        test0: true,          // creates a checkbox. On update returns the state of the checkbox (true or false)
        
        test1: 1,             // creates an input:number element. On update returns a parsed number (supports decimals)
        
        test2: "Example",     // creates an input:text elemtnt. On update returns the contents as a string
        
        test3: [1, 2, 3],     // creates a group of checkboxes with labels 1, 2, and 3
                              // On update returns an array of selected names. Names are returned as strings
                              // example: ["1", "3"] would be returned if the first and last checkbox are selected
                              
        test4: slider(0, 10), // creates a slider input element with min value 0 and max value 10
        
        test5: radio(["one", "two", "three"]), // creates a group of radio buttons with the given values as names
                                               // On update returns the name of the selected radio button
                                               
        test6: checkbox(["one", "two", "three"]), // creates a group of checkboxes with the given values as names
                                                  // identical to providing an array but allows more config options
    }
)
```


## Notes

This repo also contains a pre-made form style sheet and example implementation for reference
