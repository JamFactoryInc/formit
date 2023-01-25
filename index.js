const callbacks = {}

function form(formId, obj, preventDefault = true) {
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
                default:
                    arg[e.attributes.formvalue] = e.value
            }
        })
        callbacks[formId](arg)
    }

    function callback(fn) {
        callbacks[formId] = fn
        return f
    }

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
                switch (v.type) {
                    case "number":
                    case "range":
                        Object.entries(v).forEach(entry => child.setAttribute(entry[0], entry[1]))
                        break
                    case "radio":
                        Object.entries(v).forEach([_, option] => child.setAttribute(entry[0], entry[1]))
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

function radio(...options) {

}

addEventListener('DOMContentLoaded', (event) => {
    document.querySelector('body').appendChild(
        form("formit", {
            one: 1,
            two: "Test",
            three: false,
            four: slider(0, 10)
        }).onChange((data) => console.log(data))
    )
});