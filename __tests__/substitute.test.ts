import {substitute} from '../substitute'

describe('substitution', () => {
  it.each([
    ['hello ${NAME}', {NAME: 'world'}, 'hello world'],
    ['${MISSING}', {}, ''],
    ['${MISSING:-fallback}', {}, 'fallback'],
    ['${EMPTY:-fallback}', {EMPTY: ''}, ''],
    ['${NAME:-fallback}', {NAME: 'value'}, 'value'],
    ['${MISSING:-}', {}, ''],
    ['${NAME}/${NAME}', {NAME: 'value'}, 'value/value'],
    ['${ NAME }', {NAME: 'value'}, 'value'],
    ['${MISSING:-with spaces }', {}, 'with spaces '],
    ['${_NAME2}', {_NAME2: 'value'}, 'value'],
    ['$NAME ${2NAME} ${NAME', {NAME: 'value'}, '$NAME ${2NAME} ${NAME'],
    ['${NAME}', {NAME: '$& $$ $` $\' \\ "\n'}, '$& $$ $` $\' \\ "\n'],
    ['${A} ${B}', {A: '${B}', B: 'value'}, '${B} value'],
    ['${MISSING:-${B}}', {B: 'value'}, '${B}'],
    ['${toString}', {}, ''],
  ])('substitutes %s', (template, env, expected) => {
    expect(substitute(template, env)).toBe(expected)
  })

  it('handles a large template with repeated variables', () => {
    expect(substitute('${NAME}\n'.repeat(10000), {NAME: 'value'}))
      .toBe('value\n'.repeat(10000))
  })
})
