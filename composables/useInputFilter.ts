
const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'Backspace', 'Delete'];
function digitsFilter(e: KeyboardEvent) {
  if (!digits.includes(e.key)) {
    e.preventDefault();
  }
}
export default function () {
  return {
    digitsFilter
  }
}
