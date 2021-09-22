//------------------------------------------------------------------------------
// Autofix the regex by generating a string from the RPN
//------------------------------------------------------------------------------

const generateRegexFromRPN = (rpn) => () => {
  let stack = [];
  rpn.forEach((token) => {
    let str1 = '';
    let str2 = '';
    switch (token.type) {
      case 'charLiteral':
      case 'escapedChar':
      case 'charClass':
      case 'bracketClass':
      case '.':
        stack.push(token.label);
        break;
      case '?':
      case '*':
      case '+':
        str1 = stack.pop();
        stack.push(str1 + token.label);
        break;
      case '|':
        str1 = stack.pop();
        str2 = stack.pop();
        stack.push(str2 + '|' + str1);
        break;
      case '(':
        str1 = stack.pop();
        stack.push('(' + str1 + ')');
        break;
      case '~':
        str1 = stack.pop();
        str2 = stack.pop();
        stack.push(str2 + str1);
        break;
      default:
        break;
    }
  });
  return stack[0] || '';
};

//------------------------------------------------------------------------------

export default generateRegexFromRPN;
