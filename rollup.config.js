import resolve from 'rollup-plugin-node-resolve'
import builtins from 'rollup-plugin-node-builtins'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'
import pkg from './package.json'

const output = [
  { file: pkg.main, format: 'umd', name: 'jest-matcher-structure' },
]

const plugins = [
  builtins(),
  resolve(),
  commonjs(),
  babel({
    exclude: ['node_modules/**'],
    plugins: pkg.babel.plugins,
  }),
]

if (process.env.NODE_ENV === 'production') {
  plugins.push(uglify())
}

export default {
  input: 'src/index.js',
  output,
  plugins,
  external: Object.keys(pkg.dependencies || {}),
}
