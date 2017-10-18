const KEY_ENTER = 13
const KEY_TAB = 9
const KEY_DOUBLE_QUOTE = 34
const KEY_QUOTE = 39
const KEY_BACKTICK = 229
const KEY_PAREN_LEFT = 40
const KEY_BRACKET_LEFT = 91
const KEY_CURLY_LEFT = 123

const UL_ITEM_START = /^\s*[-+*] /
const OL_ITEM_START = /^\s*\d+\. /


const getListItemPrefix = (line) => {
  const ulMatch = line.match(UL_ITEM_START)
  if (ulMatch) {
    return ulMatch[0]
  }

  const olMatch = line.match(OL_ITEM_START)
  if (olMatch) {
    return olMatch[0]
  }

  return undefined
}

const writeNextListItemPrefix = (event, text, selStart, prefix) => {
  event.preventDefault()

  if (prefix.match(OL_ITEM_START)) {
    number = parseInt(prefix, 10)
    console.log('is number', number)

    prefix = prefix.replace(/\d+/, number + 1)
  }

  const addition = `\n${prefix}`
  const newSelStart = selStart + addition.length

  // console.log(`"${addition}"`, selStart, newSelStart)

  return {
    text: text.slice(0, selStart) + addition + text.slice(selStart),
    selStart: newSelStart,
    selEnd: newSelStart
  }
}

const finishList = (event, text, selStart, prefix) => {
  event.preventDefault()

  const addition = '\n'
  const newSelStart = selStart - prefix.length + addition.length

  return {
    text: text.slice(0, selStart - prefix.length) + addition + text.slice(selStart + addition.length),
    selStart: newSelStart,
    selEnd: newSelStart
  }
}

const indentLine = (event, text, selStart, currentLine) => {
  event.preventDefault()

  const addition = '  '
  const newSelStart = selStart + addition.length

  return {
    text: text.slice(0, selStart - currentLine.length) + addition + text.slice(selStart - currentLine.length),
    selStart: newSelStart,
    selEnd: newSelStart
  }
}

const unindentLine = (event, text, selStart, currentLine) => {
  event.preventDefault()

  const match = currentLine.match(/^( {1,2}) *\S/)

  if (match) {
    const indentationLength = match[1].length

    return {
      text: text.slice(0, selStart - currentLine.length) + text.slice(selStart - currentLine.length + indentationLength),
      selStart: selStart - indentationLength,
      selEnd: selStart - indentationLength
    }
  }
}


const enterPressed = (event, {text, selStart}) => {
  const linesBeforeCaret = text.substr(0, selStart).split('\n')
  const currentLine = linesBeforeCaret[linesBeforeCaret.length - 1]

  // console.log(currentLine)

  const listItemPrefix = getListItemPrefix(currentLine)
  if (listItemPrefix) {
    if (currentLine.length === listItemPrefix.length) {
      return finishList(event, text, selStart, listItemPrefix)
    } else {
      return writeNextListItemPrefix(event, text, selStart, listItemPrefix)
    }
  }
}

const tabPressed = (event, {text, selStart}) => {
  const linesBeforeCaret = text.substr(0, selStart).split('\n')
  const currentLine = linesBeforeCaret[linesBeforeCaret.length - 1]

  const listItemPrefix = getListItemPrefix(currentLine)
  if (listItemPrefix) {
    if (!event.shiftKey) {
      return indentLine(event, text, selStart, currentLine)
    } else {
      return unindentLine(event, text, selStart, currentLine)
    }
  } else {
    event.preventDefault()
  }
}

const wrapSelection = (event, {text, selStart, selEnd}, startDelimiter, endDelimiter) => {
  event.preventDefault()

  console.log(startDelimiter, endDelimiter)
  return {
    text: text.slice(0, selStart)
      + startDelimiter
      + text.slice(selStart, selEnd)
      + endDelimiter
      + text.slice(selEnd),
    selStart: selStart + startDelimiter.length,
    selEnd: selEnd + startDelimiter.length
  }
}

const handleKeyPress = (event, inputState) => {
  if (inputState.selStart === inputState.selEnd) {
    switch (event.keyCode) {
      case KEY_ENTER:
        return enterPressed(event, inputState)
        break
    }
  } else {
    switch (event.keyCode) {
      case KEY_DOUBLE_QUOTE:
      case KEY_QUOTE:
        console.log("quote")
        return wrapSelection(event, inputState, event.key, event.key)
        break
      case KEY_PAREN_LEFT:
        return wrapSelection(event, inputState, '(', ')')
        break
      case KEY_BRACKET_LEFT:
        console.log("bracket left")
        return wrapSelection(event, inputState, '[', ']')
        break
      case KEY_CURLY_LEFT:
        return wrapSelection(event, inputState, '{', '}')
        break
    }
  }
}

const handleKeyDown = (event, inputState) => {
  if (inputState.selStart === inputState.selEnd) {
    switch (event.keyCode) {
      case KEY_TAB:
        return tabPressed(event, inputState)
        break
    }
  } else {
    switch (event.keyCode) {
      case KEY_BACKTICK:
        return wrapSelection(event, inputState, '`', '`')
        break
    }
  }
}


document.addEventListener('DOMContentLoaded', (event) => {
  const input = document.querySelector('#markdown')

  input.addEventListener('keypress', (event) => {
    console.log('key pressed', event.keyCode, event)

    const inputState = {
      text: input.value,
      selStart: input.selectionStart,
      selEnd: input.selectionEnd
    }

    const newInputState = handleKeyPress(event, inputState)

    if (newInputState) {
      input.value = newInputState.text
      input.setSelectionRange(newInputState.selStart, newInputState.selEnd)
    }
  })


  input.addEventListener('keydown', (event) => {
    console.log('key down', event.keyCode, event)

    const inputState = {
      text: input.value,
      selStart: input.selectionStart,
      selEnd: input.selectionEnd
    }

    const newInputState = handleKeyDown(event, inputState)

    if (newInputState) {
      input.value = newInputState.text
      input.setSelectionRange(newInputState.selStart, newInputState.selEnd)
    }
  })



})
