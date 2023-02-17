function transform(callbacks, key, value) {
    if (callbacks[key + '-transform']) {
        return callbacks[key + '-transform'](value, key)
    }
    return value
}

function validate(callbacks, key, arg, fid) {
    if (callbacks[key + '-validate']) {
        const validationResult = callbacks[key + '-validate'](arg[key], arg, key)
        if (validationResult === undefined) return 0
        if (validationResult === false || typeof validationResult === "string") {
            inputValidationFailure(key, fid, validationResult)
            return 1
        }
        const failedElement = document.querySelector(`#${fid}-${key}.validation-fail`)
        if (failedElement) {
            document.querySelector(`#${fid}-${key}.validation-fail + .form-message`).style.display = "none"
            failedElement.classList.remove("validation-fail")
        }
    }
    return 0
}

function inputValidationFailure(key, formId, message) {
    const failedElement = document.getElementById(`${formId}-${key}`)
    failedElement.classList.add("validation-fail")
    const msg = document.querySelector(`#${formId}-${key}.validation-fail + .form-message`)
    msg.style.display = "block"
    msg.textContent = (typeof message === "string" ? message : "Invalid")
}


function form(formId, obj, preventDefault = true) {
    const callbacks = {}
    const f = document.createElement('form')
    f.id = formId

    // run on form change
    // passes a modified input config object to the registered callback function
    function change(ctx, ctxCallback) {

        let anyFail = 0
        let arg = obj
        // get all input elements in our form
        f.querySelectorAll('input').forEach(e => {
            // the given input id
            const key = e.attributes.formvalue
            // remove buttons from result
            if (typeof arg[key] === "function") {
                return
            }
            let ignoreCallbacks = false
            // do logic based on the input type
            // handle configured elements
            if (arg[key].config) {
                arg[key] = arg[key].value
            }
            switch (e.type) {
                case "text":
                    arg[key] = transform(callbacks, key, e.value)
                    break
                case "checkbox":
                    // discern if this is a single or multi checkbox by checking the input config value
                    if (typeof arg[key] === 'boolean') {
                        // single
                        arg[key] = transform(callbacks, key, e.checked)
                    } else {
                        // multi

                        // init the list of results
                        if (!arg[key].first) {
                            arg[key].first = true
                            arg[key].results = []
                        }
                        // add to results
                        if (e.checked) {
                            arg[key].results.push(e.value)
                        }
                    }
                    break
                case "range":
                    arg[key] = transform(callbacks, key, parseInt(e.value))
                    break
                case "number":
                    arg[key] = transform(callbacks, key, parseFloat(e.value))
                    break
                case "radio":
                    // add only the checked option as a string (there should be exactly one)
                    if (e.checked) {
                        arg[key] = transform(callbacks, key, e.value)
                    }
            }
        })
        // do post-processing for things that could not be done in one step (checkbox group)
        Object.entries(arg).forEach(([key, v]) => {
            if (v.results) {
                arg[key] = transform(callbacks, key, v.results)
            }
            anyFail += validate(callbacks, key, arg, formId)
        })

        // only do callback if there were no validation errors
        if (anyFail === 0) {
            if (ctx === "button") {
                ctxCallback(arg)
                return
            }
            callbacks[formId](arg)
        }
    }

    // used to register a callback when calling form()
    function callback(fn) {
        callbacks[formId] = fn
        return f
    }

    // create and configure an element as a subElement of the given parent
    function subChild(element, newElementType, cb) {
        const newChild = document.createElement(newElementType)
        cb(newChild)
        element.appendChild(newChild)
    }

    let numRadioInputs = 0

    // the boilerplate needed to make a group of inputs from one name
    // checkboxes and radio buttons
    function handleGroupElement(child, option, i, k, proxyClass, inputType) {
        subChild(child, "span", sChild1 => {
            subChild(sChild1, "label", label => {
                label.setAttribute("for", option)
                label.textContent = option
            })
            subChild(sChild1, "span", styleContainer => {
                styleContainer.classList.add("container")
                subChild(styleContainer, "input", (checkbox) => {
                    if (i === 0) {
                        checkbox.checked = "checked"//checked
                    }
                    checkbox.type = inputType
                    checkbox.name = `${formId}-${numRadioInputs}`
                    checkbox.id = `${checkbox.name}-${option}`
                    checkbox.value = option
                    checkbox.attributes.formvalue = k
                })
                subChild(styleContainer, "span", proxy => {
                    proxy.classList.add(proxyClass)
                })
            })
        })
    }

    // create elements based on input config and set up callbacks
    Object.entries(obj).forEach(([k, v]) => {
        let container = document.createElement('span')
        let child = document.createElement('input')
        child.id = `${formId}-${k}`
        // handle configured elements
        if (v.config) {
            //// set up callbacks
            // register validation callback
            if (v.config.validate) {
                callbacks[k + "-validate"] = v.config.validate
            }
            // register transformer callback
            if (v.config.transform) {
                callbacks[k + "-transform"] = v.config.transform
            }
            // register locking callback
            if (v.config.lock) {
                callbacks[k + "-lock"] = v.config.lock
            }
            v = v.value
        }
        // based on config input, create elements
        switch (typeof v) {
            case "function":
                child.type = "button"
                child.onclick = () => change("button", v)
                break
            case "string":
                child.setAttribute("type", "text")
                child.setAttribute("placeholder", v)
                break
            case "number":
                child.setAttribute("type", "number")
                break
            case "boolean":
                child = document.createElement('span')
                subChild(child, 'p', subChild=> {
                    subChild.classList.add("form-message")
                    subChild.style.display = "none"
                })
                child.id = `${formId}-${k}`
                child.classList.add("single-checkbox")
                // we need to create the elements required for custom styling here
                child.type = "checkmark-container"
                subChild(child, "span", styleContainer => {
                    styleContainer.classList.add("container")
                    subChild(styleContainer, "input", realInput => {
                        realInput.attributes.formvalue = k
                        realInput.type = "checkbox"
                        realInput.checked = v
                    })
                    subChild(styleContainer, "span", proxy => {
                        proxy.classList.add("checkmark")
                    })
                })
                break
            case "object":
                // objects can be a range of things, so we need to check the type
                switch (v.type) {
                    // numeric values
                    case "number":
                    case "range":
                        // copy the input config's values to the html element
                        Object.entries(v).forEach(entry => child.setAttribute(entry[0], entry[1]))
                        break
                    // radio button groups
                    case "radio":
                        child = document.createElement('span')
                        child.id = `${formId}-${k}`
                        child.type = "radio-container"
                        // we need to create the elements required for custom styling here
                        v.options.forEach((option, i) => {
                            handleGroupElement(child, option, i, k, "radio", "radio")
                        })
                        // keep track of how many grouped elements we made for ID purposes
                        numRadioInputs++
                        break
                    // checkbox groups
                    case "checkmark":
                        child = document.createElement('span')
                        child.id = `${formId}-${k}`
                        child.type = "checkmark-container"
                        // we need to create the elements required for custom styling here
                        v.options.forEach((option, i) => {
                            handleGroupElement(child, option, i, k, "checkmark", "checkbox")
                        })
                        // keep track of how many grouped elements we made for ID purposes
                        numRadioInputs++
                        break
                }
                break
        }
        child.attributes.formvalue = k
        child.oninput = change
        subChild(container, "label", label => {
            label.setAttribute("for", k)
            label.textContent = k
        })
        container.appendChild(child)
        subChild(container, 'p', sub=> {
            sub.classList.add("form-message")
            sub.style.display = "none"
        })
        f.appendChild(container)
    })
    return {
        onChange: callback
    }
}

function slider(min, max, val = min / max) {
    return {
        type: "range",
        min: min,
        max: max,
        value: val,
    }
}

function number(min, max, val = min / max) {
    return {
        type: "number",
        min: min,
        max: max,
        value: val,
    }
}

function radio(options) {
    const ret = { options: [] }
    options.forEach(option => {
        ret.options.push(option)
    })
    ret["type"] = "radio"
    return ret
}

function checkmark(options) {
    const ret = { options: [] }
    options.forEach(option => {
        ret.options.push(option)
    })
    ret["type"] = "checkmark"
    return ret
}

addEventListener('DOMContentLoaded', () => {
    document.querySelector('#formcontainer').appendChild(
        form("formit", {
            one: (v) => {console.log(v.two)},
            two: {
                value: "Test",
                config: {
                    validate: (v) => v.includes("wow")
                }
            },
            "Custom name with %": false,
            four: slider(0, 10),
            five: radio(["one", "two", "three"]),
            six: {
                value: checkmark(["four", "five", "six"]),
                config: {
                    validate: (v) => v.includes("four")
                }
            }
        }).onChange((data) => console.log(data))
    )
    document.querySelector('body').appendChild(
        form("formit2", {
            one: {
                value: 1,
                config: {
                    transform: (v) => v*2,
                    validate: (v) => v > 0
                }
            },
            two : {
                value: true,
                config: {
                    validate: (v, a) => {
                        if (a.one > 10) {
                            return true
                        }
                        return v ? true : "If 'one' is <= 5, this must be selected"
                    }
                }
            }
        }).onChange((data) => console.log(data))
    )
});