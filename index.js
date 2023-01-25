function form(formId, obj, preventDefault = true) {
    const callbacks = {}
    const f = document.createElement('form')
    f.id = formId

    function change() {
        let arg = obj
        f.querySelectorAll('input').forEach(e => {
            switch (e.type) {
                case "checkbox":
                    arg[e.attributes.formvalue] = e.checked
                    break
                case "range":
                    arg[e.attributes.formvalue] = parseInt(e.value)
                    break
                case "number":
                    arg[e.attributes.formvalue] = parseFloat(e.value)
                    break
                case "radio":
                    if (e.checked) {
                        arg[e.attributes.formvalue] = e.value
                    }
            }
        })
        callbacks[formId](arg)
    }

    function callback(fn) {
        callbacks[formId] = fn
        return f
    }

    let numRadioInputs = 0

    Object.entries(obj).forEach(([k, v]) => {
        let child = document.createElement('input')
        console.log(typeof v)
        switch (typeof v) {
            case "string":
                child.setAttribute("type", "text")
                child.setAttribute("placeholder", v)
                break
            case "number":
                child.setAttribute("type", "number")
                break
            case "boolean":
                child.setAttribute("type", "checkbox")
                child.checked = v
                break
            case "object":
                console.log(v.type)
                switch (v.type) {
                    case "number":
                    case "range":
                        Object.entries(v).forEach(entry => child.setAttribute(entry[0], entry[1]))
                        break
                    case "radio":
                        child = document.createElement('span')
                        child.type = "radio-container"
                        v.options.forEach((option, i) => {
                            const subChild = document.createElement("input")
                            if (i == 0) {
                                subChild.checked="checked"
                            }
                            subChild.type = "radio"
                            subChild.name = formId + numRadioInputs
                            subChild.value = option
                            subChild.attributes.formvalue = k
                            child.appendChild(subChild)
                            
                        })
                        numRadioInputs ++
                        break
                }

                break
        }
        child.attributes.formvalue = k
        child.oninput = change
        f.appendChild(child)
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

function radio(options, useIndex=false) {
    const ret = {options: []}
    options.forEach((option, i) => {
        ret.options.push(useIndex ? i : option)
    })
    ret["type"] = "radio"
    return ret
}

addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('body').appendChild(
        form("formit", {
            one: 1,
            two: "Test",
            three: false,
            four: slider(0, 10),
            five: radio(["one", "two", "three"], true)
        }).onChange((data) => console.log(data))
    )
    document.querySelector('body').appendChild(
        form("formit", {
            one: 1,
        }).onChange((data) => console.log(data))
    )
});